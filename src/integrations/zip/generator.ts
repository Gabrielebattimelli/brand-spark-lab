// Import the FormData type from the BrandWizard component
// If there are any TypeScript errors, we'll use a more generic type
import { FormData as BrandWizardFormData } from '@/pages/projects/BrandWizard';

// Define a fallback type in case the import fails
type FormData = BrandWizardFormData | {
  brandName?: string;
  businessName?: string;
  [key: string]: any;
};
import { ProcessedLogo } from '@/integrations/logo/processor';
import { GeneratedLogo } from '@/integrations/ai/ideogram';

/**
 * Creates a zip file containing all brand assets
 */
export const createBrandAssetsZip = async (
  data: FormData,
  processedLogo: ProcessedLogo,
  pdfBlob?: Blob,
  moodboardUrls?: string[]
): Promise<Blob> => {
  // Ensure JSZip is loaded
  await ensureJSZip();
  
  // If JSZip is not available, return a simple blob
  if (!(window as any).JSZip) {
    console.warn('JSZip not available, returning simple blob');
    return new Blob([JSON.stringify({ message: 'JSZip not available. Please try downloading individual files.' })], { type: 'application/json' });
  }
  
  // Create a new JSZip instance
  const JSZip = (window as any).JSZip;
  const zip = new JSZip();
  
  // Get the brand name for folder naming
  const brandName = (data.brandName || data.businessName || 'brand').toLowerCase().replace(/\s+/g, '-');
  
  // Add the logo files
  const logoFolder = zip.folder(`${brandName}-logos`);
  
  // Add original logo
  if (processedLogo.original.blob) {
    logoFolder?.file(`${brandName}-original.png`, processedLogo.original.blob);
  }
  
  // Add black logo
  if (processedLogo.black?.blob) {
    logoFolder?.file(`${brandName}-black.png`, processedLogo.black.blob);
  }
  
  // Add white logo
  if (processedLogo.white?.blob) {
    logoFolder?.file(`${brandName}-white.png`, processedLogo.white.blob);
  }
  
  // Add transparent logo
  if (processedLogo.transparent?.blob) {
    logoFolder?.file(`${brandName}-transparent.png`, processedLogo.transparent.blob);
  }
  
  // Add negative logo
  if (processedLogo.negative?.blob) {
    logoFolder?.file(`${brandName}-negative.png`, processedLogo.negative.blob);
  }
  
  // Add icon logo
  if (processedLogo.icon?.blob) {
    logoFolder?.file(`${brandName}-icon.png`, processedLogo.icon.blob);
  }
  
  // Add SVG logo
  if (processedLogo.svg?.blob) {
    logoFolder?.file(`${brandName}.svg`, processedLogo.svg.blob);
  }
  
  // Add the PDF if available
  if (pdfBlob) {
    zip.file(`${brandName}-guidelines.pdf`, pdfBlob);
  }
  
  // Add a README file
  const readme = `# ${data.brandName || data.businessName} Brand Assets

This package contains the brand assets for ${data.brandName || data.businessName}.

## Contents

- Brand Guidelines PDF
- Logo Files (PNG, SVG, transparent, black, white, icon)
- Color Palette Information

## Usage Guidelines

- Always maintain the proportions of the logo when resizing
- Do not alter the colors of the logo unless using the provided variations
- Ensure adequate contrast when placing the logo on backgrounds
- Maintain clear space around the logo

For any questions about brand usage, please contact the brand owner.

Generated with BrandSpark
`;
  
  zip.file('README.md', readme);
  
  // Add a color palette information file
  if (data.aiGenerated?.colorPalette?.colors) {
    const colors = data.aiGenerated.colorPalette.colors;
    let colorInfo = `# ${data.brandName || data.businessName} Color Palette\n\n`;
    
    colors.forEach(color => {
      colorInfo += `## ${color.name}\n`;
      colorInfo += `- HEX: ${color.hex}\n`;
      colorInfo += `- RGB: ${color.rgb}\n\n`;
    });
    
    zip.file(`${brandName}-colors.md`, colorInfo);
  }
  
  // Generate the zip file
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  } catch (error) {
    console.error('Error generating zip:', error);
    // Return a simple blob as fallback
    return new Blob([JSON.stringify({ message: 'Failed to generate zip file. Please try downloading individual files.' })], { type: 'application/json' });
  }
};

/**
 * Downloads a zip file containing all brand assets
 */
export const downloadBrandAssetsZip = async (
  data: FormData,
  processedLogo: ProcessedLogo,
  pdfBlob?: Blob,
  moodboardUrls?: string[],
  filename: string = 'brand-assets.zip'
): Promise<void> => {
  try {
    // Ensure JSZip is loaded
    await ensureJSZip();
    
    // If JSZip is not available, fall back to downloading individual files
    if (!(window as any).JSZip) {
      console.warn('JSZip not available, falling back to individual downloads');
      
      // Download the logo
      if (processedLogo.original.blob) {
        const logoUrl = URL.createObjectURL(processedLogo.original.blob);
        const logoLink = document.createElement('a');
        logoLink.href = logoUrl;
        logoLink.download = `${data.brandName || data.businessName || 'brand'}-logo.png`;
        document.body.appendChild(logoLink);
        logoLink.click();
        document.body.removeChild(logoLink);
        URL.revokeObjectURL(logoUrl);
      }
      
      // Download the PDF if available
      if (pdfBlob) {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfUrl;
        pdfLink.download = `${data.brandName || data.businessName || 'brand'}-guidelines.pdf`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
        URL.revokeObjectURL(pdfUrl);
      }
      
      return;
    }
    
    // Create and download the zip file
    const zipBlob = await createBrandAssetsZip(data, processedLogo, pdfBlob, moodboardUrls);
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading zip:', error);
    
    // If there's an error, try to download individual files
    try {
      console.warn('Error creating zip, falling back to individual downloads');
      
      // Download the logo
      if (processedLogo.original.blob) {
        const logoUrl = URL.createObjectURL(processedLogo.original.blob);
        const logoLink = document.createElement('a');
        logoLink.href = logoUrl;
        logoLink.download = `${data.brandName || data.businessName || 'brand'}-logo.png`;
        document.body.appendChild(logoLink);
        logoLink.click();
        document.body.removeChild(logoLink);
        URL.revokeObjectURL(logoUrl);
      }
      
      // Download the PDF if available
      if (pdfBlob) {
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const pdfLink = document.createElement('a');
        pdfLink.href = pdfUrl;
        pdfLink.download = `${data.brandName || data.businessName || 'brand'}-guidelines.pdf`;
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
        URL.revokeObjectURL(pdfUrl);
      }
    } catch (fallbackError) {
      console.error('Error in fallback download:', fallbackError);
      throw error; // Throw the original error
    }
  }
};

/**
 * Installs JSZip library if not already available
 */
export const ensureJSZip = async (): Promise<void> => {
  if (!(window as any).JSZip) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.integrity = 'sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load JSZip'));
      document.head.appendChild(script);
    });
  }
};