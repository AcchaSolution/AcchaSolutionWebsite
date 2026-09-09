import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { PropertyService } from '../services/property.service';

@Component({
  selector: 'app-agents-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './agents-view.component.html',
  styleUrl: './agents-view.component.css'
})
export class AgentsViewComponent implements OnInit {

  agents: any[] = [];

  selectedAgent: any = null;
  showAgentDetails: boolean = false;

  // Agent ki posted properties
  agentProperties: any[] = [];

  private authService = inject(AuthService);
  private propertyService = inject(PropertyService);

  constructor() {}

  ngOnInit(): void {
    this.loadAgents();
  }

  // =====================================================
  // LOAD APPROVED AGENTS + PROPERTY COUNT
  // =====================================================

  loadAgents(): void {

    this.authService.getApprovedAgents().subscribe({

      next: (res: any) => {

        console.log(
          'APPROVED AGENTS FROM MONGODB:',
          res
        );

        if (!res?.success) {

          console.error(
            'Approved agents API failed:',
            res
          );

          this.agents = [];

          return;
        }

        // ==========================================
        // GET ALL LOCAL PROPERTIES
        // ==========================================

        this.propertyService.getProperties().subscribe({

          next: (properties: any[]) => {

            console.log(
              'ALL LOCAL PROPERTIES:',
              properties
            );

            // ==========================================
            // AGENTS + ACTUAL PROPERTY COUNT
            // ==========================================

            this.agents =
              (res.agents || []).map(
                (agent: any) => {

                  const agentProperties =
                    properties.filter(
                      (property: any) =>
                        property.postedById === agent._id
                    );

                  console.log(
                    'AGENT:',
                    agent.name,
                    'ID:',
                    agent._id,
                    'PROPERTIES:',
                    agentProperties
                  );

                  return {

                    id: agent._id,

                    name:
                      agent.name || 'Unknown',

                    email:
                      agent.email || '',

                    phone:
                      agent.phone || '',

                    role:
                      agent.role || 'owner',

                    verified: true,

                    activeProperties:
                      agentProperties.length,

                    experience:
                      agent.experience || 0,

                    photoUrl:
                      agent.photoUrl || ''

                  };

                }
              );

            console.log(
              'PUBLIC APPROVED AGENTS:',
              this.agents
            );

          },

          error: (error: any) => {

            console.error(
              'Error loading local properties:',
              error
            );

            this.agents =
              (res.agents || []).map(
                (agent: any) => ({

                  id: agent._id,

                  name:
                    agent.name || 'Unknown',

                  email:
                    agent.email || '',

                  phone:
                    agent.phone || '',

                  role:
                    agent.role || 'owner',

                  verified: true,

                  activeProperties: 0,

                  experience:
                    agent.experience || 0,

                  photoUrl:
                    agent.photoUrl || ''

                })
              );

          }

        });

      },

      error: (error: any) => {

        console.error(
          'Error loading approved agents:',
          error
        );

        this.agents = [];

      }

    });

  }

  // =====================================================
  // OPEN AGENT DETAILS
  // =====================================================

  viewProfile(agentId: string): void {

    const agent = this.agents.find(
      (item: any) =>
        item.id === agentId
    );

    if (!agent) {
      return;
    }

    this.selectedAgent = agent;
    this.showAgentDetails = true;

    // ==========================================
    // LOAD THIS AGENT'S PROPERTIES
    // ==========================================

    this.propertyService.getProperties().subscribe({

      next: (properties: any[]) => {

        this.agentProperties =
          properties.filter(
            (property: any) =>
              property.postedById === agentId
          );

        console.log(
          'AGENT SELECTED:',
          agent.name
        );

        console.log(
          'AGENT PROPERTY LIST:',
          this.agentProperties
        );

      },

      error: (error: any) => {

        console.error(
          'Agent property loading error:',
          error
        );

        this.agentProperties = [];

      }

    });

  }

  // =====================================================
  // CLOSE AGENT DETAILS
  // =====================================================

  closeAgentDetails(): void {

    this.showAgentDetails = false;

    this.selectedAgent = null;

    // IMPORTANT
    this.agentProperties = [];

  }

  // =====================================================
  // TRACK BY
  // =====================================================

  trackByAgentId(
    index: number,
    agent: any
  ): string {

    return agent.id;

  }


  getInitials(name: string): string {

  if (!name) {
    return 'A';
  }

  const cleanName = name.trim();

  if (cleanName.length === 1) {
    return cleanName.toUpperCase();
  }

  return (
    cleanName.charAt(0).toUpperCase() +
    cleanName.charAt(1).toLowerCase()
  );
}
}
