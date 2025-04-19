
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
        prompt = `Create 1 compelling mission statement for a ${data.industry} business named "${data.name}" that ${data.productService}.

A mission statement should:
- Be concise (1-2 sentences, maximum 25 words)
- Focus on the present, not the future
- Clearly articulate the company's purpose and core business
- Explain what the company does, who it serves, and how it delivers value
- Use active, powerful language
- Avoid jargon, buzzwords, and generic statements
- Be specific enough to differentiate from competitors
- Be memorable and inspiring
- Include the brand name "${data.name}" in the statement

For the mission statement:
1. Provide the mission statement (concise and inspiring)
2. Include a brief explanation of why this mission statement works well for the business
3. Explain how it aligns with the industry and business description
4. Highlight how it differentiates from typical mission statements in this industry

Format as:
Statement: [Mission Statement]
Explanation: [Brief explanation]
Industry Alignment: [How it aligns with the industry]
Differentiation: [How it stands out from competitors]
`;
        break;
      case 'vision':
        prompt = `Create 1 forward-looking vision statement for a ${data.industry} business named "${data.name}" that ${data.productService}.

A vision statement should:
- Be future-oriented and aspirational
- Be concise (1-2 sentences, maximum 30 words)
- Paint a clear picture of what the company aims to achieve or become
- Be ambitious but achievable in the long term (5-10 years)
- Inspire employees and stakeholders
- Align with the company's values and mission
- Be specific to the industry and business model
- Avoid generic statements that could apply to any company
- Include the brand name "${data.name}" in the statement

For the vision statement:
1. Provide the vision statement (focusing on future impact and aspirations)
2. Include a brief explanation of why this vision statement works well for the business
3. Explain how it complements the business's mission and industry position
4. Describe how this vision could guide strategic decision-making

Format as:
Statement: [Vision Statement]
Explanation: [Brief explanation]
Mission Alignment: [How it complements the mission]
Strategic Direction: [How it guides decision-making]
`;
        break;
      case 'values':
        prompt = `Suggest 5 core values for a ${data.industry} business named "${data.name}" that ${data.productService}.

When creating core values:
- Choose values that are authentic and actionable, not just aspirational
- Ensure each value is distinct and serves a specific purpose
- Select values that align with the industry but also differentiate the brand
- Consider how each value will guide employee behavior and decision-making
- Avoid generic values that every company claims (unless truly central to the brand)
- Focus on values that will resonate with both employees and customers
- Ensure values reflect the company's unique culture and approach

For each value:
1. Provide the value name (e.g., "Integrity", "Innovation") - keep it to 1-2 words
2. Include a brief explanation of why this value is important for the business
3. Explain how this value would be demonstrated in practice through specific behaviors
4. Provide a concrete example of how this value might influence a business decision

Format each value as:
Value: [Value Name]
Explanation: [Brief explanation - no asterisks or markdown formatting]
Application: [How it's demonstrated - no asterisks or markdown formatting]
Example: [Specific scenario showing the value in action - no asterisks or markdown formatting]

Important: Do not use any asterisks (*) or markdown formatting in your response. Use plain text only.
`;
        break;
      case 'originStory':
        prompt = `Create an engaging origin story for a ${data.industry} business named "${data.name}" that ${data.productService}.

An effective brand origin story should:
1. Be authentic, memorable, and connect emotionally with the audience
2. Include a clear "why" that explains the founder's motivation and purpose
3. Identify a specific problem or gap in the market that inspired the brand
4. Include a pivotal moment or realization that catalyzed action
5. Describe the journey that led to its founding with specific details
6. Highlight key challenges overcome and lessons learned that shaped the brand
7. Connect to the brand's current values and mission
8. Include sensory details and human elements that make it relatable
9. Avoid clichés and overly dramatic narratives that feel inauthentic
10. End with a forward-looking statement that connects past to future

Structure the story with:
- A compelling hook that draws readers in
- A clear problem or opportunity that was identified
- The founder's unique perspective or approach
- Key milestones in the brand's development
- How early challenges shaped the brand's values
- The transformation from idea to established business
- A conclusion that ties to the brand's ongoing mission

Keep it concise but compelling, approximately 2-3 paragraphs.

Important: Do not use any asterisks (*) or markdown formatting in your response. Use plain text only.
`;
        break;
      case 'valueProposition':
        prompt = `Create 1 compelling value proposition for a ${data.industry} business named "${data.name}" that ${data.productService}.

A strong value proposition should:
- Be clear, concise, and immediately understandable (1-2 sentences)
- Focus on specific customer benefits, not features
- Address a clear pain point or desire of the target audience
- Communicate what makes the brand unique and better than alternatives
- Be specific and quantifiable where possible
- Use customer-centric language rather than industry jargon
- Be believable and provable, not making exaggerated claims
- Balance emotional and rational benefits
- Include the brand name "${data.name}" in the statement

For the value proposition:
1. Provide the value proposition statement (clear, concise, and impactful)
2. Include a brief explanation of why this value proposition works well for the business
3. Explain how it addresses specific customer pain points
4. Describe how it differentiates from competitors in the same industry
5. Suggest how this value proposition could be validated or proven to customers

Format as:
Statement: [Value Proposition]
Explanation: [Brief explanation]
Pain Points Addressed: [Specific customer problems solved]
Differentiation: [How it stands out from competitors]
Proof Points: [How the business can demonstrate this value]

Important: Do not use any asterisks (*) or markdown formatting in your response. Use plain text only.
`;
        break;
      case 'brandEssence':
        prompt = `Create 1 concise brand essence or core message summary for a ${data.industry} business named "${data.name}" that ${data.productService}.

A brand essence should:
- Be extremely concise (2-5 words ideally, never more than a short phrase)
- Capture the fundamental "soul" or emotional core of the brand
- Be timeless and not tied to specific products or services
- Express the brand's ultimate purpose beyond profit
- Be distinctive and ownable in the competitive landscape
- Resonate emotionally with both internal and external audiences
- Serve as a filter for all brand decisions and communications
- Be authentic to the brand's values and culture

For the brand essence:
1. Provide the brand essence (2-5 words that capture the heart of the brand)
2. Include a brief explanation of why this essence works well for the business
3. Explain how it expresses the brand's purpose and promise
4. Describe how this essence differentiates from competitors
5. Explain how this essence can guide brand decisions and communications

Format as:
Essence: [Brand Essence]
Explanation: [Brief explanation]
Purpose Connection: [How it relates to brand purpose]
Differentiation: [How it stands apart from competitors]
Application: [How it guides brand decisions]

Important: Do not use any asterisks (*) or markdown formatting in your response. Use plain text only.
`;
        break;
      case 'brandVoice':
        prompt = `Create 1 primary brand voice characteristic for a ${data.industry} business named "${data.name}" that ${data.productService}.

A well-defined brand voice should:
- Reflect the brand's personality and values consistently
- Be distinctive and recognizable across all communications
- Resonate with the target audience's preferences and expectations
- Be adaptable to different contexts while maintaining consistency
- Support the brand positioning and differentiation strategy
- Be practical for content creators to implement consistently

For the primary voice characteristic (e.g., "Friendly and approachable", "Authoritative but accessible"), provide:
- A brief explanation of what this means for the brand
- Examples of how this would sound in practice (specific phrases and sentence structures)
- When to emphasize or de-emphasize this characteristic
- How this characteristic differentiates from competitors
- Guidance on tone variations for different contexts
- Specific writing guidelines that support this characteristic
- Examples of phrases that perfectly embody this voice characteristic
- Examples of phrases that violate this voice characteristic (and how to fix them)

Format the voice characteristic as:
Characteristic: [Voice Characteristic]
Explanation: [Brief explanation]
Examples: [Practical examples]
When to Use: [Appropriate contexts]
When to Moderate: [Contexts where this should be toned down]
Differentiation: [How this differs from competitor voices]

Important: Do not use any asterisks (*) or markdown formatting in your response. Use plain text only.
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
