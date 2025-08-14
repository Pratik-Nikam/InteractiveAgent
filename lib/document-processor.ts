import { Document } from 'langchain/document';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export class DocumentProcessor {
  private embeddings: OllamaEmbeddings;
  private vectorStore: MemoryVectorStore | null = null;

  constructor() {
    this.embeddings = new OllamaEmbeddings({
      model: 'tinyllama',
      baseUrl: 'http://localhost:11434',
    });
  }

  async processDocuments(files: File[]): Promise<void> {
    const documents: Document[] = [];

    for (const file of files) {
      try {
        let text = '';

        if (file.type === 'application/pdf') {
          // Handle PDF files
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Create a temporary file-like object
          const pdfBlob = new Blob([uint8Array], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          
          // Load PDF content
          const loader = new PDFLoader(pdfUrl);
          const pdfDocs = await loader.load();
          documents.push(...pdfDocs);
          
          URL.revokeObjectURL(pdfUrl);
        } else if (file.type === 'text/plain') {
          // Handle text files
          text = await file.text();
          documents.push(new Document({
            pageContent: text,
            metadata: { source: file.name, type: 'text' }
          }));
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(documents);

    // Create vector store
    this.vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      this.embeddings
    );

    console.log(`Processed ${splitDocs.length} document chunks`);
  }

  async query(question: string): Promise<string> {
    if (!this.vectorStore) {
      throw new Error('No documents have been processed yet');
    }

    // Search for relevant documents
    const docs = await this.vectorStore.similaritySearch(question, 3);
    
    // Create context
    const context = docs.map(doc => doc.pageContent).join('\n\n');
    
    return context;
  }

  getVectorStore(): MemoryVectorStore | null {
    return this.vectorStore;
  }
}