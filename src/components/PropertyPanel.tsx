import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../store';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus,
  AlertCircle
} from 'lucide-react';
import { 
  StartNodeConfig, 
  TaskNodeConfig, 
  ApprovalNodeConfig, 
  AutomatedNodeConfig, 
  EndNodeConfig, 
  AutomationAction,
  NodeType
} from '../types';
import { mockApi } from '../services/mockApi';

const PropertyPanel = () => {
  const { nodes, selectedNodeId, selectNode, updateNodeConfig, deleteNode } = useWorkflowStore();
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  useEffect(() => {
    mockApi.getAutomations().then(setAutomations);
  }, []);

  if (!selectedNode) return null;

  const type = selectedNode.data.type;
  const config = selectedNode.data.config;

  const handleChange = (field: string, value: any) => {
    updateNodeConfig(selectedNode.id, { [field]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-slate-200 h-full flex flex-col shadow-sm animate-in slide-in-from-right duration-300">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 h-20">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Configuration</h3>
          <p className="font-bold text-slate-900 text-sm">{selectedNode.data.label} NODE</p>
        </div>
        <button 
          onClick={() => selectNode(null)}
          className="p-2 hover:bg-slate-200/50 rounded-none text-slate-400 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">
              Node Title
            </label>
            <input
              type="text"
              value={(config as any).title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder:text-slate-300"
              placeholder="E.G. CORE_PROCESS_ALPHA"
            />
          </div>

          {/* Type-specific Fields */}
          {type === 'start' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Metadata Matrix</label>
                <button 
                  onClick={() => {
                     const current = (config as StartNodeConfig).metadata || {};
                     handleChange('metadata', { ...current, '': '' });
                  }}
                  className="p-1 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-none border border-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Plus size={12} />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries((config as StartNodeConfig).metadata || {}).map(([key, val], idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newMetadata = { ...((config as StartNodeConfig).metadata || {}) };
                        const existingValue = newMetadata[key];
                        delete newMetadata[key];
                        newMetadata[e.target.value] = existingValue;
                        handleChange('metadata', newMetadata);
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-mono"
                      placeholder="KEY"
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const newMetadata = { ...((config as StartNodeConfig).metadata || {}) };
                        newMetadata[key] = e.target.value;
                        handleChange('metadata', newMetadata);
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-mono"
                      placeholder="VALUE"
                    />
                    <button 
                      onClick={() => {
                        const newMetadata = { ...((config as StartNodeConfig).metadata || {}) };
                        delete newMetadata[key];
                        handleChange('metadata', newMetadata);
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
                {!Object.keys((config as any).metadata || {}).length && (
                  <button 
                    onClick={() => handleChange('metadata', { '': '' })}
                    className="w-full py-3 border border-dashed border-slate-300 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all"
                  >
                    Initialize Metadata
                  </button>
                )}
              </div>
            </div>
          )}

          {type === 'task' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">Protocol Description</label>
                <textarea
                  value={(config as TaskNodeConfig).description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-medium min-h-[100px] focus:border-indigo-600 focus:bg-white transition-all"
                  placeholder="Define task parameters..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">Assigned Entity</label>
                <input
                  type="text"
                  value={(config as TaskNodeConfig).assignee || ''}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-medium focus:border-indigo-600 focus:bg-white transition-all"
                  placeholder="e.g. HR_ADMIN"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">Target Completion Date</label>
                <input
                  type="date"
                  value={(config as TaskNodeConfig).dueDate || ''}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-medium focus:border-indigo-600 focus:bg-white transition-all"
                />
              </div>
              <div>
                 <div className="flex items-center justify-between group mb-2.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Custom Field Grid</label>
                    <button 
                      onClick={() => {
                        const current = (config as TaskNodeConfig).customFields || {};
                        handleChange('customFields', { ...current, '': '' });
                      }}
                      className="p-1 hover:bg-indigo-600 hover:text-white text-indigo-600 rounded-none border border-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Plus size={12} />
                    </button>
                 </div>
                 <div className="space-y-2">
                    {Object.entries((config as TaskNodeConfig).customFields || {}).map(([key, val], idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => {
                            const newFields = { ...((config as TaskNodeConfig).customFields || {}) };
                            const existingVal = newFields[key];
                            delete newFields[key];
                            newFields[e.target.value] = existingVal;
                            handleChange('customFields', newFields);
                          }}
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-mono"
                          placeholder="KEY"
                        />
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => {
                             const newFields = { ...((config as TaskNodeConfig).customFields || {}) };
                             newFields[key] = e.target.value;
                             handleChange('customFields', newFields);
                          }}
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-none text-xs font-mono"
                          placeholder="VALUE"
                        />
                        <button 
                          onClick={() => {
                             const newFields = { ...((config as TaskNodeConfig).customFields || {}) };
                             delete newFields[key];
                             handleChange('customFields', newFields);
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                        >
                          <Minus size={14} />
                        </button>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {type === 'approval' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">Approver Authority</label>
                <select
                  value={(config as ApprovalNodeConfig).approverRole || ''}
                  onChange={(e) => handleChange('approverRole', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-medium focus:border-indigo-600 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="Manager">LEVEL 01: MANAGER</option>
                  <option value="HRBP">LEVEL 02: HRBP</option>
                  <option value="Director">LEVEL 03: DIRECTOR</option>
                  <option value="Finance">AUDIT: FINANCE</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">Quorum Threshold</label>
                <input
                  type="number"
                  value={(config as ApprovalNodeConfig).autoApproveThreshold || 0}
                  onChange={(e) => handleChange('autoApproveThreshold', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-medium"
                />
              </div>
            </div>
          )}

          {type === 'automated' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">Automated System Script</label>
                <select
                  value={(config as AutomatedNodeConfig).actionId || ''}
                  onChange={(e) => {
                    const actionId = e.target.value;
                    const action = automations.find(a => a.id === actionId);
                    handleChange('actionId', actionId);
                    const initialParams: Record<string, string> = {};
                    action?.params.forEach(p => initialParams[p] = '');
                    handleChange('params', initialParams);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-bold uppercase tracking-tight focus:border-indigo-600 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">SELECT TASK SCRIPT</option>
                  {automations.map(a => (
                    <option key={a.id} value={a.id}>{a.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              
              {/* Dynamic Action Parameters */}
              {(config as AutomatedNodeConfig).actionId && (
                <div className="space-y-4 p-5 bg-indigo-50/30 border border-indigo-100 rounded-none">
                  <h5 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-1">Execution Params</h5>
                  {Object.keys((config as AutomatedNodeConfig).params).map((param) => (
                    <div key={param}>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">{param}</label>
                      <input
                        type="text"
                        value={(config as AutomatedNodeConfig).params[param] || ''}
                        onChange={(e) => {
                          const newParams = { ...(config as AutomatedNodeConfig).params, [param]: e.target.value };
                          handleChange('params', newParams);
                        }}
                        className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-none text-xs font-mono focus:border-indigo-600 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {type === 'end' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">Terminal Response Matrix</label>
                <textarea
                  value={(config as EndNodeConfig).message || ''}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-none text-sm font-medium min-h-[100px] focus:border-indigo-600 focus:bg-white"
                  placeholder="System path finalized..."
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={(config as EndNodeConfig).summaryFlag}
                    onChange={(e) => handleChange('summaryFlag', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-checked:bg-indigo-600 rounded-none transition-colors"></div>
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Generate Operational Summary</span>
              </label>
            </div>
          )}
        </section>

        <section className="pt-8 border-t border-slate-200">
          <button
            onClick={() => deleteNode(selectedNode.id)}
            className="w-full py-4 border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white rounded-none text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
          >
            Purge Node Definition
          </button>
        </section>
      </div>
    </div>
  );
};

export default PropertyPanel;
