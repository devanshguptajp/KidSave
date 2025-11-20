import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChild, updateChild } from '@/lib/appState';
import { getCurrencySymbol } from '@/lib/currency';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function KidCategories() {
  const navigate = useNavigate();
  const [child, setChild] = useState<any | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [enableAutoSplit, setEnableAutoSplit] = useState(false);
  const [splitType, setSplitType] = useState<'percentage' | 'fixed'>('percentage');
  const [splitValue, setSplitValue] = useState('');
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

  const handleCreateCategory = () => {
    setError('');
    setSuccess('');

    if (!categoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    if (child.categories.some((c: any) => c.name.toLowerCase() === categoryName.toLowerCase())) {
      setError('Category already exists');
      return;
    }

    if (enableAutoSplit && !splitValue) {
      setError('Please enter a split value');
      return;
    }

    const newCategory = {
      id: generateId(),
      name: categoryName,
      balance: 0,
      autoSplit: enableAutoSplit,
      percentage: enableAutoSplit && splitType === 'percentage' ? parseFloat(splitValue) : undefined,
      fixedAmount: enableAutoSplit && splitType === 'fixed' ? parseFloat(splitValue) : undefined,
    };

    const updatedChild = {
      ...child,
      categories: [...child.categories, newCategory],
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);

    setSuccess('Category created successfully!');
    setCategoryName('');
    setSplitValue('');
    setEnableAutoSplit(false);
    setSplitType('percentage');
    setShowCreateForm(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = child.categories.find((c: any) => c.id === categoryId);
    if (categoryToDelete && categoryToDelete.balance > 0) {
      setError('Cannot delete category with money in it. Please transfer the balance first.');
      return;
    }
    const updatedChild = {
      ...child,
      categories: child.categories.filter((c: any) => c.id !== categoryId),
    };
    updateChild(child.id, updatedChild);
    setChild(updatedChild);
    setDeleteConfirmation(null);
    setSuccess('Category deleted successfully!');
  };

  const handleAddMoneyToCategory = () => {
    if (!moneyAmount || parseFloat(moneyAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(moneyAmount);
    const categoryIndex = child.categories.findIndex((c: any) => c.id === showMoneyForm);
    if (categoryIndex === -1) return;

    const updatedCategories = [...child.categories];
    if (moneyAction === 'add') {
      updatedCategories[categoryIndex].balance += amount;
    } else {
      if (updatedCategories[categoryIndex].balance < amount) {
        setError('Insufficient balance in this category');
        return;
      }
      updatedCategories[categoryIndex].balance -= amount;
    }

    const updatedChild = {
      ...child,
      categories: updatedCategories,
    };

    updateChild(child.id, updatedChild);
    setChild(updatedChild);
    setShowMoneyForm(null);
    setMoneyAmount('');
    setSuccess(`${moneyAction === 'add' ? 'Added' : 'Subtracted'} ${moneyAmount} from category!`);
  };

  if (!child) {
    return null;
  }

  const currencySymbol = getCurrencySymbol('INR'); // TODO: get from app state
  const totalInCategories = child.categories.reduce((sum: number, cat: any) => sum + cat.balance, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">My Categories</h1>
          <p className="text-gray-600">Organize your money into categories</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl shadow-lg p-8 text-white mb-8">
          <p className="text-blue-100 mb-2">Total in Categories</p>
          <h2 className="text-4xl font-bold">{currencySymbol}{totalInCategories.toFixed(2)}</h2>
          <p className="text-blue-100 mt-4">{child.categories.length} categories</p>
        </div>

        {/* Create Category Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create New Category</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Toys, Snacks, Games"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAutoSplit}
                    onChange={(e) => setEnableAutoSplit(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-gray-700 font-medium">Enable Auto-Split</span>
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Automatically split money into this category when you receive funds
                </p>
              </div>

              {enableAutoSplit && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Split Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSplitType('percentage')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          splitType === 'percentage'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <p className="font-semibold text-gray-900">Percentage</p>
                        <p className="text-sm text-gray-600">% of incoming money</p>
                      </button>
                      <button
                        onClick={() => setSplitType('fixed')}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          splitType === 'fixed'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <p className="font-semibold text-gray-900">Fixed Amount</p>
                        <p className="text-sm text-gray-600">Fixed amount per transaction</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {splitType === 'percentage' ? 'Percentage (%)' : 'Amount'}
                    </label>
                    <div className="relative">
                      {splitType === 'fixed' && (
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                          {currencySymbol}
                        </span>
                      )}
                      <input
                        type="number"
                        value={splitValue}
                        onChange={(e) => setSplitValue(e.target.value)}
                        placeholder={splitType === 'percentage' ? '50' : '0.00'}
                        className={`w-full ${splitType === 'fixed' ? 'pl-8' : ''} pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600`}
                      />
                      {splitType === 'percentage' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                          %
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCreateCategory}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Create Category
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCategoryName('');
                    setSplitValue('');
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
            className="w-full mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Category
          </button>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {/* Categories List */}
        {child.categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No categories yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first category to organize your money</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {child.categories.map((category: any) => (
              <div key={category.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                {deleteConfirmation === category.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Category?</h3>
                      <p className="text-gray-600 mb-6">
                        Are you sure you want to delete "{category.name}"? This action cannot be undone, but the money in it will remain in your balance.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDeleteConfirmation(null)}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showMoneyForm === category.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {moneyAction === 'add' ? 'Add Money' : 'Subtract Money'}
                      </h3>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="number"
                          value={moneyAmount}
                          onChange={(e) => setMoneyAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
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
                          onClick={handleAddMoneyToCategory}
                          className={`flex-1 ${moneyAction === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-2 rounded-lg transition-colors`}
                        >
                          {moneyAction === 'add' ? 'Add' : 'Subtract'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  <button
                    onClick={() => setDeleteConfirmation(category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-3xl font-bold text-blue-600 mb-4">
                  {currencySymbol}{category.balance.toFixed(2)}
                </p>

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => {
                      setShowMoneyForm(category.id);
                      setMoneyAction('add');
                      setMoneyAmount('');
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                  >
                    + Add
                  </button>
                  <button
                    onClick={() => {
                      setShowMoneyForm(category.id);
                      setMoneyAction('subtract');
                      setMoneyAmount('');
                    }}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                  >
                    - Subtract
                  </button>
                </div>

                {category.autoSplit && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700">
                    <p className="font-semibold mb-1">Auto-Split Enabled</p>
                    <p>
                      {category.percentage
                        ? `${category.percentage}% of incoming money`
                        : `${currencySymbol}${category.fixedAmount?.toFixed(2) || '0.00'} per transaction`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
