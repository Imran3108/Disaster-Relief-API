
import React, { useState, useEffect } from 'react';
import { User, Urgency, RescueRequest, RequestStatus, Location } from '../types';
import { localDB } from '../services/db';
import { analyzeDisasterRequest } from '../services/geminiService';
import { MapPin, Send, Plus, Users, AlertCircle, MessageSquare, History, Smartphone, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';

interface CitizenDashboardProps {
  user: User;
  isOnline: boolean;
}

const CitizenDashboard: React.FC<CitizenDashboardProps> = ({ user, isOnline }) => {
  const [requests, setRequests] = useState<RescueRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [urgency, setUrgency] = useState<Urgency>(Urgency.MEDIUM);
  const [loading, setLoading] = useState(false);
  
  // Location state
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const list = await localDB.getAllRequests();
    setRequests(list.sort((a, b) => b.createdAt - a.createdAt));
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'GPS Coordinates'
        });
        setLocating(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationError("Could not get location. Check GPS permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto-fetch location when form opens
  useEffect(() => {
    if (showForm) {
      fetchLocation();
    }
  }, [showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalUrgency = urgency;
    let finalCategory = 'General';
    
    if (isOnline) {
      const analysis = await analyzeDisasterRequest(message);
      if (analysis) {
        if (analysis.urgencyScore > 8) finalUrgency = Urgency.CRITICAL;
        else if (analysis.urgencyScore > 5) finalUrgency = Urgency.HIGH;
        finalCategory = analysis.category;
      }
    }

    const newRequest: RescueRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: finalCategory,
      message,
      urgency: finalUrgency,
      peopleCount,
      status: RequestStatus.PENDING,
      location: location || { lat: 0, lng: 0, address: 'Manual Entry' },
      createdAt: Date.now(),
      synced: false,
      smsSent: false
    };

    await localDB.saveRequest(newRequest);
    
    await localDB.addToSyncQueue({
      id: Math.random().toString(36).substr(2, 9),
      action: 'CREATE_REQUEST',
      payload: newRequest,
      timestamp: Date.now()
    });

    setLoading(false);
    setShowForm(false);
    setMessage('');
    setLocation(null);
    loadRequests();
  };

  const handleSmsFallback = (req: RescueRequest) => {
    const locStr = req.location.lat !== 0 ? `${req.location.lat.toFixed(4)},${req.location.lng.toFixed(4)}` : 'No GPS';
    const smsContent = `HELP | ${req.type} | LOC:${locStr} | ${req.message.slice(0, 40)} | ${req.peopleCount}ppl | ${req.urgency}`;
    window.open(`sms:9999999999?body=${encodeURIComponent(smsContent)}`);
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user.name}</h1>
          <p className="text-sm text-slate-500">Emergency Relief System</p>
        </div>
        <div className="h-10 w-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center border border-rose-200">
          <Users size={20} />
        </div>
      </header>

      {showForm ? (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Request Help</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 p-1 hover:bg-slate-50 rounded-lg">✕</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Location Display */}
            <div className={`p-4 rounded-2xl border transition-all ${location ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Your Location</span>
                <button 
                  type="button" 
                  onClick={fetchLocation} 
                  className="text-rose-600 text-[10px] font-bold hover:underline"
                >
                  Refresh GPS
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${location ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {locating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                </div>
                <div className="flex-1">
                  {locating ? (
                    <p className="text-xs font-bold text-slate-500 animate-pulse">Establishing satellite link...</p>
                  ) : location ? (
                    <p className="text-xs font-bold text-emerald-700">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      <span className="block text-[10px] opacity-70 font-medium">Coordinate Lock Acquired</span>
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-rose-500">{locationError || 'Location required for rescue'}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-1 tracking-wider">Describe Emergency</label>
              <textarea 
                className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 h-28 text-sm"
                placeholder="What happened? e.g. 'Trapped on second floor due to flood, need medical help'"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1 tracking-wider">People Count</label>
                <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200">
                  <button type="button" onClick={() => setPeopleCount(Math.max(1, peopleCount-1))} className="p-4 text-rose-600 font-black">-</button>
                  <span className="flex-1 text-center font-bold">{peopleCount}</span>
                  <button type="button" onClick={() => setPeopleCount(peopleCount+1)} className="p-4 text-rose-600 font-black">+</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-1 tracking-wider">Urgency</label>
                <select 
                  className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 outline-none h-[58px] text-sm font-bold"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as Urgency)}
                >
                  <option value={Urgency.LOW}>Low</option>
                  <option value={Urgency.MEDIUM}>Medium</option>
                  <option value={Urgency.HIGH}>High</option>
                  <option value={Urgency.CRITICAL}>Critical</option>
                </select>
              </div>
            </div>

            <button 
              disabled={loading || locating}
              type="submit"
              className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-rose-200 hover:bg-rose-700 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
              SEND RESCUE REQUEST
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              Active Requests
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">{requests.length} Entries</span>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <div className="bg-slate-50 h-20 w-20 rounded-full mx-auto flex items-center justify-center mb-4">
                <MessageSquare className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-500 font-bold">You are safe.</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">If you face an emergency, use the button below to alert rescue teams.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                      req.urgency === Urgency.CRITICAL ? 'bg-rose-100 text-rose-600' : 
                      req.urgency === Urgency.HIGH ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.urgency}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {req.synced ? (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black">
                          <CheckCircle2 size={12} /> SYNCED
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-black">
                          <RefreshCw size={12} className="animate-spin-slow" /> PENDING
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-slate-800 font-bold text-base leading-snug">{req.message}</p>
                    <div className="flex flex-wrap gap-2">
                       <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                         <Users size={10} /> {req.peopleCount} People
                       </span>
                       <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                         <MapPin size={10} /> {req.location.lat.toFixed(4)}, {req.location.lng.toFixed(4)}
                       </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-black text-slate-400">
                      {new Date(req.createdAt).toLocaleTimeString()}
                    </span>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg border ${
                      req.status === RequestStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>

                  {!req.synced && !isOnline && (
                    <button 
                      onClick={() => handleSmsFallback(req)}
                      className="mt-2 w-full flex items-center justify-center gap-2 text-rose-600 bg-rose-50 py-3 rounded-2xl text-xs font-black border border-rose-100 hover:bg-rose-100 transition-colors"
                    >
                      <Smartphone size={16} /> SEND SMS FALLBACK
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      {!showForm && (
        <button 
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rose-600 text-white h-20 w-20 rounded-full shadow-2xl shadow-rose-300 flex items-center justify-center animate-bounce transition-transform active:scale-90 border-4 border-white"
        >
          <Plus size={40} />
        </button>
      )}
    </div>
  );
};

export default CitizenDashboard;
