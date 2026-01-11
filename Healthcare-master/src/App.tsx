import React, { useState, useEffect } from 'react';
import { User, Bell, Calendar, MessageSquare, Activity, Shield, Settings } from 'lucide-react';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Triage from './components/Triage/Triage';
import Meetings from './components/Meetings/Meetings';
import Chat from './components/Chat/Chat';
import RPM from './components/RPM/RPM';
import Notifications from './components/Notifications/Notifications';
import Cosettings from './components/Settings/Settings';
import AuthModal from './components/Auth/AuthModal';
import AIDecisionModal from './components/AI/AIDecisionModal';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { AIDecision } from './types';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingAIDecision, setPendingAIDecision] = useState<AIDecision | null>(null);
  
  const { user, isAuthenticated, login, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications(user?.id);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'triage', name: 'Triage', icon: MessageSquare },
    { id: 'meetings', name: 'Meetings', icon: Calendar },
    { id: 'chat', name: 'Messages', icon: MessageSquare },
    { id: 'rpm', name: 'RPM Monitor', icon: Activity },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleAIDecision = (decision: AIDecision) => {
    setPendingAIDecision(decision);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentView} />;
      case 'triage':
        return <Triage user={user} onAIDecision={handleAIDecision} />;
      case 'meetings':
        return <Meetings user={user} onAIDecision={handleAIDecision} />;
      case 'chat':
        return <Chat user={user} onAIDecision={handleAIDecision} />;
      case 'rpm':
        return <RPM user={user} onAIDecision={handleAIDecision} />;
      case 'settings':
        return <Cosettings user={user} />;
      default:
        return <Dashboard user={user} onNavigate={setCurrentView} />;
    }
  };

  if (!isAuthenticated) {
    return <AuthModal onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      <div className={`flex w-full`}>
        <Sidebar
          navigation={navigation}
          currentView={currentView}
          onNavigate={setCurrentView}
          user={user}
        />

        <div className="flex-1 flex flex-col">
          <Header
            user={user}
            unreadNotifications={unreadCount}
            onNotificationsClick={() => setShowNotifications(!showNotifications)}
            onLogout={logout}
          />

          <main className="flex-1 p-6">
            {renderCurrentView()}
          </main>
        </div>

        {showNotifications && (
          <Notifications
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={markAsRead}
          />
        )}

        {pendingAIDecision && (
          <AIDecisionModal
            decision={pendingAIDecision}
            onConfirm={(decision, note) => {
              console.log('AI Decision Confirmed:', decision, note);
              setPendingAIDecision(null);
            }}
            onReject={(decision, note) => {
              console.log('AI Decision Rejected:', decision, note);
              setPendingAIDecision(null);
            }}
            onClose={() => setPendingAIDecision(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;