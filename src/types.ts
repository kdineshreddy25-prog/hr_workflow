import { Node, Edge } from '@xyflow/react';

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  config: NodeConfig;
  errors?: string[];
}

export type NodeConfig = 
  | StartNodeConfig 
  | TaskNodeConfig 
  | ApprovalNodeConfig 
  | AutomatedNodeConfig 
  | EndNodeConfig;

export interface StartNodeConfig {
  title: string;
  metadata?: Record<string, string>;
}

export interface TaskNodeConfig {
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  customFields?: Record<string, string>;
}

export interface ApprovalNodeConfig {
  title: string;
  approverRole: string;
  autoApproveThreshold: number;
}

export interface AutomatedNodeConfig {
  title: string;
  actionId: string;
  params: Record<string, string>;
}

export interface EndNodeConfig {
  message: string;
  summaryFlag: boolean;
}

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export interface SimulationResult {
  steps: SimulationStep[];
  success: boolean;
  error?: string;
}

export interface SimulationStep {
  nodeId: string;
  nodeTitle: string;
  type: NodeType;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  output?: string;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
