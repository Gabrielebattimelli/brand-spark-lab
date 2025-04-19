// Ideogram 3 API integration for logo generation

// Interface for logo generation parameters
export interface LogoGenerationParams {
  brandName: string;
  industry: string;
  brandPersonality: string;
  aestheticPreferences: string[];
  colorPreferences: string[];
}

// Interface for generated logo
export interface GeneratedLogo {
  id: string;
  url: string;
  prompt: string;
  selected: boolean;
}

/**
 * Generates logo concepts using Ideogram 3 API
 * 
 * This function makes an actual API call to Ideogram to generate logo images
 * based on optimized prompts crafted from the brand parameters
 */
export const generateLogoConcepts = async (
  apiKey: string,
  params: LogoGenerationParams,
  count: number = 6
): Promise<GeneratedLogo[]> => {
  try {
    console.log("Generating logo concepts with Ideogram 3...");
    console.log("API Key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4));
    console.log("Parameters:", params);
    console.log("Count:", count);

    // Craft an optimized prompt for logo generation
    const prompts = generateOptimizedPrompts(params, count);
    const logos: GeneratedLogo[] = [];

    // Make API calls to Ideogram for each prompt
    for (let i = 0; i < prompts.length; i++) {
      try {
        const prompt = prompts[i];
        console.log(`Generating logo ${i + 1} with prompt: ${prompt}`);

        // Make the API call to Ideogram
        const response = await fetch('https://api.ideogram.ai/api/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            style: "logo", // Use Ideogram's logo style
            aspect_ratio: "1:1", // Square aspect ratio for logos
            model: "ideogram-3", // Use the latest model
          }),
        });

        if (!response.ok) {
          throw new Error(`Ideogram API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract the image URL from the response
        if (data.images && data.images.length > 0) {
          logos.push({
            id: `logo-${i + 1}`,
            url: data.images[0].url,
            prompt: prompt,
            selected: i === 0 // Select the first logo by default
          });
        }
      } catch (err) {
        console.error(`Error generating logo ${i + 1}:`, err);
        // If API call fails, add a placeholder
        logos.push({
          id: `logo-${i + 1}`,
          url: `https://placehold.co/600x400/f38e63/ffffff?text=${params.brandName}+Logo+${i + 1}`,
          prompt: prompts[i],
          selected: i === 0 && logos.length === 0 // Select this only if it's the first and no other logos exist
        });
      }
    }

    // If all API calls failed, ensure we have at least some logos
    if (logos.length === 0) {
      return generatePlaceholderLogos(params, count);
    }

    return logos;
  } catch (error) {
    console.error("Error generating logo concepts:", error);
    // Return placeholder logos in case of error
    return generatePlaceholderLogos(params, count);
  }
};

/**
 * Generates optimized prompts for logo generation
 */
const generateOptimizedPrompts = (params: LogoGenerationParams, count: number): string[] => {
  const prompts: string[] = [];

  // Base descriptors for different logo styles
  const styleDescriptors = [
    "minimalist and clean",
    "bold and modern",
    "elegant and sophisticated",
    "playful and creative",
    "geometric and abstract",
    "vintage and classic"
  ];

  // Logo type variations
  const logoTypes = [
    "wordmark logo",
    "lettermark logo",
    "abstract symbol logo",
    "mascot logo",
    "emblem logo",
    "combination mark logo"
  ];

  // Color descriptions
  const colorDescriptions = params.colorPreferences.length > 0 
    ? `using colors like ${params.colorPreferences.join(", ")}` 
    : "with a harmonious color palette";

  // Industry-specific elements
  const industryElements = getIndustrySpecificElements(params.industry);

  // Personality traits
  const personalityTraits = getPersonalityTraits(params.brandPersonality);

  // Generate unique prompts for each logo
  for (let i = 0; i < count; i++) {
    const styleIndex = i % styleDescriptors.length;
    const logoTypeIndex = i % logoTypes.length;

    // Combine elements to create a rich, detailed prompt
    let prompt = `Professional ${styleDescriptors[styleIndex]} ${logoTypes[logoTypeIndex]} for "${params.brandName}", `;
    prompt += `a ${params.industry} brand with ${personalityTraits} personality. `;

    // Add industry-specific elements
    if (industryElements) {
      prompt += `${industryElements} `;
    }

    // Add aesthetic preferences
    if (params.aestheticPreferences.length > 0) {
      prompt += `Style: ${params.aestheticPreferences.join(", ")}. `;
    }

    // Add color information
    prompt += `${colorDescriptions}. `;

    // Add specific design instructions with enhanced details
    prompt += "The logo should be simple, memorable, and scalable. ";
    prompt += "Create a high-quality vector style logo with clean lines and professional appearance. ";
    prompt += "Design should work well at both small and large sizes. ";
    prompt += "Ensure the logo has strong visual impact and good figure-ground relationship. ";
    prompt += "Use balanced composition with proper visual weight. ";
    prompt += "Clean white background, no textures or gradients that would complicate reproduction. ";
    prompt += "No text except the brand name, no taglines. ";
    prompt += "Avoid generic stock imagery or clichéd symbols for the industry. ";
    prompt += "The logo should be unique and instantly recognizable. ";
    prompt += "Suitable for business cards, websites, social media, and physical signage.";

    prompts.push(prompt);
  }

  return prompts;
};

