import CryptoJS from 'crypto-js';
import type { Transaction, Channel, Node } from '../types';

/**
 * Generate a random hash using SHA256
 */
export function generateHash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Generate a random preimage (secret)
 */
export function generatePreimage(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}

/**
 * Verify if a preimage matches a hash
 */
export function verifyPreimage(preimage: string, hash: string): boolean {
  return generateHash(preimage) === hash;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a mock Bitcoin address
 */
export function generateAddress(prefix: string = 'bc1'): string {
  const random = Math.random().toString(36).substr(2, 40);
  return `${prefix}${random}`;
}

/**
 * Create a funding transaction
 */
export function createFundingTransaction(
  node: Node,
  amount: number
): Transaction {
  return {
    id: generateId(),
    type: 'funding',
    version: 1,
    timestamp: Date.now(),
    inputs: [
      {
        txid: generateHash(node.id + Date.now()),
        vout: 0,
        amount: amount,
      },
    ],
    outputs: [
      {
        address: generateAddress('2of2multisig-'),
        amount: amount,
        scriptPubKey: '2-of-2 multisig script',
      },
    ],
  };
}

/**
 * Create a commitment transaction
 */
export function createCommitmentTransaction(
  channel: Channel,
  version: number
): Transaction {
  return {
    id: generateId(),
    type: 'commitment',
    version: version,
    timestamp: Date.now(),
    inputs: [
      {
        txid: channel.fundingTx.id,
        vout: 0,
        amount: channel.capacity,
      },
    ],
    outputs: [
      {
        address: generateAddress(),
        amount: channel.balance1,
      },
      {
        address: generateAddress(),
        amount: channel.balance2,
      },
    ],
  };
}

/**
 * Create a closing transaction
 */
export function createClosingTransaction(
  channel: Channel,
  isPenalty: boolean = false
): Transaction {
  const node1Amount = isPenalty ? 0 : channel.balance1;
  const node2Amount = isPenalty ? channel.capacity : channel.balance2;

  return {
    id: generateId(),
    type: isPenalty ? 'penalty' : 'closing',
    version: 1,
    timestamp: Date.now(),
    inputs: [
      {
        txid: channel.fundingTx.id,
        vout: 0,
        amount: channel.capacity,
      },
    ],
    outputs: [
      {
        address: generateAddress(),
        amount: node1Amount,
      },
      {
        address: generateAddress(),
        amount: node2Amount,
      },
    ],
  };
}

/**
 * Format BTC amount with proper decimals
 */
export function formatBTC(amount: number): string {
  return amount.toFixed(8) + ' BTC';
}

/**
 * Format satoshis to BTC
 */
export function satoshisToBTC(satoshis: number): number {
  return satoshis / 100000000;
}

/**
 * Format BTC to satoshis
 */
export function btcToSatoshis(btc: number): number {
  return Math.round(btc * 100000000);
}

/**
 * Truncate transaction ID for display
 */
export function truncateTxId(txid: string, length: number = 8): string {
  if (txid.length <= length * 2) return txid;
  return `${txid.slice(0, length)}...${txid.slice(-length)}`;
}

/**
 * Calculate channel liquidity percentage
 */
export function calculateLiquidity(balance: number, capacity: number): number {
  return (balance / capacity) * 100;
}

/**
 * Generate a revocation secret
 */
export function generateRevocationSecret(): string {
  return generateHash(generatePreimage());
}

/**
 * Format timestamp to readable date
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}