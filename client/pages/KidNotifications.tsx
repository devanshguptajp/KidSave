import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChild, getChildNotifications, markNotificationAsRead } from '@/lib/appState';
import { getCurrencySymbol } from '@/lib/currency';
import { ArrowLeft, CheckCircle, AlertCircle, Target, Lock } from 'lucide-react';

export default function KidNotifications() {
  const navigate = useNavigate();
  const [child, setChild] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

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
    setNotifications(getChildNotifications(childId));
  }, [navigate]);

  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
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
          <h1 className="text-3xl font-bold text-gray-900">My Notifications</h1>
          <p className="text-gray-600">Updates about your account and requests</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No notifications yet</p>
            <p className="text-gray-500 text-sm mt-2">Your activity updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              let icon = null;
              let bgColor = '';
              let borderColor = '';

              switch (notification.type) {
                case 'money_added':
                  icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-200';
                  break;
                case 'money_subtracted':
                  icon = <AlertCircle className="w-5 h-5 text-red-600" />;
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-200';
                  break;
                case 'allowance':
                  icon = <CheckCircle className="w-5 h-5 text-blue-600" />;
                  bgColor = 'bg-blue-50';
                  borderColor = 'border-blue-200';
                  break;
                case 'goal_completed':
                  icon = <Target className="w-5 h-5 text-purple-600" />;
                  bgColor = 'bg-purple-50';
                  borderColor = 'border-purple-200';
                  break;
                case 'password_changed':
                  icon = <Lock className="w-5 h-5 text-indigo-600" />;
                  bgColor = 'bg-indigo-50';
                  borderColor = 'border-indigo-200';
                  break;
                case 'withdrawal_declined':
                  icon = <AlertCircle className="w-5 h-5 text-orange-600" />;
                  bgColor = 'bg-orange-50';
                  borderColor = 'border-orange-200';
                  break;
                default:
                  icon = <AlertCircle className="w-5 h-5 text-gray-600" />;
                  bgColor = 'bg-gray-50';
                  borderColor = 'border-gray-200';
              }

              return (
                <div
                  key={notification.id}
                  onClick={() => handleMarkAsRead(notification.id)}
                  className={`${bgColor} border ${borderColor} rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:shadow-md transition-all ${
                    notification.read ? 'opacity-60' : 'opacity-100'
                  }`}
                >
                  <div className="mt-1">{icon}</div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold">{notification.message}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {notification.amount && (
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-lg ${
                        notification.type === 'money_subtracted' || notification.type === 'money_withdrawn'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {notification.type === 'money_subtracted' || notification.type === 'money_withdrawn' ? '-' : '+'}
                        {currencySymbol}{notification.amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
