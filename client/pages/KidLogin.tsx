import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAppState } from '@/lib/appState';
import { verifyPin, formatPinInput } from '@/lib/pinValidation';
import { ArrowLeft, User } from 'lucide-react';

type LoginMode = 'select' | 'pin' | 'noaccount';

export default function KidLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('select');
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [children, setChildren] = useState<any[]>([]);

  useEffect(() => {
    const state = getAppState();
    if (!state.setupComplete) {
      navigate('/setup');
    } else {
      setChildren(state.children);
    }
  }, [navigate]);

  const handleSelectChild = (childId: string) => {
    const child = children.find(c => c.id === childId);
    setSelectedChild(childId);
    
    if (child.pinHash) {
      setMode('pin');
    } else {
      // No PIN set, go directly to dashboard
      loginChild(childId);
    }
  };

  const loginChild = (childId: string) => {
    localStorage.setItem('currentChildId', childId);
    localStorage.setItem('kidMode', 'true');
    navigate('/kid-dashboard');
  };

  const handlePinSubmit = () => {
    setError('');

    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    const child = children.find(c => c.id === selectedChild);
    if (!child) {
      setError('Child not found');
      return;
    }

    if (verifyPin(pin, child.pinHash)) {
      loginChild(selectedChild!);
    } else {
      setError('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePinSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 flex flex-col items-center justify-center px-4 py-8">
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kid Mode</h1>
          <p className="text-gray-600">Welcome to your virtual piggy bank!</p>
        </div>

        {/* Select Child */}
        {mode === 'select' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Who are you?</h2>

            {children.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-6">No accounts yet. Ask your parent to create one for you!</p>
                <Link
                  to="/"
                  className="inline-block bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleSelectChild(child.id)}
                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                        {child.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{child.name}</p>
                        <p className="text-sm text-gray-600">
                          {child.pinHash ? '🔒 PIN protected' : 'No PIN'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PIN Entry */}
        {mode === 'pin' && selectedChild && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => setMode('select')}
              className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Enter your PIN
            </h2>
            <p className="text-gray-600 mb-8">
              It's {children.find(c => c.id === selectedChild)?.name}'s turn!
            </p>

            <div className="mb-8">
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(formatPinInput(e.target.value))}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-center text-5xl font-bold tracking-[0.5em]"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handlePinSubmit}
              disabled={pin.length !== 4}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Enter My Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
