import { GoogleGenerativeAI } from "@google/generative-ai";

// Interface for color palette generation parameters
export interface ColorPaletteGenerationParams {
  brandName: string;
  industry: string;
  brandPersonality: string;
  aestheticPreferences: string[];
  colorPreferences: string[];
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
  count: number = 3
): Promise<GeneratedColorPalette[]> => {
  try {
    console.log("Generating color palettes with Gemini...");
    
    // Initialize the Gemini API with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Construct a prompt for the color palette generation
    const prompt = `
      Create ${count} distinct color palettes for a brand with the following details:
      
      Brand Name: ${params.brandName}
      Industry: ${params.industry}
      Brand Personality: ${params.brandPersonality}
      Aesthetic Preferences: ${params.aestheticPreferences.join(", ")}
      Color Preferences: ${params.colorPreferences.join(", ")}
      
      For each palette, provide 5 colors:
      1. Primary - The main brand color
      2. Secondary - A complementary color to the primary
      3. Accent - A color for highlights and calls-to-action
      4. Light - A light color for backgrounds
      5. Dark - A dark color for text and contrast
      
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
      
      Ensure the colors in each palette work well together and reflect the brand's personality and industry.
      The colors should be accessible and have sufficient contrast for text readability.
      Include the RGB values as comma-separated numbers.
      Only respond with the JSON array, no additional text.
    `;

    // Generate content using Gemini API
    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text();
    
    // Parse the JSON response
    let palettes: GeneratedColorPalette[] = [];
    
    try {
      // Try to parse the response as JSON
      palettes = JSON.parse(generatedContent);
      
      // Add selected property to each palette
      palettes = palettes.map((palette, index) => ({
        ...palette,
        selected: index === 0 // Select the first palette by default
      }));
    } catch (error) {
      console.error("Error parsing color palette JSON:", error);
      
      // Fallback to default palettes if parsing fails
      palettes = generateDefaultPalettes(count, params);
    }
    
    return palettes;
  } catch (error) {
    console.error("Error generating color palettes:", error);
    
    // Return default palettes in case of error
    return generateDefaultPalettes(count, params);
  }
};

/**
 * Generates default color palettes as a fallback
 */
const generateDefaultPalettes = (
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
    // Adjust the parameters based on feedback
    const adjustedParams = { ...params };
    
    // Simple feedback handling
    if (feedback.includes("brighter") || feedback.includes("vibrant")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "bright", "vibrant", "colorful"];
    } else if (feedback.includes("darker") || feedback.includes("muted")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "dark", "muted", "subdued"];
    } else if (feedback.includes("professional")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "professional", "corporate", "clean"];
    } else if (feedback.includes("creative")) {
      adjustedParams.aestheticPreferences = [...params.aestheticPreferences, "creative", "artistic", "expressive"];
    }
    
    // Generate new palettes with adjusted parameters
    return generateColorPalettes(apiKey, adjustedParams, count);
  } catch (error) {
    console.error("Error regenerating color palettes:", error);
    throw error;
  }
};