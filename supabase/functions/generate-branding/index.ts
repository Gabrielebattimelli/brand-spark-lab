import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const DEEPSEEK_ENDPOINT = "https://model-6wgx0p63.api.baseten.co/environments/production/predict";

const generateWithDeepseek = async (prompt: string, apiKey: string) => {
  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: { 
      'Authorization': `Api-Key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stream: true,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.6
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.output;
};

serve(async (req) => {
  try {
    const { type, data, apiKey } = await req.json();
    
    // Use your prompts but with Deepseek
    const content = await generateWithDeepseek(generatePromptForType(type, data), apiKey);

    return new Response(
      JSON.stringify({ content }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

function generatePromptForType(type: string, data: any): string {
  switch (type) {
    case 'mission':
      return generateMissionPrompt(data.name, data.industry, data.productService);
    case 'vision':
      return generateVisionPrompt(data.name, data.industry, data.productService);
    case 'values':
      return generateValuesPrompt(data.name, data.industry, data.productService);
    case 'originStory':
      return generateOriginStoryPrompt(data.name, data.industry, data.productService);
    default:
      return "Tell me about this brand.";
  }
}

function generateMissionPrompt(name: string, industry: string, productService: string): string {
  return `
  You are a branding expert. Generate a concise and inspiring mission statement for ${name}, 
  a company in the ${industry} industry that ${productService}. 
  The mission statement should be one sentence and capture the company's purpose.
  `;
}

function generateVisionPrompt(name: string, industry: string, productService: string): string {
  return `
  You are a branding expert. Craft a compelling and forward-looking vision statement for ${name}, 
  an organization in the ${industry} sector that ${productService}. 
  The vision statement should be one sentence, describing the company's desired future state.
  `;
}

function generateValuesPrompt(name: string, industry: string, productService: string): string {
  return `
  You are a branding expert. Define three core values for ${name}, 
  a business in the ${industry} industry that ${productService}. 
  Each value should be one word, followed by a brief explanation of its importance to the company.
  `;
}

function generateOriginStoryPrompt(name: string, industry: string, productService: string): string {
  return `
  You are a branding expert. Write a brief and engaging origin story for ${name}, 
  a company operating in the ${industry} industry that ${productService}. 
  The origin story should be no more than three sentences, highlighting the company's founding and initial purpose.
  `;
}
