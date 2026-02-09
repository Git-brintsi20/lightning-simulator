import { useState } from 'react';
import { ChannelManager } from './lib/ChannelManager';
import type { Channel, Node, Payment } from './types';
import { ChannelCreator } from './components/channel/ChannelCreator';
import { ChannelVisualizer } from './components/channel/ChannelVisualizer';
import { ChannelCloser } from './components/channel/ChannelCloser';
import { TransactionDisplay } from './components/transaction/TransactionDisplay';
import { PaymentForm } from './components/payment/PaymentForm';
import { PaymentHistory } from './components/payment/PaymentHistory';
import { MultiHopSetup } from './components/htlc/MultiHopSetup';
import { NetworkVisualizer } from './components/network/NetworkVisualizer';

// Initialize nodes
const alice: Node = {
  id: 'alice',
  name: 'Alice',
  color: '#3b82f6', // Blue
};

const bob: Node = {
  id: 'bob',
  name: 'Bob',
  color: '#10b981', // Green
};

const carol: Node = {
  id: 'carol',
  name: 'Carol',
  color: '#8b5cf6', // Purple
};

// Initialize channel manager
const channelManager = new ChannelManager();

function App() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'channel' | 'transaction' | 'payment' | 'history' | 'htlc' | 'close' | 'network'>('create');
  const [activeSender, setActiveSender] = useState<Node>(alice);

  const handleCreateChannel = (fundingAmount: number) => {
    const newChannel = channelManager.createChannel(alice, bob, fundingAmount);
    setChannel(newChannel);
    setActiveTab('channel');
  };

  const handleSendPayment = (amount: number, sender: Node) => {
    if (!channel) return;

    const payment = channelManager.sendPayment(channel.id, sender.id, amount);
    if (payment) {
      const updatedChannel = channelManager.getChannel(channel.id);
      if (updatedChannel) {
        setChannel({ ...updatedChannel });
      }
      setPayments([...channelManager.getChannelPayments(channel.id)]);
    }
  };

  const handleCooperativeClose = () => {
    if (!channel) return;
    channelManager.closeChannel(channel.id);
    const updatedChannel = channelManager.getChannel(channel.id);
    if (updatedChannel) {
      setChannel({ ...updatedChannel });
    }
  };

  const handleForceClose = (publishOldState: boolean) => {
    if (!channel) return;
    channelManager.forceCloseChannel(channel.id, publishOldState);
    const updatedChannel = channelManager.getChannel(channel.id);
    if (updatedChannel) {
      setChannel({ ...updatedChannel });
    }
  };

  const getSenderBalance = () => {
    if (!channel) return 0;
    return activeSender.id === alice.id ? channel.balance1 : channel.balance2;
  };

  const getReceiverNode = () => {
    return activeSender.id === alice.id ? bob : alice;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-lightning-400 to-bitcoin-500 bg-clip-text text-transparent">
            ⚡ Lightning Network Simulator
          </h1>
          <p className="text-gray-400 text-lg">
            Learn how Bitcoin's Layer 2 payment channels work
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📝 Create Channel
          </button>
          <button
            onClick={() => setActiveTab('channel')}
            disabled={!channel}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'channel'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            📊 Channel State
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            disabled={!channel || channel.status !== 'active'}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'payment'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ⚡ Send Payment
          </button>
          <button
            onClick={() => setActiveTab('history')}
            disabled={!channel}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            📜 History
          </button>
          <button
            onClick={() => setActiveTab('transaction')}
            disabled={!channel}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'transaction'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            🔍 Transaction
          </button>
          <button
            onClick={() => setActiveTab('htlc')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'htlc'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔐 HTLC Demo
          </button>
          <button
            onClick={() => setActiveTab('close')}
            disabled={!channel || channel.status === 'closed'}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'close'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            🔒 Close Channel
          </button>
          <button
            onClick={() => setActiveTab('network')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'network'
                ? 'bg-lightning-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🌐 Network View
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'create' && (
            <ChannelCreator
              node1={alice}
              node2={bob}
              onCreateChannel={handleCreateChannel}
              disabled={channel !== null}
            />
          )}

          {activeTab === 'channel' && channel && (
            <ChannelVisualizer channel={channel} />
          )}

          {activeTab === 'payment' && channel && (
            <div className="space-y-6">
              {/* Sender Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">Select Sender</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveSender(alice)}
                    className={`flex-1 py-4 rounded-lg font-semibold transition-all ${
                      activeSender.id === alice.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {alice.name}
                  </button>
                  <button
                    onClick={() => setActiveSender(bob)}
                    className={`flex-1 py-4 rounded-lg font-semibold transition-all ${
                      activeSender.id === bob.id
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {bob.name}
                  </button>
                </div>
              </div>
              
              <PaymentForm
                sender={activeSender}
                receiver={getReceiverNode()}
                senderBalance={getSenderBalance()}
                onSendPayment={handleSendPayment}
                disabled={channel.status !== 'active'}
              />
            </div>
          )}

          {activeTab === 'history' && channel && (
            <PaymentHistory
              payments={payments}
              nodeName1={alice.name}
              nodeName2={bob.name}
            />
          )}

          {activeTab === 'transaction' && channel && (
            <TransactionDisplay
              transaction={channel.fundingTx}
              title="Funding Transaction"
            />
          )}

          {activeTab === 'htlc' && (
            <MultiHopSetup availableNodes={[alice, bob, carol]} />
          )}

          {activeTab === 'close' && channel && (
            <ChannelCloser
              channel={channel}
              onCooperativeClose={handleCooperativeClose}
              onForceClose={handleForceClose}
            />
          )}

          {activeTab === 'network' && (
            <NetworkVisualizer />
          )}
        </div>

        {/* Info message */}
        {channel && activeTab !== 'create' && activeTab !== 'htlc' && activeTab !== 'network' && (
          <div className="max-w-4xl mx-auto mt-8">
            <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
              <h4 className="font-semibold text-green-300 mb-2">
                ✅ Channel is Active!
              </h4>
              <p className="text-sm text-gray-300">
                Channel capacity: {channel.capacity} BTC • 
                Commitment version: {channel.commitmentTxVersion} • 
                Payments: {payments.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

