
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, User as UserIcon, HardHat, ShieldAlert, Activity } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);

  const handleRequestOtp = () => {
    if (phone.length >= 10) setStep(2);
  };

  const handleVerify = () => {
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: phone === '9999999999' ? 'Admin User' : 'Test User',
      phone,
      role,
      otpVerified: true
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 py-12">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center">
          {/* Redesigned Logo */}
          <div className="mx-auto h-20 w-20 relative mb-6">
            <div className="absolute inset-0 bg-rose-600 rounded-[2rem] rotate-6 opacity-20 animate-pulse"></div>
            <div className="relative h-full w-full bg-rose-600 text-white flex items-center justify-center rounded-[2rem] shadow-2xl shadow-rose-200">
              <Activity size={44} strokeWidth={2.5} />
            </div>
          </div>
          
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
            Rescue<span className="text-rose-600 font-medium">Net</span>
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="h-1 w-1 bg-rose-500 rounded-full"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disaster Relief Operations</p>
            <div className="h-1 w-1 bg-rose-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          {step === 1 ? (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Access Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: UserRole.CITIZEN, label: 'Citizen', icon: UserIcon },
                    { id: UserRole.VOLUNTEER, label: 'Volunteer', icon: HardHat },
                    { id: UserRole.ADMIN, label: 'Admin', icon: ShieldCheck },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id as UserRole)}
                      className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 ${
                        role === r.id 
                        ? 'border-rose-600 bg-rose-50 text-rose-600 ring-4 ring-rose-50' 
                        : 'border-slate-50 text-slate-300 grayscale opacity-60'
                      }`}
                    >
                      <r.icon size={22} />
                      <span className="text-[10px] mt-2 font-black uppercase tracking-tighter">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Registration</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+91</span>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all font-bold"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <button
                onClick={handleRequestOtp}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
              >
                Request Authorization
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Security Verification Code</label>
                <div className="flex gap-2 justify-between">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className="w-10 h-14 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all"
                    />
                  ))}
                </div>
                <p className="mt-6 text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">
                  Code transmitted to +91 {phone.slice(-4)}
                </p>
              </div>
              <button
                onClick={handleVerify}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
              >
                Confirm & Enter
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest pt-2"
              >
                Switch Identity
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 py-4">
           <div className="h-px flex-1 bg-slate-200"></div>
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Protocol v2.1</p>
           <div className="h-px flex-1 bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
