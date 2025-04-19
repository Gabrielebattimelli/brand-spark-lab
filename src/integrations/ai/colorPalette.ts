import { GoogleGenerativeAI } from "@google/generative-ai";

// Interface for color palette generation parameters
export interface ColorPaletteGenerationParams {
  brandName: string;
  industry: string;
  brandPersonality: string;
  aestheticPreferences: string[];
  colorPreferences?: string[];
}

// Interface for a color in the palette
export interface Color {
  name: string;
  hex: string;
  rgb: string;
}

// Interface for a generated color palette
export interface GeneratedColorPalette {
  id: string;
  colors: Color[];
  selected: boolean;
}

/**
 * Generates color palettes using Google's Generative AI
 * 
 * This function uses Gemini to generate color palettes based on brand parameters
 */
export const generateColorPalettes = async (
  apiKey: string,
  params: ColorPaletteGenerationParams,
  count: number = 3,
  maxRetries: number = 3,
  initialDelay: number = 2000
): Promise<GeneratedColorPalette[]> => {
  try {
    console.log("Generating color palettes with Gemini...");
    
    // Validate API key
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("Gemini API key is required");
    }

    // Initialize the Gemini API with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Validate input parameters
    if (!params.brandName?.trim()) {
      throw new Error("Brand name is required");
    }

    if (!params.industry?.trim()) {
      throw new Error("Industry is required");
    }

    // Ensure aestheticPreferences is an array
    if (!Array.isArray(params.aestheticPreferences)) {
      params.aestheticPreferences = [];
    }

    // Ensure colorPreferences is an array if provided
    if (params.colorPreferences && !Array.isArray(params.colorPreferences)) {
      params.colorPreferences = [];
    }

    // Construct a prompt for the color palette generation with enhanced guidelines
    const prompt = `
      Create ${count} distinct and personalized color palettes for a brand with the following details:
      
      Brand Name: ${params.brandName}
      Industry: ${params.industry}
      Brand Personality: ${params.brandPersonality || "professional and modern"}
      Visual Style: ${params.aestheticPreferences[0] || "clean and modern"}
      Additional Aesthetic Preferences: ${params.aestheticPreferences.slice(1).join(", ") || "none"}
      Color Preferences: ${params.colorPreferences?.join(", ") || "any suitable colors"}
      
      For each palette, provide 5 colors that work together as a cohesive system:
      
      1. Primary - The main brand color that:
         - Aligns with the visual style and brand personality
         - Is distinctive and memorable within the industry context
         - Works well in both light and dark contexts
         - Has strong psychological associations with the brand values
         - Can be used for logos, headers, and primary UI elements
      
      2. Secondary - A complementary color that:
         - Creates visual harmony with the primary color
         - Supports the brand's aesthetic preferences
         - Can be used for secondary elements, backgrounds, and supporting UI
         - Provides sufficient contrast with the primary color
         - Reinforces the brand personality in a different way than the primary
      
      3. Accent - A color for highlights that:
         - Creates visual interest and draws attention
         - Works well for calls-to-action, buttons, and important highlights
         - Complements both primary and secondary colors
         - Has high visual impact but is used sparingly
         - Creates effective visual hierarchy when combined with other colors
      
      4. Light - A background color that:
         - Provides good contrast with text (minimum 4.5:1 ratio for AA compliance)
         - Is easy on the eyes for extended viewing
         - Works well with the other colors in the palette
         - Can be used for backgrounds, cards, and content areas
         - Feels clean and unobtrusive
      
      5. Dark - A text color that:
         - Ensures readability on light backgrounds (minimum 4.5:1 ratio)
         - Creates sufficient contrast with light backgrounds
         - Maintains brand consistency
         - Can be used for body text, headings, and UI elements
         - Feels appropriate to the brand's tone and personality
      
      Important guidelines:
      - Ensure all colors are web-safe and accessible
      - Maintain WCAG 2.1 AA contrast standards (minimum 4.5:1 for normal text)
      - Colors should reflect the brand's personality and industry context
      - Consider the psychological impact of colors based on the brand's context
      - Include both warm and cool tones for balance when appropriate
      - If specific color preferences are provided, incorporate them meaningfully
      - Ensure colors work well together in various combinations and contexts
      - Consider how colors will appear in different applications (digital, print)
      - Avoid colors that have strong negative associations in the brand's industry
      - Create palettes with distinct personalities that align with the brand
      - Ensure sufficient contrast between colors used adjacent to each other
      - Consider color blindness and accessibility for all users
      
      Format your response as a JSON array with the following structure:
      [
        {
          "id": "palette-1",
          "colors": [
            {"name": "Primary", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Secondary", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Accent", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Light", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Dark", "hex": "#HEXCODE", "rgb": "R, G, B"}
          ]
        },
        ...
      ]
      
      Only respond with the JSON array, no additional text.
    `;

    let response;
    let retryCount = 0;
    let delay = initialDelay;

    while (retryCount < maxRetries) {
      try {
        const result = await model.generateContent(prompt);
        response = result.response.text();
        break;
      } catch (error) {
        if (error instanceof Error && error.message.includes('429')) {
          console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
          retryCount++;
          continue;
        }
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate color palettes. Please check your API key and try again.");
      }
    }

    if (!response) {
      throw new Error("No response received from Gemini API after retries");
    }

    // Parse and validate the response
    let palettes: GeneratedColorPalette[];
    try {
      palettes = JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse response:", response);
      throw new Error("Failed to parse color palette response. The AI might have returned an invalid format.");
    }

    // Validate the structure of each palette
    if (!Array.isArray(palettes)) {
      throw new Error("Invalid response format: expected an array of palettes");
    }

    palettes.forEach((palette, index) => {
      if (!palette.id || !palette.colors || !Array.isArray(palette.colors)) {
        throw new Error(`Invalid palette structure at index ${index}. Missing required fields: id, colors`);
      }

      // Validate each color in the palette
      palette.colors.forEach((color, colorIndex) => {
        if (!color.name || !color.hex || !color.rgb) {
          throw new Error(`Invalid color structure in palette ${index}, color ${colorIndex}. Missing required fields: name, hex, rgb`);
        }

        // Validate hex color format
        if (!/^#[0-9A-Fa-f]{6}$/i.test(color.hex)) {
          throw new Error(`Invalid hex color format in palette ${index}, color ${colorIndex}: ${color.hex}`);
        }

        // Validate RGB format - make it more flexible
        const rgbMatch = color.rgb.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
        if (!rgbMatch) {
          throw new Error(`Invalid RGB format in palette ${index}, color ${colorIndex}: ${color.rgb}`);
        }

        // Validate RGB values are within range
        const [r, g, b] = rgbMatch.slice(1).map(Number);
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
          throw new Error(`RGB values out of range in palette ${index}, color ${colorIndex}: ${color.rgb}`);
        }
      });
    });

    // Add selected property if not present
    palettes = palettes.map((palette, index) => ({
      ...palette,
      selected: palette.selected ?? (index === 0)
    }));

    return palettes;
  } catch (error) {
    console.error("Error generating color palettes:", error);
    throw error;
  }
};

