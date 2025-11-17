import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAppState,
  addChild,
  updateChild,
  deleteChild,
} from "@/lib/appState";
import { getCurrencySymbol, formatCurrency } from "@/lib/currency";
import { LogOut, Plus, Trash2, Settings, Bell } from "lucide-react";

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [state, setState] = useState(getAppState());
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isParent = localStorage.getItem("parentMode");
    if (!isParent) {
      navigate("/parent-login");
    }
  }, [navigate]);

  const handleAddChild = () => {
    setError("");

    if (!childName.trim()) {
      setError("Please enter a child name");
      return;
    }

    if (
      state.children.some(
        (c) => c.name.toLowerCase() === childName.toLowerCase(),
      )
    ) {
      setError("This child already exists");
      return;
    }

    const newChild = {
      id: Date.now().toString(),
      name: childName,
      balance: 0,
      categories: [],
      goals: [],
      piggyBank: 0,
      notifications: [],
      createdAt: Date.now(),
    };

    addChild(newChild);
    setState(getAppState());
    setChildName("");
    setShowAddChild(false);
  };

  const handleDeleteChild = (childId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this child account? This cannot be undone.",
      )
    ) {
      deleteChild(childId);
      setState(getAppState());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("parentMode");
    localStorage.removeItem("parentLoginTime");
    navigate("/");
  };

  const currencySymbol = getCurrencySymbol(state.currency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Parent Dashboard
            </h1>
            <p className="text-gray-600">Currency: {state.currency}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/parent-settings')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Child Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Children</h2>
            <button
              onClick={() => setShowAddChild(!showAddChild)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Child
            </button>
          </div>

          {showAddChild && (
            <div className="bg-purple-50 rounded-lg p-6 mb-6 border border-purple-200">
              <h3 className="font-bold text-gray-900 mb-4">
                Create New Child Account
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Name
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter child's name"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleAddChild}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => {
                      setShowAddChild(false);
                      setChildName("");
                      setError("");
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Children List */}
          {state.children.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No children accounts yet. Create one to get started!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.children.map((child) => (
                <div
                  key={child.id}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {child.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Created {new Date(child.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Balance */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">
                      Current Balance
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {currencySymbol}
                      {child.balance.toFixed(2)}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">Categories</p>
                      <p className="text-lg font-bold text-gray-900">
                        {child.categories.length}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-600">Goals</p>
                      <p className="text-lg font-bold text-gray-900">
                        {child.goals.length}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        navigate(`/parent-child-details/${child.id}`)
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Manage Account
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Add Money</h3>
            <p className="text-gray-600 text-sm mb-4">
              Add funds to any child's account
            </p>
            <button className="text-green-600 hover:text-green-700 font-semibold text-sm">
              Learn more →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Set Allowances
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Automate regular allowance payments
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              Learn more →
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              View Notifications
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Track all account activities and changes
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
              Learn more →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
