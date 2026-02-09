import React from 'react';
import { motion } from 'framer-motion';
import type { Transaction } from '../../types';
import { formatBTC, truncateTxId, formatTimestamp } from '../../utils/crypto';

interface TransactionDisplayProps {
  transaction: Transaction;
  title?: string;
}

export const TransactionDisplay: React.FC<TransactionDisplayProps> = ({
  transaction,
  title,
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'funding':
        return 'bg-green-600';
      case 'commitment':
        return 'bg-blue-600';
      case 'closing':
        return 'bg-yellow-600';
      case 'penalty':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'funding':
        return '🔓';
      case 'commitment':
        return '📝';
      case 'closing':
        return '🔒';
      case 'penalty':
        return '⚠️';
      default:
        return '📄';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-200">
          {title || 'Transaction Details'}
        </h3>
        <span className={`${getTypeColor(transaction.type)} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2`}>
          <span>{getTypeIcon(transaction.type)}</span>
          {transaction.type.toUpperCase()}
        </span>
      </div>

      {/* Transaction ID */}
      <div className="mb-4 bg-gray-700 p-3 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
        <p className="font-mono text-sm text-lightning-300 break-all">
          {transaction.id}
        </p>
      </div>

      {/* Version and Timestamp */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Version</p>
          <p className="font-semibold text-white">{transaction.version}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Timestamp</p>
          <p className="text-sm text-white">{formatTimestamp(transaction.timestamp)}</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">
          Inputs ({transaction.inputs.length})
        </h4>
        <div className="space-y-2">
          {transaction.inputs.map((input, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs text-gray-400">TXID</p>
                <p className="text-xs text-lightning-300 font-mono">
                  {truncateTxId(input.txid)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-sm font-semibold text-green-400">
                  {formatBTC(input.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outputs */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">
          Outputs ({transaction.outputs.length})
        </h4>
        <div className="space-y-2">
          {transaction.outputs.map((output, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-xs text-lightning-300 font-mono">
                  {truncateTxId(output.address, 10)}
                </p>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-sm font-semibold text-green-400">
                  {formatBTC(output.amount)}
                </p>
              </div>
              {output.scriptPubKey && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-400 mb-1">Script</p>
                  <p className="text-xs text-gray-300 font-mono">
                    {output.scriptPubKey}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
