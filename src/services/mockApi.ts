import { AutomationAction, SimulationResult, WorkflowGraph, SimulationStep } from '../types';

const MOCK_AUTOMATIONS: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient', 'format'] },
  { id: 'notify_slack', label: 'Slack Notification', params: ['channel', 'message'] },
  { id: 'update_crm', label: 'Update CRM Record', params: ['entityId', 'field'] },
];

export const mockApi = {
  getAutomations: async (): Promise<AutomationAction[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_AUTOMATIONS;
  },

  simulateWorkflow: async (graph: WorkflowGraph): Promise<SimulationResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { nodes, edges } = graph;
    
    // Initial validation check
    const startNodes = nodes.filter(n => n.data.type === 'start');
    if (startNodes.length === 0) {
      return { success: false, error: 'Workflow must have a Start Node', steps: [] };
    }
    if (startNodes.length > 1) {
      return { success: false, error: 'Workflow can only have one Start Node', steps: [] };
    }

    const steps: SimulationStep[] = [];
    let currentNode = startNodes[0];
    const visited = new Set();
    const maxSteps = 50; // Prevention for infinite loops in mock simulator

    while (currentNode && steps.length < maxSteps) {
      if (visited.has(currentNode.id)) {
        return { success: false, error: 'Cycle detected during execution trace', steps };
      }
      visited.add(currentNode.id);

      const config = currentNode.data.config as any;
      let stepOutput = '';

      switch (currentNode.data.type) {
        case 'start':
          stepOutput = `Initializing workflow protocol: ${config.title}. Metadata sync successful.`;
          break;
        case 'task':
          stepOutput = `Manual task assigned to ${config.assignee || 'UNASSIGNED'}. Title: ${config.title}. Due date: ${config.dueDate || 'NONE'}.`;
          break;
        case 'approval':
          stepOutput = `Requesting approval from ${config.approverRole}. Threshold set to ${config.autoApproveThreshold} quorum.`;
          break;
        case 'automated':
          stepOutput = `Triggering system script: ${config.actionId || 'UNKNOWN'}. Arguments passed: ${JSON.stringify(config.params)}.`;
          break;
        case 'end':
          stepOutput = `Terminal state reached. Message: ${config.message}. Summary generation: ${config.summaryFlag ? 'ENABLED' : 'DISABLED'}.`;
          break;
      }

      steps.push({
        nodeId: currentNode.id,
        nodeTitle: config.title || currentNode.data.label,
        type: currentNode.data.type,
        status: 'completed',
        timestamp: new Date().toISOString(),
        output: stepOutput
      });

      if (currentNode.data.type === 'end') break;

      const outgoingEdges = edges.filter(e => e.source === currentNode.id);
      if (outgoingEdges.length === 0) {
        steps.push({
          nodeId: 'error',
          nodeTitle: 'INCOMPLETE_LINK',
          type: 'end',
          status: 'failed',
          timestamp: new Date().toISOString(),
          output: 'ERROR::04: Node path terminated without reaching an End Node binary state.'
        });
        return { success: false, error: 'Workflow path is incomplete', steps };
      }

      // Simulation follows the primary path
      const nextEdge = outgoingEdges[0];
      const nextNode = nodes.find(n => n.id === nextEdge.target);
      
      if (!nextNode) {
        return { success: false, error: 'Reference error: Target node not found', steps };
      }
      
      currentNode = nextNode;
    }

    if (steps.length >= maxSteps) {
      return { success: false, error: 'Sync timeout: Execution path exceeded maximum allowable nodes.', steps };
    }

    return { 
      success: true, 
      steps 
    };
  }
};
