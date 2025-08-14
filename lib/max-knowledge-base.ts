export const MAX_KNOWLEDGE_BASE = [
    "Q: What is S&A? A: S&A stands for Service & Administration. It handles centralized operations, client onboarding, service centers, and back-office activities including account maintenance, document processing, and operational support.",
    
    "Q: What is CWM? A: CWM stands for Consumer & Wealth Management. It provides mass market wealth services including investment accounts, retirement planning, and financial advisory services for retail clients.",
    
    "Q: What is Advisory Services? A: Advisory Services includes financial advisors and investment associates across all channels. They provide personalized financial planning, portfolio management, and investment advice to clients.",
    
    "Q: What is Supervision & Compliance? A: Supervision & Compliance handles regulatory oversight, trade review, surveillance, and account review to ensure all activities meet regulatory requirements and internal policies.",
    
    "Q: What is the client onboarding process? A: The client onboarding process includes: 1) Initial consultation and needs assessment, 2) Account application and documentation collection, 3) ID verification and compliance checks, 4) Account funding and portfolio setup, 5) Welcome call and service introduction. The process typically takes 3-5 business days.",
    
    "Q: What happens if ID verification is delayed? A: If ID verification is delayed beyond 48 hours: 1) Send automated e-ID reminders, 2) Prefill missing fields in the application, 3) Notify assigned advisors, 4) Schedule follow-up tasks, 5) Monitor for SLA breaches. This helps prevent onboarding delays and ensures regulatory compliance.",
    
    "Q: How do I handle stalled onboarding cases? A: For stalled onboarding cases: 1) Review the specific hold reason, 2) Send targeted reminders based on missing information, 3) Update CRM notes with action taken, 4) Schedule same-day follow-up tasks, 5) Escalate to supervisor if no response within 72 hours.",
    
    "Q: What are the key portfolio metrics to monitor? A: Key portfolio metrics include: 1) Asset allocation percentages, 2) Sector diversification, 3) Risk-adjusted returns, 4) Volatility measures, 5) Correlation with benchmarks, 6) Cash flow projections, 7) Tax efficiency ratios.",
    
    "Q: How do I handle portfolio rebalancing alerts? A: For portfolio rebalancing alerts: 1) Review current vs. target allocations, 2) Calculate required trades, 3) Check for tax implications, 4) Consider market conditions, 5) Prepare client communication, 6) Execute trades if approved, 7) Update client records.",
    
    "Q: What are the key compliance requirements for client accounts? A: Key compliance requirements include: 1) Know Your Customer (KYC) verification, 2) Anti-Money Laundering (AML) screening, 3) Suitability assessments, 4) Risk tolerance evaluations, 5) Regular account reviews, 6) Transaction monitoring, 7) Regulatory reporting.",
    
    "Q: How do I handle compliance flags? A: For compliance flags: 1) Immediately review the flag details, 2) Assess risk level and urgency, 3) Gather additional information if needed, 4) Document findings and actions, 5) Escalate to compliance team if required, 6) Update client records, 7) Monitor for resolution.",
    
    "Q: What is the standard response time for client inquiries? A: Standard response times are: 1) Urgent matters: 2 hours, 2) General inquiries: 24 hours, 3) Account changes: 48 hours, 4) Document requests: 72 hours, 5) Complex issues: 5 business days. All responses should be documented in CRM.",
    
    "Q: How do I handle client complaints? A: For client complaints: 1) Listen actively and acknowledge concerns, 2) Document the issue in CRM, 3) Research the situation thoroughly, 4) Provide clear explanation and solution, 5) Follow up to ensure resolution, 6) Escalate if unable to resolve, 7) Update client satisfaction metrics.",
    
    "Q: How do I handle market volatility alerts? A: For market volatility alerts: 1) Review affected client portfolios, 2) Identify high-risk positions, 3) Prepare client communications, 4) Consider rebalancing opportunities, 5) Monitor for additional risks, 6) Update client advisors, 7) Document actions taken.",
    
    "Q: What should I do when there are significant market events? A: For significant market events: 1) Assess impact on client portfolios, 2) Identify clients with concentrated positions, 3) Prepare proactive communications, 4) Review risk management strategies, 5) Coordinate with investment team, 6) Update client records, 7) Monitor for follow-up actions.",
    
    "Q: What systems do I need to access for client information? A: Key systems include: 1) CRM for client relationship data, 2) Portfolio management system for holdings, 3) Trading platform for transactions, 4) Compliance system for regulatory checks, 5) Document management for client files, 6) Reporting tools for analytics, 7) Communication platforms for client outreach.",
    
    "Q: How do I update client information in CRM? A: To update client information: 1) Access the client record in CRM, 2) Navigate to the appropriate section, 3) Make required changes, 4) Add notes explaining the update, 5) Save the changes, 6) Verify the update was successful, 7) Notify relevant team members if needed.",
    
    "Q: What are the key KPIs for wealth management? A: Key KPIs include: 1) Client satisfaction scores, 2) Account retention rates, 3) Portfolio performance vs. benchmarks, 4) Response time metrics, 5) Compliance adherence rates, 6) Revenue per client, 7) Client acquisition costs, 8) Service quality metrics.",
    
    "Q: How do I track client portfolio performance? A: To track portfolio performance: 1) Monitor daily/weekly/monthly returns, 2) Compare against relevant benchmarks, 3) Review risk-adjusted metrics, 4) Analyze sector and asset class performance, 5) Identify underperforming positions, 6) Prepare performance reports, 7) Schedule client review meetings.",
    
    "Q: How do I choose between different investment products? A: Product selection framework: 1) Assess client risk tolerance, 2) Review investment objectives, 3) Consider time horizon, 4) Evaluate tax implications, 5) Compare fees and expenses, 6) Review historical performance, 7) Consider liquidity needs, 8) Ensure suitability compliance.",
    
    "Q: When should I escalate a client issue? A: Escalation triggers: 1) Compliance violations or concerns, 2) Large financial losses, 3) Client complaints or threats, 4) System failures affecting multiple clients, 5) Regulatory inquiries, 6) Unusual trading activity, 7) Data security incidents, 8) Legal matters or disputes."
  ];
  
  export const MAX_CLIENT_DATA = [
    {
      id: "CL001",
      name: "Sarah Johnson",
      age: 45,
      location: "New York, NY",
      investment_style: "Moderate",
      net_worth_tier: "High Net Worth",
      organization: "CWM",
      portfolio: {
        total_value: 2500000,
        cash: 150000,
        equities: 1200000,
        bonds: 800000,
        alternatives: 350000
      },
      recent_activity: [
        "Account opened 3 months ago",
        "Initial portfolio setup completed",
        "Quarterly review scheduled for next week"
      ],
      alerts: [
        "Portfolio rebalancing due",
        "Market volatility affecting tech holdings"
      ]
    },
    {
      id: "CL002", 
      name: "Michael Chen",
      age: 62,
      location: "San Francisco, CA",
      investment_style: "Conservative",
      net_worth_tier: "Ultra High Net Worth",
      organization: "Advisory Services",
      portfolio: {
        total_value: 8500000,
        cash: 500000,
        equities: 3000000,
        bonds: 4000000,
        alternatives: 1000000
      },
      recent_activity: [
        "Retirement planning consultation",
        "Estate planning documents submitted",
        "Tax loss harvesting completed"
      ],
      alerts: [
        "Required minimum distribution due",
        "Estate planning review overdue"
      ]
    },
    {
      id: "CL003",
      name: "Emily Rodriguez",
      age: 28,
      location: "Austin, TX", 
      investment_style: "Aggressive",
      net_worth_tier: "Mass Market",
      organization: "CWM",
      portfolio: {
        total_value: 150000,
        cash: 25000,
        equities: 100000,
        bonds: 15000,
        alternatives: 10000
      },
      recent_activity: [
        "First-time investor consultation",
        "401(k) rollover initiated",
        "Emergency fund established"
      ],
      alerts: [
        "High concentration in tech stocks",
        "Risk tolerance review recommended"
      ]
    }
  ];
  
  export const MAX_GREETING = "Hello! I'm Max, your AI wealth management assistant. I can help you with client onboarding, portfolio management, compliance monitoring, and operational tasks. How can I assist you today?";
  
  export const MAX_PERSONALITY = {
    name: "Max",
    role: "AI Wealth Management Assistant",
    tone: "Professional, proactive, and helpful",
    capabilities: [
      "Client onboarding and verification",
      "Portfolio monitoring and alerts", 
      "Compliance and regulatory support",
      "Operational task automation",
      "Client communication assistance",
      "Data analysis and reporting"
    ]
  };