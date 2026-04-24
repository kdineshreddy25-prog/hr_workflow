import React from 'react';
import { 
  Play, 
  CheckCircle, 
  User, 
  Cpu, 
  Flag 
} from 'lucide-react';
import { NodeType } from '../types';

const NODE_TYPES: { type: NodeType; label: string; icon: any; color: string; description: string }[] = [
  { 
    type: 'start', 
    label: 'Start Node', 
    icon: Play, 
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Trigger point of your workflow.'
  },
  { 
    type: 'task', 
    label: 'Task Node', 
    icon: User, 
    color: 'bg-blue-100 text-blue-700',
    description: 'A manual step for an assignee.'
  },
  { 
    type: 'approval', 
    label: 'Approval Node', 
    icon: CheckCircle, 
    color: 'bg-amber-100 text-amber-700',
    description: 'Requires multi-level sign-offs.'
  },
  { 
    type: 'automated', 
    label: 'Automation', 
    icon: Cpu, 
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Trigger system-level scripts.'
  },
  { 
    type: 'end', 
    label: 'End Node', 
    icon: Flag, 
    color: 'bg-rose-100 text-rose-700',
    description: 'Finalize the workflow path.'
  },
];

const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Components</h2>
        <p className="text-sm font-medium text-slate-800 mt-2">Architecture Matrix</p>
      </div>

      <div className="p-4 space-y-2">
        {NODE_TYPES.map((node) => {
          const Icon = node.icon;
          return (
            <div
              key={node.type}
              className="group cursor-grab active:cursor-grabbing p-3 rounded-none border border-slate-100 bg-white hover:bg-slate-50 hover:border-indigo-200 transition-all duration-150"
              onDragStart={(event) => onDragStart(event, node.type)}
              draggable
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-none ${node.color} flex items-center justify-center w-10 h-10`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate">{node.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium line-clamp-1">
                    {node.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-none"></div>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Compiler Ready</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-relaxed font-medium">
          VALIDATE START-TO-END CONTINUUM BEFORE PRODUCTION SYNC.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