/**
 * Gets industry-specific elements for the prompt
 */
const getIndustrySpecificElements = (industry: string): string => {
  const industryMap: {[key: string]: string} = {
    "technology": "Incorporate subtle tech elements like circuits, pixels, or digital motifs.",
    "food": "Suggest culinary elements or ingredients that evoke taste and freshness.",
    "health": "Include elements that convey wellness, care, and vitality.",
    "finance": "Incorporate elements that suggest stability, growth, and security.",
    "education": "Include symbols of knowledge, growth, and learning.",
    "fashion": "Design with elegance, style, and contemporary aesthetic.",
    "entertainment": "Incorporate dynamic, expressive, and engaging elements.",
    "real estate": "Suggest stability, home, and property with architectural elements.",
    "travel": "Include elements that evoke exploration, adventure, and destinations.",
    "fitness": "Incorporate elements of strength, movement, and energy."
  };

  // Find the matching industry or closest match
  for (const key in industryMap) {
    if (industry.toLowerCase().includes(key)) {
      return industryMap[key];
    }
  }

  return "Design with elements that represent quality and professionalism in the industry.";
};

/**
 * Gets personality traits for the prompt
 */
const getPersonalityTraits = (personality: string): string => {
  const personalityMap: {[key: string]: string} = {
    "innovative": "forward-thinking, cutting-edge, and innovative",
    "trustworthy": "reliable, trustworthy, and established",
    "friendly": "approachable, friendly, and welcoming",
    "luxury": "premium, luxurious, and high-end",
    "playful": "fun, playful, and energetic",
    "serious": "professional, serious, and authoritative",
    "creative": "creative, artistic, and imaginative",
    "traditional": "traditional, classic, and timeless"
  };

  // Find the matching personality or closest match
  for (const key in personalityMap) {
    if (personality.toLowerCase().includes(key)) {
      return personalityMap[key];
    }
  }

  return personality || "professional and distinctive";
};

/**
 * Generates placeholder logos in case the API calls fail
 */
const generatePlaceholderLogos = (params: LogoGenerationParams, count: number): GeneratedLogo[] => {
  // Construct a basic prompt for the logo generation
  const basePrompt = `Create a professional logo for ${params.brandName}, a ${params.industry} brand with a ${params.brandPersonality} personality.`;

  // Add aesthetic preferences to the prompt
  const aestheticPrompt = params.aestheticPreferences.length > 0 
    ? ` The style should be ${params.aestheticPreferences.join(", ")}.` 
    : "";

  // Add color preferences to the prompt
  const colorPrompt = params.colorPreferences.length > 0 
    ? ` Use colors like ${params.colorPreferences.join(", ")}.` 
    : "";

  // Combine all prompt parts
  const fullPrompt = basePrompt + aestheticPrompt + colorPrompt;

  // Generate placeholder logos
  return Array.from({ length: count }, (_, i) => ({
    id: `logo-${i + 1}`,
    url: `https://placehold.co/600x400/f38e63/ffffff?text=${params.brandName}+Logo+${i + 1}`,
    prompt: fullPrompt,
    selected: i === 0 // Select the first logo by default
  }));
};

/**
 * Regenerates logo concepts with adjusted parameters
 * 
 * This function would be used when the user wants to refine the logo generation
 * with feedback like "more minimalist" or "more colorful"
 */
export const regenerateLogoConcepts = async (
  apiKey: string,
  params: LogoGenerationParams,
  feedback: string,
  count: number = 6
): Promise<GeneratedLogo[]> => {
  try {
    // Adjust the parameters based on feedback
    const adjustedParams = { ...params };

    // Simple feedback handling
    if (feedback.includes("minimalist")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "minimalist", "clean", "simple"];
    } else if (feedback.includes("colorful")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "colorful", "vibrant"];
    } else if (feedback.includes("bold")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "bold", "strong", "impactful"];
    }

    // Generate new logos with adjusted parameters
    return generateLogoConcepts(apiKey, adjustedParams, count);
  } catch (error) {
    console.error("Error regenerating logo concepts:", error);
    throw error;
  }
};

/**
 * Generates variations of a selected logo
 */
export const generateLogoVariations = async (
  apiKey: string,
  selectedLogo: GeneratedLogo,
  count: number = 3
): Promise<GeneratedLogo[]> => {
  try {
    console.log("Generating variations of selected logo...");
    console.log("Selected logo:", selectedLogo);

    // In a real implementation, you would make an API call to Ideogram 3 here
    // For now, we'll simulate the API call with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate placeholder logo variations
    const variations: GeneratedLogo[] = Array.from({ length: count }, (_, i) => ({
      id: `variation-${selectedLogo.id}-${i + 1}`,
      url: `https://placehold.co/600x400/f38e63/ffffff?text=Variation+${i + 1}`,
      prompt: `Variation of ${selectedLogo.prompt}`,
      selected: false
    }));

    return variations;
  } catch (error) {
    console.error("Error generating logo variations:", error);
    throw error;
  }
};
