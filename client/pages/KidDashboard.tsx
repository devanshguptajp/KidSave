import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getChild, getAppState, createWithdrawalRequest, addParentNotification } from "@/lib/appState";
import { getCurrencySymbol, formatCurrency } from "@/lib/currency";
import {
  LogOut,
  Plus,
  Wallet,
  Target,
  PiggyBank as PiggyBankIcon,
  Bell,
  Send,
} from "lucide-react";

export default function KidDashboard() {
  const navigate = useNavigate();
  const [child, setChild] = useState<any | null>(null);
  const [state, setState] = useState(getAppState());
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');

  useEffect(() => {
    const childId = localStorage.getItem("currentChildId");
    const isKid = localStorage.getItem("kidMode");

    if (!isKid || !childId) {
      navigate("/kid-login");
      return;
    }

    const foundChild = getChild(childId);
    if (!foundChild) {
      navigate("/kid-login");
      return;
    }

    setChild(foundChild);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("kidMode");
    localStorage.removeItem("currentChildId");
    navigate("/kid-login");
  };

  const handleWithdrawalRequest = () => {
    setWithdrawalError('');
    setWithdrawalSuccess('');

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalError('Please enter a valid amount');
      return;
    }

    if (amount > child.balance) {
      setWithdrawalError('Insufficient balance');
      return;
    }

    createWithdrawalRequest(child.id, child.name, amount, withdrawalReason);

    // Create parent notification
    const notification = {
      id: Date.now().toString(),
      type: 'withdrawal_request',
      message: `${child.name} requested ${getCurrencySymbol(state.currency)}${amount.toFixed(2)} withdrawal`,
      timestamp: Date.now(),
      childName: child.name,
      amount,
      read: false,
    };

    addParentNotification(notification);

    setWithdrawalSuccess('Request sent to parent!');
    setWithdrawalAmount('');
    setWithdrawalReason('');
    setTimeout(() => {
      setShowWithdrawalForm(false);
    }, 1500);
  };

  if (!child) {
    return null;
  }

  const currencySymbol = getCurrencySymbol(state.currency);
  const unreadNotifications = child.notifications.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Hi, {child.name}! 👋
            </h1>
            <p className="text-gray-600">Your Money Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/kid-notifications')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
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
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-2xl p-8 sm:p-12 mb-8 text-white">
          <p className="text-blue-100 mb-2 text-lg">Your Total Balance</p>
          <h2 className="text-5xl sm:text-6xl font-bold mb-8">
            {currencySymbol}
            {child.balance.toFixed(2)}
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/kid-savings')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 transition-all text-left"
            >
              <p className="text-blue-100 text-sm mb-1">Add to Savings</p>
              <PiggyBankIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/kid-goals')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 transition-all text-left"
            >
              <p className="text-blue-100 text-sm mb-1">Create a Goal</p>
              <Target className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/kid-categories')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl p-4 transition-all text-left"
            >
              <p className="text-blue-100 text-sm mb-1">View Categories</p>
              <Wallet className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Piggy Bank */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Piggy Bank</h3>
              <PiggyBankIcon className="w-6 h-6 text-pink-600" />
            </div>
            <p className="text-4xl font-bold text-pink-600 mb-4">
              {currencySymbol}
              {child.piggyBank.toFixed(2)}
            </p>
            <button
              onClick={() => navigate('/kid-savings')}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              Manage
            </button>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Categories</h3>
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {child.categories.length}
            </p>
            <button
              onClick={() => navigate('/kid-categories')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              View All
            </button>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Goals</h3>
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-4xl font-bold text-green-600 mb-4">
              {child.goals.filter((g) => !g.completed).length}
            </p>
            <button
              onClick={() => navigate('/kid-goals')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
            >
              View All
            </button>
          </div>
        </div>

        {/* Categories Section */}
        {child.categories.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              My Categories
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {child.categories.slice(0, 3).map((category: any) => (
                <div
                  key={category.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4"
                >
                  <h4 className="font-bold text-gray-900 mb-2">
                    {category.name}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 mb-3">
                    {currencySymbol}
                    {category.balance.toFixed(2)}
                  </p>
                  <div className="w-full bg-gray-300 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {child.categories.length > 3 && (
              <button className="mt-4 text-blue-600 hover:text-blue-700 font-semibold">
                View all {child.categories.length} categories →
              </button>
            )}
          </div>
        )}

        {/* Goals Section */}
        {child.goals.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">My Goals</h3>
            <div className="space-y-4">
              {child.goals.slice(0, 3).map((goal: any) => (
                <div
                  key={goal.id}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">{goal.name}</h4>
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
            {child.goals.length > 3 && (
              <button className="mt-4 text-green-600 hover:text-green-700 font-semibold">
                View all {child.goals.length} goals →
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {child.categories.length === 0 && child.goals.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Let's Get Started! 🎉
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first category to organize your money or set a savings
              goal!
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-all inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Category
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
