import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

const STEPS = [
  { icon: '🔌', label: 'Connecting to CaseWare…',          ms: 1200 },
  { icon: '📤', label: 'Exporting Trial Balance…',          ms: 1200 },
  { icon: '💾', label: 'Ingesting data into FinancialDB…',  ms: 1200 },
];

interface SyncModalProps {
  open:      boolean;
  onComplete: () => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ open, onComplete }) => {
  const [step,  setStep]  = useState(0);
  const [done,  setDone]  = useState(false);

  useEffect(() => {
    if (!open) { setStep(0); setDone(false); return; }

    let timer: ReturnType<typeof setTimeout>;
    let current = 0;

    const advance = () => {
      current += 1;
      if (current < STEPS.length) {
        setStep(current);
        timer = setTimeout(advance, STEPS[current].ms);
      } else {
        setDone(true);
        timer = setTimeout(onComplete, 800);
      }
    };

    timer = setTimeout(advance, STEPS[0].ms);
    return () => clearTimeout(timer);
  }, [open, onComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-gt-card border border-gt-border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        {/* GTBank header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gt-orange flex items-center justify-center text-white font-black text-lg">
            GT
          </div>
          <div>
            <p className="text-xs text-gt-muted uppercase tracking-widest">Guaranty Trust Bank</p>
            <p className="text-sm font-bold text-white">CaseWare Sync in Progress</p>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {STEPS.map((s, i) => {
            const isActive  = i === step && !done;
            const isComplete = i < step || done;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                  isActive   ? 'border-gt-orange bg-gt-orange/10' :
                  isComplete ? 'border-gt-green/40 bg-gt-green/5' :
                               'border-gt-border bg-gt-card2 opacity-40'
                }`}
              >
                <span className="text-xl w-7 text-center">{s.icon}</span>
                <span className={`text-sm font-medium flex-1 ${isActive ? 'text-gt-orange' : isComplete ? 'text-gt-green' : 'text-gt-muted'}`}>
                  {s.label}
                </span>
                {isActive && <Loader2 className="w-4 h-4 text-gt-orange animate-spin" />}
                {isComplete && <CheckCircle className="w-4 h-4 text-gt-green" />}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gt-border rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gt-orange rounded-full transition-all duration-500"
            style={{ width: done ? '100%' : `${((step) / STEPS.length) * 100}%` }}
          />
        </div>

        {done && (
          <p className="text-center text-gt-green text-sm font-semibold mt-4">
            ✅ Sync complete — refreshing dashboard…
          </p>
        )}
      </div>
    </div>
  );
};

export default SyncModal;
