
import React, { useState, useEffect } from 'react';
import { User, RescueRequest, RequestStatus, Urgency } from '../types';
import { localDB } from '../services/db';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
// Added missing Smartphone icon import
import { Activity, ShieldAlert, CheckCircle2, Users, Search, Filter, Download, Smartphone } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  isOnline: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, isOnline }) => {
  const [data, setData] = useState<RescueRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    completed: 0,
    pending: 0
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll local DB for demo purposes
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const list = await localDB.getAllRequests();
    setData(list);
    setStats({
      total: list.length,
      critical: list.filter(r => r.urgency === Urgency.CRITICAL).length,
      completed: list.filter(r => r.status === RequestStatus.COMPLETED).length,
      pending: list.filter(r => r.status === RequestStatus.PENDING).length
    });
  };

  const chartData = [
    { name: 'Critical', value: stats.critical, color: '#e11d48' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Completed', value: stats.completed, color: '#10b981' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operations Control</h1>
          <p className="text-slate-500">Real-time disaster relief monitoring panel</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-slate-200">
            <ShieldAlert size={16} /> Alert All Teams
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: Activity, color: 'blue' },
          { label: 'Critical Alert', value: stats.critical, icon: ShieldAlert, color: 'rose' },
          { label: 'Rescued', value: stats.completed, icon: CheckCircle2, color: 'emerald' },
          { label: 'Active Teams', value: '24', icon: Users, color: 'indigo' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center mb-4 bg-${kpi.color}-50 text-${kpi.color}-600`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity size={20} className="text-slate-400" />
            Mission Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live List Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-[450px] overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold mb-4">Live Activity</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {data.slice().reverse().map(req => (
              <div key={req.id} className="flex gap-3 items-start p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  req.urgency === Urgency.CRITICAL ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  <ShieldAlert size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">New request from {req.userName}</p>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{req.message}</p>
                  <span className="text-[9px] font-black uppercase text-slate-400 mt-2 block">
                    {new Date(req.createdAt).toLocaleTimeString()} • {req.type.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold">Request Log</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search victims..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl"><Filter size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Victim</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Urgency</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Connectivity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">#{row.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{row.userName}</p>
                    <p className="text-xs text-slate-500">{row.userPhone}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{row.type}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      row.urgency === Urgency.CRITICAL ? 'bg-rose-100 text-rose-600' : 
                      row.urgency === Urgency.HIGH ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${
                      row.status === RequestStatus.COMPLETED ? 'text-emerald-600' : 'text-slate-600'
                    }`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {row.synced ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                        <CheckCircle2 size={14} /> CLOUD SYNCED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-amber-600 font-bold status-pulse">
                        <Smartphone size={14} /> LOCAL/SMS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
