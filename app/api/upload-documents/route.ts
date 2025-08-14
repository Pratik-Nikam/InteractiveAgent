import { NextRequest, NextResponse } from 'next/server';
import { DocumentProcessor } from '@/lib/document-processor';

// Global document processor instance
let documentProcessor: DocumentProcessor | null = null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' }, 
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['text/plain'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { error: `Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only text files are supported.` }, 
        { status: 400 }
      );
    }

    // Initialize document processor
    if (!documentProcessor) {
      documentProcessor = new DocumentProcessor();
    }

    // Process documents
    await documentProcessor.processDocuments(files);

    return NextResponse.json({ 
      message: `Successfully processed ${files.length} documents`,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process documents', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}