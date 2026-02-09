import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Node } from '../../types';
import { formatBTC } from '../../utils/crypto';

interface RouteNode extends Node {
  index: number;
}

interface RouteVisualizerProps {
  nodes: RouteNode[];
  amount: number;
  hash: string;
  preimage?: string;
  onSimulationComplete?: () => void;
}

export const RouteVisualizer: React.FC<RouteVisualizerProps> = ({
  nodes,
  amount,
  hash,
  preimage,
  onSimulationComplete,
}) => {
  const [activeHop, setActiveHop] = useState<number>(-1);
  const [hopStates, setHopStates] = useState<Map<number, 'pending' | 'locked' | 'fulfilled'>>(
    new Map()
  );
  const [phase, setPhase] = useState<'setup' | 'forward' | 'reveal' | 'fulfill' | 'complete'>('setup');

  useEffect(() => {
    simulatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const simulatePayment = async () => {
    // Phase 1: Forward payment (lock HTLCs)
    setPhase('forward');
    for (let i = 0; i < nodes.length - 1; i++) {
      setActiveHop(i);
      await delay(1000);
      setHopStates(prev => new Map(prev).set(i, 'locked'));
    }

    // Phase 2: Reveal preimage at destination
    setPhase('reveal');
    setActiveHop(nodes.length - 1);
    await delay(1500);

    // Phase 3: Fulfill HTLCs backwards
    setPhase('fulfill');
    for (let i = nodes.length - 2; i >= 0; i--) {
      setActiveHop(i);
      await delay(800);
      setHopStates(prev => new Map(prev).set(i, 'fulfilled'));
    }

    setPhase('complete');
    setActiveHop(-1);
    
    if (onSimulationComplete) {
      onSimulationComplete();
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getConnectionState = (index: number) => {
    if (phase === 'forward' && index <= activeHop) return 'active';
    if (phase === 'fulfill' || phase === 'complete') return 'fulfilled';
    if (hopStates.get(index) === 'locked') return 'locked';
    return 'inactive';
  };

  const getNodeState = (index: number) => {
    if (hopStates.get(index) === 'fulfilled') return 'fulfilled';
    if (hopStates.get(index) === 'locked') return 'locked';
    if (activeHop === index) return 'active';
    return 'inactive';
  };

  return (
    <div className="card">
      <h3 className="text-2xl font-bold mb-6 text-lightning-400">
        ⚡ Multi-Hop Payment Routing
      </h3>

      {/* Phase indicator */}
      <div className="mb-8 bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Current Phase</p>
            <p className="text-lg font-bold text-white capitalize">{phase}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Amount</p>
            <p className="text-lg font-bold text-lightning-400">{formatBTC(amount)}</p>
          </div>
        </div>
      </div>

      {/* Route visualization */}
      <div className="relative py-12">
        <div className="flex items-center justify-between">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              {/* Node */}
              <div className="flex flex-col items-center z-10">
                <motion.div
                  animate={{
                    scale: activeHop === index ? [1, 1.2, 1] : 1,
                    boxShadow: getNodeState(index) === 'fulfilled'
                      ? '0 0 30px rgba(16, 185, 129, 0.6)'
                      : getNodeState(index) === 'active'
                      ? '0 0 30px rgba(251, 191, 36, 0.6)'
                      : 'none',
                  }}
                  transition={{ duration: 0.5 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                    getNodeState(index) === 'fulfilled'
                      ? 'ring-4 ring-green-500'
                      : getNodeState(index) === 'active'
                      ? 'ring-4 ring-yellow-500'
                      : ''
                  }`}
                  style={{ backgroundColor: node.color }}
                >
                  {getNodeState(index) === 'fulfilled' ? '✓' : node.name.charAt(0)}
                </motion.div>
                <p className="mt-2 font-semibold text-white">{node.name}</p>
                <p className="text-xs text-gray-400">
                  {index === 0 ? 'Sender' : index === nodes.length - 1 ? 'Receiver' : 'Hop'}
                </p>
              </div>

              {/* Connection line */}
              {index < nodes.length - 1 && (
                <div className="flex-1 relative mx-4">
                  {/* Background line */}
                  <div className="h-2 bg-gray-700 rounded"></div>
                  
                  {/* Progress line */}
                  <motion.div
                    className={`absolute top-0 h-2 rounded ${
                      getConnectionState(index) === 'fulfilled'
                        ? 'bg-green-500'
                        : getConnectionState(index) === 'locked'
                        ? 'bg-yellow-500'
                        : getConnectionState(index) === 'active'
                        ? 'bg-lightning-400'
                        : 'bg-gray-700'
                    }`}
                    initial={{ width: 0 }}
                    animate={{
                      width: getConnectionState(index) !== 'inactive' ? '100%' : 0,
                    }}
                    transition={{ duration: 0.8 }}
                  />

                  {/* Lightning bolt animation */}
                  {activeHop === index && phase === 'forward' && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 text-2xl"
                      initial={{ left: 0 }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 0.8 }}
                    >
                      ⚡
                    </motion.div>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* HTLC Details */}
      <div className="mt-8 space-y-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Payment Hash (Lock)</p>
          <p className="font-mono text-xs text-lightning-300 break-all">{hash}</p>
        </div>

        <AnimatePresence>
          {phase === 'reveal' || phase === 'fulfill' || phase === 'complete' ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg"
            >
              <p className="text-sm text-green-400 mb-2">Preimage Revealed (Unlock)</p>
              <p className="font-mono text-xs text-green-300 break-all">{preimage}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Status messages */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2">💡 What's Happening?</h4>
          <p className="text-sm text-gray-300">
            {phase === 'forward' && 'HTLCs are being locked at each hop using the payment hash...'}
            {phase === 'reveal' && `${nodes[nodes.length - 1].name} reveals the preimage to claim the payment!`}
            {phase === 'fulfill' && 'HTLCs are being fulfilled backwards using the preimage...'}
            {phase === 'complete' && 'Payment complete! All HTLCs fulfilled securely.'}
          </p>
        </div>
      </div>
    </div>
  );
};
