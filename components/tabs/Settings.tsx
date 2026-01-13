import React from 'react';
import { useBPContext } from '../../context/BPContext';
import { useToast } from '../Toast';

const Settings: React.FC = () => {
  const { profile, updateProfile } = useBPContext();
  const { showToast } = useToast();

  const handleUpdate = () => {
    showToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Profile</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Help AI understand you better</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8 relative z-10">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="age" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
            <input
              id="age"
              type="number"
              value={profile.age}
              onChange={(e) => updateProfile({...profile, age: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
              aria-label="Enter your age"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="gender" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
            <select
              id="gender"
              value={profile.gender}
              onChange={(e) => updateProfile({...profile, gender: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer text-base h-[3.5rem] appearance-none"
              aria-label="Select your gender"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="weight" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              value={profile.weight}
              onChange={(e) => updateProfile({...profile, weight: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
              aria-label="Enter your weight in kilograms"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="height" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (cm)</label>
            <input
              id="height"
              type="number"
              value={profile.height}
              onChange={(e) => updateProfile({...profile, height: e.target.value})}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
              aria-label="Enter your height in centimeters"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="conditions" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Conditions</label>
          <textarea
            id="conditions"
            value={profile.conditions}
            onChange={(e) => updateProfile({...profile, conditions: e.target.value})}
            placeholder="e.g. Diabetes, Type 2"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-medium text-slate-600 outline-none focus:ring-4 focus:ring-slate-100 transition-all h-32"
            aria-label="Enter any medical conditions"
          />
        </div>
        
        <div className="pt-4">
          <button 
            onClick={handleUpdate}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] uppercase tracking-widest text-xs active:scale-95 transition-transform"
            aria-label="Save profile changes"
          >
            Update Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
