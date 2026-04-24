import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  NodeChange, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges 
} from '@xyflow/react';
import { WorkflowNode, WorkflowEdge, NodeType, NodeConfig, StartNodeConfig, TaskNodeConfig, ApprovalNodeConfig, AutomatedNodeConfig, EndNodeConfig } from './types';
import { getLayoutedElements, validateWorkflow } from './lib/workflowUtils';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  globalErrors: string[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  selectNode: (id: string | null) => void;
  updateNodeConfig: (id: string, config: Partial<NodeConfig>) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  layoutNodes: () => void;
  runValidation: () => void;
}

const getDefaultConfig = (type: NodeType): NodeConfig => {
  switch (type) {
    case 'start':
      return { title: 'START_PROTOCOL', metadata: {} } as StartNodeConfig;
    case 'task':
      return { title: 'NEW_TASK', description: '', assignee: '', dueDate: '' } as TaskNodeConfig;
    case 'approval':
      return { title: 'APPROVAL_STEP', approverRole: 'Manager', autoApproveThreshold: 1 } as ApprovalNodeConfig;
    case 'automated':
      return { title: 'AUTO_SCRIPT', actionId: '', params: {} } as AutomatedNodeConfig;
    case 'end':
      return { message: 'PROCESS_COMPLETE', summaryFlag: true } as EndNodeConfig;
  }
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  globalErrors: [],

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as WorkflowNode[],
    });
    get().runValidation();
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as WorkflowEdge[],
    });
    get().runValidation();
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
    get().runValidation();
  },

  addNode: (type, position) => {
    const id = `${type}_${Math.random().toString(36).substr(2, 9)}`;
    const newNode: WorkflowNode = {
      id,
      type: 'custom',
      position,
      data: {
        label: type.toUpperCase(),
        type,
        config: getDefaultConfig(type),
        errors: []
      },
    };

    set({
      nodes: [...get().nodes, newNode],
    });
    get().runValidation();
  },

  selectNode: (id) => {
    set({ selectedNodeId: id });
  },

  updateNodeConfig: (id, config) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              config: { ...node.data.config, ...config } as NodeConfig,
            },
          };
        }
        return node;
      }),
    });
    // Config changes might resolve some logical errors if we validate content too
    get().runValidation();
  },

  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
    get().runValidation();
  },

  setNodes: (nodes) => {
    set({ nodes });
    get().runValidation();
  },
  
  setEdges: (edges) => {
    set({ edges });
    get().runValidation();
  },

  layoutNodes: () => {
    const { nodes, edges } = get();
    const layouted = getLayoutedElements(nodes, edges);
    set({ nodes: layouted.nodes, edges: layouted.edges });
  },

  runValidation: () => {
    const { nodes, edges } = get();
    const { nodeErrors, globalErrors } = validateWorkflow(nodes, edges);
    
    const newNodes = nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            errors: nodeErrors[node.id] || []
        }
    }));

    set({ nodes: newNodes, globalErrors });
  }
}));
