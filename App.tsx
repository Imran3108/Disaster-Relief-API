
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, RescueRequest, RequestStatus, SyncQueueItem } from './types';
import { localDB } from './services/db';
import Login from './views/Login';
import CitizenDashboard from './views/CitizenDashboard';
import VolunteerDashboard from './views/VolunteerDashboard';
import AdminDashboard from './views/AdminDashboard';
import { Wifi, WifiOff, RefreshCw, Smartphone, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // Background Connectivity Listener
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Sync Engine Logic
  const performSync = useCallback(async () => {
    if (!isOnline || syncing) return;
    
    const queue = await localDB.getSyncQueue();
    if (queue.length === 0) return;

    setSyncing(true);
    console.log(`Syncing ${queue.length} items to server...`);

    try {
      // Simulation of Bulk Sync API Call
      for (const item of queue) {
        // Mock API call: await fetch('/api/sync', { method: 'POST', body: JSON.stringify(item) });
        await new Promise(r => setTimeout(r, 500)); // Simulate delay
        
        // Update local request status
        if (item.action === 'CREATE_REQUEST') {
          const requests = await localDB.getAllRequests();
          const target = requests.find(r => r.id === item.payload.id);
          if (target) {
            await localDB.saveRequest({ ...target, synced: true });
          }
        }
        
        await localDB.removeFromSyncQueue(item.id);
      }
      setLastSync(Date.now());
    } catch (e) {
      console.error("Sync Failed", e);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing]);

  // Automatic Sync when coming back online
  useEffect(() => {
    if (isOnline) {
      performSync();
    }
  }, [isOnline, performSync]);

  // Role Routing
  const renderDashboard = () => {
    if (!user) return <Login onLogin={setUser} />;

    switch (user.role) {
      case UserRole.CITIZEN:
        return <CitizenDashboard user={user} isOnline={isOnline} />;
      case UserRole.VOLUNTEER:
        return <VolunteerDashboard user={user} isOnline={isOnline} />;
      case UserRole.ADMIN:
        return <AdminDashboard user={user} isOnline={isOnline} />;
      default:
        return <Login onLogin={setUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Top Status Bar with Logo */}
      <div className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-1.5 text-[10px] font-black tracking-widest transition-colors ${isOnline ? 'bg-emerald-600' : 'bg-rose-600'} text-white shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 border-r border-white/20 pr-3 mr-1">
            <Activity size={14} strokeWidth={3} />
            <span className="uppercase">RescueNet</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} className="status-pulse" />}
            <span>{isOnline ? 'LIVE' : 'OFFLINE (SMS ACTIVE)'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {syncing && (
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full">
              <RefreshCw size={10} className="animate-spin" />
              <span>SYNC</span>
            </div>
          )}
          <span className="opacity-70">LAST: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <main className="pt-8">
        {renderDashboard()}
      </main>

      {/* Logout / Switch Role (For Demo) */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50 flex gap-2">
          <button 
            onClick={() => setUser(null)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Terminal Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
