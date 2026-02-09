import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Node } from '../../types';

interface ChannelCreatorProps {
  node1: Node;
  node2: Node;
  onCreateChannel: (fundingAmount: number) => void;
  disabled?: boolean;
}

export const ChannelCreator: React.FC<ChannelCreatorProps> = ({
  node1,
  node2,
  onCreateChannel,
  disabled = false,
}) => {
  const [fundingAmount, setFundingAmount] = useState<string>('0.1');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    const amount = parseFloat(fundingAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid funding amount');
      return;
    }

    setIsCreating(true);
    setTimeout(() => {
      onCreateChannel(amount);
      setIsCreating(false);
    }, 1000); // Simulate transaction creation delay
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-lightning-400">
        ⚡ Create Lightning Channel
      </h2>

      <div className="space-y-6">
        {/* Node selection display */}
        <div className="flex items-center justify-around bg-gray-700 p-4 rounded-lg">
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2"
              style={{ backgroundColor: node1.color }}
            >
              {node1.name.charAt(0)}
            </div>
            <p className="font-semibold">{node1.name}</p>
            <p className="text-xs text-gray-400">Funder</p>
          </div>

          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-3xl"
          >
            ⚡
          </motion.div>

          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2"
              style={{ backgroundColor: node2.color }}
            >
              {node2.name.charAt(0)}
            </div>
            <p className="font-semibold">{node2.name}</p>
            <p className="text-xs text-gray-400">Recipient</p>
          </div>
        </div>

        {/* Funding amount input */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Funding Amount (BTC)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            className="input-field w-full"
            placeholder="0.1"
            disabled={disabled}
          />
          <p className="text-xs text-gray-400 mt-1">
            This amount will be locked in the channel and can be used for off-chain payments
          </p>
        </div>

        {/* Create button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          disabled={disabled || isCreating}
          className="btn-primary w-full py-3 text-lg"
        >
          {isCreating ? (
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
              Creating Channel...
            </span>
          ) : (
            'Open Payment Channel'
          )}
        </motion.button>

        {/* Info box */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2">💡 What happens next?</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• A funding transaction is created on-chain</li>
            <li>• {node1.name} locks {fundingAmount} BTC in a 2-of-2 multisig</li>
            <li>• Both parties can now transact instantly off-chain</li>
            <li>• No blockchain fees for channel payments!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
