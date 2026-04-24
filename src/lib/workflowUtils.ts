import dagre from 'dagre';
import { WorkflowNode, WorkflowEdge, WorkflowGraph } from '../types';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 80;

export const getLayoutedElements = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 100, ranksep: 100 }); // Top to Bottom layout with better spacing

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export const validateWorkflow = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const nodeErrors: Record<string, string[]> = {};
  const globalErrors: string[] = [];

  // 1. One and only one Start Node
  const startNodes = nodes.filter(n => n.data.type === 'start');
  if (startNodes.length === 0) globalErrors.push('Workflow must have a Start Node.');
  if (startNodes.length > 1) {
    startNodes.forEach(n => {
      nodeErrors[n.id] = [...(nodeErrors[n.id] || []), 'Only one Start Node is allowed.'];
    });
  }

  // 2. Start Node must be first (no incoming)
  startNodes.forEach(n => {
    const incoming = edges.filter(e => e.target === n.id);
    if (incoming.length > 0) {
      nodeErrors[n.id] = [...(nodeErrors[n.id] || []), 'Start Node cannot have incoming edges.'];
    }
  });

  // 3. End Node must be last (no outgoing)
  const endNodes = nodes.filter(n => n.data.type === 'end');
  endNodes.forEach(n => {
    const outgoing = edges.filter(e => e.source === n.id);
    if (outgoing.length > 0) {
      nodeErrors[n.id] = [...(nodeErrors[n.id] || []), 'End Node cannot have outgoing edges.'];
    }
  });

  // 4. Disconnected nodes
  nodes.forEach(n => {
    if (n.data.type === 'start') {
      const hasOutgoing = edges.some(e => e.source === n.id);
      if (!hasOutgoing && nodes.length > 1) nodeErrors[n.id] = [...(nodeErrors[n.id] || []), 'Start Node must lead to other steps.'];
    } else if (n.data.type === 'end') {
      const hasIncoming = edges.some(e => e.target === n.id);
      if (!hasIncoming) nodeErrors[n.id] = [...(nodeErrors[n.id] || []), 'End Node must be reachable.'];
    } else {
      const hasIncoming = edges.some(e => e.target === n.id);
      const hasOutgoing = edges.some(e => e.source === n.id);
      if (!hasIncoming) nodeErrors[n.id] = [...(nodeErrors[n.id] || []), 'Isolated node: No incoming connection.'];
      if (!hasOutgoing) nodeErrors[n.id] = [...(nodeErrors[n.id] || []), 'Terminal step: No outgoing connection (use End Node).'];
    }
  });

  // Check for cycles using DFS
  const hasCycle = (nodeId: string, visited: Set<string>, recStack: Set<string>): boolean => {
    visited.add(nodeId);
    recStack.add(nodeId);

    const neighbors = edges.filter(e => e.source === nodeId).map(e => e.target);
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        if (hasCycle(neighborId, visited, recStack)) return true;
      } else if (recStack.has(neighborId)) {
        return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  };

  const visited = new Set<string>();
  const recStack = new Set<string>();
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycle(node.id, visited, recStack)) {
        globalErrors.push('Infinite loop detected in workflow graph.');
        // We could also identify specific nodes in cycle if needed
        break;
      }
    }
  }

  return { nodeErrors, globalErrors };
};
