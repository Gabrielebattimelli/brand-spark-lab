// src/integrations/ai/moodboard.ts

export interface MoodboardGenerationParams {
  brandName?: string;
  industry?: string;
  visualStyle: string;
  colorPreferences: string[];
  inspirationKeywords: string[];
}

export interface GeneratedMoodboard {
  images: string[];
  prompts: string[];
  timestamp: number;
}

export interface GeneratedMoodboard {
  images: string[];
  prompts: string[];
  timestamp: number;
}

// Function to call the Gemini API
async function callLLM(apiKey: string, prompt: string): Promise<any> {
  try {
    console.log(`Calling Gemini API with prompt: ${prompt}`);
    
    // Use the Google Generative AI API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the text from the response
    const text = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!text) {
      throw new Error("No text returned from Gemini API");
    }
    
    // Parse the text to extract the prompts
    // Assuming the model returns a list of prompts, one per line
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // Take up to 4 prompts
    const prompts = lines.slice(0, 4);
    
    // If we don't have enough prompts, add some defaults
    while (prompts.length < 4) {
      prompts.push(`A visually appealing image for the brand (${prompts.length + 1})`);
    }
    
    console.log("Extracted prompts from Gemini:", prompts);
    return prompts;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Return default prompts in case of an error
    return [
      "A visually appealing image representing the brand's style",
      "Another image showcasing a key aspect of the brand's identity",
      "A third image that captures the brand's overall aesthetic",
      "A fourth image related to the brand's visual direction",
    ];
  }
}

export async function generateMoodboardPrompts(
  apiKey: string,
  params: MoodboardGenerationParams
): Promise<string[]> {
  const { brandName, industry, visualStyle, colorPreferences, inspirationKeywords } = params;

  const prompt = `Generate four short, keyword-rich prompts for image search, 
  capturing the essence of a brand with the following characteristics:
  
  Brand Name: ${brandName || "Brand"}
  Industry: ${industry || "General"}
  Visual Style: ${visualStyle || "modern"}
  Color Preferences: ${(colorPreferences ?? []).join(", ") || "Not specified"}
  Inspiration Keywords: ${(inspirationKeywords ?? []).join(", ") || "Not specified"}
  
  Each:
  1. Be 3-5 words maximum
  2. Focus on visual elements, not concepts
  3. Include specific colors, textures, or objects
  4. Be suitable for searching stock photography
  5. Each promptshould:
  1. Be 3-5 words maximum
  2. Focus on visual elements, not concepts
  3. Include specific colors, textures, or objects
  4. Be suitable for searching stock photography
  5. Each prompt should focus on a different aspect of the brand's visual identity
  
  Format each prompt as a simple comma-separated list of keywords.
  Example: "blue ocean waves, serene"
  `;

  try {
    const prompts = await callLLM(apiKey, prompt);
    if (Array.isArray(prompts) && prompts.length === 4) {
      return prompts;
    } else {
      console.error("Unexpected result from LLM for prompts:", prompts);
      // Return default prompts in case of an error
      return [
        "A visually appealing image representing the brand's style",
        "Another image showcasing a key aspect of the brand's identity",
        "A third image that captures the brand's overall aesthetic",
        "A fourth image related to the brand's visual direction",
      ];
    }
  } catch (error) {
    console.error("Error generating moodboard prompts:", error);
    // Return default prompts in case of an error
    return [
      "A visually appealing image representing the brand's style",
      "Another image showcasing a key aspect of the brand's identity",
      "A third image that captures the brand's overall aesthetic",
      "A fourth image related to the brand's visual direction",
    ];
  }
}

