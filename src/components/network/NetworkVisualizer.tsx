import React, { useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, MiniMap, useNodesState, useEdgesState, ConnectionLineType } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { Node as LNNode } from '../../types';
import { formatBTC } from '../../utils/crypto';

// Create initial network topology
const createNetworkTopology = () => {
  const networkNodes: LNNode[] = [
    { id: 'alice', name: 'Alice', color: '#3b82f6' },
    { id: 'bob', name: 'Bob', color: '#10b981' },
    { id: 'carol', name: 'Carol', color: '#8b5cf6' },
    { id: 'dave', name: 'Dave', color: '#f59e0b' },
    { id: 'emma', name: 'Emma', color: '#ec4899' },
    { id: 'frank', name: 'Frank', color: '#06b6d4' },
    { id: 'grace', name: 'Grace', color: '#84cc16' },
    { id: 'henry', name: 'Henry', color: '#f43f5e' },
  ];

  // Create nodes for React Flow
  const nodes: Node[] = networkNodes.map((node, index) => {
    const angle = (index / networkNodes.length) * 2 * Math.PI;
    const radius = 300;
    return {
      id: node.id,
      type: 'default',
      position: {
        x: 400 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      },
      data: {
        label: (
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-1"
              style={{ backgroundColor: node.color }}
            >
              {node.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-white">{node.name}</span>
          </div>
        ),
      },
      style: {
        background: 'transparent',
        border: 'none',
        padding: 0,
      },
    };
  });

  // Create random channels (edges)
  const channels: { source: string; target: string; capacity: number }[] = [
    { source: 'alice', target: 'bob', capacity: 0.5 },
    { source: 'bob', target: 'carol', capacity: 0.3 },
    { source: 'carol', target: 'dave', capacity: 0.4 },
    { source: 'dave', target: 'emma', capacity: 0.6 },
    { source: 'emma', target: 'frank', capacity: 0.2 },
    { source: 'frank', target: 'grace', capacity: 0.5 },
    { source: 'grace', target: 'henry', capacity: 0.3 },
    { source: 'henry', target: 'alice', capacity: 0.4 },
    { source: 'alice', target: 'carol', capacity: 0.3 },
    { source: 'bob', target: 'dave', capacity: 0.4 },
    { source: 'emma', target: 'grace', capacity: 0.5 },
  ];

  const edges: Edge[] = channels.map((channel, index) => ({
    id: `e${index}`,
    source: channel.source,
    target: channel.target,
    type: ConnectionLineType.SimpleBezier,
    style: { stroke: '#6b7280', strokeWidth: 3 },
    label: `${formatBTC(channel.capacity)}`,
    labelStyle: { fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' },
    labelBgStyle: { fill: '#1f2937' },
    data: { capacity: channel.capacity },
  }));

  return { nodes, edges, networkNodes };
};

export const NetworkVisualizer: React.FC = () => {
  const { nodes: initialNodes, edges: initialEdges } = createNetworkTopology();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [route, setRoute] = useState<string[]>([]);

  // Simple BFS pathfinding
  const findPath = useCallback((source: string, target: string): string[] => {
    if (source === target) return [source];

    const visited = new Set<string>();
    const queue: { node: string; path: string[] }[] = [{ node: source, path: [source] }];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.node === target) {
        return current.path;
      }

      if (visited.has(current.node)) continue;
      visited.add(current.node);

      // Find connected nodes
      const connectedEdges = edges.filter(
        (e) => e.source === current.node || e.target === current.node
      );

      for (const edge of connectedEdges) {
        const nextNode = edge.source === current.node ? edge.target : edge.source;
        if (!visited.has(nextNode)) {
          queue.push({
            node: nextNode,
            path: [...current.path, nextNode],
          });
        }
      }
    }

    return [];
  }, [edges]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!selectedSource) {
      setSelectedSource(node.id);
      setSelectedTarget(null);
      setRoute([]);
      
      // Highlight selected source
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            opacity: n.id === node.id ? 1 : 0.5,
          },
        }))
      );
    } else if (node.id === selectedSource) {
      // Deselect
      setSelectedSource(null);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            opacity: 1,
          },
        }))
      );
    } else {
      setSelectedTarget(node.id);
      const path = findPath(selectedSource, node.id);
      setRoute(path);

      // Highlight route
      const routeSet = new Set(path);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          style: {
            ...n.style,
            opacity: routeSet.has(n.id) ? 1 : 0.3,
          },
        }))
      );

      // Highlight route edges
      setEdges((eds) =>
        eds.map((e) => {
          const sourceIndex = path.indexOf(e.source);
          const targetIndex = path.indexOf(e.target);
          const isInRoute =
            sourceIndex !== -1 &&
            targetIndex !== -1 &&
            Math.abs(sourceIndex - targetIndex) === 1;

          return {
            ...e,
            style: {
              ...e.style,
              stroke: isInRoute ? '#fbbf24' : '#6b7280',
              strokeWidth: isInRoute ? 5 : 3,
            },
            animated: isInRoute,
          };
        })
      );
    }
  }, [selectedSource, findPath, setNodes, setEdges]);

  const handleReset = () => {
    setSelectedSource(null);
    setSelectedTarget(null);
    setRoute([]);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: 1,
        },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: '#6b7280',
          strokeWidth: 3,
        },
        animated: false,
      }))
    );
  };

  return (
    <div className="card h-[700px] relative">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-lightning-400 mb-2">
          🌐 Lightning Network Topology
        </h3>
        <p className="text-gray-400 text-sm">
          Click two nodes to find a payment route between them
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: 'calc(100% - 100px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={() => '#6b7280'}
          />
        </ReactFlow>
      </div>

      {/* Status panel */}
      <div className="absolute bottom-4 left-4 right-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
        {!selectedSource && (
          <p className="text-sm text-gray-400">
            👆 Click a node to select it as the payment source
          </p>
        )}
        {selectedSource && !selectedTarget && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-300">
              Source: <span className="font-bold text-lightning-400">{selectedSource}</span>
              <span className="text-gray-500 ml-2">→ Click destination node</span>
            </p>
            <button onClick={handleReset} className="btn-secondary text-xs py-1 px-3">
              Reset
            </button>
          </div>
        )}
        {selectedSource && selectedTarget && route.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-green-400">
                ✅ Route Found: {route.length} hops
              </p>
              <button onClick={handleReset} className="btn-secondary text-xs py-1 px-3">
                Reset
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              {route.map((nodeId, index) => (
                <React.Fragment key={nodeId}>
                  <span className="font-semibold text-lightning-300">{nodeId}</span>
                  {index < route.length - 1 && (
                    <span className="text-gray-500">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        {selectedSource && selectedTarget && route.length === 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-400">
              ❌ No route found between {selectedSource} and {selectedTarget}
            </p>
            <button onClick={handleReset} className="btn-secondary text-xs py-1 px-3">
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
