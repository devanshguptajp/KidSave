import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Currency } from "@shared/types";
import { setCurrency, getAppState } from "@/lib/appState";
import { setParentPin } from "@/lib/appState";
import { formatPinInput } from "@/lib/pinValidation";
import { ArrowRight, Lock } from "lucide-react";

type Step = "currency" | "pin" | "complete";

export default function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("currency");
  const [currency, setCurrencyState] = useState<Currency>("INR");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const state = getAppState();
    if (state.setupComplete) {
      navigate("/parent-login");
    }
  }, [navigate]);

  const handleCurrencySelect = (selected: Currency) => {
    setCurrencyState(selected);
    setCurrency(selected);
    setStep("pin");
  };

  const handlePinSetup = () => {
    setError("");

    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    setParentPin(pin);
    setStep("complete");

    setTimeout(() => {
      navigate("/parent-login");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🏦</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PiggyBank</h1>
          <p className="text-gray-600">Let's get started!</p>
        </div>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${step === "currency" || step === "pin" || step === "complete" ? "bg-purple-600" : "bg-gray-300"}`}
          />
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${step === "pin" || step === "complete" ? "bg-purple-600" : "bg-gray-300"}`}
          />
          <div
            className={`h-1 flex-1 rounded-full transition-colors ${step === "complete" ? "bg-purple-600" : "bg-gray-300"}`}
          />
        </div>

        {/* Currency Selection Step */}
        {step === "currency" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Your Currency
            </h2>
            <p className="text-gray-600 mb-8">
              Select the currency your child will use
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleCurrencySelect("INR")}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  currency === "INR"
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-purple-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">₹</span>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Indian Rupees</p>
                    <p className="text-sm text-gray-600">₹ (INR)</p>
                  </div>
                </div>
                {currency === "INR" && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => handleCurrencySelect("USD")}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  currency === "USD"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">$</span>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">US Dollars</p>
                    <p className="text-sm text-gray-600">$ (USD)</p>
                  </div>
                </div>
                {currency === "USD" && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            </div>

            <button
              onClick={() => setStep("pin")}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* PIN Setup Step */}
        {step === "pin" && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Parent PIN
            </h2>
            <p className="text-gray-600 mb-8">
              Set a 4-digit PIN to protect Parent Mode access
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(formatPinInput(e.target.value))}
                    placeholder="••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 transition-colors text-center text-3xl font-bold tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) =>
                      setConfirmPin(formatPinInput(e.target.value))
                    }
                    placeholder="••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 transition-colors text-center text-3xl font-bold tracking-widest"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={handlePinSetup}
              disabled={pin.length !== 4 || confirmPin.length !== 4}
              className="w-full mt-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all"
            >
              Complete Setup
            </button>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Set!</h2>
            <p className="text-gray-600 mb-6">
              Your account is ready. Redirecting to Parent Mode...
            </p>
            <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
