import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChild, updateChild, saveNotification, addChildNotification } from '@/lib/appState';
import { getCurrencySymbol } from '@/lib/currency';
import { ArrowLeft, Plus, Minus } from 'lucide-react';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function KidSavings() {
  const navigate = useNavigate();
  const [child, setChild] = useState<any | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMode, setTransferMode] = useState<'in' | 'out'>('in');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const childId = localStorage.getItem('currentChildId');
    const isKid = localStorage.getItem('kidMode');

    if (!isKid || !childId) {
      navigate('/kid-login');
      return;
    }

    const foundChild = getChild(childId);
    if (!foundChild) {
      navigate('/kid-login');
      return;
    }

    setChild(foundChild);
  }, [navigate]);

  const handleTransfer = () => {
    setError('');
    setSuccess('');

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (transferMode === 'in') {
      // Transfer from main balance to savings
      if (child.balance < amount) {
        setError('Insufficient balance');
        return;
      }

      const updatedChild = {
        ...child,
        balance: child.balance - amount,
        piggyBank: child.piggyBank + amount,
      };

      updateChild(child.id, updatedChild);
      setChild(updatedChild);

      // Create notification
      const notification = {
        id: generateId(),
        type: 'money_transferred',
        message: `Transferred ${getCurrencySymbol('INR')}${amount.toFixed(2)} to Savings`,
        timestamp: Date.now(),
        amount,
        read: false,
      };

      saveNotification(notification);
      addChildNotification(child.id, notification);

      setSuccess(`Successfully transferred ${getCurrencySymbol('INR')}${amount.toFixed(2)} to Savings`);
    } else {
      // Transfer from savings to main balance
      if (child.piggyBank < amount) {
        setError('Insufficient savings');
        return;
      }

      const updatedChild = {
        ...child,
        balance: child.balance + amount,
        piggyBank: child.piggyBank - amount,
      };

      updateChild(child.id, updatedChild);
      setChild(updatedChild);

      // Create notification
      const notification = {
        id: generateId(),
        type: 'money_withdrawn',
        message: `Withdrew ${getCurrencySymbol('INR')}${amount.toFixed(2)} from Savings`,
        timestamp: Date.now(),
        amount,
        read: false,
      };

      saveNotification(notification);
      addChildNotification(child.id, notification);

      setSuccess(`Successfully withdrew ${getCurrencySymbol('INR')}${amount.toFixed(2)} from Savings`);
    }

    setTransferAmount('');
  };

  if (!child) {
    return null;
  }

  const currencySymbol = getCurrencySymbol('INR'); // TODO: get from app state

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/kid-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Savings</h1>
          <p className="text-gray-600">Save money for the future</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Savings Balance Card */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-2xl p-12 text-white mb-8">
          <p className="text-pink-100 mb-2">Your Savings Balance</p>
          <h2 className="text-5xl font-bold">{currencySymbol}{child.piggyBank.toFixed(2)}</h2>
          <p className="text-pink-100 mt-4 text-sm">
            Main Balance: {currencySymbol}{child.balance.toFixed(2)}
          </p>
        </div>

        {/* Transfer Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Transfer Money</h3>

          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setTransferMode('in')}
              className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                transferMode === 'in'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-200'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">To Savings</span>
            </button>
            <button
              onClick={() => setTransferMode('out')}
              className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                transferMode === 'out'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <Minus className="w-5 h-5" />
              <span className="font-semibold">From Savings</span>
            </button>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                {currencySymbol}
              </span>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            {transferMode === 'in' ? (
              <p className="text-sm text-gray-600 mt-2">
                Available: {currencySymbol}{child.balance.toFixed(2)}
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-2">
                Available: {currencySymbol}{child.piggyBank.toFixed(2)}
              </p>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}

          {/* Transfer Button */}
          <button
            onClick={handleTransfer}
            disabled={!transferAmount || parseFloat(transferAmount) <= 0}
            className={`w-full font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 ${
              transferMode === 'in'
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
          >
            {transferMode === 'in' ? (
              <>
                <Plus className="w-5 h-5" />
                Move to Savings
              </>
            ) : (
              <>
                <Minus className="w-5 h-5" />
                Withdraw from Savings
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
          <h4 className="font-bold text-gray-900 mb-2">💡 What is Savings?</h4>
          <p className="text-gray-700 text-sm">
            Your Savings is a special place to set aside money that you want to save for something special. 
            You can move money between your main balance and savings anytime!
          </p>
        </div>
      </main>
    </div>
  );
}
