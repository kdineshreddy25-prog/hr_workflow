import React, { useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '../store';
import CustomNode from './CustomNode';
import { NodeType } from '../types';
import { Play, Save, Share2, Trash2, Layout, AlertTriangle } from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

const WorkflowCanvas = ({ onSimulate }: { onSimulate: () => void }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNode, 
    selectNode,
    setNodes,
    setEdges,
    layoutNodes,
    globalErrors
  } = useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = {
        x: event.clientX - (reactFlowWrapper.current?.getBoundingClientRect().left || 0) - 100,
        y: event.clientY - (reactFlowWrapper.current?.getBoundingClientRect().top || 0) - 20,
      };

      addNode(type, position);
    },
    [addNode]
  );

  const clearWorkflow = () => {
    if (confirm('Are you sure you want to clear the entire workflow?')) {
      setNodes([]);
      setEdges([]);
      selectNode(null);
    }
  };

  return (
    <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-50/50"
      >
        <Background variant={BackgroundVariant.Lines} gap={20} size={1} color="#e2e8f0" />
        <Controls className="!rounded-none" />
        
        <Panel position="top-right" className="flex flex-col items-end gap-3">
          <div className="flex bg-white rounded-none shadow-sm border border-slate-200 p-1">
            <button 
              onClick={onSimulate}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-none transition-all active:scale-95 uppercase tracking-widest group"
            >
              <Play size={14} fill="currentColor" className="group-hover:translate-x-0.5 transition-transform" />
              Simulate Matrix
            </button>
          </div>
          
          <div className="flex bg-white rounded-none shadow-sm border border-slate-200 p-1">
            <button 
              onClick={layoutNodes}
              className="p-2.5 hover:bg-slate-50 rounded-none text-slate-400 hover:text-indigo-600 transition-colors"
              title="Auto-layout Pipeline"
            >
              <Layout size={18} />
            </button>
            <div className="w-[1px] bg-slate-100 mx-1" />
            <button 
              className="p-2.5 hover:bg-slate-50 rounded-none text-slate-400 hover:text-slate-600 transition-colors"
              title="Export Definition"
            >
              <Save size={18} />
            </button>
            <div className="w-[1px] bg-slate-100 mx-1" />
            <button 
              onClick={clearWorkflow}
              className="p-2.5 hover:bg-rose-50 rounded-none text-slate-400 hover:text-rose-600 transition-colors"
              title="Purge Canvas"
            >
              <Trash2 size={18} />
            </button>
          </div>

          {globalErrors.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 p-3 max-w-[240px] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-2 text-rose-600 mb-1">
                 <AlertTriangle size={14} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Errors</span>
               </div>
               <ul className="space-y-1">
                 {globalErrors.map((err, i) => (
                   <li key={i} className="text-[10px] text-rose-500 font-medium leading-tight">
                     - {err}
                   </li>
                 ))}
               </ul>
            </div>
          )}
        </Panel>

        <Panel position="top-left" className="bg-white p-4 rounded-none border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-none flex items-center justify-center shrink-0">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight uppercase">Opus Workflow</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none">Cluster Designer A-04</p>
              </div>
            </div>
          </div>
        </Panel>

        {!nodes.length && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 transition-opacity">
            <div className="text-center">
              <div className="p-12 border-2 border-slate-300 rounded-none mb-6 inline-block">
                <Share2 size={56} className="text-slate-400" />
              </div>
              <h3 className="text-3xl font-light text-slate-400 uppercase tracking-[0.3em] italic">Deploy Node Matrix</h3>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
