
import { toast } from "sonner";

const DEEPSEEK_ENDPOINT = "https://model-6wgx0p63.api.baseten.co/environments/production/predict";
const FLUX_ENDPOINT = "https://model-5qe48n2w.api.baseten.co/environments/production/predict";

export const generateTextWithDeepseek = async (prompt: string, apiKey: string) => {
  try {
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
  } catch (error) {
    console.error('Error calling Deepseek API:', error);
    toast.error('Failed to generate text with Deepseek');
    throw error;
  }
};

export const generateImageWithFlux = async (prompt: string, apiKey: string) => {
  try {
    const response = await fetch(FLUX_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Authorization': `Api-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.image_url; // Adjust based on actual response format
  } catch (error) {
    console.error('Error calling Flux API:', error);
    toast.error('Failed to generate image with Flux');
    throw error;
  }
};
