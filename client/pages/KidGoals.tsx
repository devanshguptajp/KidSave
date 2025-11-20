import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChild, updateChild, saveNotification, addChildNotification } from '@/lib/appState';
import { getCurrencySymbol } from '@/lib/currency';
import { ArrowLeft, Plus, Trash2, Target, Minus } from 'lucide-react';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function KidGoals() {
  const navigate = useNavigate();
  const [child, setChild] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [showMoneyForm, setShowMoneyForm] = useState<string | null>(null);
  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyAction, setMoneyAction] = useState<'add' | 'subtract'>('add');

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

  const handleCreateGoal = () => {
    setError('');
    setSuccess('');

    if (!goalName.trim()) {
      setError('Please enter a goal name');
      return;
    }

    if (child.goals.some((g: any) => g.name.toLowerCase() === goalName.toLowerCase())) {
      setError('Goal already exists');
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please enter a valid target amount');
      return;
    }

    const newGoal = {
      id: generateId(),
      name: goalName,
      targetAmount: target,
      currentAmount: 0,
      completed: false,
    };

    const updatedChild = {
      ...child,
      goals: [...child.goals, newGoal],
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);

    setSuccess('Goal created successfully!');
    setGoalName('');
    setTargetAmount('');
    setShowCreateForm(false);
  };

  const handleAddToGoal = (goalId: string, goalIndex: number) => {
    const goal = child.goals[goalIndex];
    const amountNeeded = goal.targetAmount - goal.currentAmount;
    
    if (amountNeeded <= 0) {
      setError('This goal is already completed');
      return;
    }

    const amount = Math.min(child.balance, amountNeeded);
    
    if (amount <= 0) {
      setError('Insufficient balance to add to this goal');
      return;
    }

    const updatedGoals = [...child.goals];
    const isCompleting = goal.currentAmount + amount >= goal.targetAmount;
    updatedGoals[goalIndex] = {
      ...goal,
      currentAmount: goal.currentAmount + amount,
      completed: isCompleting,
      completedDate: isCompleting ? Date.now() : undefined,
    };

    const updatedChild = {
      ...child,
      balance: child.balance - amount,
      goals: updatedGoals,
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);

    if (isCompleting) {
      const notification = {
        id: generateId(),
        type: 'goal_completed',
        message: `Congratulations! You completed the goal "${goal.name}"!`,
        timestamp: Date.now(),
        amount,
        read: false,
      };

      saveNotification(notification);
      addChildNotification(child.id, notification);
    }

    setSuccess(`Added ${getCurrencySymbol('INR')}${amount.toFixed(2)} to "${goal.name}"`);
  };

  const handleDeleteGoal = (goalId: string) => {
    const goalToDelete = child.goals.find((g: any) => g.id === goalId);
    if (goalToDelete && goalToDelete.currentAmount > 0) {
      setError('Cannot delete goal with money in it. Please withdraw the balance first.');
      setDeleteConfirmation(null);
      return;
    }
    const updatedChild = {
      ...child,
      goals: child.goals.filter((g: any) => g.id !== goalId),
    };
    updateChild(child.id, updatedChild);
    setChild(updatedChild);
    setDeleteConfirmation(null);
    setSuccess('Goal deleted successfully!');
  };

  const handleAdjustGoalAmount = () => {
    if (!moneyAmount || parseFloat(moneyAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(moneyAmount);
    const goalIndex = child.goals.findIndex((g: any) => g.id === showMoneyForm);
    if (goalIndex === -1) return;

    const updatedGoals = [...child.goals];
    const goal = updatedGoals[goalIndex];

    if (moneyAction === 'add') {
      goal.currentAmount += amount;
      if (goal.currentAmount >= goal.targetAmount) {
        goal.currentAmount = goal.targetAmount;
        goal.completed = true;
        goal.completedDate = Date.now();
      }
    } else {
      if (goal.currentAmount < amount) {
        setError('Cannot subtract more than the current goal amount');
        return;
      }
      goal.currentAmount -= amount;
      goal.completed = false;
    }

    const updatedChild = {
      ...child,
      goals: updatedGoals,
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);
    setShowMoneyForm(null);
    setMoneyAmount('');
    setSuccess(`${moneyAction === 'add' ? 'Added' : 'Subtracted'} ${moneyAmount} ${moneyAction === 'add' ? 'to' : 'from'} goal!`);
  };

  if (!child) {
    return null;
  }

  const currencySymbol = getCurrencySymbol('INR'); // TODO: get from app state
  const completedGoals = child.goals.filter((g: any) => g.completed).length;
  const activeGoals = child.goals.filter((g: any) => !g.completed);

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
          <h1 className="text-3xl font-bold text-gray-900">My Goals</h1>
          <p className="text-gray-600">Track your savings goals</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white mb-8">
          <p className="text-green-100 mb-2">Your Progress</p>
          <h2 className="text-4xl font-bold mb-4">
            {completedGoals} of {child.goals.length} Goals
          </h2>
          <div className="w-full bg-green-800 rounded-full h-3">
            <div
              className="bg-white h-3 rounded-full transition-all"
              style={{
                width: child.goals.length > 0 ? `${(completedGoals / child.goals.length) * 100}%` : '0%',
              }}
            />
          </div>
        </div>

        {/* Create Goal Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Goal</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., New Gaming Console, Bicycle"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCreateGoal}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Create Goal
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setGoalName('');
                    setTargetAmount('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full mb-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Goal
          </button>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Active Goals</h3>
            <div className="space-y-4">
              {activeGoals.map((goal: any, index: number) => {
                const progressPercent = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id}>
                    {deleteConfirmation === goal.id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Goal?</h3>
                          <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{goal.name}"? This action cannot be undone, but the money in it will remain in your balance.
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => setDeleteConfirmation(null)}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {showMoneyForm === goal.id && (
                      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {moneyAction === 'add' ? 'Add Money to Goal' : 'Subtract Money from Goal'}
                          </h3>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                            <input
                              type="number"
                              value={moneyAmount}
                              onChange={(e) => setMoneyAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-600"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setShowMoneyForm(null);
                                setMoneyAmount('');
                              }}
                              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleAdjustGoalAmount}
                              className={`flex-1 ${moneyAction === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-2 rounded-lg transition-colors`}
                            >
                              {moneyAction === 'add' ? 'Add' : 'Subtract'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">{goal.name}</h4>
                          <p className="text-gray-600 text-sm">
                            {currencySymbol}{goal.currentAmount.toFixed(2)} of {currencySymbol}{goal.targetAmount.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => setDeleteConfirmation(goal.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="w-full bg-gray-300 rounded-full h-4 mb-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>

                      <p className="text-sm font-semibold text-gray-700 mb-4">{Math.round(progressPercent)}% Complete</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowMoneyForm(goal.id);
                            setMoneyAction('add');
                            setMoneyAmount('');
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all text-sm"
                        >
                          + Add
                        </button>
                        <button
                          onClick={() => {
                            setShowMoneyForm(goal.id);
                            setMoneyAction('subtract');
                            setMoneyAmount('');
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold rounded-lg transition-all text-sm"
                        >
                          - Subtract
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Completed Goals 🎉</h3>
            <div className="space-y-4">
              {child.goals
                .filter((g: any) => g.completed)
                .map((goal: any) => (
                  <div key={goal.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-green-900">{goal.name}</h4>
                        <p className="text-green-700 text-sm">
                          ✓ Saved {currencySymbol}{goal.targetAmount.toFixed(2)}
                        </p>
                        {goal.completedDate && (
                          <p className="text-green-600 text-sm mt-1">
                            Completed {new Date(goal.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Target className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {child.goals.length === 0 && !showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No goals yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first goal to start saving for something special</p>
          </div>
        )}
      </main>
    </div>
  );
}