// Function to call the Ideogram API to generate images
async function callIdeogramAPI(apiKey: string, prompt: string): Promise<string> {
  try {
    console.log(`Calling Ideogram API with prompt: ${prompt}`);
    
    // Check if this is a real Ideogram API key
    if (!apiKey || !apiKey.startsWith('ideogram_')) {
      throw new Error('Invalid Ideogram API key');
    }
    
    // Call the Ideogram API
    const response = await fetch("https://api.ideogram.ai/api/v1/images", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        num_images: 1,
        style: "general", // Use a general style for mood boards
        aspect_ratio: "1:1", // Square aspect ratio
      }),
    });

    if (!response.ok) {
      throw new Error(`Ideogram API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the image URL from the response
    if (data.images && data.images.length > 0) {
      return data.images[0].url;
    } else {
      throw new Error('No images returned from Ideogram API');
    }
  } catch (error) {
    console.error("Error calling Ideogram API:", error);
    throw error;
  }
}

// Function to call the Clipdrop API to generate images
async function callClipdropAPI(apiKey: string, prompt: string): Promise<string> {
  try {
    console.log(`Calling Clipdrop API with prompt: ${prompt}`);
    
    // Call the Clipdrop API
    const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Clipdrop API error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch (e) {
        // If we can't parse the error JSON, just use the status text
      }
      throw new Error(errorMessage);
    }

    // Get the binary image data and convert to base64
    const imageBlob = await response.blob();
    const imageBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageBlob);
    });

    return imageBase64;
  } catch (error) {
    console.error("Error calling Clipdrop API:", error);
    throw error;
  }
}

export async function generateImages(apiKey: string, prompts: string[]): Promise<string[]> {
  try {
    if (!Array.isArray(prompts)) {
      console.error("Prompts is not an array:", prompts);
      throw new TypeError("prompts.map is not a function");
    }
    
    // Determine which API to use based on the API key
    const isIdeogram = apiKey.startsWith('ideogram_');
    
    // Generate images using the appropriate API
    const imageResults = await Promise.all(
      prompts.map(async (prompt, index) => {
        try {
          if (isIdeogram) {
            // Use Ideogram API
            return await callIdeogramAPI(apiKey, prompt);
          } else {
            // Use Clipdrop API
            return await callClipdropAPI(apiKey, prompt);
          }
        } catch (err) {
          console.error(`Error generating image for prompt ${index}:`, err);
          
          // Fall back to Unsplash if the API call fails
          try {
            // Extract keywords from the prompt
            const keywords = prompt
              .split(' ')
              .filter(word => word.length > 3)  // Only use words longer than 3 characters
              .slice(0, 3)                      // Take up to 3 keywords
              .join(',');
            
            // Use Unsplash Source API as a fallback
            const imageUrl = `https://source.unsplash.com/600x600/?${encodeURIComponent(keywords)}`;
            
            // Add a random parameter to prevent caching
            const cacheBuster = Date.now() + Math.random();
            const finalUrl = `${imageUrl}&cb=${cacheBuster}`;
            
            console.log(`Falling back to Unsplash for prompt "${prompt}": ${finalUrl}`);
            return finalUrl;
          } catch (fallbackErr) {
            console.error(`Fallback to Unsplash also failed for prompt ${index}:`, fallbackErr);
            return `https://placehold.co/600x600/e2e8f0/64748b?text=Error+generating+image+${index + 1}`;
          }
        }
      })
    );
    
    console.log("Generated image URLs:", imageResults);
    return imageResults;
    
  } catch (error) {
    console.error("Error generating images:", error);
    // Return placeholder image URLs or data in case of an error
    return [
      "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+1",
      "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+2",
      "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+3",
      "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+4",
    ];
  }
}

// Function to generate a complete moodboard
export async function generateMoodboard(
  promptApiKey: string,
  params: MoodboardGenerationParams,
  imageApiKey?: string
): Promise<GeneratedMoodboard> {
  try {
    // Generate prompts for the moodboard using the Gemini API
    const prompts = await generateMoodboardPrompts(promptApiKey, params);
    
    // Generate images based on the prompts using the Ideogram or Clipdrop API
    // If imageApiKey is not provided, use the promptApiKey (though this is not recommended)
    const images = await generateImages(imageApiKey || promptApiKey, prompts);
    
    // Return the complete moodboard
    return {
      images,
      prompts,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Error generating moodboard:", error);
    // Return a default moodboard in case of an error
    return {
      images: [
        "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+1",
        "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+2",
        "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+3",
        "https://placehold.co/600x600/e2e8f0/64748b?text=Moodboard+Image+4",
      ],
      prompts: [
        "A visually appealing image representing the brand's style",
        "Another image showcasing a key aspect of the brand's identity",
        "A third image that captures the brand's overall aesthetic",
        "A fourth image related to the brand's visual direction",
      ],
      timestamp: Date.now()
    };
  }
}