/**
 * Generates default color palettes as a fallback
 */
export const generateDefaultPalettes = (
  count: number,
  params: ColorPaletteGenerationParams
): GeneratedColorPalette[] => {
  // Default color schemes
  const defaultSchemes = [
    // Modern & Professional
    [
      { name: "Primary", hex: "#3498db", rgb: "52, 152, 219" },
      { name: "Secondary", hex: "#2c3e50", rgb: "44, 62, 80" },
      { name: "Accent", hex: "#e74c3c", rgb: "231, 76, 60" },
      { name: "Light", hex: "#ecf0f1", rgb: "236, 240, 241" },
      { name: "Dark", hex: "#2c3e50", rgb: "44, 62, 80" }
    ],
    // Vibrant & Creative
    [
      { name: "Primary", hex: "#9b59b6", rgb: "155, 89, 182" },
      { name: "Secondary", hex: "#3498db", rgb: "52, 152, 219" },
      { name: "Accent", hex: "#f1c40f", rgb: "241, 196, 15" },
      { name: "Light", hex: "#f5f5f5", rgb: "245, 245, 245" },
      { name: "Dark", hex: "#34495e", rgb: "52, 73, 94" }
    ],
    // Earthy & Natural
    [
      { name: "Primary", hex: "#27ae60", rgb: "39, 174, 96" },
      { name: "Secondary", hex: "#f39c12", rgb: "243, 156, 18" },
      { name: "Accent", hex: "#d35400", rgb: "211, 84, 0" },
      { name: "Light", hex: "#f8f9fa", rgb: "248, 249, 250" },
      { name: "Dark", hex: "#2d3436", rgb: "45, 52, 54" }
    ],
    // Elegant & Luxury
    [
      { name: "Primary", hex: "#2c3e50", rgb: "44, 62, 80" },
      { name: "Secondary", hex: "#7f8c8d", rgb: "127, 140, 141" },
      { name: "Accent", hex: "#f1c40f", rgb: "241, 196, 15" },
      { name: "Light", hex: "#ecf0f1", rgb: "236, 240, 241" },
      { name: "Dark", hex: "#2c3e50", rgb: "44, 62, 80" }
    ],
    // Bold & Energetic
    [
      { name: "Primary", hex: "#e74c3c", rgb: "231, 76, 60" },
      { name: "Secondary", hex: "#3498db", rgb: "52, 152, 219" },
      { name: "Accent", hex: "#f39c12", rgb: "243, 156, 18" },
      { name: "Light", hex: "#ecf0f1", rgb: "236, 240, 241" },
      { name: "Dark", hex: "#2c3e50", rgb: "44, 62, 80" }
    ]
  ];
  
  // Return a subset of the default schemes based on the requested count
  return Array.from({ length: Math.min(count, defaultSchemes.length) }, (_, i) => ({
    id: `palette-${i + 1}`,
    colors: defaultSchemes[i],
    selected: i === 0 // Select the first palette by default
  }));
};

