import type { Channel, Node, Payment, HTLC } from '../types';
import {
  generateId,
  createFundingTransaction,
  generateRevocationSecret,
} from '../utils/crypto';

export class ChannelManager {
  private channels: Map<string, Channel> = new Map();
  private payments: Payment[] = [];

  /**
   * Create a new payment channel
   */
  createChannel(node1: Node, node2: Node, fundingAmount: number): Channel {
    const fundingTx = createFundingTransaction(node1, fundingAmount);
    
    const channel: Channel = {
      id: generateId(),
      node1,
      node2,
      capacity: fundingAmount,
      balance1: fundingAmount,
      balance2: 0,
      fundingTx,
      commitmentTxVersion: 1,
      status: 'active',
      createdAt: Date.now(),
      revocationSecrets: [generateRevocationSecret()],
    };

    this.channels.set(channel.id, channel);
    return channel;
  }

  /**
   * Send a payment through a channel
   */
  sendPayment(
    channelId: string,
    fromNodeId: string,
    amount: number,
    htlc?: HTLC
  ): Payment | null {
    const channel = this.channels.get(channelId);
    if (!channel || channel.status !== 'active') {
      return null;
    }

    const isNode1Sender = channel.node1.id === fromNodeId;
    const senderBalance = isNode1Sender ? channel.balance1 : channel.balance2;

    // Check if sender has enough balance
    if (senderBalance < amount) {
      return null;
    }

    // Update balances
    if (isNode1Sender) {
      channel.balance1 -= amount;
      channel.balance2 += amount;
    } else {
      channel.balance2 -= amount;
      channel.balance1 += amount;
    }

    // Increment commitment transaction version
    channel.commitmentTxVersion += 1;
    channel.revocationSecrets.push(generateRevocationSecret());

    const payment: Payment = {
      id: generateId(),
      from: fromNodeId,
      to: isNode1Sender ? channel.node2.id : channel.node1.id,
      amount,
      timestamp: Date.now(),
      channelId,
      htlc,
    };

    this.payments.push(payment);
    this.channels.set(channelId, channel);

    return payment;
  }

  /**
   * Get a channel by ID
   */
  getChannel(channelId: string): Channel | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Get all channels
   */
  getAllChannels(): Channel[] {
    return Array.from(this.channels.values());
  }

  /**
   * Get payment history for a channel
   */
  getChannelPayments(channelId: string): Payment[] {
    return this.payments.filter((p) => p.channelId === channelId);
  }

  /**
   * Get all payments
   */
  getAllPayments(): Payment[] {
    return this.payments;
  }

  /**
   * Close a channel cooperatively
   */
  closeChannel(channelId: string): boolean {
    const channel = this.channels.get(channelId);
    if (!channel) return false;

    channel.status = 'closed';
    this.channels.set(channelId, channel);
    return true;
  }

  /**
   * Force close a channel (simulate penalty)
   */
  forceCloseChannel(channelId: string, publishOldState: boolean): {
    success: boolean;
    penaltyApplied: boolean;
  } {
    const channel = this.channels.get(channelId);
    if (!channel) return { success: false, penaltyApplied: false };

    channel.status = 'closed';
    
    // If publishing an old state, apply penalty
    const penaltyApplied = publishOldState;
    if (penaltyApplied) {
      // All funds go to the honest party
      channel.balance2 = channel.capacity;
      channel.balance1 = 0;
    }

    this.channels.set(channelId, channel);
    return { success: true, penaltyApplied };
  }

  /**
   * Get channel balance for a specific node
   */
  getNodeBalance(channelId: string, nodeId: string): number {
    const channel = this.channels.get(channelId);
    if (!channel) return 0;

    return channel.node1.id === nodeId ? channel.balance1 : channel.balance2;
  }

  /**
   * Check if a payment is possible
   */
  canSendPayment(channelId: string, fromNodeId: string, amount: number): boolean {
    const channel = this.channels.get(channelId);
    if (!channel || channel.status !== 'active') {
      return false;
    }

    const balance = this.getNodeBalance(channelId, fromNodeId);
    return balance >= amount;
  }
}
