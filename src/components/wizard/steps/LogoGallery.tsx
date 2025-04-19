import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { GeneratedLogo } from "@/integrations/ai/ideogram";

interface LogoGalleryProps {
  logos: GeneratedLogo[];
  selectedLogo: GeneratedLogo | null;
  onSelectLogo: (logo: GeneratedLogo) => void;
}

export const LogoGallery = ({ 
  logos, 
  selectedLogo, 
  onSelectLogo 
}: LogoGalleryProps) => {
  const [displayedLogos, setDisplayedLogos] = useState<GeneratedLogo[]>([]);

  // Force a refresh of the logos when they change
  useEffect(() => {
    console.log(`LogoGallery: received ${logos?.length || 0} logos`);
    if (logos && Array.isArray(logos)) {
      setDisplayedLogos(logos);
    } else {
      setDisplayedLogos([]);
    }
  }, [logos]);

  if (!displayedLogos || displayedLogos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
        <div className="text-center p-6">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Logos Available</h3>
          <p className="text-gray-500 mb-4">
            Generate logo concepts to see them here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">All Generated Logos</h3>
      <p className="text-gray-500 mb-4">
        Click on a logo to select it as your brand logo. Generate more logos to add to your collection.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedLogos.map((logo, index) => {
          // Ensure each logo has an ID
          const logoId = logo.id || `logo-fallback-${index}`;
          const isSelected = selectedLogo?.id === logoId;
          
          return (
            <div
              key={logoId}
              className={`
                relative border rounded-lg overflow-hidden cursor-pointer transition-all
                ${isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"}
              `}
              onClick={() => onSelectLogo({...logo, id: logoId})}
            >
              <div className="bg-white p-4 flex items-center justify-center min-h-[200px]">
                <img
                  src={logo.url}
                  alt={`Logo concept ${index + 1}`}
                  className="max-w-full max-h-[250px] object-contain"
                  loading="lazy"
                />
              </div>
              <div className="absolute top-2 right-2">
                {isSelected && (
                  <div className="bg-primary text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              <div className="p-2 bg-gray-50 text-xs text-gray-500 border-t">
                Generated #{index + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};