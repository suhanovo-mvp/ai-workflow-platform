import { db } from './db/index.js';
import { aiServices } from './db/schema.js';

async function seed() {
  console.log('Seeding database with AI services...');

  const services = [
    {
      name: 'GPT-4 Chat',
      description: 'Conversational AI using GPT-4 model for natural language understanding and generation',
      category: 'NLP' as const,
      operationType: 'chat',
      inputFormats: ['text/plain', 'application/json'],
      outputFormats: ['text/plain'],
      parameters: {
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        max_tokens: 2000,
      },
      apiEndpoint: 'openai',
      apiKeyRequired: true,
      isActive: true,
    },
    {
      name: 'Text Summarization',
      description: 'Automatically summarize long texts into concise summaries',
      category: 'NLP' as const,
      operationType: 'summarization',
      inputFormats: ['text/plain', 'text/markdown'],
      outputFormats: ['text/plain'],
      parameters: {
        length: 'medium',
      },
      apiEndpoint: 'openai',
      apiKeyRequired: true,
      isActive: true,
    },
    {
      name: 'Language Translation',
      description: 'Translate text between multiple languages',
      category: 'NLP' as const,
      operationType: 'translation',
      inputFormats: ['text/plain'],
      outputFormats: ['text/plain'],
      parameters: {
        targetLanguage: 'English',
      },
      apiEndpoint: 'openai',
      apiKeyRequired: true,
      isActive: true,
    },
    {
      name: 'Text Analysis',
      description: 'Analyze text for sentiment, entities, topics, and other insights',
      category: 'analytics' as const,
      operationType: 'analysis',
      inputFormats: ['text/plain'],
      outputFormats: ['application/json', 'text/plain'],
      parameters: {
        analysisType: 'sentiment',
      },
      apiEndpoint: 'openai',
      apiKeyRequired: true,
      isActive: true,
    },
    {
      name: 'Code Generator',
      description: 'Generate code in various programming languages from natural language descriptions',
      category: 'generation' as const,
      operationType: 'code_generation',
      inputFormats: ['text/plain'],
      outputFormats: ['text/plain', 'application/javascript', 'application/python'],
      parameters: {
        language: 'javascript',
      },
      apiEndpoint: 'openai',
      apiKeyRequired: true,
      isActive: true,
    },
    {
      name: 'Text Generator',
      description: 'Generate creative and informative text content',
      category: 'generation' as const,
      operationType: 'text_generation',
      inputFormats: ['text/plain'],
      outputFormats: ['text/plain'],
      parameters: {
        creativity: 0.8,
      },
      apiEndpoint: 'openai',
      apiKeyRequired: true,
      isActive: true,
    },
  ];

  for (const service of services) {
    await db.insert(aiServices).values(service);
    console.log(`✓ Added: ${service.name}`);
  }

  console.log('\nSeeding completed!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

