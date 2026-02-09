import React from 'react';
import { motion } from 'framer-motion';
import type { Payment } from '../../types';
import { formatBTC, formatTimestamp } from '../../utils/crypto';

interface PaymentHistoryProps {
  payments: Payment[];
  nodeName1: string;
  nodeName2: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  nodeName1,
  nodeName2,
}) => {
  if (payments.length === 0) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">💳</div>
        <h3 className="text-xl font-bold mb-2 text-gray-300">No Payments Yet</h3>
        <p className="text-gray-400">Send a payment to see it appear here</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 text-lightning-400">
        Payment History ({payments.length})
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {payments.map((payment, index) => {
          const isAliceSender = payment.from === 'alice';
          const senderName = isAliceSender ? nodeName1 : nodeName2;
          const receiverName = isAliceSender ? nodeName2 : nodeName1;

          return (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">
                    {isAliceSender ? '→' : '←'}
                  </span>
                  <div>
                    <p className="font-semibold text-white">
                      {senderName} → {receiverName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatTimestamp(payment.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-lightning-400">
                    {formatBTC(payment.amount)}
                  </p>
                  {payment.htlc && (
                    <span className="text-xs px-2 py-1 bg-purple-600 rounded-full">
                      HTLC
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-400 font-mono truncate">
                ID: {payment.id}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Payments</p>
            <p className="text-2xl font-bold text-lightning-400">{payments.length}</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">Total Volume</p>
            <p className="text-lg font-bold text-green-400">
              {formatBTC(payments.reduce((sum, p) => sum + p.amount, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
