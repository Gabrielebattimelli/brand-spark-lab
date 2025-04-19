import { FormData } from '@/pages/projects/BrandWizard';
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
  // In a real implementation, you would use a library like JSZip
  // For this example, we'll create a simple blob
  
  // This is a placeholder - in a real implementation you would use JSZip to create a proper zip file
  const zipBlob = new Blob([JSON.stringify({ message: 'This is a placeholder for a zip file' })], { type: 'application/zip' });
  return zipBlob;
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
    const zipBlob = await createBrandAssetsZip(data, processedLogo, pdfBlob, moodboardUrls);
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading zip:', error);
    throw error;
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