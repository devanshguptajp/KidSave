import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppState, approveWithdrawalRequest, declineWithdrawalRequest, getPendingWithdrawalRequests } from '@/lib/appState';
import { getCurrencySymbol } from '@/lib/currency';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Lock } from 'lucide-react';

export default function ParentNotifications() {
  const navigate = useNavigate();
  const [state, setState] = useState(getAppState());
  const [pendingRequests, setPendingRequests] = useState(getPendingWithdrawalRequests());
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    const isParent = localStorage.getItem('parentMode');
    if (!isParent) {
      navigate('/parent-login');
    }
  }, [navigate]);

  const handleApprove = (requestId: string) => {
    approveWithdrawalRequest(requestId);
    setState(getAppState());
    setPendingRequests(getPendingWithdrawalRequests());
    setSelectedRequest(null);
  };

  const handleDecline = (requestId: string) => {
    declineWithdrawalRequest(requestId);
    setState(getAppState());
    setPendingRequests(getPendingWithdrawalRequests());
    setSelectedRequest(null);
  };

  const currencySymbol = getCurrencySymbol(state.currency);

  const allNotifications = [
    ...state.parentNotifications.sort((a, b) => b.timestamp - a.timestamp),
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Activity, requests, and updates</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pending Withdrawal Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              Pending Withdrawal Requests ({pendingRequests.length})
            </h2>

            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{request.childName}</h3>
                      <p className="text-gray-600 text-sm">
                        Requested {new Date(request.requestedAt).toLocaleDateString()} at{' '}
                        {new Date(request.requestedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {currencySymbol}{request.amount.toFixed(2)}
                    </div>
                  </div>

                  {request.reason && (
                    <p className="text-gray-700 mb-4">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(request.id)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Notifications */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Log</h2>

        {allNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allNotifications.map((notification) => {
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
                  icon = <XCircle className="w-5 h-5 text-red-600" />;
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-200';
                  break;
                case 'password_changed':
                  icon = <Lock className="w-5 h-5 text-blue-600" />;
                  bgColor = 'bg-blue-50';
                  borderColor = 'border-blue-200';
                  break;
                case 'allowance':
                  icon = <CheckCircle className="w-5 h-5 text-purple-600" />;
                  bgColor = 'bg-purple-50';
                  borderColor = 'border-purple-200';
                  break;
                default:
                  icon = <AlertCircle className="w-5 h-5 text-gray-600" />;
                  bgColor = 'bg-gray-50';
                  borderColor = 'border-gray-200';
              }

              return (
                <div key={notification.id} className={`${bgColor} border ${borderColor} rounded-xl p-4 flex items-start gap-4`}>
                  <div className="mt-1">{icon}</div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold">{notification.message}</p>
                    {notification.childName && (
                      <p className="text-gray-600 text-sm">Child: {notification.childName}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  {notification.amount && (
                    <div className="text-right">
                      <p className={`font-bold ${notification.type === 'money_subtracted' ? 'text-red-600' : 'text-green-600'}`}>
                        {notification.type === 'money_subtracted' ? '-' : '+'}
                        {currencySymbol}{notification.amount.toFixed(2)}
                      </p>
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
