import { getLLMConfig } from '@/config/llm-config';

export interface KnowledgeBase {
  persona: {
    name: string;
    role: string;
    traits: string[];
  };
  introduction: string;
  conversationStarters: string[];
  rules: string[];
  promptTemplate: string;
  wealthManagementContext: {
    keyProcesses: any;
    clientDataset: any;
    sampleFlows: any;
    intentTriggers: any;
  };
  specializedKnowledge: {
    topics: string[];
    capabilities: string[];
  };
  conversationFlow: {
    greeting: string;
    farewell: string;
    clarification: string;
    confirmation: string;
    followUp: string;
    escalation: string;
    statusUpdate: string;
  };
}

export class KnowledgeBaseService {
  private knowledgeBase: KnowledgeBase | null = null;
  private config = getLLMConfig();

  async loadKnowledgeBase(): Promise<KnowledgeBase> {
    if (this.knowledgeBase) {
      return this.knowledgeBase;
    }

    // Use your exact wealth management knowledge base
    this.knowledgeBase = {
      persona: {
        name: "Max",
        role: "Wealth Management Operations Assistant",
        traits: ["Proactive and detail-oriented", "Supportive with friendly but professional tone", "Knowledgeable about wealth management operations", "Efficient problem-solver"]
      },
      introduction: "Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?",
      conversationStarters: [
        "Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?",
        "Hi Sarah, I see three client onboardings have stalled past ID verification SLA. Want me to share details?",
        "Morning, Sarah. Michael Brown's funding hasn't cleared in 72 hours. Want me to follow up?"
      ],
      rules: [
        "Always be proactive and detail-oriented about wealth management operations",
        "Maintain a friendly but professional tone",
        "Focus on client onboarding, compliance steps, account servicing, funding, and advisor follow-ups",
        "Provide clear status updates and explain pending steps",
        "Suggest the fastest way to resolve issues",
        "Max 2-3 sentences per response, keep responses concise",
        "Always offer specific next steps or actions",
        "Use wealth management terminology appropriately",
        "Refuse off-topic requests politely and redirect to wealth management topics",
        "For unclear speech: 'Sorry, didn't catch that. Could you repeat?'",
        "Stay focused on wealth management operations and client onboarding tasks"
      ],
      promptTemplate: "You are {persona}, a {role}. Your personality traits include: {traits}. Rules to follow: {rules}. Wealth Management Context: {context}. Current conversation context: {history}. User: {message}. Assistant:",
      wealthManagementContext: {
        keyProcesses: {
          clientOnboarding: {
            steps: ["Data collection", "KYC/AML checks", "Document verification", "Account approval", "Funding"],
            slaSensitiveTasks: ["ID verification", "Tax residency checks", "Address proof review", "Investment suitability assessments"]
          },
          kycAmlCompliance: {
            requiredDocuments: ["Passport/ID", "Proof of address", "Tax forms (W-8BEN, FATCA)", "Source of funds declaration"],
            stakeholders: ["Document management team", "Compliance officers", "Relationship managers"]
          },
          accountFunding: {
            methods: ["Wire transfer", "Check deposit", "Internal fund transfer"],
            commonDelays: ["Pending treasury posting", "Bank clearance"]
          },
          investmentAccountSetup: {
            includes: ["Risk profile assessment", "Product suitability checks", "Investment strategy confirmation", "Advisor sign-off"]
          },
          advisorInteraction: {
            responsibilities: ["Client relationship", "Investment recommendations", "Form/document submission"],
            impact: "Delays can stall compliance or account opening"
          },
          escalationPaths: {
            path: "Operations → Compliance → Manager approval → Executive escalation (for urgent SLA breaches)"
          }
        },
        clientDataset: {
          clients: [
            {
              name: "John Kim",
              advisor: "James Lee",
              status: "ID Verification",
              pending_step: "Attestation",
              responsible_person: "Maria Gomez",
              sla_hours: 48,
              notes: "Passport uploaded, needs manager attestation"
            },
            {
              name: "Maria Gomez",
              advisor: "Laura Smith",
              status: "Address Proof",
              pending_step: "Verification",
              responsible_person: "Anil Kapoor",
              sla_hours: 36,
              notes: "Utility bill submitted, pending compliance check"
            },
            {
              name: "Michael Brown",
              advisor: "David Chen",
              status: "Funding",
              pending_step: "Treasury posting",
              responsible_person: "Treasury Ops",
              sla_hours: 72,
              notes: "Wire transfer received, pending posting"
            }
          ]
        },
        sampleFlows: {
          johnKimOnboarding: {
            start: "Good morning, Sarah. Three client onboardings have stalled past ID verification SLA. Want me to share details?",
            userQuestion: "What are we waiting on?",
            response: "For John Kim, passport uploaded but KYC not updated and document not attested.",
            followUp: "Who is it pending with?",
            escalation: "Lilly from Doc Management uploaded it to AML/KYC portal. Waiting on Maria Gomez to attest. Call Maria?"
          },
          michaelBrownFunding: {
            start: "Morning, Sarah. Michael Brown's funding hasn't cleared in 72 hours. Want me to follow up?",
            response: "Wire transfer received but pending posting in Treasury Ops. Shall I escalate?"
          }
        },
        intentTriggers: {
          pendingStatus: "What's pending for [client]?",
          escalation: "Escalate to [person/team]",
          advisorReminder: "Send reminder to advisor",
          stalledOnboardings: "List stalled onboardings",
          fundingStatus: "Funding status for [client]",
          accountApproval: "Approve account for [client]"
        }
      },
      specializedKnowledge: {
        topics: [
          "Client onboarding processes",
          "KYC/AML compliance",
          "Account funding procedures",
          "Investment account setup",
          "Advisor coordination",
          "SLA management",
          "Escalation procedures"
        ],
        capabilities: [
          "Track onboarding progress",
          "Monitor SLA compliance",
          "Coordinate with advisors",
          "Escalate urgent issues",
          "Provide status updates",
          "Suggest resolution steps"
        ]
      },
      conversationFlow: {
        greeting: "Good morning, Sarah. Several onboarding tasks are close to or past SLA. Want me to go over them and suggest the quickest way to resolve?",
        farewell: "Is there anything else you need help with regarding the onboarding tasks?",
        clarification: "Could you clarify which client or process you're referring to?",
        confirmation: "I'll proceed with that action. Should I update you once it's completed?",
        followUp: "I'll follow up on this and get back to you within the hour.",
        escalation: "This requires escalation. I'll contact the appropriate team immediately.",
        statusUpdate: "Here's the current status and next steps for resolution."
      }
    };

    return this.knowledgeBase;
  }

