import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const openaiService = {
  // Chat completion
  async chat(messages: ChatMessage[], model: string = 'gpt-4.1-mini'): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
      });
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw error;
    }
  },

  // Text summarization
  async summarize(text: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes text concisely.',
      },
      {
        role: 'user',
        content: `Please summarize the following text:\n\n${text}`,
      },
    ];
    
    return this.chat(messages);
  },

  // Text translation
  async translate(text: string, targetLanguage: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a professional translator. Translate text to ${targetLanguage}.`,
      },
      {
        role: 'user',
        content: text,
      },
    ];
    
    return this.chat(messages);
  },

  // Text analysis
  async analyze(text: string, analysisType: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert analyst. Perform ${analysisType} analysis on the provided text.`,
      },
      {
        role: 'user',
        content: text,
      },
    ];
    
    return this.chat(messages);
  },

  // Code generation
  async generateCode(prompt: string, language: string = 'javascript'): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert ${language} programmer. Generate clean, well-documented code.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];
    
    return this.chat(messages);
  },

  // Text generation
  async generate(prompt: string, systemPrompt?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    messages.push({
      role: 'user',
      content: prompt,
    });
    
    return this.chat(messages);
  },
};

