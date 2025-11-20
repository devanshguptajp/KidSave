import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getChild, updateChild, saveNotification, addChildNotification } from "@/lib/appState";
import { getCurrencySymbol, formatCurrency } from "@/lib/currency";
import { formatPinInput, hashPin, validatePin } from "@/lib/pinValidation";
import {
  ArrowLeft,
  Plus,
  Minus,
  Settings,
  Lock,
  Bell,
  Trash2,
  DollarSign,
} from "lucide-react";

type TabType = "overview" | "addmoney" | "allowance" | "settings";

export default function ChildDetails() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [allowanceAmount, setAllowanceAmount] = useState("");
  const [allowanceFrequency, setAllowanceFrequency] = useState<
    "daily" | "weekly" | "custom"
  >("weekly");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const isParent = localStorage.getItem("parentMode");
    if (!isParent) {
      navigate("/parent-login");
      return;
    }

    if (!childId) {
      navigate("/parent-dashboard");
      return;
    }

    const foundChild = getChild(childId);
    if (!foundChild) {
      navigate("/parent-dashboard");
      return;
    }

    setChild(foundChild);
  }, [childId, navigate]);

  if (!child) {
    return null;
  }

  const currencySymbol = getCurrencySymbol("INR"); // TODO: get from app state

  const handleAddMoney = () => {
    setError("");
    setSuccess("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    let updatedChild = {
      ...child,
      balance: child.balance + parsedAmount,
    };

    // Apply auto-split rules to categories
    if (child.categories && child.categories.length > 0) {
      const updatedCategories = child.categories.map((category: any) => {
        if (category.autoSplit) {
          let splitAmount = 0;
          if (category.percentage) {
            splitAmount = (parsedAmount * category.percentage) / 100;
          } else if (category.fixedAmount) {
            splitAmount = category.fixedAmount;
          }
          return {
            ...category,
            balance: category.balance + splitAmount,
          };
        }
        return category;
      });

      const totalSplit = updatedCategories.reduce((sum: number, cat: any) => {
        const originalCat = child.categories.find((c: any) => c.id === cat.id);
        return sum + (cat.balance - (originalCat?.balance || 0));
      }, 0);

      updatedChild = {
        ...updatedChild,
        balance: updatedChild.balance - totalSplit,
        categories: updatedCategories,
      };
    }

    updateChild(child.id, updatedChild);
    setChild(updatedChild);

    // Create notification for the child
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: "money_added" as const,
      message: `${currencySymbol}${parsedAmount.toFixed(2)} has been added to your account${reason ? ` (${reason})` : ''}`,
      timestamp: Date.now(),
      amount: parsedAmount,
      read: false,
    };

    saveNotification(notification);
    addChildNotification(child.id, notification);

    setSuccess(
      `Successfully added ${currencySymbol}${parsedAmount.toFixed(2)}`,
    );
    setAmount("");
    setReason("");
  };

  const handleSubtractMoney = () => {
    setError("");
    setSuccess("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (parsedAmount > child.balance) {
      setError("Insufficient balance");
      return;
    }

    const updatedChild = {
      ...child,
      balance: child.balance - parsedAmount,
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);

    // Create notification for the child
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: "money_subtracted" as const,
      message: `${currencySymbol}${parsedAmount.toFixed(2)} has been subtracted from your account${reason ? ` (${reason})` : ''}`,
      timestamp: Date.now(),
      amount: parsedAmount,
      read: false,
    };

    saveNotification(notification);
    addChildNotification(child.id, notification);

    setSuccess(
      `Successfully subtracted ${currencySymbol}${parsedAmount.toFixed(2)}`,
    );
    setAmount("");
    setReason("");
  };

  const handleSetPin = () => {
    setError("");
    setSuccess("");

    if (newPin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    const updatedChild = {
      ...child,
      pinHash: hashPin(newPin),
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);

    // Create notification for the child
    const notification = {
      id: Date.now().toString() + Math.random(),
      type: "password_changed" as const,
      message: `Your PIN has been updated by your parent`,
      timestamp: Date.now(),
      read: false,
    };

    saveNotification(notification);
    addChildNotification(child.id, notification);

    setSuccess("PIN set successfully");
    setNewPin("");
    setConfirmPin("");
  };

  const handleRemovePin = () => {
    const updatedChild = {
      ...child,
      pinHash: undefined,
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);
    setSuccess("PIN removed successfully");
  };

  const handleSetAllowance = () => {
    setError("");
    setSuccess("");

    const parsedAmount = parseFloat(allowanceAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid allowance amount");
      return;
    }

    const updatedChild = {
      ...child,
      allowanceAmount: parsedAmount,
      allowanceFrequency,
      lastAllowanceDate: Date.now(),
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);
    setSuccess("Allowance configured successfully");
    setAllowanceAmount("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/parent-dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {child.name}'s Account
          </h1>
          <p className="text-gray-600">
            Created {new Date(child.createdAt).toLocaleDateString()}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <p className="text-blue-100 text-lg mb-2">Current Balance</p>
          <h2 className="text-5xl font-bold mb-6">
            {currencySymbol}
            {child.balance.toFixed(2)}
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Categories</p>
              <p className="text-3xl font-bold">{child.categories.length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Goals</p>
              <p className="text-3xl font-bold">{child.goals.length}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-blue-100 text-sm mb-1">Piggy Bank</p>
              <p className="text-3xl font-bold">
                {currencySymbol}
                {child.piggyBank.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 px-4 py-4 font-semibold transition-colors ${
                activeTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("addmoney")}
              className={`flex-1 px-4 py-4 font-semibold transition-colors ${
                activeTab === "addmoney"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Add/Subtract Money
            </button>
            <button
              onClick={() => setActiveTab("allowance")}
              className={`flex-1 px-4 py-4 font-semibold transition-colors ${
                activeTab === "allowance"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Allowance
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 px-4 py-4 font-semibold transition-colors ${
                activeTab === "settings"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Categories
                  </h3>
                  {child.categories.length === 0 ? (
                    <p className="text-gray-600">No categories yet</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {child.categories.map((cat: any) => (
                        <div
                          key={cat.id}
                          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4"
                        >
                          <h4 className="font-bold text-gray-900 mb-2">
                            {cat.name}
                          </h4>
                          <p className="text-2xl font-bold text-blue-600 mb-2">
                            {currencySymbol}
                            {cat.balance.toFixed(2)}
                          </p>
                          {cat.autoSplit && (
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                              Auto-split:{" "}
                              {cat.percentage
                                ? `${cat.percentage}%`
                                : `${currencySymbol}${cat.fixedAmount}`}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Goals */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Goals
                  </h3>
                  {child.goals.length === 0 ? (
                    <p className="text-gray-600">No goals yet</p>
                  ) : (
                    <div className="space-y-4">
                      {child.goals.map((goal: any) => (
                        <div
                          key={goal.id}
                          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-900">
                              {goal.name}
                            </h4>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                goal.completed
                                  ? "bg-green-200 text-green-800"
                                  : "bg-blue-200 text-blue-800"
                              }`}
                            >
                              {goal.completed ? "✓ Completed" : "In Progress"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-300 rounded-full h-3 mb-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                              style={{
                                width: `${(goal.currentAmount / goal.targetAmount) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            {currencySymbol}
                            {goal.currentAmount.toFixed(2)} of {currencySymbol}
                            {goal.targetAmount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add/Subtract Money Tab */}
            {activeTab === "addmoney" && (
              <div className="max-w-md">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Add Money
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason (optional)
                        </label>
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="e.g., Birthday gift, Reward"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                          {success}
                        </div>
                      )}

                      <button
                        onClick={handleAddMoney}
                        disabled={!amount}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Money
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Subtract Money
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason (optional)
                        </label>
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="e.g., Spent on snacks"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-600"
                        />
                      </div>

                      <button
                        onClick={handleSubtractMoney}
                        disabled={!amount}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Minus className="w-5 h-5" />
                        Subtract Money
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Allowance Tab */}
            {activeTab === "allowance" && (
              <div className="max-w-md">
                {child.allowanceAmount ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Current Allowance
                    </h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Amount:</strong> {currencySymbol}
                      {child.allowanceAmount.toFixed(2)}
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Frequency:</strong> {child.allowanceFrequency}
                    </p>
                    <p className="text-sm text-gray-600">
                      Last paid:{" "}
                      {child.lastAllowanceDate
                        ? new Date(child.lastAllowanceDate).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowance Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                        {currencySymbol}
                      </span>
                      <input
                        type="number"
                        value={allowanceAmount}
                        onChange={(e) => setAllowanceAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={allowanceFrequency}
                      onChange={(e) =>
                        setAllowanceFrequency(e.target.value as any)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                      {success}
                    </div>
                  )}

                  <button
                    onClick={handleSetAllowance}
                    disabled={!allowanceAmount}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Set Allowance
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-8 max-w-md">
                {/* PIN Settings */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    PIN Settings
                  </h3>

                  {child.pinHash ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-700 mb-4">
                        🔒 This account is PIN protected
                      </p>
                      <button
                        onClick={handleRemovePin}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Remove PIN Protection
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New PIN
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={newPin}
                          onChange={(e) =>
                            setNewPin(formatPinInput(e.target.value))
                          }
                          placeholder="••••"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-center text-2xl font-bold tracking-widest"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm PIN
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          value={confirmPin}
                          onChange={(e) =>
                            setConfirmPin(formatPinInput(e.target.value))
                          }
                          placeholder="••••"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-center text-2xl font-bold tracking-widest"
                        />
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                          {success}
                        </div>
                      )}

                      <button
                        onClick={handleSetPin}
                        disabled={
                          newPin.length !== 4 || confirmPin.length !== 4
                        }
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-all"
                      >
                        Set PIN
                      </button>
                    </div>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-xl font-bold text-red-600 mb-4">
                    Danger Zone
                  </h3>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete ${child.name}'s account? This cannot be undone.`,
                        )
                      ) {
                        // Delete logic would go here
                      }
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
