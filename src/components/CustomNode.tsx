import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { 
  Play, 
  CheckCircle, 
  User, 
  Cpu, 
  Flag,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkflowNode } from '../types';

const NodeIcons: Record<string, any> = {
  start: Play,
  task: User,
  approval: CheckCircle,
  automated: Cpu,
  end: Flag,
};

const NodeColors: Record<string, string> = {
  start: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  task: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  approval: 'bg-amber-50 text-amber-700 border-amber-200',
  automated: 'bg-slate-50 text-slate-700 border-slate-200',
  end: 'bg-rose-50 text-rose-700 border-rose-200',
};

const NodeIconColors: Record<string, string> = {
  start: 'text-emerald-500',
  task: 'text-indigo-500',
  approval: 'text-amber-500',
  automated: 'text-slate-500',
  end: 'text-rose-500',
};

const CustomNode = ({ data, selected }: NodeProps<WorkflowNode>) => {
  const Icon = NodeIcons[data.type] || Play;
  const colorClass = NodeColors[data.type] || 'bg-white text-slate-700 border-slate-200';
  const iconColorClass = NodeIconColors[data.type] || 'text-slate-500';
  const hasErrors = data.errors && data.errors.length > 0;

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-sm rounded-none border border-slate-200 min-w-[200px] transition-all duration-150 bg-white group',
        selected ? 'border-indigo-600 ring-4 ring-indigo-50 scale-[1.02]' : 'border-slate-200',
        hasErrors ? 'border-rose-400 bg-rose-50/20' : 'hover:border-slate-400'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-none flex items-center justify-center w-10 h-10', colorClass)}>
          <Icon size={18} className={iconColorClass} />
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-0.5">
            {data.type}
          </div>
          <div className="font-bold text-xs text-slate-900 truncate uppercase">
            {(data.config as any).title || data.label}
          </div>
        </div>
        
        {hasErrors ? (
          <div className="text-rose-500 group-hover:scale-110 transition-transform cursor-help relative group/error">
             <AlertCircle size={16} />
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/error:block z-50">
                <div className="bg-slate-900 text-white text-[10px] font-bold p-2 whitespace-nowrap uppercase tracking-widest border border-slate-800 shadow-xl">
                   {data.errors?.[0]}
                </div>
             </div>
          </div>
        ) : (
          <button className="text-slate-300 hover:text-slate-500">
            <MoreVertical size={14} />
          </button>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-400 !border-0 !rounded-none"
        style={{ visibility: data.type === 'start' ? 'hidden' : 'visible' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-400 !border-0 !rounded-none"
        style={{ visibility: data.type === 'end' ? 'hidden' : 'visible' }}
      />
    </div>
  );
};

export default memo(CustomNode);
