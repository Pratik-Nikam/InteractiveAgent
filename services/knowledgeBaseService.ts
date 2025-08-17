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

    // Use comprehensive knowledge base
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
              pendingStep: "Attestation",
              responsiblePerson: "Maria Gomez",
              slaHours: 48,
              notes: "Passport uploaded, needs manager attestation"
            },
            {
              name: "Maria Gomez",
              advisor: "Laura Smith",
              status: "Address Proof",
              pendingStep: "Verification",
              responsiblePerson: "Anil Kapoor",
              slaHours: 36,
              notes: "Utility bill submitted, pending compliance check"
            },
            {
              name: "Michael Brown",
              advisor: "David Wilson",
              status: "Funding",
              pendingStep: "Treasury posting",
              responsiblePerson: "Treasury Ops",
              slaHours: 72,
              notes: "Wire transfer received, pending posting"
            },
            {
              name: "Priya Mehta",
              advisor: "Sophie Chen",
              status: "Account Approval",
              pendingStep: "Compliance review",
              responsiblePerson: "David Chen",
              slaHours: 72,
              notes: "Tax residency form under review"
            },
            {
              name: "James Wong",
              advisor: "Emily Davis",
              status: "Document Rejection",
              pendingStep: "Updated proof needed",
              responsiblePerson: "Client",
              slaHours: 24,
              notes: "Utility bill over 6 months old"
            }
          ]
        },
        sampleFlows: {
          flow1: {
            title: "John Kim Onboarding Delay",
            agentStart: "Good morning, Sarah. Three client onboardings have stalled past ID verification SLA. Want me to share details?",
            userQuestion: "What are we waiting on?",
            agentResponse: "For John Kim, passport uploaded but KYC not updated and document not attested.",
            followUp: "Who is it pending with?",
            followUpResponse: "Lilly from Doc Management uploaded it to AML/KYC portal. Waiting on Maria Gomez to attest. Call Maria?"
          },
          flow2: {
            title: "Funding Delay (Michael Brown)",
            agentStart: "Morning, Sarah. Michael Brown's funding hasn't cleared in 72 hours. Want me to follow up?",
            userQuestion: "Yes.",
            agentResponse: "Wire transfer received but pending posting in Treasury Ops. Shall I escalate?",
            followUp: "If Yes",
            followUpResponse: "Contacting Treasury Ops… Posting confirmed within the hour."
          },
          flow3: {
            title: "Investment Account Approval (Priya Mehta)",
            agentStart: "Hi, Sarah. Priya Mehta's account approval is in compliance review for 3 days. Expedite?",
            userQuestion: "Why the delay?",
            agentResponse: "Compliance is reviewing tax residency form. Pending with David Chen.",
            followUp: "If Yes",
            followUpResponse: "Messaging David for priority review."
          }
        },
        intentTriggers: {
          clientPending: "What's pending for [client]?",
          escalate: "Escalate to [person/team]",
          advisorReminder: "Send reminder to advisor",
          stalledOnboardings: "List stalled onboardings",
          fundingStatus: "Funding status for [client]",
          approveAccount: "Approve account for [client]"
        }
      },
      specializedKnowledge: {
        topics: [
          "Wealth management operations",
          "Client onboarding processes",
          "KYC/AML compliance",
          "Account funding and treasury operations",
          "Investment account setup",
          "Advisor relationship management",
          "SLA monitoring and escalation"
        ],
        capabilities: [
          "Track onboarding progress and identify bottlenecks",
          "Monitor SLA compliance and flag delays",
          "Provide status updates on client accounts",
          "Suggest escalation paths and next steps",
          "Coordinate with different teams and stakeholders",
          "Handle document verification and compliance checks"
        ]
      },
      conversationFlow: {
        greeting: "Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?",
        farewell: "Is there anything else you'd like me to check or escalate?",
        clarification: "Sorry, didn't catch that. Could you repeat?",
        confirmation: "Let me make sure I understand correctly...",
        followUp: "What would you like me to do next?",
        escalation: "Shall I escalate this to the appropriate team?",
        statusUpdate: "I'll monitor this and update you on any changes."
      }
    };

    console.log('Loaded comprehensive knowledge base:', this.knowledgeBase);
    return this.knowledgeBase;
  }

  // Get proactive greeting with specific issues
  getProactiveGreeting(): string {
    return "Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?";
  }

  // NEW: Create intelligent prompt that makes the LLM act as a wealth management assistant
  async generateIntelligentPrompt(message: string, conversationHistory: any[] = []): Promise<string> {
    const kb = await this.loadKnowledgeBase();
    
    // Build conversation context
    const history = conversationHistory
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Get current issues from knowledge base
    const stalledClients = this.getStalledOnboardings();
    const currentIssues = stalledClients.map(client => 
      `${client.name}: ${client.status} - ${client.pendingStep} (${client.slaHours}h overdue, pending with ${client.responsiblePerson})`
    ).join('\n');

    // Create a more intelligent prompt
    const intelligentPrompt = `You are Max, a Wealth Management Operations Assistant. Your role is to proactively identify and resolve issues in client onboarding processes.

CURRENT CLIENT ISSUES:
${currentIssues}

AVAILABLE ACTIONS:
- Send e-ID reminders to clients
- Prefill missing fields in forms
- Notify advisors about pending items
- Escalate to compliance team
- Contact treasury for funding issues
- Update SLA status

CONVERSATION HISTORY:
${history}

USER MESSAGE: ${message}

INSTRUCTIONS:
1. If this is the first message, proactively identify the most critical issues
2. Always reference specific client names and their specific problems
3. Offer concrete next steps (e.g., "I'll send e-ID reminders to John Kim and Maria Gomez")
4. Keep responses concise (2-3 sentences max)
5. Focus on wealth management operations only

ASSISTANT:`;

    return intelligentPrompt;
  }

  async generatePrompt(message: string, conversationHistory: any[] = []): Promise<string> {
    // Use the intelligent prompt instead of the basic one
    return this.generateIntelligentPrompt(message, conversationHistory);
  }

  getIntroduction(): string {
    return this.knowledgeBase?.introduction || "Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?";
  }

  getConversationStarters(): string[] {
    return this.knowledgeBase?.conversationStarters || ["Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?"];
  }

  getRandomConversationStarter(): string {
    const starters = this.getConversationStarters();
    return starters[Math.floor(Math.random() * starters.length)];
  }

  getGreeting(): string {
    return this.getProactiveGreeting();
  }

  getClientData(clientName?: string) {
    const clients = this.knowledgeBase?.wealthManagementContext.clientDataset.clients || [];
    if (clientName) {
      return clients.find((client: any) => 
        client.name.toLowerCase().includes(clientName.toLowerCase())
      );
    }
    return clients;
  }

  getStalledOnboardings() {
    const clients = this.getClientData();
    return clients.filter((client: any) => client.slaHours > 24);
  }

  // NEW: Get specific client issues for better responses
  getClientIssues(clientName?: string) {
    if (clientName) {
      const client = this.getClientData(clientName);
      if (client) {
        return `${client.name} has ${client.status} pending - ${client.pendingStep} (${client.slaHours}h overdue, pending with ${client.responsiblePerson})`;
      }
    }
    return null;
  }
}

// Singleton instance
export const knowledgeBaseService = new KnowledgeBaseService();
