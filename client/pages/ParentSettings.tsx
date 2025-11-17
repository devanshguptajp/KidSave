import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppState, setCurrency as setCurrencyState, setParentPin, updateChild } from '@/lib/appState';
import { getCurrencySymbol } from '@/lib/currency';
import { formatPinInput, hashPin, verifyPin } from '@/lib/pinValidation';
import { ArrowLeft, Lock, Globe } from 'lucide-react';
import { Currency } from '@shared/types';

export default function ParentSettings() {
  const navigate = useNavigate();
  const [state, setState] = useState(getAppState());
  const [activeTab, setActiveTab] = useState<'currency' | 'pin'>('currency');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(state.currency);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const isParent = localStorage.getItem('parentMode');
    if (!isParent) {
      navigate('/parent-login');
    }
  }, [navigate]);

  const handleChangeCurrency = () => {
    setError('');
    setSuccess('');

    if (selectedCurrency === state.currency) {
      setError('Please select a different currency');
      return;
    }

    setCurrencyState(selectedCurrency);
    setState(getAppState());
    setSuccess(`Currency changed to ${selectedCurrency}`);
  };

  const handleChangePin = () => {
    setError('');
    setSuccess('');

    if (!currentPin) {
      setError('Please enter your current PIN');
      return;
    }

    if (!state.parentPinHash || !verifyPin(currentPin, state.parentPinHash)) {
      setError('Current PIN is incorrect');
      return;
    }

    if (newPin.length !== 4) {
      setError('New PIN must be exactly 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PINs do not match');
      return;
    }

    if (newPin === currentPin) {
      setError('New PIN must be different from current PIN');
      return;
    }

    setParentPin(newPin);
    setState(getAppState());
    setSuccess('PIN changed successfully');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('currency')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'currency'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-5 h-5" />
              Currency
            </button>
            <button
              onClick={() => setActiveTab('pin')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'pin'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lock className="w-5 h-5" />
              Change PIN
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Currency Tab */}
            {activeTab === 'currency' && (
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Select Currency</h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-gray-700">
                    <strong>Current Currency:</strong> {state.currency}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <button
                    onClick={() => setSelectedCurrency('INR')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      selectedCurrency === 'INR'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">₹</span>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">Indian Rupees</p>
                        <p className="text-sm text-gray-600">₹ (INR)</p>
                      </div>
                    </div>
                    {selectedCurrency === 'INR' && (
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedCurrency('USD')}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                      selectedCurrency === 'USD'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">$</span>
                      <div className="text-left">
                        <p className="font-bold text-gray-900">US Dollars</p>
                        <p className="text-sm text-gray-600">$ (USD)</p>
                      </div>
                    </div>
                    {selectedCurrency === 'USD' && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleChangeCurrency}
                  disabled={selectedCurrency === state.currency}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Update Currency
                </button>
              </div>
            )}

            {/* PIN Tab */}
            {activeTab === 'pin' && (
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Change Parent PIN</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current PIN
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(formatPinInput(e.target.value))}
                      placeholder="••••"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-center text-3xl font-bold tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New PIN
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(formatPinInput(e.target.value))}
                      placeholder="••••"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-center text-3xl font-bold tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New PIN
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(formatPinInput(e.target.value))}
                      placeholder="••••"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-center text-3xl font-bold tracking-widest"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleChangePin}
                  disabled={!currentPin || newPin.length !== 4 || confirmPin.length !== 4}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Update PIN
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