/**
 * Regenerates color palettes with adjusted parameters based on feedback
 */
export const regenerateColorPalettes = async (
  apiKey: string,
  params: ColorPaletteGenerationParams,
  feedback: string,
  count: number = 3
): Promise<GeneratedColorPalette[]> => {
  try {
    // Validate API key
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("Gemini API key is required");
    }

    // Initialize the Gemini API with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Adjust the parameters based on feedback
    const adjustedParams = { ...params };
    
    // Enhanced feedback handling
    if (feedback.toLowerCase().includes("brighter") || feedback.toLowerCase().includes("vibrant")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "bright", "vibrant", "colorful", "energetic"];
    } else if (feedback.toLowerCase().includes("darker") || feedback.toLowerCase().includes("muted")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "dark", "muted", "subdued", "sophisticated"];
    } else if (feedback.toLowerCase().includes("professional")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "professional", "corporate", "clean", "sleek"];
    } else if (feedback.toLowerCase().includes("creative")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "creative", "artistic", "expressive", "innovative"];
    } else if (feedback.toLowerCase().includes("warm")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "warm", "inviting", "friendly"];
    } else if (feedback.toLowerCase().includes("cool")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "cool", "calm", "serene"];
    }

    // Construct a prompt for the color palette regeneration with enhanced guidelines
    const prompt = `
      Regenerate ${count} distinct and personalized color palettes for a brand with the following details:
      
      Brand Name: ${adjustedParams.brandName}
      Industry: ${adjustedParams.industry}
      Brand Personality: ${adjustedParams.brandPersonality || "professional and modern"}
      Visual Style: ${adjustedParams.aestheticPreferences[0] || "clean and modern"}
      Additional Aesthetic Preferences: ${adjustedParams.aestheticPreferences.slice(1).join(", ") || "none"}
      Color Preferences: ${adjustedParams.colorPreferences?.join(", ") || "any suitable colors"}
      
      User Feedback: ${feedback}
      
      Based on the user feedback, create new color palettes that specifically address their comments while maintaining brand coherence.
      
      For each palette, provide 5 colors that work together as a cohesive system:
      
      1. Primary - The main brand color that:
         - Aligns with the visual style and brand personality
         - Is distinctive and memorable within the industry context
         - Works well in both light and dark contexts
         - Has strong psychological associations with the brand values
         - Can be used for logos, headers, and primary UI elements
         - Directly responds to the user's feedback
      
      2. Secondary - A complementary color that:
         - Creates visual harmony with the primary color
         - Supports the brand's aesthetic preferences
         - Can be used for secondary elements, backgrounds, and supporting UI
         - Provides sufficient contrast with the primary color
         - Reinforces the brand personality in a different way than the primary
      
      3. Accent - A color for highlights that:
         - Creates visual interest and draws attention
         - Works well for calls-to-action, buttons, and important highlights
         - Complements both primary and secondary colors
         - Has high visual impact but is used sparingly
         - Creates effective visual hierarchy when combined with other colors
      
      4. Light - A background color that:
         - Provides good contrast with text (minimum 4.5:1 ratio for AA compliance)
         - Is easy on the eyes for extended viewing
         - Works well with the other colors in the palette
         - Can be used for backgrounds, cards, and content areas
         - Feels clean and unobtrusive
      
      5. Dark - A text color that:
         - Ensures readability on light backgrounds (minimum 4.5:1 ratio)
         - Creates sufficient contrast with light backgrounds
         - Maintains brand consistency
         - Can be used for body text, headings, and UI elements
         - Feels appropriate to the brand's tone and personality
      
      Important guidelines:
      - Ensure all colors are web-safe and accessible
      - Maintain WCAG 2.1 AA contrast standards
      - Colors should reflect the brand's personality and industry
      - Consider the psychological impact of colors based on the brand's context
      - Include both warm and cool tones for balance
      - If specific color preferences are provided, incorporate them meaningfully
      - Ensure colors work well together in various combinations
      - Take into account the user's feedback when generating the new palettes
      
      Format your response as a JSON array with the following structure:
      [
        {
          "id": "palette-1",
          "colors": [
            {"name": "Primary", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Secondary", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Accent", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Light", "hex": "#HEXCODE", "rgb": "R, G, B"},
            {"name": "Dark", "hex": "#HEXCODE", "rgb": "R, G, B"}
          ]
        },
        ...
      ]
      
      Only respond with the JSON array, no additional text.
    `;

    let response;
    try {
      const result = await model.generateContent(prompt);
      response = result.response.text();
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error("Failed to regenerate color palettes. Please check your API key and try again.");
    }

    // Parse and validate the response
    let palettes: GeneratedColorPalette[];
    try {
      palettes = JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse response:", response);
      throw new Error("Failed to parse color palette response. The AI might have returned an invalid format.");
    }

    // Validate the structure of each palette
    if (!Array.isArray(palettes)) {
      throw new Error("Invalid response format: expected an array of palettes");
    }

    palettes.forEach((palette, index) => {
      if (!palette.id || !palette.colors || !Array.isArray(palette.colors)) {
        throw new Error(`Invalid palette structure at index ${index}. Missing required fields: id, colors`);
      }

      // Validate each color in the palette
      palette.colors.forEach((color, colorIndex) => {
        if (!color.name || !color.hex || !color.rgb) {
          throw new Error(`Invalid color structure in palette ${index}, color ${colorIndex}. Missing required fields: name, hex, rgb`);
        }

        // Validate hex color format
        if (!/^#[0-9A-Fa-f]{6}$/i.test(color.hex)) {
          throw new Error(`Invalid hex color format in palette ${index}, color ${colorIndex}: ${color.hex}`);
        }

        // Validate RGB format - make it more flexible
        const rgbMatch = color.rgb.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
        if (!rgbMatch) {
          throw new Error(`Invalid RGB format in palette ${index}, color ${colorIndex}: ${color.rgb}`);
        }

        // Validate RGB values are within range
        const [r, g, b] = rgbMatch.slice(1).map(Number);
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
          throw new Error(`RGB values out of range in palette ${index}, color ${colorIndex}: ${color.rgb}`);
        }
      });
    });

    // Add selected property if not present
    palettes = palettes.map((palette, index) => ({
      ...palette,
      selected: palette.selected ?? (index === 0)
    }));

    return palettes;
  } catch (error) {
    console.error("Error regenerating color palettes:", error);
    throw error;
  }
};