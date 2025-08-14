import { Document } from 'langchain/document';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Ollama } from '@langchain/community/llms/ollama';
import { MAX_KNOWLEDGE_BASE, MAX_CLIENT_DATA, MAX_GREETING, MAX_PERSONALITY } from '@/lib/max-knowledge-base';

export class RAGService {
  private vectorStore: MemoryVectorStore | null = null;
  private llm: Ollama;
  private embeddings: OllamaEmbeddings;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      model: 'tinyllama',
      baseUrl: 'http://localhost:11434',
    });
    
    this.llm = new Ollama({
      model: 'tinyllama',
      baseUrl: 'http://localhost:11434',
    });
  }

  // Method to set vector store from document processor
  setVectorStore(vectorStore: MemoryVectorStore) {
    this.vectorStore = vectorStore;
  }

  async initializeKnowledgeBase() {
    try {
      console.log('🔍 MAX: Initializing Max knowledge base with', MAX_KNOWLEDGE_BASE.length, 'documents');
      
      const documents = MAX_KNOWLEDGE_BASE.map((knowledge, index) => 
        new Document({ 
          pageContent: knowledge, 
          metadata: { source: `max-knowledge-${index}`, type: 'max-knowledge' } 
        })
      );

      // Add client data
      MAX_CLIENT_DATA.forEach((client, index) => {
        const clientDoc = `Client: ${client.name} (${client.id})
Age: ${client.age}
Location: ${client.location}
Investment Style: ${client.investment_style}
Net Worth Tier: ${client.net_worth_tier}
Organization: ${client.organization}
Portfolio Value: $${client.portfolio.total_value.toLocaleString()}
Recent Activity: ${client.recent_activity.join(', ')}
Alerts: ${client.alerts.join(', ')}`;
        
        documents.push(new Document({
          pageContent: clientDoc,
          metadata: { source: `client-${client.id}`, type: 'client-data' }
        }));
      });

      this.vectorStore = await MemoryVectorStore.fromDocuments(
        documents,
        this.embeddings
      );
      
      console.log('🔍 MAX: Knowledge base initialized successfully');
    } catch (error) {
      console.error('Error initializing Max knowledge base:', error);
      throw error;
    }
  }

  async query(question: string): Promise<{ answer: string; source: string; confidence: number }> {
    if (!this.vectorStore) {
      return {
        answer: MAX_GREETING,
        source: "max-greeting",
        confidence: 100
      };
    }

    try {
      console.log('🔍 MAX: Searching knowledge base for:', question);
      
      const docs = await this.vectorStore.similaritySearch(question, 3);
      
      if (docs.length === 0) {
        return {
          answer: "I don't have specific information about that in my knowledge base. Let me connect you with a human advisor who can help.",
          source: "no_match",
          confidence: 0
        };
      }

      const confidence = docs[0].score ? Math.round(docs[0].score * 100) : 50;
      const context = docs.map(doc => doc.pageContent).join('\n\n');
      
      const prompt = `You are Max, an AI wealth management assistant. Answer the following question based on the provided context. Be professional, helpful, and proactive. Always introduce yourself as Max when appropriate. If the context doesn't contain the answer, say you'll need to consult with a human advisor.

Context:
${context}

Question: ${question}

Max's Response:`;

      const response = await this.llm.call(prompt);
      const source = docs[0].metadata?.source || 'unknown';
      
      return {
        answer: response,
        source: source,
        confidence: confidence
      };
    } catch (error) {
      console.error('Error querying Max knowledge base:', error);
      return {
        answer: "I'm sorry, I encountered an error. Let me connect you with a human advisor who can help.",
        source: "error",
        confidence: 0
      };
    }
  }
}