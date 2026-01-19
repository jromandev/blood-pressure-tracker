
import React, { useState, useRef, useEffect } from 'react';
import { BPLog } from '../types';
import { scanBPDevice } from '../services/geminiService';
import { useToast } from './Toast';
import { useBPContext } from '../context/BPContext';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: Omit<BPLog, 'id'>) => void;
}

const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSave }) => {
  const { profile } = useBPContext();
  const hasApiKey = Boolean(profile.geminiApiKey && profile.geminiApiKey.trim());
  const [systolic, setSystolic] = useState<string>('120');
  const [diastolic, setDiastolic] = useState<string>('80');
  const [pulse, setPulse] = useState<string>('72');
  const now = new Date();
  const [date, setDate] = useState<string>(now.toISOString().slice(0, 10));
  const [time, setTime] = useState<string>(now.toTimeString().slice(0, 5));
  const [note, setNote] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Reset saving state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSaving(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setSystolic('120');
    setDiastolic('80');
    setPulse('72');
    const resetNow = new Date();
    setDate(resetNow.toISOString().slice(0, 10));
    setTime(resetNow.toTimeString().slice(0, 5));
    setNote('');
    setIsSaving(false);
  };

  const handleSubmit = () => {
    console.log('🔵 handleSubmit called');
    console.log('Data:', { systolic, diastolic, pulse, date, time, note });
    
    if (isSaving) {
      console.log('⚠️ Already saving, ignoring click');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const timestamp = new Date(`${date}T${time}`).toISOString();
      console.log('✅ Timestamp created:', timestamp);
      
      onSave({
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: parseInt(pulse),
        note,
        timestamp
      });
      
      console.log('✅ onSave called');
      resetForm();
      console.log('✅ Form reset');
      
      // Give a tiny delay for state to update
      setTimeout(() => {
        console.log('✅ Calling onClose');
        onClose();
      }, 100);
    } catch (error) {
      console.error('❌ Error saving log:', error);
      showToast('Error saving reading. Please try again.', 'error');
      setIsSaving(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const result = await scanBPDevice(base64, profile.geminiApiKey);
      if (result) {
        setSystolic(result.systolic.toString());
        setDiastolic(result.diastolic.toString());
        setPulse(result.pulse.toString());
        showToast('Successfully scanned BP monitor!', 'success');
      } else {
        showToast(!profile.geminiApiKey ? "API key required for OCR scanning. Add it in Profile." : "Couldn't read values from image. Please enter manually.", 'warning');
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="modal-title" className="text-2xl font-black text-slate-900 tracking-tight">Add Reading</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manual entry or Scan</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
            aria-label="Close dialog"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <button 
            onClick={handleCameraClick}
            disabled={isScanning || !hasApiKey}
            className={`w-full py-4 px-6 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 group transition-all focus:ring-4 ${
              !hasApiKey 
                ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50' 
                : isScanning 
                  ? 'border-indigo-200 bg-indigo-50/50 opacity-50 cursor-wait' 
                  : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 hover:border-indigo-300 focus:ring-indigo-200'
            }`}
            aria-label="Scan blood pressure monitor screen with camera"
          >
            {isScanning ? (
              <span className="flex items-center gap-3 font-bold text-indigo-600">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Device Screen...
              </span>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform ${
                  !hasApiKey 
                    ? 'bg-slate-400 text-white shadow-slate-200' 
                    : 'bg-indigo-600 text-white shadow-indigo-200 group-active:scale-90'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={`font-bold ${!hasApiKey ? 'text-slate-400' : 'text-indigo-700'}`}>
                  {!hasApiKey ? 'API Key Required to Scan' : 'Scan BP Monitor Screen'}
                </span>
              </>
            )}
          </button>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
            aria-label="Upload blood pressure monitor image"
          />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Systolic</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                  placeholder="120"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diastolic</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xl font-black text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                  placeholder="80"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="pulse" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pulse Rate</label>
              <input
                id="pulse"
                type="number"
                required
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                placeholder="72"
                aria-label="Enter pulse rate"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="time" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time</label>
              <input
                id="time"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
                aria-label="Enter time"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="date" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all"
              aria-label="Enter date"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-600 focus:ring-4 focus:ring-indigo-100 focus:bg-white outline-none transition-all h-24"
              placeholder="How are you feeling?"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-4xl shadow-xl shadow-slate-200 active:scale-95 transition-all uppercase tracking-widest text-sm focus:ring-4 focus:ring-slate-300 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Save blood pressure reading"
          >
            {isSaving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogModal;
