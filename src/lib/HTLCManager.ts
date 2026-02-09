import type { HTLC, Channel, Route } from '../types';
import { generateHash, generatePreimage, verifyPreimage } from '../utils/crypto';

export class HTLCManager {
  /**
   * Create an HTLC with preimage and hash
   */
  createHTLC(amount: number, timelock: number = 144): {
    htlc: HTLC;
    preimage: string;
  } {
    const preimage = generatePreimage();
    const hash = generateHash(preimage);

    const htlc: HTLC = {
      hash,
      amount,
      timelock,
      state: 'pending',
    };

    return { htlc, preimage };
  }

  /**
   * Fulfill an HTLC with the preimage
   */
  fulfillHTLC(htlc: HTLC, preimage: string): boolean {
    if (htlc.state !== 'pending') {
      return false;
    }

    if (verifyPreimage(preimage, htlc.hash)) {
      htlc.preimage = preimage;
      htlc.state = 'fulfilled';
      return true;
    }

    return false;
  }

  /**
   * Fail an HTLC
   */
  failHTLC(htlc: HTLC): void {
    if (htlc.state === 'pending') {
      htlc.state = 'failed';
    }
  }

  /**
   * Check if HTLC is expired
   */
  isExpired(htlc: HTLC, currentBlock: number): boolean {
    return currentBlock > htlc.timelock;
  }

  /**
   * Simulate multi-hop payment routing
   */
  async simulateMultiHopPayment(
    route: Route,
    amount: number,
    onHopUpdate: (hopIndex: number, state: 'pending' | 'fulfilled' | 'failed') => void
  ): Promise<{ success: boolean; preimage?: string }> {
    // Create HTLC
    const { preimage } = this.createHTLC(amount);

    // Simulate payment forwarding through each hop
    for (let i = 0; i < route.hops.length - 1; i++) {
      onHopUpdate(i, 'pending');
      await this.delay(1000); // Simulate network delay
    }

    // Last hop (recipient) reveals preimage
    await this.delay(500);
    const lastHopIndex = route.hops.length - 1;
    onHopUpdate(lastHopIndex, 'fulfilled');

    // Fulfill HTLCs backwards through the route
    for (let i = route.hops.length - 2; i >= 0; i--) {
      await this.delay(800);
      onHopUpdate(i, 'fulfilled');
    }

    return { success: true, preimage };
  }

  /**
   * Find a route between two nodes (simplified pathfinding)
   */
  findRoute(
    fromNodeId: string,
    toNodeId: string,
    channels: Map<string, Channel>
  ): Route | null {
    // Simple BFS to find a path
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[]; channelPath: string[] }[] = [
      { nodeId: fromNodeId, path: [fromNodeId], channelPath: [] },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.nodeId === toNodeId) {
        return {
          hops: current.path,
          channels: current.channelPath,
          totalFee: 0, // Simplified - no fees
        };
      }

      if (visited.has(current.nodeId)) {
        continue;
      }

      visited.add(current.nodeId);

      // Find all channels connected to this node
      for (const [channelId, channel] of channels) {
        if (channel.status !== 'active') continue;

        let nextNodeId: string | null = null;
        
        if (channel.node1.id === current.nodeId) {
          nextNodeId = channel.node2.id;
        } else if (channel.node2.id === current.nodeId) {
          nextNodeId = channel.node1.id;
        }

        if (nextNodeId && !visited.has(nextNodeId)) {
          queue.push({
            nodeId: nextNodeId,
            path: [...current.path, nextNodeId],
            channelPath: [...current.channelPath, channelId],
          });
        }
      }
    }

    return null; // No route found
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
