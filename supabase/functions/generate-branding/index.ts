
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()
    const openAIKey = Deno.env.get('OPENAI_API_KEY')

    let prompt = ''
    switch (type) {
      case 'mission':
        prompt = `Create a compelling mission statement for a ${data.industry} business named "${data.name}" that ${data.productService}. Keep it concise and inspiring.`
        break
      case 'vision':
        prompt = `Create a forward-looking vision statement for a ${data.industry} business named "${data.name}" that ${data.productService}. Focus on the future impact and aspirations.`
        break
      case 'values':
        prompt = `Suggest 5 core values for a ${data.industry} business named "${data.name}" that ${data.productService}. For each value, provide a brief explanation of why it's important.`
        break
      default:
        throw new Error('Invalid generation type')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional branding consultant helping businesses develop their brand identity. Provide clear, professional, and inspiring responses.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    })

    const data_1 = await response.json()
    const generatedContent = data_1.choices[0].message.content

    // Log for debugging
    console.log('Generated content:', type, generatedContent)

    return new Response(
      JSON.stringify({ content: generatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
