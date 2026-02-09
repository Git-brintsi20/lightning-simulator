import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Node } from '../../types';
import { formatBTC } from '../../utils/crypto';

interface PaymentFormProps {
  sender: Node;
  receiver: Node;
  senderBalance: number;
  onSendPayment: (amount: number, sender: Node) => void;
  disabled?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  sender,
  receiver,
  senderBalance,
  onSendPayment,
  disabled = false,
}) => {
  const [amount, setAmount] = useState<string>('0.01');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (paymentAmount > senderBalance) {
      alert(`Insufficient balance! ${sender.name} only has ${formatBTC(senderBalance)}`);
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      onSendPayment(paymentAmount, sender);
      setIsSending(false);
      setAmount('0.01');
    }, 800); // Simulate payment processing
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-6 text-lightning-400">
        ⚡ Send Payment
      </h3>

      <div className="space-y-6">
        {/* Sender/Receiver Info */}
        <div className="flex items-center justify-center space-x-6 bg-gray-700 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2"
              style={{ backgroundColor: sender.color }}
            >
              {sender.name.charAt(0)}
            </div>
            <p className="font-semibold">{sender.name}</p>
            <p className="text-xs text-gray-400">Sender</p>
            <p className="text-sm text-green-400 mt-1">{formatBTC(senderBalance)}</p>
          </div>

          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-3xl"
          >
            →
          </motion.div>

          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2"
              style={{ backgroundColor: receiver.color }}
            >
              {receiver.name.charAt(0)}
            </div>
            <p className="font-semibold">{receiver.name}</p>
            <p className="text-xs text-gray-400">Receiver</p>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Amount (BTC)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.001"
            max={senderBalance}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field w-full text-lg"
            placeholder="0.01"
            disabled={disabled || isSending}
          />
          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-400">
              Available: {formatBTC(senderBalance)}
            </p>
            <button
              onClick={() => setAmount(senderBalance.toString())}
              className="text-xs text-lightning-400 hover:text-lightning-300"
              disabled={disabled || isSending}
            >
              Max
            </button>
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSend}
          disabled={disabled || isSending}
          className="btn-primary w-full py-3 text-lg"
        >
          {isSending ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            `Send ${amount} BTC`
          )}
        </motion.button>

        {/* Info */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2">💡 Off-Chain Payment</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Instant settlement - no blockchain confirmation needed</li>
            <li>• Zero transaction fees</li>
            <li>• Updates channel balances immediately</li>
            <li>• New commitment transaction created</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
