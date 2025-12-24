
import React, { useState, useEffect } from 'react';
import { User, RescueRequest, RequestStatus } from '../types';
import { localDB } from '../services/db';
// Added missing Users and History icon imports
import { Map, List, Navigation, CheckCircle, Clock, MapPin, PhoneCall, Users, History } from 'lucide-react';

interface VolunteerDashboardProps {
  user: User;
  isOnline: boolean;
}

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ user, isOnline }) => {
  const [tasks, setTasks] = useState<RescueRequest[]>([]);
  const [activeTask, setActiveTask] = useState<RescueRequest | null>(null);

  useEffect(() => {
    loadNearbyTasks();
  }, []);

  const loadNearbyTasks = async () => {
    const list = await localDB.getAllRequests();
    // In a real app, filter by proximity and status
    setTasks(list.filter(r => r.status === RequestStatus.PENDING));
    const active = list.find(r => r.status === RequestStatus.IN_PROGRESS);
    if (active) setActiveTask(active);
  };

  const handleAccept = async (req: RescueRequest) => {
    const updated = { ...req, status: RequestStatus.IN_PROGRESS };
    await localDB.saveRequest(updated);
    await localDB.addToSyncQueue({
      id: Math.random().toString(36).substr(2, 9),
      action: 'UPDATE_STATUS',
      payload: { id: req.id, status: RequestStatus.IN_PROGRESS },
      timestamp: Date.now()
    });
    setActiveTask(updated);
    loadNearbyTasks();
  };

  const handleComplete = async () => {
    if (!activeTask) return;
    const updated = { ...activeTask, status: RequestStatus.COMPLETED };
    await localDB.saveRequest(updated);
    await localDB.addToSyncQueue({
      id: Math.random().toString(36).substr(2, 9),
      action: 'UPDATE_STATUS',
      payload: { id: activeTask.id, status: RequestStatus.COMPLETED },
      timestamp: Date.now()
    });
    setActiveTask(null);
    loadNearbyTasks();
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Volunteer Hub</h1>
          <p className="text-sm text-slate-500">{isOnline ? 'Active Online' : 'Operating Offline'}</p>
        </div>
        <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
          <Navigation size={20} />
        </div>
      </header>

      {activeTask ? (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          <h3 className="text-lg font-bold text-emerald-600 flex items-center gap-2">
            <Clock size={20} /> Current Active Mission
          </h3>
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold">{activeTask.userName}</h4>
                <p className="text-sm text-slate-500">Urgency: {activeTask.urgency.toUpperCase()}</p>
              </div>
              <button className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                <PhoneCall size={20} />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-medium text-slate-700">"{activeTask.message}"</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={16} className="text-rose-500" />
              <span>Location: 12.97, 77.59 (Nearby Hospital)</span>
            </div>

            <button 
              onClick={handleComplete}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <CheckCircle size={20} /> Mark as Rescued
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <List size={18} className="text-slate-400" />
              Nearby Requests
            </h3>
            <div className="flex gap-2">
              <button className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm"><Map size={16} /></button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-100 h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-4">
                <CheckCircle className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-bold">All clear!</p>
              <p className="text-sm text-slate-400">No pending rescue tasks in your area.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tasks.map(task => (
                <div key={task.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-slate-400">#{task.id.toUpperCase()}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      task.urgency === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.urgency}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800">{task.type} Assistance Needed</h4>
                  <p className="text-sm text-slate-500 line-clamp-2">{task.message}</p>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Users size={14} /> {task.peopleCount} People</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> 2.4 km away</span>
                  </div>
                  <button 
                    onClick={() => handleAccept(task)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                  >
                    Accept Task
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex justify-around items-center">
        <button className="flex flex-col items-center gap-1 text-emerald-600">
          <List size={24} />
          <span className="text-[10px] font-bold uppercase">Tasks</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Map size={24} />
          <span className="text-[10px] font-bold uppercase">Map</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <History size={24} />
          <span className="text-[10px] font-bold uppercase">History</span>
        </button>
      </nav>
    </div>
  );
};

export default VolunteerDashboard;
