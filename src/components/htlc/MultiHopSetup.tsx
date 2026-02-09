import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Node } from '../../types';
import { RouteVisualizer } from './RouteVisualizer';
import { HTLCManager } from '../../lib/HTLCManager';

interface MultiHopSetupProps {
  availableNodes: Node[];
}

const htlcManager = new HTLCManager();

export const MultiHopSetup: React.FC<MultiHopSetupProps> = ({ availableNodes }) => {
  const [amount, setAmount] = useState<string>('0.05');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<{
    nodes: (Node & { index: number })[];
    hash: string;
    preimage: string;
    amount: number;
  } | null>(null);

  const handleStartSimulation = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Create HTLC
    const { htlc, preimage } = htlcManager.createHTLC(paymentAmount);

    // Set up route with all available nodes
    const routeNodes = availableNodes.map((node, index) => ({
      ...node,
      index,
    }));

    setSimulationData({
      nodes: routeNodes,
      hash: htlc.hash,
      preimage,
      amount: paymentAmount,
    });

    setIsSimulating(true);
  };

  const handleSimulationComplete = () => {
    // Keep showing the completed state
  };

  const handleReset = () => {
    setIsSimulating(false);
    setSimulationData(null);
  };

  if (isSimulating && simulationData) {
    return (
      <div className="space-y-6">
        <RouteVisualizer
          nodes={simulationData.nodes}
          amount={simulationData.amount}
          hash={simulationData.hash}
          preimage={simulationData.preimage}
          onSimulationComplete={handleSimulationComplete}
        />
        <button onClick={handleReset} className="btn-secondary w-full">
          Reset & Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-lightning-400">
        🔐 HTLC Multi-Hop Payment Demo
      </h2>

      <div className="space-y-6">
        {/* Explanation */}
        <div className="bg-purple-900 bg-opacity-30 border border-purple-500 rounded-lg p-4">
          <h4 className="font-semibold text-purple-300 mb-2">🎓 How HTLCs Work</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• <strong>Hash Lock:</strong> Payment is locked with a secret hash</li>
            <li>• <strong>Time Lock:</strong> Payment expires if not claimed in time</li>
            <li>• <strong>Routing:</strong> Payment hops through intermediaries</li>
            <li>• <strong>Atomic:</strong> Either everyone gets paid or no one does</li>
          </ul>
        </div>

        {/* Route preview */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Payment Route</h3>
          <div className="flex items-center justify-center space-x-4">
            {availableNodes.map((node, index) => (
              <React.Fragment key={node.id}>
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-2 opacity-70"
                    style={{ backgroundColor: node.color }}
                  >
                    {node.name.charAt(0)}
                  </div>
                  <p className="text-sm font-semibold text-white">{node.name}</p>
                </div>
                {index < availableNodes.length - 1 && (
                  <div className="text-2xl text-gray-500">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            {availableNodes[0]?.name} wants to pay {availableNodes[availableNodes.length - 1]?.name} through {availableNodes.length - 2} intermediar{availableNodes.length - 2 === 1 ? 'y' : 'ies'}
          </p>
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">
            Payment Amount (BTC)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field w-full text-lg"
            placeholder="0.05"
          />
        </div>

        {/* Start button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartSimulation}
          className="btn-primary w-full py-3 text-lg"
        >
          ▶️ Start HTLC Simulation
        </motion.button>

        {/* Additional info */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-2">💡 Watch For:</h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 🔒 <strong>Forward Phase:</strong> HTLCs locked at each hop</li>
            <li>• 🔓 <strong>Reveal Phase:</strong> Receiver reveals secret preimage</li>
            <li>• ✅ <strong>Fulfill Phase:</strong> HTLCs claimed backwards</li>
            <li>• ⚡ <strong>Result:</strong> Atomic payment through the network!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
