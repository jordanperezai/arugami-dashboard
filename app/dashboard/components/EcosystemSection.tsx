'use client';

import { useState } from 'react';
import { IntegrationStatus } from './IntegrationStatus';
import { EcosystemModal } from './EcosystemModal';

interface Integration {
  integration_id: string;
  integration_type: string;
  display_name: string;
  status: string;
  last_health_check: string | null;
}

interface AgentRun {
  agent_run_id: string;
  agent_type: string;
  status: string;
  queued_at: string;
  goal: string;
}

interface EcosystemSectionProps {
  integrations: Integration[];
  agentRuns: AgentRun[];
}

export function EcosystemSection({ integrations, agentRuns }: EcosystemSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <IntegrationStatus 
        integrations={integrations} 
        onExpand={() => setIsModalOpen(true)} 
      />
      
      <EcosystemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        integrations={integrations}
        agentRuns={agentRuns}
      />
    </>
  );
}
