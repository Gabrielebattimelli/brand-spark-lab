import { GeneratedLogo } from "../../types/logo";

interface LogoParams {
  brandName: string;
  industry: string;
  brandPersonality: string;
  aestheticPreferences?: string[];
  colorPreferences?: string[];
}

export class LogoGenerationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'LogoGenerationError';
  }
}

// Rate limiting implementation
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;
const requestTimestamps: number[] = [];

function checkRateLimit(): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Remove old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0] < windowStart) {
    requestTimestamps.shift();
  }
  
  if (requestTimestamps.length >= MAX_REQUESTS) {
    throw new LogoGenerationError(
      'Rate limit exceeded. Please try again later.',
      'RATE_LIMIT_EXCEEDED'
    );
  }
  
  requestTimestamps.push(now);
}

// Cache implementation
const logoCache = new Map<string, GeneratedLogo[]>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(params: LogoParams): string {
  return JSON.stringify(params);
}

function getFromCache(params: LogoParams): GeneratedLogo[] | null {
  const key = getCacheKey(params);
  const cached = logoCache.get(key);
  if (cached) {
    return cached;
  }
  return null;
}

function setCache(params: LogoParams, logos: GeneratedLogo[]): void {
  const key = getCacheKey(params);
  logoCache.set(key, logos);
  // Remove from cache after TTL
  setTimeout(() => {
    logoCache.delete(key);
  }, CACHE_TTL);
}

export async function generateLogoConcepts(
  apiKey: string,
  params: LogoParams,
  count: number = 4
): Promise<GeneratedLogo[]> {
  if (!apiKey) {
    throw new LogoGenerationError('API key is required', 'MISSING_API_KEY');
  }

  if (!params.brandName) {
    throw new LogoGenerationError('Brand name is required', 'MISSING_BRAND_NAME');
  }

  // Check rate limit
  checkRateLimit();

  // Check cache
  const cachedLogos = getFromCache(params);
  if (cachedLogos) {
    return cachedLogos;
  }

  // Construct the prompt
  const prompt = `Create a professional logo for ${params.brandName}, a ${params.industry} company. 
    The logo should reflect a ${params.brandPersonality} brand personality.
    ${params.aestheticPreferences?.length ? `Style preferences: ${params.aestheticPreferences.join(", ")}.` : ""}
    ${params.colorPreferences?.length ? `Color preferences: ${params.colorPreferences.join(", ")}.` : ""}
    The logo should be simple, memorable, and work well in both small and large sizes.`;

  try {
    // Check if we're using Ideogram or Clipdrop
    const isIdeogram = apiKey.startsWith("ideogram_");
    let logos: GeneratedLogo[] = [];

    if (isIdeogram) {
      // Ideogram API call
      const response = await fetch("https://api.ideogram.ai/api/v1/images", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          num_images: count,
          style: "logo",
          negative_prompt: "text, words, letters, complex details, realistic photo",
        }),
      });

      if (!response.ok) {
        throw new LogoGenerationError(
          `Ideogram API error: ${response.statusText}`,
          'IDEOGRAM_API_ERROR'
        );
      }

      const data = await response.json();
      logos = data.images.map((img: any, index: number) => ({
        id: `logo-${index + 1}`,
        url: img.url,
        prompt,
        selected: false,
      }));
    } else {
      // Clipdrop API call
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
        throw new LogoGenerationError(errorMessage, 'CLIPDROP_API_ERROR');
      }

      // Get the binary image data and convert to base64
      const imageBlob = await response.blob();
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

      logos = [{
        id: "logo-1",
        url: imageBase64,
        prompt,
        selected: false,
      }];
    }

    if (!logos || logos.length === 0) {
      throw new LogoGenerationError('No logos were generated', 'NO_LOGOS_GENERATED');
    }

    // Cache the results
    setCache(params, logos);

    return logos;
  } catch (error) {
    if (error instanceof LogoGenerationError) {
      throw error;
    }
    console.error("Error generating logos:", error);
    throw new LogoGenerationError(
      'Failed to generate logos',
      'GENERATION_FAILED'
    );
  }
}

export async function regenerateLogoConcepts(
  apiKey: string,
  params: LogoParams,
  feedback: string,
  count: number = 4
): Promise<GeneratedLogo[]> {
  if (!apiKey) {
    throw new LogoGenerationError('API key is required', 'MISSING_API_KEY');
  }

  if (!params.brandName) {
    throw new LogoGenerationError('Brand name is required', 'MISSING_BRAND_NAME');
  }

  if (!feedback.trim()) {
    throw new LogoGenerationError('Feedback is required for regeneration', 'MISSING_FEEDBACK');
  }

  // Check rate limit
  checkRateLimit();

  // Construct the prompt with feedback
  const prompt = `Create a professional logo for ${params.brandName}, a ${params.industry} company. 
    The logo should reflect a ${params.brandPersonality} brand personality.
    ${params.aestheticPreferences?.length ? `Style preferences: ${params.aestheticPreferences.join(", ")}.` : ""}
    ${params.colorPreferences?.length ? `Color preferences: ${params.colorPreferences.join(", ")}.` : ""}
    The logo should be simple, memorable, and work well in both small and large sizes.
    Previous feedback: ${feedback}`;

  try {
    // Check if we're using Ideogram or Clipdrop
    const isIdeogram = apiKey.startsWith("ideogram_");
    let logos: GeneratedLogo[] = [];

    if (isIdeogram) {
      // Ideogram API call
      const response = await fetch("https://api.ideogram.ai/api/v1/images", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          num_images: count,
          style: "logo",
          negative_prompt: "text, words, letters, complex details, realistic photo",
        }),
      });

      if (!response.ok) {
        throw new LogoGenerationError(
          `Ideogram API error: ${response.statusText}`,
          'IDEOGRAM_API_ERROR'
        );
      }

      const data = await response.json();
      logos = data.images.map((img: any, index: number) => ({
        id: `logo-${index + 1}`,
        url: img.url,
        prompt,
        selected: false,
      }));
    } else {
      // Clipdrop API call
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
        throw new LogoGenerationError(errorMessage, 'CLIPDROP_API_ERROR');
      }

      // Get the binary image data and convert to base64
      const imageBlob = await response.blob();
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });

      logos = [{
        id: "logo-1",
        url: imageBase64,
        prompt,
        selected: false,
      }];
    }

    if (!logos || logos.length === 0) {
      throw new LogoGenerationError('No logos were generated', 'NO_LOGOS_GENERATED');
    }

    // Cache the results
    setCache(params, logos);

    return logos;
  } catch (error) {
    if (error instanceof LogoGenerationError) {
      throw error;
    }
    console.error("Error regenerating logos:", error);
    throw new LogoGenerationError(
      'Failed to regenerate logos',
      'REGENERATION_FAILED'
    );
  }
} 