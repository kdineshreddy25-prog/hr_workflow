import React, { useState } from 'react';
import { useWorkflowStore } from '../store';
import { mockApi } from '../services/mockApi';
import { SimulationResult, SimulationStep } from '../types';
import { 
  X, 
  Play, 
  Terminal, 
  CheckCircle2, 
  Hourglass, 
  AlertTriangle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const SimulationPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { nodes, edges } = useWorkflowStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await mockApi.simulateWorkflow({ nodes, edges });
      setResult(res);
    } catch (err) {
      setResult({ success: false, error: 'Simulation failed unexpectedly', steps: [] });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white rounded-none shadow-2xl overflow-hidden flex flex-col h-[650px] border border-slate-200"
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white h-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-none flex items-center justify-center border border-slate-200 text-slate-400">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Debug Environment</h3>
              <p className="font-bold text-slate-900 text-sm mt-1 uppercase">Workflow Execution Trace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-none text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-none flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                <Play size={24} fill="currentColor" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-3">Sync Pending</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm leading-relaxed">
                Initialize the execution engine to verify node connections, validate schema integrity, and trace the logical path.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center px-12 text-center">
              <Loader2 size={32} className="text-indigo-600 animate-spin mb-6" />
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serializing Data Matrix</p>
                <p className="text-xs font-medium text-slate-600">Checking for logical inconsistencies...</p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-8">
              {result.success ? (
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-none flex items-center gap-4 text-emerald-800">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">SUCCESS: Trace Verified</p>
                    <p className="text-[11px] font-medium opacity-80 mt-1">THE ARCHITECTURE CONFORMS TO THE DEFINED PROTOCOLS.</p>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-none flex items-center gap-4 text-rose-800">
                  <AlertTriangle className="text-rose-500 shrink-0" size={24} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">FAILURE: Sync Interrupt</p>
                    <p className="text-[11px] font-medium opacity-80 mt-1">{result.error?.toUpperCase()}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] px-1">Operation Log Entry</h5>
                <div className="space-y-3 relative before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
                  {result.steps.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-6 relative z-10"
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-none flex items-center justify-center border shrink-0 bg-white shadow-sm mt-1",
                        step.status === 'completed' ? "border-emerald-500 text-emerald-500" : "border-rose-500 text-rose-500"
                      )}>
                        <div className="w-1.5 h-1.5 bg-current" />
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-none border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-900 uppercase">
                            {step.nodeTitle}
                          </span>
                          <span className="text-[10px] font-mono text-slate-300">
                            {new Date(step.timestamp).toLocaleTimeString([], { hour12: false })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[9px] bg-slate-50 text-slate-400 px-2 py-0.5 border border-slate-100 font-bold uppercase tracking-widest">
                            TYPE::{step.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-mono bg-slate-50 p-2.5 border-l-2 border-slate-200">
                          {step.output}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex items-center justify-between bg-white h-24">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
          >
            Terminal Shutdown
          </button>
          <button 
            onClick={runSimulation}
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-3"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            {result ? 'Recalibrate' : 'Execute Trace'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SimulationPanel;
