import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Channel } from '../../types';
import { formatBTC, createClosingTransaction } from '../../utils/crypto';

interface ChannelCloserProps {
  channel: Channel;
  onCooperativeClose: () => void;
  onForceClose: (publishOldState: boolean) => void;
}

export const ChannelCloser: React.FC<ChannelCloserProps> = ({
  channel,
  onCooperativeClose,
  onForceClose,
}) => {
  const [closingType, setClosingType] = useState<'cooperative' | 'force' | null>(null);
  const [showOldStateWarning, setShowOldStateWarning] = useState(false);
  const [publishOldState, setPublishOldState] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closed, setClosed] = useState(false);
  const [penaltyApplied, setPenaltyApplied] = useState(false);

  const handleCooperativeClose = () => {
    setClosingType('cooperative');
    setIsClosing(true);
    
    setTimeout(() => {
      onCooperativeClose();
      setIsClosing(false);
      setClosed(true);
    }, 2000);
  };

  const handleForceClose = () => {
    setClosingType('force');
    setShowOldStateWarning(true);
  };

  const confirmForceClose = () => {
    setIsClosing(true);
    setShowOldStateWarning(false);

    setTimeout(() => {
      onForceClose(publishOldState);
      setIsClosing(false);
      setClosed(true);
      if (publishOldState) {
        setPenaltyApplied(true);
      }
    }, 2000);
  };

  if (closed) {
    const closingTx = createClosingTransaction(channel, penaltyApplied);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
      >
        <div className="text-center mb-6">
          {penaltyApplied ? (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">
                Penalty Applied!
              </h3>
              <p className="text-gray-300">
                Publishing an old state resulted in all funds going to the honest party
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                Channel Closed Successfully
              </h3>
              <p className="text-gray-300">
                {closingType === 'cooperative' ? 'Cooperative close completed' : 'Force close completed'}
              </p>
            </>
          )}
        </div>

        {/* Final balances */}
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-300">Final Settlement</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: channel.node1.color }}
                >
                  {channel.node1.name.charAt(0)}
                </div>
                <span className="font-semibold">{channel.node1.name}</span>
              </div>
              <span className={`text-lg font-bold ${penaltyApplied ? 'text-red-400' : 'text-green-400'}`}>
                {formatBTC(closingTx.outputs[0].amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: channel.node2.color }}
                >
                  {channel.node2.name.charAt(0)}
                </div>
                <span className="font-semibold">{channel.node2.name}</span>
              </div>
              <span className={`text-lg font-bold ${penaltyApplied ? 'text-green-400' : 'text-green-400'}`}>
                {formatBTC(closingTx.outputs[1].amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Closing transaction */}
        <div className="bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Closing Transaction ID</p>
          <p className="font-mono text-xs text-lightning-300 break-all">{closingTx.id}</p>
        </div>

        {penaltyApplied && (
          <div className="mt-6 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
            <h4 className="font-semibold text-red-300 mb-2">⚠️ Educational Warning</h4>
            <p className="text-sm text-gray-300">
              This demonstrates Lightning's penalty mechanism. Broadcasting old channel states
              allows the other party to claim ALL funds. Always close channels cooperatively!
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  if (isClosing) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-2xl font-bold mb-4 text-lightning-400">
          Closing Channel...
        </h3>
        <div className="flex justify-center">
          <svg className="animate-spin h-12 w-12 text-lightning-400" viewBox="0 0 24 24">
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
        </div>
        <p className="mt-4 text-gray-400">
          Broadcasting closing transaction to blockchain...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cooperative Close */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="card cursor-pointer"
        onClick={handleCooperativeClose}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-3xl">🤝</span>
              <h3 className="text-xl font-bold text-green-400">Cooperative Close</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Both parties agree to close the channel. Final balances are settled on-chain
              with minimal fees.
            </p>
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-2 text-gray-300">Final Balances:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{channel.node1.name}:</span>
                  <span className="text-green-400 font-semibold">
                    {formatBTC(channel.balance1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{channel.node2.name}:</span>
                  <span className="text-green-400 font-semibold">
                    {formatBTC(channel.balance2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button className="btn-primary ml-4">
            Close
          </button>
        </div>
      </motion.div>

      {/* Force Close */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="card cursor-pointer border-2 border-red-600"
        onClick={handleForceClose}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-bold text-red-400">Force Close</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Unilaterally close the channel by broadcasting the latest commitment transaction.
              Higher fees and longer settlement time.
            </p>
            <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-1 text-red-300">⚠️ Warning</h4>
              <p className="text-xs text-gray-300">
                Only use when the other party is unresponsive. Broadcasting an old state will
                trigger penalty transaction!
              </p>
            </div>
          </div>
          <button className="btn-danger ml-4">
            Force Close
          </button>
        </div>
      </motion.div>

      {/* Force Close Confirmation Dialog */}
      <AnimatePresence>
        {showOldStateWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowOldStateWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-4 text-red-400">⚠️ Force Close Warning</h3>
              
              <p className="text-gray-300 mb-6">
                You are about to force close this channel. Would you like to simulate
                what happens if you publish an old channel state?
              </p>

              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishOldState}
                    onChange={(e) => setPublishOldState(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <div>
                    <p className="font-semibold text-white">Publish Old State (Demonstration)</p>
                    <p className="text-xs text-gray-400">
                      See what happens when trying to cheat - penalty applied!
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOldStateWarning(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmForceClose}
                  className="btn-danger flex-1"
                >
                  Confirm Force Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
        <h4 className="font-semibold text-blue-300 mb-2">💡 Channel Closing Options</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <strong>Cooperative:</strong> Best option - fast, cheap, both parties agree</li>
          <li>• <strong>Force:</strong> Backup option - use when other party is offline</li>
          <li>• <strong>Penalty:</strong> Security mechanism - prevents publishing old states</li>
        </ul>
      </div>
    </div>
  );
};
