import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAppState } from '@/lib/appState';
import { verifyPin, formatPinInput } from '@/lib/pinValidation';
import { Lock, ArrowLeft } from 'lucide-react';

export default function ParentLogin() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    const state = getAppState();
    if (!state.setupComplete) {
      navigate('/setup');
    } else {
      setIsSetup(true);
    }
  }, [navigate]);

  const handleLogin = () => {
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    const state = getAppState();
    if (state.parentPinHash && verifyPin(pin, state.parentPinHash)) {
      localStorage.setItem('parentMode', 'true');
      localStorage.setItem('parentLoginTime', Date.now().toString());
      navigate('/parent-dashboard');
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!isSetup) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex flex-col items-center justify-center px-4 py-8">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Mode</h1>
          <p className="text-gray-600">Enter your PIN to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Enter 4-Digit PIN
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(formatPinInput(e.target.value))}
              onKeyPress={handleKeyPress}
              placeholder="••••"
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 transition-colors text-center text-5xl font-bold tracking-[0.5em]"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={pin.length !== 4}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all mb-4"
          >
            Enter Parent Mode
          </button>

          <p className="text-center text-gray-600 text-sm">
            First time? <Link to="/setup" className="text-purple-600 hover:text-purple-700 font-semibold">
              Complete setup
            </Link>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Parent Mode Features</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Manage child accounts</li>
            <li>✓ Set allowances and monitor spending</li>
            <li>✓ Add or subtract money</li>
            <li>✓ View activity notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
