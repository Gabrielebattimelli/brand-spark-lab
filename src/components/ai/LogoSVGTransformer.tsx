import React, { useState, useEffect } from "react";
import { GeneratedLogo } from "@/integrations/ai/ideogram";
import { GeneratedColorPalette, Color } from "@/integrations/ai/colorPalette";
import { 
  convertToSVG, 
  applyColorPalette, 
  downloadSVG, 
  convertSVGtoPNG,
  TransformedSVG,
  SVGTransformOptions
} from "@/integrations/ai/svgTransformer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Paintbrush, 
  FileType, 
  FileImage,
  Palette
} from "lucide-react";

interface LogoSVGTransformerProps {
  logo: GeneratedLogo;
  colorPalette?: GeneratedColorPalette | null;
}

export const LogoSVGTransformer: React.FC<LogoSVGTransformerProps> = ({
  logo,
  colorPalette
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<TransformedSVG | null>(null);
  const [colorVariants, setColorVariants] = useState<TransformedSVG[]>([]);
  const [activeTab, setActiveTab] = useState("original");
  const [simplifyLevel, setSimplifyLevel] = useState(5);
  const [colorMode, setColorMode] = useState<'original' | 'monochrome' | 'custom'>('original');

  // Convert the logo to SVG when the component mounts or when the logo changes
  useEffect(() => {
    if (logo) {
      handleConvertToSVG();
    }
  }, [logo]);

  // Generate color variants when the SVG or color palette changes
  useEffect(() => {
    if (svg && colorPalette) {
      generateColorVariants();
    }
  }, [svg, colorPalette]);

  const handleConvertToSVG = async () => {
    setIsConverting(true);
    setError(null);

    try {
      const options: SVGTransformOptions = {
        simplifyLevel,
        colorMode
      };

      if (colorMode === 'custom' && colorPalette) {
        options.customColors = colorPalette.colors;
      }

      const transformedSVG = await convertToSVG(logo.url, options);
      setSvg(transformedSVG);

      // Generate color variants if a color palette is available
      if (colorPalette) {
        generateColorVariants();
      }
    } catch (err) {
      console.error("Error converting to SVG:", err);
      setError("Failed to convert the logo to SVG. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const generateColorVariants = () => {
    if (!svg || !colorPalette) return;

    // Create different color variants based on the color palette
    const variants: TransformedSVG[] = [];

    // Variant 1: Original colors from the SVG
    variants.push(svg);

    // Variant 2: Use the color palette as is
    variants.push(applyColorPalette(svg, colorPalette.colors));

    // Variant 3: Monochrome version using the primary color
    if (colorPalette.colors.length > 0) {
      const primaryColor = colorPalette.colors[0];
      const monochromeColors: Color[] = [
        { name: "Primary", hex: primaryColor.hex, rgb: primaryColor.rgb },
        { name: "Secondary", hex: adjustColorBrightness(primaryColor.hex, -20), rgb: "" },
        { name: "Accent", hex: adjustColorBrightness(primaryColor.hex, 20), rgb: "" },
        { name: "Light", hex: "#FFFFFF", rgb: "255, 255, 255" },
        { name: "Dark", hex: "#000000", rgb: "0, 0, 0" }
      ];
      variants.push(applyColorPalette(svg, monochromeColors));
    }

    // Variant 4: Inverted color palette
    if (colorPalette.colors.length > 0) {
      const invertedColors = colorPalette.colors.map(color => ({
        name: color.name,
        hex: invertColor(color.hex),
        rgb: ""
      }));
      variants.push(applyColorPalette(svg, invertedColors));
    }

    setColorVariants(variants);
  };

  const handleDownloadSVG = (svgToDownload: TransformedSVG) => {
    const filename = `${logo.id}-${activeTab}.svg`;
    downloadSVG(svgToDownload, filename);
  };

  const handleDownloadPNG = async (svgToDownload: TransformedSVG) => {
    try {
      setIsConverting(true);
      const pngUrl = await convertSVGtoPNG(svgToDownload, 1024, 1024);

      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${logo.id}-${activeTab}.png`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading PNG:", err);
      setError("Failed to download PNG. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleSimplifyChange = (value: number[]) => {
    setSimplifyLevel(value[0]);
  };

  const handleColorModeChange = (value: string) => {
    setColorMode(value as 'original' | 'monochrome' | 'custom');
  };

  const handleRegenerate = () => {
    handleConvertToSVG();
  };

  // Helper function to get the current SVG based on the active tab
  const getCurrentSVG = (): TransformedSVG | null => {
    if (!svg) return null;

    if (activeTab === "original") return svg;

    const index = parseInt(activeTab.replace("variant-", ""), 10);
    if (isNaN(index) || index < 1 || index > colorVariants.length - 1) return svg;

    return colorVariants[index];
  };

  // Helper function to adjust color brightness
  const adjustColorBrightness = (hex: string, percent: number): string => {
    // Remove the # if it exists
    hex = hex.replace('#', '');

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Adjust brightness
    r = Math.max(0, Math.min(255, r + (r * percent / 100)));
    g = Math.max(0, Math.min(255, g + (g * percent / 100)));
    b = Math.max(0, Math.min(255, b + (b * percent / 100)));

    // Convert back to hex
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  // Helper function to invert a color
  const invertColor = (hex: string): string => {
    // Remove the # if it exists
    hex = hex.replace('#', '');

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Invert the colors
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileType className="h-5 w-5 text-primary" />
          Logo SVG Transformer
        </CardTitle>
        <CardDescription>
          Convert your logo to SVG and apply different color schemes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Original Logo</h3>
              <div className="border rounded-lg overflow-hidden p-4 bg-gray-50">
                <img 
                  src={logo.url} 
                  alt="Original logo" 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">SVG Version</h3>
              <div className="border rounded-lg overflow-hidden p-4 bg-gray-50 h-full flex items-center justify-center">
                {isConverting ? (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <RefreshCw className="h-8 w-8 animate-spin mb-2" />
                    <p>Converting to SVG...</p>
                  </div>
                ) : svg ? (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: getCurrentSVG()?.svgString || '' }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FileType className="h-8 w-8 mb-2" />
                    <p>SVG will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="simplify-level">Simplification Level</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">Simple</span>
                <Slider
                  id="simplify-level"
                  defaultValue={[simplifyLevel]}
                  max={10}
                  min={1}
                  step={1}
                  onValueChange={handleSimplifyChange}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">Detailed</span>
              </div>
              <p className="text-xs text-gray-500">
                Adjust how simplified the SVG should be. Lower values create simpler SVGs with fewer details.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color-mode">Color Mode</Label>
              <Select value={colorMode} onValueChange={handleColorModeChange}>
                <SelectTrigger id="color-mode">
                  <SelectValue placeholder="Select a color mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Colors</SelectItem>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                  <SelectItem value="custom" disabled={!colorPalette}>
                    Custom Palette {!colorPalette && "(No palette selected)"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose how colors should be applied to the SVG.
              </p>
            </div>

            <Button 
              onClick={handleRegenerate}
              disabled={isConverting}
              className="w-full"
            >
              {isConverting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate SVG
                </>
              )}
            </Button>
          </div>

          {colorVariants.length > 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Color Variants</h3>
              <Tabs 
                defaultValue="original" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="original">Original</TabsTrigger>
                  <TabsTrigger value="variant-1">Palette</TabsTrigger>
                  <TabsTrigger value="variant-2">Monochrome</TabsTrigger>
                  <TabsTrigger value="variant-3">Inverted</TabsTrigger>
                </TabsList>

                {/* Original SVG */}
                <TabsContent value="original" className="pt-4">
                  <div className="flex justify-center">
                    <div 
                      className="border rounded-lg overflow-hidden p-4 bg-gray-50 w-64 h-64 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: svg?.svgString || '' }}
                    />
                  </div>
                </TabsContent>

                {/* Color variants */}
                {colorVariants.slice(1).map((variant, index) => (
                  <TabsContent key={`variant-${index + 1}`} value={`variant-${index + 1}`} className="pt-4">
                    <div className="flex justify-center">
                      <div 
                        className="border rounded-lg overflow-hidden p-4 bg-gray-50 w-64 h-64 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: variant.svgString }}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => getCurrentSVG() && handleDownloadSVG(getCurrentSVG()!)}
            disabled={!svg || isConverting}
          >
            <FileType className="mr-2 h-4 w-4" />
            Download SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => getCurrentSVG() && handleDownloadPNG(getCurrentSVG()!)}
            disabled={!svg || isConverting}
          >
            <FileImage className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Palette className="mr-2 h-4 w-4" />
          {colorPalette ? `Using ${colorPalette.colors.length} colors` : "No color palette selected"}
        </div>
      </CardFooter>
    </Card>
  );
};
