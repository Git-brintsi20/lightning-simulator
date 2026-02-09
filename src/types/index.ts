// Core Types for Lightning Network Simulator

export interface Node {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'funding' | 'commitment' | 'closing' | 'penalty';
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  timestamp: number;
  version: number;
}

export interface TransactionInput {
  txid: string;
  vout: number;
  amount: number;
}

export interface TransactionOutput {
  address: string;
  amount: number;
  scriptPubKey?: string;
}

export interface Channel {
  id: string;
  node1: Node;
  node2: Node;
  capacity: number;
  balance1: number; // Balance of node1
  balance2: number; // Balance of node2
  fundingTx: Transaction;
  commitmentTxVersion: number;
  status: 'pending' | 'active' | 'closing' | 'closed';
  createdAt: number;
  revocationSecrets: string[]; // Simplified revocation mechanism
}

export interface Payment {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  channelId: string;
  htlc?: HTLC;
}

export interface HTLC {
  hash: string;
  preimage?: string;
  amount: number;
  timelock: number;
  state: 'pending' | 'fulfilled' | 'failed' | 'expired';
}

export interface Route {
  hops: string[]; // Node IDs
  totalFee: number;
  channels: string[]; // Channel IDs
}

export interface NetworkNode extends Node {
  x: number;
  y: number;
  channels: string[];
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  capacity: number;
  balance1: number;
  balance2: number;
}

export interface ChannelState {
  channels: Map<string, Channel>;
  payments: Payment[];
  nodes: Map<string, Node>;
}

export interface ClosingTransaction {
  type: 'cooperative' | 'force';
  finalBalances: {
    node1: number;
    node2: number;
  };
  penaltyApplied?: boolean;
}