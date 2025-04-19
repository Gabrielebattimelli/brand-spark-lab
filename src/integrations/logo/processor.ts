import { GeneratedLogo } from '@/integrations/ai/ideogram';
import { GeneratedColorPalette } from '@/integrations/ai/colorPalette';

/**
 * Represents a processed logo in various formats
 */
export interface ProcessedLogo {
  original: {
    url: string;
    blob?: Blob;
  };
  negative?: {
    url: string;
    blob?: Blob;
  };
  black?: {
    url: string;
    blob?: Blob;
  };
  white?: {
    url: string;
    blob?: Blob;
  };
  transparent?: {
    url: string;
    blob?: Blob;
  };
  svg?: {
    url: string;
    content: string;
    blob?: Blob;
  };
  icon?: {
    url: string;
    blob?: Blob;
  };
}

/**
 * Processes a logo into various formats
 */
export const processLogo = async (
  logo: GeneratedLogo,
  colorPalette?: GeneratedColorPalette | null
): Promise<ProcessedLogo> => {
  // Start with the original logo
  const processedLogo: ProcessedLogo = {
    original: {
      url: logo.url
    }
  };

  try {
    // Fetch the original image
    const originalResponse = await fetch(logo.url);
    const originalBlob = await originalResponse.blob();
    processedLogo.original.blob = originalBlob;

    // Create a canvas to manipulate the image
    const img = new Image();
    const loadImage = new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = logo.url;
    });
    await loadImage;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Draw the original image
    ctx.drawImage(img, 0, 0);

    // Create negative version (inverted colors)
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    const negativeUrl = canvas.toDataURL('image/png');
    const negativeBlob = await (await fetch(negativeUrl)).blob();
    processedLogo.negative = {
      url: negativeUrl,
      blob: negativeBlob
    };

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Create black version (silhouette)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // If pixel is not transparent
      if (data[i + 3] > 0) {
        // Set to black
        data[i] = 0;     // R
        data[i + 1] = 0; // G
        data[i + 2] = 0; // B
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    const blackUrl = canvas.toDataURL('image/png');
    const blackBlob = await (await fetch(blackUrl)).blob();
    processedLogo.black = {
      url: blackUrl,
      blob: blackBlob
    };

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Create white version
    const whiteImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const whiteData = whiteImageData.data;
    
    for (let i = 0; i < whiteData.length; i += 4) {
      // If pixel is not transparent
      if (whiteData[i + 3] > 0) {
        // Set to white
        whiteData[i] = 255;     // R
        whiteData[i + 1] = 255; // G
        whiteData[i + 2] = 255; // B
      }
    }
    
    ctx.putImageData(whiteImageData, 0, 0);
    const whiteUrl = canvas.toDataURL('image/png');
    const whiteBlob = await (await fetch(whiteUrl)).blob();
    processedLogo.white = {
      url: whiteUrl,
      blob: whiteBlob
    };

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Create transparent background version
    // This is a simplified approach - in a real implementation,
    // you would use more sophisticated background removal techniques
    const transparentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const transparentData = transparentImageData.data;
    
    // Get the background color (assuming it's the color of the top-left pixel)
    const bgR = transparentData[0];
    const bgG = transparentData[1];
    const bgB = transparentData[2];
    
    // Set all pixels matching the background color to transparent
    // Using a tolerance to account for anti-aliasing
    const tolerance = 30;
    
    for (let i = 0; i < transparentData.length; i += 4) {
      const r = transparentData[i];
      const g = transparentData[i + 1];
      const b = transparentData[i + 2];
      
      // Check if the pixel is close to the background color
      if (
        Math.abs(r - bgR) < tolerance &&
        Math.abs(g - bgG) < tolerance &&
        Math.abs(b - bgB) < tolerance
      ) {
        // Make it transparent
        transparentData[i + 3] = 0;
      }
    }
    
    ctx.putImageData(transparentImageData, 0, 0);
    const transparentUrl = canvas.toDataURL('image/png');
    const transparentBlob = await (await fetch(transparentUrl)).blob();
    processedLogo.transparent = {
      url: transparentUrl,
      blob: transparentBlob
    };

    // Create icon version (square thumbnail)
    const iconSize = 256;
    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = iconSize;
    iconCanvas.height = iconSize;
    const iconCtx = iconCanvas.getContext('2d');
    
    if (iconCtx) {
      // Calculate scaling and positioning to fit the logo in a square
      const scale = Math.min(iconSize / img.width, iconSize / img.height);
      const x = (iconSize - img.width * scale) / 2;
      const y = (iconSize - img.height * scale) / 2;
      
      iconCtx.drawImage(img, x, y, img.width * scale, img.height * scale);
      
      const iconUrl = iconCanvas.toDataURL('image/png');
      const iconBlob = await (await fetch(iconUrl)).blob();
      processedLogo.icon = {
        url: iconUrl,
        blob: iconBlob
      };
    }

    // Create SVG version (placeholder - in a real implementation, you would use a proper raster to vector conversion)
    // This is just a simple placeholder that creates an SVG wrapper around the image
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}" viewBox="0 0 ${img.width} ${img.height}">
        <image href="${logo.url}" width="${img.width}" height="${img.height}" />
      </svg>
    `;
    
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    processedLogo.svg = {
      url: svgUrl,
      content: svgContent,
      blob: svgBlob
    };

  } catch (error) {
    console.error('Error processing logo:', error);
  }

  return processedLogo;
};

/**
 * Downloads a processed logo in a specific format
 */
export const downloadProcessedLogo = (
  processedLogo: ProcessedLogo,
  format: keyof ProcessedLogo,
  filename: string
): void => {
  const logoFormat = processedLogo[format];
  
  if (!logoFormat) {
    console.error(`Format ${format} not available`);
    return;
  }
  
  const url = logoFormat.url;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Gets the appropriate file extension for a logo format
 */
export const getFileExtension = (format: keyof ProcessedLogo): string => {
  switch (format) {
    case 'svg':
      return '.svg';
    default:
      return '.png';
  }
};