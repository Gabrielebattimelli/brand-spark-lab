
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Define the model name to use for all Gemini API calls
const MODEL_NAME = "gemini-1.5-pro";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, apiKey } = await req.json();

    if (!apiKey) {
      throw new Error('API key is required');
    }

    const geminiApiKey = apiKey;

    // Initialize the Gemini API with the API key
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    let prompt = '';
    switch (type) {
      case 'mission':
        prompt = `Create 3 compelling mission statement options for a ${data.industry} business named "${data.name}" that ${data.productService}.

For each mission statement:
1. Provide the mission statement (concise and inspiring)
2. Include a brief explanation of why this mission statement works well for the business
3. Explain how it aligns with the industry and business description

Format each option as:
Statement: [Mission Statement]
Explanation: [Brief explanation]
`;
        break;
      case 'vision':
        prompt = `Create 3 forward-looking vision statement options for a ${data.industry} business named "${data.name}" that ${data.productService}.

For each vision statement:
1. Provide the vision statement (focusing on future impact and aspirations)
2. Include a brief explanation of why this vision statement works well for the business
3. Explain how it complements the business's mission and industry position

Format each option as:
Statement: [Vision Statement]
Explanation: [Brief explanation]
`;
        break;
      case 'values':
        prompt = `Suggest 5 core values for a ${data.industry} business named "${data.name}" that ${data.productService}.

For each value:
1. Provide the value name (e.g., "Integrity", "Innovation")
2. Include a brief explanation of why this value is important for the business
3. Explain how this value would be demonstrated in practice

Format each value as:
Value: [Value Name]
Explanation: [Brief explanation]
Application: [How it's demonstrated]
`;
        break;
      case 'originStory':
        prompt = `Create an engaging origin story for a ${data.industry} business named "${data.name}" that ${data.productService}.

The story should:
1. Be authentic, memorable, and connect emotionally with the audience
2. Include details about what inspired the creation of the brand
3. Describe the journey that led to its founding
4. Highlight key challenges overcome and lessons learned
5. Connect to the brand's current values and mission

Keep it concise but compelling, approximately 2-3 paragraphs.
`;
        break;
      case 'valueProposition':
        prompt = `Create 3 compelling value proposition options for a ${data.industry} business named "${data.name}" that ${data.productService}.

For each value proposition:
1. Provide the value proposition statement (clear, concise, and impactful)
2. Include a brief explanation of why this value proposition works well for the business
3. Explain how it addresses customer pain points and differentiates from competitors

Format each option as:
Statement: [Value Proposition]
Explanation: [Brief explanation]
`;
        break;
      case 'brandEssence':
        prompt = `Create 3 concise brand essence or core message summary options for a ${data.industry} business named "${data.name}" that ${data.productService}.

For each brand essence:
1. Provide the brand essence (1-2 sentences that capture the heart of the brand)
2. Include a brief explanation of why this essence works well for the business
3. Explain how it expresses the brand's purpose and promise

Format each option as:
Essence: [Brand Essence]
Explanation: [Brief explanation]
`;
        break;
      case 'brandVoice':
        prompt = `Create brand voice and tone guidelines for a ${data.industry} business named "${data.name}" that ${data.productService}.

Include:
1. 3-4 specific voice characteristics (e.g., "Friendly and approachable", "Authoritative but accessible")
2. For each characteristic, provide:
   - A brief explanation of what this means for the brand
   - Examples of how this would sound in practice
   - When to emphasize or de-emphasize this characteristic

3. Guidance on tone for different contexts (social media, website, customer service, etc.)
4. Examples of phrases that align with the brand voice
5. Examples of phrases to avoid

Format the voice characteristics as:
Characteristic: [Voice Characteristic]
Explanation: [Brief explanation]
Examples: [Practical examples]
`;
        break;
      default:
        throw new Error('Invalid generation type');
    }

    // Generate content using Gemini API
    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text();

    // Log for debugging
    console.log('Generated content:', type, generatedContent);

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
