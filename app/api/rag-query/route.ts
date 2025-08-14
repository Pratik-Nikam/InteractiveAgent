import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/lib/rag-service';

// Initialize Max's RAG service as a singleton
let maxRAGService: RAGService | null = null;

async function getMaxRAGService() {
  if (!maxRAGService) {
    maxRAGService = new RAGService();
    await maxRAGService.initializeKnowledgeBase();
  }
  return maxRAGService;
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();
    
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' }, 
        { status: 400 }
      );
    }

    const ragService = await getMaxRAGService();
    const result = await ragService.query(question);
    
    return NextResponse.json({ 
      answer: result.answer,
      source: result.source,
      confidence: result.confidence,
      question,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { error: 'Failed to process query', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}