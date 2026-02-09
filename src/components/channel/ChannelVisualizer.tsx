import React from 'react';
import { motion } from 'framer-motion';
import type { Channel } from '../../types';
import { formatBTC, calculateLiquidity } from '../../utils/crypto';

interface ChannelVisualizerProps {
  channel: Channel;
}

export const ChannelVisualizer: React.FC<ChannelVisualizerProps> = ({ channel }) => {
  const balance1Percentage = calculateLiquidity(channel.balance1, channel.capacity);
  const balance2Percentage = calculateLiquidity(channel.balance2, channel.capacity);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-lightning-400">Payment Channel</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          channel.status === 'active' ? 'bg-green-600' : 
          channel.status === 'closed' ? 'bg-red-600' : 'bg-yellow-600'
        }`}>
          {channel.status.toUpperCase()}
        </span>
      </div>

      {/* Nodes */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
            style={{ backgroundColor: channel.node1.color }}
          >
            {channel.node1.name.charAt(0)}
          </div>
          <p className="mt-2 font-semibold">{channel.node1.name}</p>
          <p className="text-sm text-gray-400">{formatBTC(channel.balance1)}</p>
        </motion.div>

        <div className="flex-1 mx-6">
          <div className="relative">
            {/* Channel capacity label */}
            <div className="text-center mb-2 text-sm text-gray-400">
              Capacity: {formatBTC(channel.capacity)}
            </div>
            
            {/* Balance bar */}
            <div className="h-12 bg-gray-700 rounded-lg overflow-hidden flex shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${balance1Percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: channel.node1.color }}
              >
                {balance1Percentage > 10 && `${balance1Percentage.toFixed(0)}%`}
              </motion.div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${balance2Percentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: channel.node2.color }}
              >
                {balance2Percentage > 10 && `${balance2Percentage.toFixed(0)}%`}
              </motion.div>
            </div>

            {/* Commitment version */}
            <div className="text-center mt-2 text-xs text-gray-500">
              Commitment Transaction Version: {channel.commitmentTxVersion}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
            style={{ backgroundColor: channel.node2.color }}
          >
            {channel.node2.name.charAt(0)}
          </div>
          <p className="mt-2 font-semibold">{channel.node2.name}</p>
          <p className="text-sm text-gray-400">{formatBTC(channel.balance2)}</p>
        </motion.div>
      </div>

      {/* Channel Info */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-400 mb-1">Channel ID</p>
          <p className="font-mono text-xs text-lightning-300 truncate">{channel.id}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg">
          <p className="text-gray-400 mb-1">Funding TX</p>
          <p className="font-mono text-xs text-lightning-300 truncate">{channel.fundingTx.id}</p>
        </div>
      </div>
    </div>
  );
};
