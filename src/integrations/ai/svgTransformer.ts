/**
 * SVG Transformer module for converting raster images to SVG and applying color transformations
 */

import { Color } from "./colorPalette";
import { Potrace } from 'potrace';

// Logging utility to prevent excessive console logs
// Set to false to disable verbose logging
const ENABLE_VERBOSE_LOGGING = false;

const log = {
  debug: (message: string) => {
    if (ENABLE_VERBOSE_LOGGING) {
      console.log(message);
    }
  },
  error: (message: string) => {
    console.error(message);
  }
};

/**
 * Interface for SVG transformation options
 */
export interface SVGTransformOptions {
  simplifyLevel?: number; // 1-10, higher means more simplification
  colorMode?: 'original' | 'monochrome' | 'custom';
  customColors?: Color[]; // Colors to use for custom color mode
  threshold?: number; // 0-255, for image tracing
  turdsize?: number; // Remove speckles of up to this size
  alphamax?: number; // Corner threshold parameter
  optCurve?: boolean; // Optimize curves
  optTolerance?: number; // Curve optimization tolerance
}

/**
 * Interface for transformed SVG result
 */
export interface TransformedSVG {
  id: string;
  svgString: string;
  colors: Color[];
  paths: SVGPath[];
}

export interface SVGPath {
  d: string;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Converts a raster image to SVG format using Potrace
 */
export const convertToSVG = async (
  imageUrl: string,
  options: SVGTransformOptions = {}
): Promise<TransformedSVG> => {
  try {
    log.debug("Converting image to SVG");
    log.debug("SVG conversion options: " + JSON.stringify(options));
    
    // Load the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const image = await createImageBitmap(blob);
    
    // Create a canvas to process the image
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error("Could not get canvas context");
    }
    
    // Draw the image
    ctx.drawImage(image, 0, 0);
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Configure Potrace options
    const potraceOptions = {
      threshold: options.threshold || 128,
      turdsize: options.turdsize || 2,
      alphamax: options.alphamax || 1,
      optCurve: options.optCurve ?? true,
      optTolerance: options.optTolerance || 0.2,
      color: '#000000',
      background: '#ffffff'
    };
    
    // Convert to SVG using Potrace
    const svgString = await new Promise<string>((resolve, reject) => {
      const potrace = new Potrace();
      potrace.setParameters(potraceOptions);
      potrace.loadImageData(imageData, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(potrace.getSVG());
      });
    });
    
    // Extract paths and colors from the SVG
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = Array.from(doc.querySelectorAll('path')).map(path => ({
      d: path.getAttribute('d') || '',
      fill: path.getAttribute('fill') || '#000000',
      stroke: path.getAttribute('stroke') || undefined,
      strokeWidth: path.getAttribute('stroke-width') ? 
        parseFloat(path.getAttribute('stroke-width')!) : undefined
    }));
    
    // Extract unique colors
    const colors = extractColorsFromPaths(paths, options);
    
    return {
      id: `svg-${Date.now()}`,
      svgString,
      colors,
      paths
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
    
    // Create a new SVG with the updated colors
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg.svgString, 'image/svg+xml');
    
    // Update path colors
    const paths = doc.querySelectorAll('path');
    paths.forEach((path, index) => {
      if (index < colors.length) {
        path.setAttribute('fill', colors[index].hex);
      }
    });
    
    // Generate new SVG string
    const serializer = new XMLSerializer();
    const newSvgString = serializer.serializeToString(doc);
    
    // Update paths with new colors
    const newPaths = svg.paths.map((path, index) => ({
      ...path,
      fill: index < colors.length ? colors[index].hex : path.fill
    }));
    
    return {
      id: `${svg.id}-recolored`,
      svgString: newSvgString,
      colors,
      paths: newPaths
    };
  } catch (error) {
    console.error("Error applying color palette to SVG:", error);
    throw error;
  }
};

/**
 * Extracts colors from SVG paths
 */
const extractColorsFromPaths = (
  paths: SVGPath[],
  options: SVGTransformOptions
): Color[] => {
  const { colorMode = 'original', customColors = [] } = options;
  
  // Get unique colors from paths
  const uniqueColors = new Set(paths.map(path => path.fill));
  
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
  
  // Convert unique colors to Color objects
  return Array.from(uniqueColors).map((hex, index) => ({
    name: `Color ${index + 1}`,
    hex,
    rgb: hexToRgb(hex)
  }));
};

/**
 * Converts hex color to RGB string
 */
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0, 0, 0";
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
};

/**
 * Downloads an SVG as a file
 */
export const downloadSVG = (svg: TransformedSVG, filename: string = 'logo.svg'): void => {
  try {
    const blob = new Blob([svg.svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
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
      const img = new Image();
      const svgBlob = new Blob([svg.svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        
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