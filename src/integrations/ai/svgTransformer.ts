/**
 * SVG Transformer module for converting raster images to SVG and applying color transformations
 */

import { Color } from "./colorPalette";

/**
 * Interface for SVG transformation options
 */
export interface SVGTransformOptions {
  simplifyLevel?: number; // 1-10, higher means more simplification
  colorMode?: 'original' | 'monochrome' | 'custom';
  customColors?: Color[]; // Colors to use for custom color mode
}

/**
 * Interface for transformed SVG result
 */
export interface TransformedSVG {
  id: string;
  svgString: string;
  colors: Color[];
}

/**
 * Converts a raster image to SVG format
 * 
 * This function uses a combination of image processing techniques to:
 * 1. Trace the outlines of shapes in the image
 * 2. Simplify the paths for cleaner SVG
 * 3. Apply color quantization to reduce the number of colors
 * 4. Generate an optimized SVG string
 */
export const convertToSVG = async (
  imageUrl: string,
  options: SVGTransformOptions = {}
): Promise<TransformedSVG> => {
  try {
    console.log("Converting image to SVG:", imageUrl);
    console.log("Options:", options);
    
    // In a real implementation, we would use a library like potrace or a service API
    // to convert the raster image to SVG. For this demo, we'll simulate the conversion
    // with a placeholder SVG.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a simple SVG based on the options
    const svgString = generatePlaceholderSVG(options);
    
    // Extract or generate colors from the SVG
    const colors = extractColorsFromSVG(svgString, options);
    
    return {
      id: `svg-${Date.now()}`,
      svgString,
      colors
    };
  } catch (error) {
    console.error("Error converting image to SVG:", error);
    throw error;
  }
};

/**
 * Applies a new color palette to an existing SVG
 */
export const applyColorPalette = (
  svg: TransformedSVG,
  colors: Color[]
): TransformedSVG => {
  try {
    console.log("Applying color palette to SVG:", svg.id);
    console.log("Colors:", colors);
    
    // In a real implementation, we would parse the SVG, identify color attributes,
    // and replace them with the new colors. For this demo, we'll simulate the transformation.
    
    // Create a new SVG string with the new colors
    let newSvgString = svg.svgString;
    
    // Replace fill colors in the SVG
    svg.colors.forEach((oldColor, index) => {
      if (index < colors.length) {
        const newColor = colors[index];
        newSvgString = newSvgString.replace(
          new RegExp(oldColor.hex, 'g'),
          newColor.hex
        );
      }
    });
    
    return {
      id: `${svg.id}-recolored`,
      svgString: newSvgString,
      colors
    };
  } catch (error) {
    console.error("Error applying color palette to SVG:", error);
    throw error;
  }
};

/**
 * Generates a placeholder SVG for demonstration purposes
 */
const generatePlaceholderSVG = (options: SVGTransformOptions): string => {
  const { colorMode = 'original', customColors = [] } = options;
  
  // Define colors based on the color mode
  let colors: string[] = ['#3498db', '#2c3e50', '#e74c3c', '#ecf0f1', '#f39c12'];
  
  if (colorMode === 'monochrome') {
    colors = ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7'];
  } else if (colorMode === 'custom' && customColors.length > 0) {
    colors = customColors.map(color => color.hex);
  }
  
  // Create a simple logo SVG with the specified colors
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect x="0" y="0" width="200" height="200" fill="${colors[3]}" />
      <circle cx="100" cy="100" r="70" fill="${colors[0]}" />
      <rect x="70" y="70" width="60" height="60" fill="${colors[1]}" />
      <polygon points="100,40 120,70 80,70" fill="${colors[2]}" />
      <path d="M 50 150 Q 100 180 150 150" stroke="${colors[4]}" stroke-width="5" fill="none" />
    </svg>
  `.trim();
};

/**
 * Extracts colors from an SVG string
 */
const extractColorsFromSVG = (svgString: string, options: SVGTransformOptions): Color[] => {
  const { colorMode = 'original', customColors = [] } = options;
  
  // In a real implementation, we would parse the SVG and extract all unique colors.
  // For this demo, we'll return placeholder colors based on the color mode.
  
  if (colorMode === 'custom' && customColors.length > 0) {
    return customColors;
  }
  
  if (colorMode === 'monochrome') {
    return [
      { name: "Primary", hex: "#2c3e50", rgb: "44, 62, 80" },
      { name: "Secondary", hex: "#34495e", rgb: "52, 73, 94" },
      { name: "Accent", hex: "#7f8c8d", rgb: "127, 140, 141" },
      { name: "Light", hex: "#ecf0f1", rgb: "236, 240, 241" },
      { name: "Dark", hex: "#2c3e50", rgb: "44, 62, 80" }
    ];
  }
  
  // Default colors for 'original' mode
  return [
    { name: "Primary", hex: "#3498db", rgb: "52, 152, 219" },
    { name: "Secondary", hex: "#2c3e50", rgb: "44, 62, 80" },
    { name: "Accent", hex: "#e74c3c", rgb: "231, 76, 60" },
    { name: "Light", hex: "#ecf0f1", rgb: "236, 240, 241" },
    { name: "Dark", hex: "#2c3e50", rgb: "44, 62, 80" }
  ];
};

/**
 * Downloads an SVG as a file
 */
export const downloadSVG = (svg: TransformedSVG, filename: string = 'logo.svg'): void => {
  try {
    // Create a blob from the SVG string
    const blob = new Blob([svg.svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading SVG:", error);
    throw error;
  }
};

/**
 * Converts an SVG to PNG format with specified dimensions
 */
export const convertSVGtoPNG = async (
  svg: TransformedSVG,
  width: number = 1024,
  height: number = 1024
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element to load the SVG
      const img = new Image();
      const svgBlob = new Blob([svg.svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        // Create a canvas to render the PNG
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        // Draw the SVG on the canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert the canvas to a PNG data URL
        const pngUrl = canvas.toDataURL('image/png');
        
        // Clean up
        URL.revokeObjectURL(url);
        
        resolve(pngUrl);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG"));
      };
      
      img.src = url;
    } catch (error) {
      console.error("Error converting SVG to PNG:", error);
      reject(error);
    }
  });
};