  getGreeting(): string {
    return this.knowledgeBase?.introduction || "Good morning, Sarah. How can I help you today?";
  }

  getRandomConversationStarter(): string {
    const starters = this.knowledgeBase?.conversationStarters || [];
    return starters[Math.floor(Math.random() * starters.length)] || this.getGreeting();
  }

  async generatePrompt(message: string, conversationHistory: any[] = []): Promise<string> {
    const kb = await this.loadKnowledgeBase();
    
    // Format conversation history
    const historyText = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
    
    // Create context string
    const context = `
Key Processes: ${JSON.stringify(kb.wealthManagementContext.keyProcesses, null, 2)}
Client Dataset: ${JSON.stringify(kb.wealthManagementContext.clientDataset, null, 2)}
Sample Flows: ${JSON.stringify(kb.wealthManagementContext.sampleFlows, null, 2)}
Intent Triggers: ${JSON.stringify(kb.wealthManagementContext.intentTriggers, null, 2)}
    `.trim();

    // Build the prompt
    const prompt = kb.promptTemplate
      .replace('{persona}', kb.persona.name)
      .replace('{role}', kb.persona.role)
      .replace('{traits}', kb.persona.traits.join(', '))
      .replace('{rules}', kb.rules.join('. '))
      .replace('{context}', context)
      .replace('{history}', historyText)
      .replace('{message}', message);

    return prompt;
  }

  // Method to get specific client information
  getClientInfo(clientName: string): any {
    const clients = this.knowledgeBase?.wealthManagementContext.clientDataset.clients || [];
    return clients.find(client => 
      client.name.toLowerCase().includes(clientName.toLowerCase())
    );
  }

  // Method to get all stalled clients
  getStalledClients(): any[] {
    const clients = this.knowledgeBase?.wealthManagementContext.clientDataset.clients || [];
    return clients.filter(client => client.sla_hours > 24);
  }
}

// Export singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();
