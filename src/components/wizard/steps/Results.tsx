
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Copy,
  CheckCircle,
  Circle,
  Sparkles,
  RefreshCw,
  FileType,
  FileImage,
  Eye,
  Archive,
  Palette,
  FileText,
  Image,
  Layers,
} from "lucide-react";
import { GeneratedLogo } from "@/integrations/ai/ideogram";
import { GeneratedColorPalette } from "@/integrations/ai/colorPalette";
import { FormData } from '@/pages/projects/BrandWizard';
import { processLogo, ProcessedLogo, downloadProcessedLogo } from "@/integrations/logo/processor";
import { generateBrandGuidelinesPDF, previewBrandGuidelinesHTML, downloadBrandGuidelinesPDF } from "@/integrations/pdf/generator";
import { downloadBrandAssetsZip, ensureJSZip } from "@/integrations/zip/generator";
import { toast } from "@/components/ui/use-toast";

interface ResultsProps {
  data: FormData;
}

export const Results = ({ data }: ResultsProps) => {
  const [activeTab, setActiveTab] = useState("brand-strategy");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [processedLogo, setProcessedLogo] = useState<ProcessedLogo | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(
    data.logo?.id || (data.aiGenerated?.logo?.id || null)
  );

  // Combine provided data with defaults for any missing values
  const generatedContent = {
    brandName: data.brandName || data.businessName || "NovaBrand",
    mission: data.mission || data.aiGenerated?.mission || "To empower businesses with innovative solutions that drive growth and success.",
    vision: data.vision || data.aiGenerated?.vision || "A world where every business has the tools and support they need to thrive in the digital era.",
    values: data.values || ["Innovation", "Integrity", "Excellence", "Collaboration"],
    voiceTone: data.aiGenerated?.brandVoice || "Friendly, professional, and knowledgeable. Communication should inspire confidence while remaining approachable and jargon-free.",
    valueProposition: data.uniqueSellingProposition || data.aiGenerated?.valueProposition || "We provide exceptional value through innovative solutions tailored to your specific needs.",
    brandEssence: data.aiGenerated?.brandEssence || "The essence of our brand is built on trust, innovation, and customer success.",
    targetAudience: data.demographics?.ageRange || data.demographics?.gender || data.demographics?.location 
      ? `${data.demographics?.ageRange || ""} ${data.demographics?.gender || ""} ${data.demographics?.location ? `from ${data.demographics.location}` : ""}`
      : "Small to medium-sized businesses looking to establish or strengthen their online presence. Decision-makers aged 30-50 who value quality and results over the lowest price point.",
    brandPersonality: data.visualStyle === "techy" ? "Innovative and forward-thinking" : "Trustworthy and reliable",
    // Use the AI-generated logo if available, otherwise use placeholders
    logos: data.logo ? [
      {
        ...data.logo,
        selected: true
      }
    ] : data.aiGenerated?.logo ? [
      {
        ...data.aiGenerated.logo,
        selected: true
      }
    ] : [
      {
        id: "1",
        url: "https://placehold.co/600x400/f38e63/ffffff?text=Logo+1",
        selected: true,
        prompt: ""
      },
      {
        id: "2",
        url: "https://placehold.co/600x400/f38e63/ffffff?text=Logo+2",
        selected: false,
        prompt: ""
      },
    ],
    colors: data.aiGenerated?.colorPalette?.colors || [
      { name: "Primary", hex: "#f38e63", rgb: "243, 142, 99" },
      { name: "Secondary", hex: "#6C757D", rgb: "108, 117, 125" },
      { name: "Accent", hex: "#9b87f5", rgb: "155, 135, 245" },
      { name: "Light", hex: "#F8F9FA", rgb: "248, 249, 250" },
      { name: "Dark", hex: "#343A40", rgb: "52, 58, 64" },
    ],
    typography: {
      headings: "Poppins",
      body: "Inter",
    },
  };

  // Process the logo when component mounts or when the selected logo changes
  useEffect(() => {
    const processSelectedLogo = async () => {
      const selectedLogo = generatedContent.logos.find(logo => logo.id === selectedLogoId);
      if (selectedLogo) {
        setIsProcessingLogo(true);
        try {
          const processed = await processLogo(
            selectedLogo, 
            data.aiGenerated?.colorPalette || null
          );
          setProcessedLogo(processed);
        } catch (error) {
          console.error('Error processing logo:', error);
          toast({
            title: "Error",
            description: "Failed to process logo. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessingLogo(false);
        }
      }
    };

    processSelectedLogo();
  }, [selectedLogoId, data.aiGenerated?.colorPalette]);

  // Load JSZip when component mounts
  useEffect(() => {
    ensureJSZip().catch(error => {
      console.error('Error loading JSZip:', error);
    });
  }, []);

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      // Ensure the logo is processed
      if (!processedLogo) {
        const selectedLogo = generatedContent.logos.find(logo => logo.id === selectedLogoId);
        if (selectedLogo) {
          try {
            const processed = await processLogo(
              selectedLogo, 
              data.aiGenerated?.colorPalette || null
            );
            setProcessedLogo(processed);
          } catch (logoError) {
            console.error('Error processing logo:', logoError);
            toast({
              title: "Warning",
              description: "Could not process logo. Some assets may be missing from the download.",
              variant: "destructive",
            });
          }
        }
      }

      // Generate PDF
      let pdfBlob: Blob | undefined;
      try {
        pdfBlob = await generateBrandGuidelinesPDF(
          data,
          generatedContent.logos.find(logo => logo.id === selectedLogoId)
        );
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        toast({
          title: "Warning",
          description: "Could not generate PDF. Some assets may be missing from the download.",
          variant: "destructive",
        });
      }

      // Download ZIP with all assets
      if (processedLogo) {
        await downloadBrandAssetsZip(
          data,
          processedLogo,
          pdfBlob,
          data.moodboardUrls
        );

        toast({
          title: "Success",
          description: "Brand kit downloaded successfully!",
        });
      } else {
        // If we don't have a processed logo, try to download just the PDF
        if (pdfBlob) {
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${data.brandName || data.businessName || 'brand'}-guidelines.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Partial Success",
            description: "Only the brand guidelines PDF was downloaded. Logo processing failed.",
            variant: "warning",
          });
        } else {
          throw new Error('Failed to process logo and generate PDF');
        }
      }
    } catch (error) {
      console.error('Error downloading brand kit:', error);
      toast({
        title: "Error",
        description: "Failed to download brand kit. Please try downloading individual items instead.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(field);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleGenerateMore = () => {
    setIsGeneratingMore(true);
    // Simulate regeneration process
    setTimeout(() => {
      setIsGeneratingMore(false);
      toast({
        title: "Info",
        description: "To generate more logos, please go back to the Logo Generation step.",
      });
    }, 1000);
  };

  const selectLogo = (id: string) => {
    setSelectedLogoId(id);
    // Update the logos array to mark the selected logo
    generatedContent.logos.forEach(logo => {
      logo.selected = logo.id === id;
    });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadBrandGuidelinesPDF(
        data,
        generatedContent.logos.find(logo => logo.id === selectedLogoId)
      );
      
      toast({
        title: "Success",
        description: "Your browser's print dialog should open. Select 'Save as PDF' to download.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      
      // Try an alternative approach
      try {
        // Generate the HTML and open it in a new window
        const html = await generateBrandGuidelinesHTML(
          data,
          generatedContent.logos.find(logo => logo.id === selectedLogoId)
        );
        
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Open in a new window
        window.open(url, '_blank');
        
        toast({
          title: "Alternative Method",
          description: "PDF generation failed. HTML opened in a new tab. Use your browser's print function to save as PDF.",
          variant: "warning",
        });
        
        // Clean up the URL object after a minute
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 60000);
      } catch (fallbackError) {
        console.error('Error with fallback HTML method:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to generate PDF or HTML. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePreviewPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const newWindow = await previewBrandGuidelinesHTML(
        data,
        generatedContent.logos.find(logo => logo.id === selectedLogoId)
      );
      
      if (!newWindow) {
        throw new Error('Failed to open preview window. Check your popup blocker settings.');
      }
    } catch (error) {
      console.error('Error previewing PDF:', error);
      
      // Try an alternative approach
      try {
        // Generate the HTML and open it in a new window
        const html = await generateBrandGuidelinesHTML(
          data,
          generatedContent.logos.find(logo => logo.id === selectedLogoId)
        );
        
        // Create a data URL
        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
        
        // Open in a new window
        window.open(dataUrl, '_blank');
        
        toast({
          title: "Alternative Preview",
          description: "Using alternative preview method. Some features may be limited.",
          variant: "warning",
        });
      } catch (fallbackError) {
        console.error('Error with fallback preview method:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to preview. Please check your popup blocker settings and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadLogo = (format: keyof ProcessedLogo) => {
    if (!processedLogo) {
      toast({
        title: "Error",
        description: "Logo processing not complete. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      downloadProcessedLogo(
        processedLogo,
        format,
        `${generatedContent.brandName.toLowerCase().replace(/\s+/g, '-')}-logo${format === 'svg' ? '.svg' : '.png'}`
      );
    } catch (error) {
      console.error(`Error downloading ${format} logo:`, error);
      toast({
        title: "Error",
        description: `Failed to download ${format} logo. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDownloadLogoPackage = async () => {
    if (!processedLogo) {
      toast({
        title: "Error",
        description: "Logo processing not complete. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      // Ensure JSZip is loaded
      await ensureJSZip();
      
      // If JSZip is available, create a zip with all logo formats
      if ((window as any).JSZip) {
        const JSZip = (window as any).JSZip;
        const zip = new JSZip();
        
        // Get the brand name for folder naming
        const brandName = (data.brandName || data.businessName || 'brand').toLowerCase().replace(/\s+/g, '-');
        
        // Add all available logo formats
        if (processedLogo.original.blob) {
          zip.file(`${brandName}-original.png`, processedLogo.original.blob);
        }
        
        if (processedLogo.black?.blob) {
          zip.file(`${brandName}-black.png`, processedLogo.black.blob);
        }
        
        if (processedLogo.white?.blob) {
          zip.file(`${brandName}-white.png`, processedLogo.white.blob);
        }
        
        if (processedLogo.transparent?.blob) {
          zip.file(`${brandName}-transparent.png`, processedLogo.transparent.blob);
        }
        
        if (processedLogo.negative?.blob) {
          zip.file(`${brandName}-negative.png`, processedLogo.negative.blob);
        }
        
        if (processedLogo.icon?.blob) {
          zip.file(`${brandName}-icon.png`, processedLogo.icon.blob);
        }
        
        if (processedLogo.svg?.blob) {
          zip.file(`${brandName}.svg`, processedLogo.svg.blob);
        }
        
        // Add a README file
        const readme = `# ${data.brandName || data.businessName} Logo Package

This package contains logo files for ${data.brandName || data.businessName} in various formats.

## Files

- original.png: Full color logo on original background
- black.png: Black version of the logo
- white.png: White version of the logo
- transparent.png: Logo with transparent background
- negative.png: Inverted colors version
- icon.png: Square icon version
- svg: Vector version of the logo

## Usage Guidelines

- Always maintain the proportions of the logo when resizing
- Do not alter the colors of the logo unless using the provided variations
- Ensure adequate contrast when placing the logo on backgrounds
- Maintain clear space around the logo

Generated with BrandSpark
`;
        
        zip.file('README.md', readme);
        
        // Generate and download the zip
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brandName}-logo-package.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Logo package downloaded successfully!",
        });
      } else {
        // If JSZip is not available, download individual files
        toast({
          title: "Info",
          description: "Downloading individual logo files instead of a package.",
          variant: "warning",
        });
        
        // Download original logo
        downloadProcessedLogo(
          processedLogo,
          'original',
          `${generatedContent.brandName.toLowerCase().replace(/\s+/g, '-')}-logo-original.png`
        );
        
        // Download black logo if available
        if (processedLogo.black) {
          setTimeout(() => {
            downloadProcessedLogo(
              processedLogo,
              'black',
              `${generatedContent.brandName.toLowerCase().replace(/\s+/g, '-')}-logo-black.png`
            );
          }, 500);
        }
        
        // Download transparent logo if available
        if (processedLogo.transparent) {
          setTimeout(() => {
            downloadProcessedLogo(
              processedLogo,
              'transparent',
              `${generatedContent.brandName.toLowerCase().replace(/\s+/g, '-')}-logo-transparent.png`
            );
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error downloading logo package:', error);
      
      // Fallback to downloading just the original logo
      try {
        downloadProcessedLogo(
          processedLogo,
          'original',
          `${generatedContent.brandName.toLowerCase().replace(/\s+/g, '-')}-logo.png`
        );
        
        toast({
          title: "Partial Success",
          description: "Only the original logo was downloaded. Try downloading individual formats.",
          variant: "warning",
        });
      } catch (fallbackError) {
        console.error('Error with fallback download:', fallbackError);
        toast({
          title: "Error",
          description: "Failed to download logo package. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Your Brand Kit
        </h1>
        <p className="text-gray-600">
          Based on your inputs, we've generated a complete brand kit for you. Review the elements below and download your brand assets.
        </p>
      </div>

      <Tabs
        defaultValue="brand-strategy"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brand-strategy">Brand Strategy</TabsTrigger>
          <TabsTrigger value="visual-identity">Visual Identity</TabsTrigger>
          <TabsTrigger value="download">Download Kit</TabsTrigger>
        </TabsList>

        {/* Brand Strategy Tab */}
        <TabsContent value="brand-strategy" className="pt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {generatedContent.brandName}
                </CardTitle>
                <CardDescription>
                  Your Brand Name & Key Messaging
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mission Statement</h3>
                  <div className="relative p-4 bg-gray-50 rounded-lg">
                    <p className="pr-8">{generatedContent.mission}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => handleCopy(generatedContent.mission, 'mission')}
                    >
                      {isCopied === 'mission' ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Vision Statement</h3>
                  <div className="relative p-4 bg-gray-50 rounded-lg">
                    <p className="pr-8">{generatedContent.vision}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => handleCopy(generatedContent.vision, 'vision')}
                    >
                      {isCopied === 'vision' ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Core Values</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {generatedContent.values.map((value, index) => (
                      <li key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                        <Circle size={8} className="text-primary mr-2" />
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Voice & Personality</CardTitle>
                <CardDescription>
                  How your brand communicates and presents itself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Voice & Tone</h3>
                  <p className="p-4 bg-gray-50 rounded-lg">
                    {generatedContent.voiceTone}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Personality</h3>
                  <p className="p-4 bg-gray-50 rounded-lg">
                    {generatedContent.brandPersonality}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Brand Essence</h3>
                  <p className="p-4 bg-gray-50 rounded-lg">
                    {generatedContent.brandEssence}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Target Audience</h3>
                  <p className="p-4 bg-gray-50 rounded-lg">
                    {generatedContent.targetAudience}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setActiveTab("visual-identity")}>
              View Visual Identity
            </Button>
          </div>
        </TabsContent>

        {/* Visual Identity Tab */}
        <TabsContent value="visual-identity" className="pt-6">
          <div className="grid gap-6">
            <Tabs defaultValue="logo-options" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="logo-options">Logo Options</TabsTrigger>
                <TabsTrigger value="color-typography">Colors & Typography</TabsTrigger>
              </TabsList>

              {/* Logo Options Tab */}
              <TabsContent value="logo-options" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo Options</CardTitle>
                    <CardDescription>
                      Select your preferred logo design
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {generatedContent.logos.map((logo) => (
                        <div
                          key={logo.id}
                          className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                            logo.id === selectedLogoId ? "ring-2 ring-primary" : "hover:border-primary/50"
                          }`}
                          onClick={() => selectLogo(logo.id)}
                        >
                          <img
                            src={logo.url}
                            alt={`Logo option ${logo.id}`}
                            className="w-full h-auto"
                          />
                          {logo.id === selectedLogoId && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                              <CheckCircle size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handleGenerateMore}
                        disabled={isGeneratingMore}
                      >
                        {isGeneratingMore ? (
                          <>
                            <RefreshCw size={16} className="mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} className="mr-2" />
                            Generate More Options
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Logo Variations */}
                {processedLogo && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Logo Variations</CardTitle>
                      <CardDescription>
                        Different versions of your selected logo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Original */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="p-4 bg-white">
                            <img 
                              src={processedLogo.original.url} 
                              alt="Original logo" 
                              className="w-full h-auto max-h-40 object-contain"
                            />
                          </div>
                          <div className="p-3 bg-gray-50 border-t">
                            <p className="font-medium text-sm">Original</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleDownloadLogo('original')}
                            >
                              <Download size={14} className="mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {/* Black */}
                        {processedLogo.black && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-white">
                              <img 
                                src={processedLogo.black.url} 
                                alt="Black logo" 
                                className="w-full h-auto max-h-40 object-contain"
                              />
                            </div>
                            <div className="p-3 bg-gray-50 border-t">
                              <p className="font-medium text-sm">Black</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => handleDownloadLogo('black')}
                              >
                                <Download size={14} className="mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* White */}
                        {processedLogo.white && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-800">
                              <img 
                                src={processedLogo.white.url} 
                                alt="White logo" 
                                className="w-full h-auto max-h-40 object-contain"
                              />
                            </div>
                            <div className="p-3 bg-gray-50 border-t">
                              <p className="font-medium text-sm">White</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => handleDownloadLogo('white')}
                              >
                                <Download size={14} className="mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Transparent */}
                        {processedLogo.transparent && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-gray-100 bg-opacity-50" style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xOdTWsmQAAAAcSURBVDhPYxgFo2AUjAIYeHBw8P9RPBoGDAYGANAqCgFdR5y0AAAAAElFTkSuQmCC")' }}>
                              <img 
                                src={processedLogo.transparent.url} 
                                alt="Transparent logo" 
                                className="w-full h-auto max-h-40 object-contain"
                              />
                            </div>
                            <div className="p-3 bg-gray-50 border-t">
                              <p className="font-medium text-sm">Transparent</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => handleDownloadLogo('transparent')}
                              >
                                <Download size={14} className="mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Negative */}
                        {processedLogo.negative && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-white">
                              <img 
                                src={processedLogo.negative.url} 
                                alt="Negative logo" 
                                className="w-full h-auto max-h-40 object-contain"
                              />
                            </div>
                            <div className="p-3 bg-gray-50 border-t">
                              <p className="font-medium text-sm">Negative</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => handleDownloadLogo('negative')}
                              >
                                <Download size={14} className="mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Icon */}
                        {processedLogo.icon && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-white">
                              <img 
                                src={processedLogo.icon.url} 
                                alt="Icon version" 
                                className="w-full h-auto max-h-40 object-contain"
                              />
                            </div>
                            <div className="p-3 bg-gray-50 border-t">
                              <p className="font-medium text-sm">Icon</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => handleDownloadLogo('icon')}
                              >
                                <Download size={14} className="mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* SVG */}
                        {processedLogo.svg && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="p-4 bg-white">
                              <img 
                                src={processedLogo.svg.url} 
                                alt="SVG version" 
                                className="w-full h-auto max-h-40 object-contain"
                              />
                            </div>
                            <div className="p-3 bg-gray-50 border-t">
                              <p className="font-medium text-sm">SVG</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full mt-2"
                                onClick={() => handleDownloadLogo('svg')}
                              >
                                <Download size={14} className="mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Colors & Typography Tab */}
              <TabsContent value="color-typography" className="pt-4">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Color Palette</CardTitle>
                      <CardDescription>
                        Your brand's color scheme
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {generatedContent.colors.map((color, index) => (
                          <div key={index} className="text-center">
                            <div
                              className="h-20 rounded-md mb-2"
                              style={{ backgroundColor: color.hex }}
                            ></div>
                            <p className="font-medium">{color.name}</p>
                            <p className="text-sm text-gray-600">{color.hex}</p>
                            <p className="text-xs text-gray-500">RGB: {color.rgb}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Typography</CardTitle>
                      <CardDescription>
                        Font recommendations for your brand
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Headings: {generatedContent.typography.headings}</h3>
                          <div className="space-y-2">
                            <p className="text-3xl font-poppins font-bold">Headline Text</p>
                            <p className="text-2xl font-poppins font-semibold">Subheading Text</p>
                            <p className="text-xl font-poppins">Section Title</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Body: {generatedContent.typography.body}</h3>
                          <div className="space-y-2">
                            <p className="font-inter">This is paragraph text in your body font. It should be highly readable and work well at different sizes.</p>
                            <p className="font-inter text-sm">This is smaller text that might be used for captions or secondary information.</p>
                            <p className="font-inter font-medium">This is medium weight text for emphasis.</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setActiveTab("download")}>
              Proceed to Download
            </Button>
          </div>
        </TabsContent>

        {/* Download Kit Tab */}
        <TabsContent value="download" className="pt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Brand Kit is Ready!</CardTitle>
              <CardDescription>
                Download your complete brand assets and guidelines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="mr-4 text-primary">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-medium">What's included:</h3>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Brand Guidelines PDF (Mission, Vision, Values, Voice)</li>
                    <li>• Logo Files (PNG, SVG, Transparent, Black, White, Icon)</li>
                    <li>• Color Palette with HEX and RGB codes</li>
                    <li>• Typography recommendations</li>
                    {data.moodboardUrls?.length > 0 && (
                      <li>• Moodboard images</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* PDF Preview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Brand Guidelines Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-gray-50 p-6 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">{generatedContent.brandName} Brand Guidelines</h3>
                    <p className="text-gray-500 mb-4">
                      A comprehensive guide to your brand's identity, messaging, and visual elements.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handlePreviewPDF}
                        disabled={isGeneratingPDF}
                      >
                        <Eye size={16} className="mr-2" />
                        Preview
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                      >
                        <Download size={16} className="mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center py-6">
                <Button
                  size="lg"
                  className="px-8"
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw size={20} className="mr-2 animate-spin" />
                      Preparing files...
                    </>
                  ) : (
                    <>
                      <Download size={20} className="mr-2" />
                      Download Complete Brand Kit
                    </>
                  )}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  All files are packaged as a ZIP archive
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch border-t pt-6">
              <h3 className="font-medium mb-3">Individual downloads:</h3>
              <div className="grid gap-3">
                <Button 
                  variant="outline" 
                  className="justify-between"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                >
                  Brand Guidelines (PDF)
                  <Download size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-between"
                  onClick={handleDownloadLogoPackage}
                  disabled={!processedLogo}
                >
                  Logo Package (ZIP)
                  <Download size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-between"
                  onClick={() => {
                    // In a real implementation, this would download a PDF with color palette
                    toast({
                      title: "Info",
                      description: "Color palette is included in the Brand Guidelines PDF.",
                    });
                  }}
                >
                  Color Palette (PDF)
                  <Download size={16} />
                </Button>
              </div>
            </CardFooter>
          </Card>

          <div className="text-center">
            <p className="font-medium text-gray-700 mb-1">
              Want to continue refining your brand?
            </p>
            <p className="text-gray-600 text-sm mb-4">
              You can go back to any step in the process to make adjustments.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => setActiveTab("brand-strategy")}>
                Edit Brand Strategy
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("visual-identity")}>
                Edit Visual Identity
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
