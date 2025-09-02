import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  messages?: ChatMessage[];
  context?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, messages = [], context }: ChatRequest = await req.json();

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // System prompt for Maliph chatbot
    const systemPrompt = `You are Maliph, an intelligent AI assistant for CampoCode Forge, an online coding education platform. You help students with:

1. **Coding Questions**: Debug code, explain programming concepts, provide solutions
2. **Learning Assistance**: Help with course content, exercises, and coding challenges
3. **Platform Support**: Guide users through features and functionality
4. **Code Review**: Analyze code for best practices and improvements

**Personality**: Friendly, encouraging, and educational. Always provide clear explanations and practical examples.

**Capabilities**:
- Debug and fix code in multiple programming languages
- Explain complex programming concepts in simple terms
- Provide step-by-step solutions to coding problems
- Suggest best practices and coding standards
- Help with platform navigation and features

${context ? `**Current Context**: ${context}` : ''}

Be concise but thorough. Always encourage learning and provide educational value.`;

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI with messages:', chatMessages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('OpenAI response received, length:', assistantMessage.length);

    return new Response(JSON.stringify({
      success: true,
      message: assistantMessage,
      usage: data.usage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});