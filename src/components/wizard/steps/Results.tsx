
import { useState } from "react";
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
} from "lucide-react";

interface ResultsProps {
  data: any;
}

export const Results = ({ data }: ResultsProps) => {
  const [activeTab, setActiveTab] = useState("brand-strategy");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);

  // Simulated data from the AI generation
  const generatedContent = {
    brandName: data.businessName || "NovaBrand",
    mission: data.mission || "To empower businesses with innovative solutions that drive growth and success.",
    vision: data.vision || "A world where every business has the tools and support they need to thrive in the digital era.",
    values: data.values || ["Innovation", "Integrity", "Excellence", "Collaboration"],
    voiceTone: "Friendly, professional, and knowledgeable. Communication should inspire confidence while remaining approachable and jargon-free.",
    targetAudience: "Small to medium-sized businesses looking to establish or strengthen their online presence. Decision-makers aged 30-50 who value quality and results over the lowest price point.",
    brandPersonality: data.visualStyle === "techy" ? "Innovative and forward-thinking" : "Trustworthy and reliable",
    logos: [
      {
        id: 1,
        url: "https://placehold.co/600x400/f38e63/ffffff?text=Logo+1",
        selected: true,
      },
      {
        id: 2,
        url: "https://placehold.co/600x400/f38e63/ffffff?text=Logo+2",
        selected: false,
      },
      {
        id: 3,
        url: "https://placehold.co/600x400/f38e63/ffffff?text=Logo+3",
        selected: false,
      },
      {
        id: 4,
        url: "https://placehold.co/600x400/f38e63/ffffff?text=Logo+4",
        selected: false,
      },
    ],
    colors: [
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

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      // In a real app, this would initiate a download of the brand kit
    }, 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleGenerateMore = () => {
    setIsGeneratingMore(true);
    // Simulate regeneration process
    setTimeout(() => {
      setIsGeneratingMore(false);
      // In a real app, this would generate new logos
    }, 2000);
  };

  const selectLogo = (id: number) => {
    // Would update the selected logo in a real app
    // This is just a placeholder
    console.log(`Selected logo ${id}`);
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
                      onClick={() => handleCopy(generatedContent.mission)}
                    >
                      {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
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
                      onClick={() => handleCopy(generatedContent.vision)}
                    >
                      {isCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
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
                        logo.selected ? "ring-2 ring-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => selectLogo(logo.id)}
                    >
                      <img
                        src={logo.url}
                        alt={`Logo option ${logo.id}`}
                        className="w-full h-auto"
                      />
                      {logo.selected && (
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
                    <li>• Logo Files (SVG, PNG with transparent background, JPG)</li>
                    <li>• Color Palette with HEX, RGB, and CMYK codes</li>
                    <li>• Typography recommendations</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center py-6">
                <Button
                  size="lg"
                  className="px-8"
                  onClick={handleDownload}
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
                <Button variant="outline" className="justify-between">
                  Brand Guidelines (PDF)
                  <Download size={16} />
                </Button>
                <Button variant="outline" className="justify-between">
                  Logo Package (ZIP)
                  <Download size={16} />
                </Button>
                <Button variant="outline" className="justify-between">
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
