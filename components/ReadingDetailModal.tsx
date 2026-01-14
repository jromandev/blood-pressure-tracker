import React from 'react';
import { BPLog } from '../types';
import { getBPCategory } from '../constants';

interface ReadingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: BPLog | null;
  onDelete: (id: string) => void;
}

const ReadingDetailModal: React.FC<ReadingDetailModalProps> = ({ isOpen, onClose, reading, onDelete }) => {
  if (!isOpen || !reading) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this reading?')) {
      onDelete(reading.id);
      onClose();
    }
  };

  const category = getBPCategory(reading.systolic, reading.diastolic);

  // Define BP zones
  const zones = [
    { name: 'LOW**', color: 'bg-cyan-400', systolicMax: 90, diastolicMax: 60 },
    { name: 'NORMAL', color: 'bg-green-400', systolicMax: 120, diastolicMax: 80 },
    { name: 'PREHYPERTENSION', color: 'bg-orange-400', systolicMax: 140, diastolicMax: 90 },
    { name: 'HIGH: STAGE 1 HYPERTENSION', color: 'bg-orange-500', systolicMax: 160, diastolicMax: 100 },
    { name: 'HIGH: STAGE 2 HYPERTENSION', color: 'bg-red-400', systolicMax: 180, diastolicMax: 120 },
  ];

  // Calculate position on chart (percentage)
  const getPosition = () => {
    const systolicPercent = Math.min(((reading.systolic - 40) / 140) * 100, 100);
    const diastolicPercent = Math.min(((reading.diastolic - 40) / 80) * 100, 100);
    return { x: diastolicPercent, y: 100 - systolicPercent };
  };

  const position = getPosition();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reading-detail-title"
    >
      <div 
        className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="reading-detail-title" className="text-2xl font-black text-slate-900 tracking-tight">Reading Details</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              {new Date(reading.timestamp).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all active:scale-95"
            aria-label="Close reading details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* BP Values */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-2xl text-center">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Systolic</p>
              <p className="text-3xl font-black text-red-600">{reading.systolic}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl text-center">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Diastolic</p>
              <p className="text-3xl font-black text-blue-600">{reading.diastolic}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl text-center">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Pulse</p>
              <p className="text-3xl font-black text-purple-600">{reading.pulse}</p>
            </div>
          </div>

          {/* BP Chart */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Blood Pressure Zone</p>
            <div className="relative h-64 w-full border-l-4 border-b-4 border-slate-300">
              {/* Y-axis labels */}
              <div className="absolute -left-12 top-0 text-xs font-bold text-slate-500">180+</div>
              <div className="absolute -left-12 top-1/4 text-xs font-bold text-slate-500">140</div>
              <div className="absolute -left-12 top-1/2 text-xs font-bold text-slate-500">120</div>
              <div className="absolute -left-12 top-3/4 text-xs font-bold text-slate-500">90</div>
              <div className="absolute -left-12 bottom-0 text-xs font-bold text-slate-500">40</div>

              {/* X-axis labels */}
              <div className="absolute -bottom-8 left-0 text-xs font-bold text-slate-500">40</div>
              <div className="absolute -bottom-8 left-1/4 text-xs font-bold text-slate-500">60</div>
              <div className="absolute -bottom-8 left-1/2 text-xs font-bold text-slate-500">80</div>
              <div className="absolute -bottom-8 left-3/4 text-xs font-bold text-slate-500">100</div>
              <div className="absolute -bottom-8 right-0 text-xs font-bold text-slate-500">120+</div>

              {/* Zones */}
              <div className="absolute bottom-0 left-0 w-1/4 h-3/4 bg-cyan-400 opacity-60"></div>
              <div className="absolute bottom-0 left-1/4 w-1/4 h-1/2 bg-green-400 opacity-60"></div>
              <div className="absolute bottom-0 left-1/2 w-1/4 h-1/4 bg-orange-400 opacity-60"></div>
              <div className="absolute bottom-0 left-3/4 w-1/4 h-[15%] bg-orange-500 opacity-60"></div>

              {/* Current reading marker */}
              <div 
                className="absolute w-6 h-6 bg-slate-900 rounded-full border-4 border-white shadow-xl z-10 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ left: `${position.x}%`, top: `${position.y}%` }}
              />
            </div>
            <div className="mt-8 text-center">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Zone</p>
              <p className="text-xl font-black text-slate-900 mt-1">{category}</p>
            </div>
          </div>

          {/* Notes */}
          {reading.note && (
            <div className="bg-indigo-50 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Notes</p>
              <p className="text-sm font-medium text-indigo-900">{reading.note}</p>
            </div>
          )}

          {/* Time */}
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400">
              Recorded at {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="w-full py-4 px-6 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-black text-sm uppercase tracking-widest hover:bg-red-100 hover:border-red-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            aria-label="Delete this reading"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete Reading
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingDetailModal;
