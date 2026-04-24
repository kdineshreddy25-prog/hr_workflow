/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import WorkflowCanvas from './components/WorkflowCanvas';
import PropertyPanel from './components/PropertyPanel';
import SimulationPanel from './components/SimulationPanel';
import { ReactFlowProvider } from '@xyflow/react';

export default function App() {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <ReactFlowProvider>
        {/* Sidebar for dragging nodes */}
        <Sidebar />

        {/* Main Canvas area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <WorkflowCanvas onSimulate={() => setIsSimulatorOpen(true)} />
        </main>

        {/* Properties Panel (conditional) */}
        <PropertyPanel />

        {/* Simulation Sandbox (Modal) */}
        <SimulationPanel 
          isOpen={isSimulatorOpen} 
          onClose={() => setIsSimulatorOpen(false)} 
        />
      </ReactFlowProvider>
    </div>
  );
}

