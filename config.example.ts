// Pain Locator Configuration Example
// Copy this file to config.ts and fill in your API keys

export const config = {
  // Optional: Grok API for enhanced AI summaries
  // Get your API key from https://x.ai/api
  grokApiKey: process.env.GROK_API_KEY || '',
  
  // Optional: OpenAI API as alternative for AI summaries
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Optional: Hugging Face API for alternative LLM models
  huggingfaceToken: process.env.HUGGINGFACE_TOKEN || '',
  
  // Application Configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Pain Locator',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.1.0',
  
  // Feature Flags
  enableAISummaries: process.env.NEXT_PUBLIC_ENABLE_AI_SUMMARIES === 'true',
  enableVoiceInput: process.env.NEXT_PUBLIC_ENABLE_VOICE_INPUT === 'true',
  enableMultilanguage: process.env.NEXT_PUBLIC_ENABLE_MULTILANGUAGE === 'true',
  
  // API Endpoints
  apiEndpoints: {
    summary: '/api/summary',
    anatomy: '/api/anatomy',
  },
  
  // 3D Model Configuration
  modelConfig: {
    maxPainPoints: 10,
    defaultMarkerRadius: 0.1,
    markerColors: {
      mild: '#4ade80',      // Green
      moderate: '#fbbf24',  // Yellow
      severe: '#f97316',    // Orange
      verySevere: '#ef4444' // Red
    }
  }
};
