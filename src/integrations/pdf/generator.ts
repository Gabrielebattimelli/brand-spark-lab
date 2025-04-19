// Import the FormData type from the BrandWizard component
// If there are any TypeScript errors, we'll use a more generic type
import { FormData as BrandWizardFormData } from '@/pages/projects/BrandWizard';

// Define a fallback type in case the import fails
type FormData = BrandWizardFormData | {
  brandName?: string;
  businessName?: string;
  industry?: string;
  productService?: string;
  uniqueSellingProposition?: string;
  
  demographics?: {
    ageRange?: string;
    gender?: string;
    location?: string;
    income?: string;
    education?: string;
    [key: string]: any;
  };
  
  psychographics?: {
    interests?: string[];
    values?: string[];
    painPoints?: string[];
    goals?: string[];
    [key: string]: any;
  };
  
  personalityTraits?: Array<{
    label: string;
    value: number;
  }> | any;
  
  selectedArchetype?: string;
  
  mission?: string;
  vision?: string;
  values?: string[] | any;
  originStory?: string;
  
  competitors?: Array<{
    name: string;
    strengths?: string;
    weaknesses?: string;
  }> | any;
  
  differentiators?: string[] | any;
  
  visualStyle?: string;
  colorPreferences?: string[];
  inspirationKeywords?: string[];
  moodboardUrls?: string[];
  logo?: GeneratedLogo | null;
  
  aiGenerated?: {
    brandName?: string;
    mission?: string;
    vision?: string;
    valueProposition?: string;
    brandEssence?: string;
    brandVoice?: string;
    colorPalette?: GeneratedColorPalette | null;
    logo?: GeneratedLogo | null;
  };
  
  [key: string]: any;
};
import { GeneratedColorPalette } from '@/integrations/ai/colorPalette';
import { GeneratedLogo } from '@/integrations/ai/ideogram';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates complete brand guidelines HTML document using AI
 */
export const generateBrandGuidelinesContent = async (
  data: FormData,
  apiKey: string
): Promise<string> => {
  try {
    // Initialize the Gemini API with the API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Extract key data for the prompt
    const {
      brandName,
      businessName,
      industry,
      productService,
      uniqueSellingProposition,
      demographics,
      psychographics,
      personalityTraits,
      selectedArchetype,
      mission,
      vision,
      values,
      originStory,
      competitors,
      differentiators,
      visualStyle,
      colorPreferences,
      inspirationKeywords,
      moodboardUrls,
      aiGenerated,
    } = data;
    
    // Get the color palette
    const colorPalette = aiGenerated?.colorPalette || null;
    const colors = colorPalette?.colors || [];
    
    // Format color information for the prompt
    let colorInfo = '';
    if (colors.length > 0) {
      colorInfo = 'Color Palette:\n';
      colors.forEach(color => {
        colorInfo += `- ${color.name}: ${color.hex} (RGB: ${color.rgb})\n`;
      });
    } else if (colorPreferences && colorPreferences.length > 0) {
      colorInfo = 'Color Preferences:\n';
      colorPreferences.forEach(color => {
        colorInfo += `- ${color}\n`;
      });
    }
    
    // Format values for the prompt
    let valuesInfo = '';
    if (values) {
      if (Array.isArray(values)) {
        valuesInfo = values.join(', ');
      } else if (typeof values === 'string') {
        valuesInfo = values;
      }
    }
    
    // Format competitors for the prompt
    let competitorsInfo = '';
    if (competitors && Array.isArray(competitors)) {
      competitorsInfo = 'Competitors:\n';
      competitors.forEach(comp => {
        if (typeof comp === 'string') {
          competitorsInfo += `- ${comp}\n`;
        } else if (typeof comp === 'object' && comp !== null) {
          const name = comp.name || 'Competitor';
          const strengths = comp.strengths || '';
          const weaknesses = comp.weaknesses || '';
          
          competitorsInfo += `- ${name}`;
          if (strengths) competitorsInfo += ` (Strengths: ${strengths})`;
          if (weaknesses) competitorsInfo += ` (Weaknesses: ${weaknesses})`;
          competitorsInfo += '\n';
        }
      });
    }
    
    // Format moodboard URLs for the prompt
    let moodboardInfo = '';
    if (moodboardUrls && moodboardUrls.length > 0) {
      moodboardInfo = 'MOODBOARD IMAGES (CRITICAL - You MUST include these exact images in the Visual Identity section):\n';
      moodboardUrls.forEach(url => {
        moodboardInfo += `- ${url}\n`;
      });
      
      // Add an extra reminder about the importance of including the moodboard
      moodboardInfo += '\nIMPORTANT: The moodboard images above MUST be displayed in the Visual Identity section using <img> tags with the exact URLs provided.\n';
    }
    
    // Create a comprehensive prompt for the AI
    const prompt = `
      Create a complete, visually stunning HTML brand guidelines document for "${brandName || businessName || 'Brand'}".
      
      BRAND DETAILS:
      Brand Name: ${brandName || businessName || 'Not specified'}
      Industry: ${industry || 'Not specified'}
      Product/Service: ${productService || 'Not specified'}
      Unique Selling Proposition: ${uniqueSellingProposition || aiGenerated?.valueProposition || 'Not specified'}
      Mission: ${mission || aiGenerated?.mission || 'Not specified'}
      Vision: ${vision || aiGenerated?.vision || 'Not specified'}
      Values: ${valuesInfo || 'Not specified'}
      Brand Archetype: ${selectedArchetype || 'Not specified'}
      Brand Voice: ${aiGenerated?.brandVoice || 'Not specified'}
      Brand Essence: ${aiGenerated?.brandEssence || 'Not specified'}
      Origin Story: ${originStory || 'Not specified'}
      Visual Style: ${visualStyle || 'Not specified'}
      ${colorInfo}
      ${competitorsInfo}
      ${moodboardInfo}
      
      DESIGN REQUIREMENTS:
      1. Create a COMPLETE HTML document with <!DOCTYPE html>, <html>, <head>, and <body> tags
      2. Include embedded CSS in the <head> section for a professional, modern design
      3. Use a clean, professional layout with appropriate white space
      4. Use Google Fonts (like Poppins for headings and Inter for body text)
      5. Create a color scheme based on the brand's color palette or preferences
      6. Include responsive design elements that work on different screen sizes
      7. Add subtle animations or transitions for interactive elements
      8. Use modern CSS features like flexbox or grid for layout
      9. Include a table of contents or navigation
      10. Display all moodboard images in the Visual Identity section using <img> tags with the exact URLs provided
      
      CONTENT SECTIONS:
      1. Cover Page - With brand name, logo placeholder, and a professional header
      2. Introduction - A brief overview of the brand and its purpose
      3. Brand Strategy - Including mission, vision, values, and positioning
      4. Brand Story - The origin story and narrative behind the brand
      5. Target Audience - Who the brand is trying to reach
      6. Brand Personality - The character and tone of the brand
      7. Competitive Analysis - How the brand stands out from competitors
      8. Visual Identity - Guidelines for visual elements, including:
         - Color palette with hex codes and RGB values
         - Typography recommendations
         - MOODBOARD IMAGES (Display all moodboard images provided in the URLs)
         - Visual style guidelines
      9. Brand Voice & Messaging - Communication style and key messages
      10. Applications - Examples of the brand in use (if applicable)
      
      IMPORTANT:
      - The document should be aesthetically pleasing and professional
      - Include interactive elements where appropriate (hover effects, etc.)
      - Make sure the document is complete and can be viewed as a standalone HTML page
      - Include print-friendly styles
      - Add a footer with copyright information
      - The HTML should be valid and well-structured
      - Include comments in the HTML to explain sections
      - CRITICAL: If moodboard URLs are provided, you MUST display these images in the Visual Identity section
      - For moodboard images, use the <img> tag with the src attribute set to the URL provided
      
      Your response should be ONLY the complete HTML document with no additional text before or after.
    `;
    
    // Generate content using the AI model
    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text();
    
    return generatedContent;
  } catch (error) {
    console.error("Error generating brand guidelines content:", error);
    return ""; // Return empty string on error
  }
};

/**
 * Generates HTML content for a brand guidelines PDF
 */
export const generateBrandGuidelinesHTML = async (
  data: FormData,
  selectedLogo?: GeneratedLogo | null
): Promise<string> => {
  // Extract all the necessary data from the form data
  const {
    brandName,
    businessName,
    industry,
    productService,
    uniqueSellingProposition,
    demographics,
    psychographics,
    personalityTraits,
    selectedArchetype,
    mission,
    vision,
    values,
    originStory,
    competitors,
    differentiators,
    visualStyle,
    colorPreferences,
    inspirationKeywords,
    moodboardUrls,
    aiGenerated,
  } = data;

  // Get the color palette
  const colorPalette = aiGenerated?.colorPalette || null;
  const colors = colorPalette?.colors || [];
  
  // Get the primary color for styling
  const primaryColor = colors.length > 0 ? colors[0].hex : '#3b82f6';
  const secondaryColor = colors.length > 1 ? colors[1].hex : '#1e40af';
  const accentColor = colors.length > 2 ? colors[2].hex : '#f97316';
  
  // Create a color swatch HTML
  const colorSwatches = colors.map(color => `
    <div class="color-swatch">
      <div class="color-box" style="background-color: ${color.hex}"></div>
      <div class="color-details">
        <div class="color-name">${color.name}</div>
        <div class="color-hex">${color.hex}</div>
        <div class="color-rgb">RGB: ${color.rgb}</div>
      </div>
    </div>
  `).join('');

  // Format personality traits - handle different possible data structures
  let personalityTraitsHTML = '';
  
  if (personalityTraits) {
    // Check if personalityTraits is an array and has the expected structure
    if (Array.isArray(personalityTraits) && personalityTraits.length > 0 && typeof personalityTraits[0] === 'object') {
      personalityTraitsHTML = personalityTraits.map(trait => {
        // Make sure trait has the expected properties
        if (trait && trait.label && trait.value !== undefined) {
          const labelParts = trait.label.includes(' vs. ') ? trait.label.split(' vs. ') : [trait.label, ''];
          return `
            <div class="personality-trait">
              <div class="trait-label">${trait.label}</div>
              <div class="trait-scale">
                <div class="scale-line">
                  <div class="scale-marker" style="left: ${trait.value}%"></div>
                </div>
                <div class="scale-labels">
                  <span>${labelParts[0]}</span>
                  <span>${labelParts[1]}</span>
                </div>
              </div>
            </div>
          `;
        }
        return '';
      }).join('');
    } else if (typeof personalityTraits === 'string') {
      // If it's a string, just display it as text
      personalityTraitsHTML = `<p>${personalityTraits}</p>`;
    } else if (typeof personalityTraits === 'object' && !Array.isArray(personalityTraits)) {
      // If it's an object but not an array, try to extract values
      personalityTraitsHTML = Object.entries(personalityTraits)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join('');
    }
  }

  // Format values - handle different possible data structures
  let valuesHTML = '';
  
  if (values) {
    if (Array.isArray(values)) {
      valuesHTML = values.map(value => {
        if (typeof value === 'string') {
          return `
            <div class="value-item">
              <div class="value-name">${value}</div>
            </div>
          `;
        } else if (typeof value === 'object' && value !== null) {
          // If it's an object, try to extract a name or label property
          const valueName = value.name || value.label || value.value || JSON.stringify(value);
          return `
            <div class="value-item">
              <div class="value-name">${valueName}</div>
            </div>
          `;
        }
        return '';
      }).join('');
    } else if (typeof values === 'string') {
      // If it's a string, split by commas or display as is
      const valueArray = values.includes(',') ? values.split(',').map(v => v.trim()) : [values];
      valuesHTML = valueArray.map(value => `
        <div class="value-item">
          <div class="value-name">${value}</div>
        </div>
      `).join('');
    } else if (typeof values === 'object' && !Array.isArray(values)) {
      // If it's an object but not an array, try to extract values
      valuesHTML = Object.entries(values)
        .map(([key, value]) => `
          <div class="value-item">
            <div class="value-name">${key}: ${value}</div>
          </div>
        `)
        .join('');
    }
  }

  // Format differentiators - handle different possible data structures
  let differentiatorsHTML = '';
  
  if (differentiators) {
    if (Array.isArray(differentiators)) {
      differentiatorsHTML = differentiators.map(diff => {
        if (typeof diff === 'string') {
          return `<li>${diff}</li>`;
        } else if (typeof diff === 'object' && diff !== null) {
          // If it's an object, try to extract a name or label property
          const diffText = diff.name || diff.label || diff.value || JSON.stringify(diff);
          return `<li>${diffText}</li>`;
        }
        return '';
      }).join('');
    } else if (typeof differentiators === 'string') {
      // If it's a string, split by commas or display as is
      const diffArray = differentiators.includes(',') ? 
        differentiators.split(',').map(d => d.trim()) : [differentiators];
      differentiatorsHTML = diffArray.map(diff => `<li>${diff}</li>`).join('');
    } else if (typeof differentiators === 'object' && !Array.isArray(differentiators)) {
      // If it's an object but not an array, try to extract values
      differentiatorsHTML = Object.entries(differentiators)
        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
        .join('');
    }
  }

  // Format target audience with better error handling
  let demographicsHTML = '';
  
  if (demographics) {
    demographicsHTML = `
      <h3>Demographics</h3>
      <ul>
        ${demographics.ageRange ? `<li><strong>Age Range:</strong> ${demographics.ageRange}</li>` : ''}
        ${demographics.gender ? `<li><strong>Gender:</strong> ${demographics.gender}</li>` : ''}
        ${demographics.location ? `<li><strong>Location:</strong> ${demographics.location}</li>` : ''}
        ${demographics.income ? `<li><strong>Income Level:</strong> ${demographics.income}</li>` : ''}
        ${demographics.education ? `<li><strong>Education:</strong> ${demographics.education}</li>` : ''}
      </ul>
    `;
    
    // If demographics is an object but doesn't have the expected properties, try to extract other properties
    if (!demographics.ageRange && !demographics.gender && !demographics.location && 
        !demographics.income && !demographics.education && typeof demographics === 'object') {
      demographicsHTML = `
        <h3>Demographics</h3>
        <ul>
          ${Object.entries(demographics)
            .filter(([key, value]) => value && typeof value !== 'object')
            .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
            .join('')}
        </ul>
      `;
    }
  }
  
  // Helper function to format a list of items
  const formatList = (items) => {
    if (!items) return '';
    
    if (Array.isArray(items)) {
      return items.map(item => {
        if (typeof item === 'string') {
          return `<li>${item}</li>`;
        } else if (typeof item === 'object' && item !== null) {
          const itemText = item.name || item.label || item.value || JSON.stringify(item);
          return `<li>${itemText}</li>`;
        }
        return '';
      }).join('');
    } else if (typeof items === 'string') {
      const itemArray = items.includes(',') ? items.split(',').map(i => i.trim()) : [items];
      return itemArray.map(item => `<li>${item}</li>`).join('');
    } else if (typeof items === 'object' && !Array.isArray(items)) {
      return Object.entries(items)
        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
        .join('');
    }
    
    return '';
  };
  
  // Format psychographics section
  let psychographicsHTML = '';
  
  if (psychographics) {
    const sections = [];
    
    // Handle interests
    if (psychographics.interests) {
      sections.push(`
        <div class="psycho-item">
          <h4>Interests</h4>
          <ul>
            ${formatList(psychographics.interests)}
          </ul>
        </div>
      `);
    }
    
    // Handle values
    if (psychographics.values) {
      sections.push(`
        <div class="psycho-item">
          <h4>Values</h4>
          <ul>
            ${formatList(psychographics.values)}
          </ul>
        </div>
      `);
    }
    
    // Handle pain points
    if (psychographics.painPoints) {
      sections.push(`
        <div class="psycho-item">
          <h4>Pain Points</h4>
          <ul>
            ${formatList(psychographics.painPoints)}
          </ul>
        </div>
      `);
    }
    
    // Handle goals
    if (psychographics.goals) {
      sections.push(`
        <div class="psycho-item">
          <h4>Goals</h4>
          <ul>
            ${formatList(psychographics.goals)}
          </ul>
        </div>
      `);
    }
    
    // If psychographics is an object but doesn't have the expected properties, try to extract other properties
    if (sections.length === 0 && typeof psychographics === 'object') {
      Object.entries(psychographics).forEach(([key, value]) => {
        if (value && key !== 'interests' && key !== 'values' && key !== 'painPoints' && key !== 'goals') {
          sections.push(`
            <div class="psycho-item">
              <h4>${key.charAt(0).toUpperCase() + key.slice(1)}</h4>
              <ul>
                ${formatList(value)}
              </ul>
            </div>
          `);
        }
      });
    }
    
    psychographicsHTML = sections.join('');
    
    // If psychographics is a string, just display it
    if (typeof psychographics === 'string') {
      psychographicsHTML = `<p>${psychographics}</p>`;
    }
  }
  
  const targetAudienceHTML = `
    <div class="audience-section">
      ${demographicsHTML || '<h3>Demographics</h3><p>No demographic information provided.</p>'}
    </div>
    <div class="audience-section">
      <h3>Psychographics</h3>
      ${psychographicsHTML || '<p>No psychographic information provided.</p>'}
    </div>
  `;

  // Check if we have AI-generated content
  const aiGeneratedContent = data.aiGeneratedGuidelinesContent || '';
  
  // Generate the HTML content
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Brand Guidelines - ${brandName || businessName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
        
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
          --accent-color: ${accentColor};
          --text-color: #333333;
          --background-color: #ffffff;
          --light-gray: #f5f5f5;
          --medium-gray: #e0e0e0;
          --dark-gray: #666666;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          color: var(--text-color);
          background-color: var(--background-color);
          line-height: 1.6;
          padding: 0;
          margin: 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        header {
          text-align: center;
          margin-bottom: 60px;
          padding-bottom: 30px;
          border-bottom: 1px solid var(--medium-gray);
        }
        
        h1, h2, h3, h4 {
          font-family: 'Poppins', sans-serif;
          color: var(--primary-color);
          margin-bottom: 20px;
        }
        
        h1 {
          font-size: 36px;
          margin-bottom: 10px;
          color: var(--text-color);
        }
        
        h2 {
          font-size: 28px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--primary-color);
          margin-top: 50px;
        }
        
        h3 {
          font-size: 22px;
          margin-top: 30px;
        }
        
        h4 {
          font-size: 18px;
          margin-top: 20px;
        }
        
        p {
          margin-bottom: 20px;
        }
        
        .subtitle {
          font-size: 18px;
          color: var(--dark-gray);
          margin-bottom: 5px;
        }
        
        .section {
          margin-bottom: 60px;
        }
        
        .logo-container {
          text-align: center;
          margin: 40px 0;
        }
        
        .logo-container img {
          max-width: 300px;
          max-height: 300px;
        }
        
        .color-palette {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 30px 0;
        }
        
        .color-swatch {
          width: 200px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .color-box {
          height: 100px;
          width: 100%;
        }
        
        .color-details {
          padding: 15px;
          background-color: white;
        }
        
        .color-name {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .color-hex, .color-rgb {
          font-size: 14px;
          color: var(--dark-gray);
        }
        
        .personality-traits {
          margin: 30px 0;
        }
        
        .personality-trait {
          margin-bottom: 25px;
        }
        
        .trait-label {
          font-weight: 500;
          margin-bottom: 10px;
        }
        
        .trait-scale {
          width: 100%;
        }
        
        .scale-line {
          height: 6px;
          background-color: var(--medium-gray);
          border-radius: 3px;
          position: relative;
          margin-bottom: 8px;
        }
        
        .scale-marker {
          position: absolute;
          width: 16px;
          height: 16px;
          background-color: var(--primary-color);
          border-radius: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        
        .scale-labels {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--dark-gray);
        }
        
        .values-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin: 30px 0;
        }
        
        .value-item {
          background-color: var(--light-gray);
          padding: 15px 20px;
          border-radius: 8px;
          border-left: 4px solid var(--primary-color);
        }
        
        .value-name {
          font-weight: 600;
        }
        
        .audience-section {
          margin-bottom: 30px;
        }
        
        .audience-section h3 {
          margin-bottom: 15px;
        }
        
        .audience-section ul {
          list-style-type: none;
          padding-left: 0;
        }
        
        .audience-section li {
          margin-bottom: 8px;
        }
        
        .psycho-item {
          margin-bottom: 20px;
        }
        
        .psycho-item h4 {
          margin-bottom: 10px;
          color: var(--secondary-color);
        }
        
        .psycho-item ul {
          padding-left: 20px;
        }
        
        footer {
          text-align: center;
          margin-top: 80px;
          padding-top: 30px;
          border-top: 1px solid var(--medium-gray);
          color: var(--dark-gray);
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>${brandName || businessName}</h1>
          <p class="subtitle">Brand Guidelines</p>
        </header>
        
        ${aiGeneratedContent ? `
          <!-- AI-Generated Content -->
          <div class="ai-generated-content">
            ${aiGeneratedContent}
          </div>
        ` : `
        <div class="section">
          <h2>Brand Overview</h2>
          
          <div class="logo-container">
            ${selectedLogo ? `<img src="${selectedLogo.url}" alt="${brandName || businessName} Logo">` : ''}
          </div>
          
          <h3>Industry</h3>
          <p>${industry || 'Not specified'}</p>
          
          <h3>Products/Services</h3>
          <p>${productService || 'Not specified'}</p>
          
          <h3>Unique Selling Proposition</h3>
          <p>${uniqueSellingProposition || aiGenerated?.valueProposition || 'Not specified'}</p>
        </div>
        
        <div class="section">
          <h2>Brand Strategy</h2>
          
          <h3>Mission Statement</h3>
          <p>${mission || aiGenerated?.mission || 'Not specified'}</p>
          
          <h3>Vision Statement</h3>
          <p>${vision || aiGenerated?.vision || 'Not specified'}</p>
          
          <h3>Value Proposition</h3>
          <p>${aiGenerated?.valueProposition || uniqueSellingProposition || 'Not specified'}</p>
          
          <h3>Brand Positioning</h3>
          <p>
            ${brandName || businessName} positions itself in the ${industry || 'industry'} as 
            ${uniqueSellingProposition ? `a provider that ${uniqueSellingProposition.toLowerCase()}` : 'a unique provider'}.
            ${differentiators && differentiators.length > 0 ? 
              `Our key differentiators include ${Array.isArray(differentiators) ? differentiators.slice(0, 3).join(', ') : differentiators}.` : ''}
          </p>
          
          <h3>Brand Essence</h3>
          <p>${aiGenerated?.brandEssence || 'Not specified'}</p>
          
          <h3>Brand Archetype</h3>
          <p>${selectedArchetype || 'Not specified'}</p>
          
          <h3>Core Values</h3>
          <div class="values-container">
            ${valuesHTML || '<p>No values specified</p>'}
          </div>
          
          <h3>Brand Personality</h3>
          <div class="personality-traits">
            ${personalityTraitsHTML || '<p>No personality traits specified</p>'}
          </div>
          
          <h3>Brand Voice</h3>
          <p>${aiGenerated?.brandVoice || 'Not specified'}</p>
        </div>
        `}
        
        <div class="section">
          <h2>Target Audience</h2>
          ${targetAudienceHTML || '<p>No target audience specified</p>'}
        </div>
        
        <div class="section">
          <h2>Brand Story</h2>
          <p>${originStory || 'Not specified'}</p>
        </div>
        
        <div class="section">
          <h2>Competitive Analysis</h2>
          
          <h3>Key Competitors</h3>
          ${(() => {
            if (!competitors) return '<p>No competitors specified</p>';
            
            if (Array.isArray(competitors)) {
              if (competitors.length === 0) return '<p>No competitors specified</p>';
              
              return `
                <ul>
                  ${competitors.map(comp => {
                    if (typeof comp === 'string') {
                      return `<li><strong>${comp}</strong></li>`;
                    } else if (typeof comp === 'object' && comp !== null) {
                      const name = comp.name || comp.competitor || 'Competitor';
                      const strengths = comp.strengths || comp.strength || '';
                      const weaknesses = comp.weaknesses || comp.weakness || '';
                      
                      return `
                        <li>
                          <strong>${name}</strong>
                          <ul>
                            ${strengths ? `<li>Strengths: ${strengths}</li>` : ''}
                            ${weaknesses ? `<li>Weaknesses: ${weaknesses}</li>` : ''}
                          </ul>
                        </li>
                      `;
                    }
                    return '';
                  }).join('')}
                </ul>
              `;
            } else if (typeof competitors === 'string') {
              // If it's a string, split by commas or display as is
              const compArray = competitors.includes(',') ? 
                competitors.split(',').map(c => c.trim()) : [competitors];
              
              return `
                <ul>
                  ${compArray.map(comp => `<li><strong>${comp}</strong></li>`).join('')}
                </ul>
              `;
            } else if (typeof competitors === 'object' && !Array.isArray(competitors)) {
              // If it's an object but not an array, try to extract values
              return `
                <ul>
                  ${Object.entries(competitors)
                    .map(([key, value]) => {
                      if (typeof value === 'object' && value !== null) {
                        const strengths = value.strengths || value.strength || '';
                        const weaknesses = value.weaknesses || value.weakness || '';
                        
                        return `
                          <li>
                            <strong>${key}</strong>
                            <ul>
                              ${strengths ? `<li>Strengths: ${strengths}</li>` : ''}
                              ${weaknesses ? `<li>Weaknesses: ${weaknesses}</li>` : ''}
                            </ul>
                          </li>
                        `;
                      } else {
                        return `<li><strong>${key}:</strong> ${value}</li>`;
                      }
                    })
                    .join('')}
                </ul>
              `;
            }
            
            return '<p>No competitors specified</p>';
          })()}
          
          <h3>Differentiators</h3>
          ${differentiators?.length ? `<ul>${differentiatorsHTML}</ul>` : '<p>No differentiators specified</p>'}
        </div>
        
        <div class="section">
          <h2>Visual Identity</h2>
          
          <h3>Visual Style</h3>
          <p>${visualStyle || 'Not specified'}</p>
          
          <h3>Color Palette</h3>
          <div class="color-palette">
            ${colorSwatches || '<p>No color palette specified</p>'}
          </div>
          
          <h3>Typography</h3>
          <div>
            <h4>Headings: Poppins</h4>
            <p style="font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 600;">The quick brown fox jumps over the lazy dog.</p>
            
            <h4>Body: Inter</h4>
            <p style="font-family: 'Inter', sans-serif;">The quick brown fox jumps over the lazy dog.</p>
          </div>
          
          ${moodboardUrls && moodboardUrls.length > 0 ? `
          <h3>Moodboard</h3>
          <div class="moodboard">
            ${moodboardUrls.map(url => `
              <div class="moodboard-image">
                <img src="${url}" alt="Moodboard image" style="max-width: 100%; height: auto; margin-bottom: 10px; border-radius: 4px;">
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${inspirationKeywords && inspirationKeywords.length > 0 ? `
          <h3>Inspiration Keywords</h3>
          <div class="inspiration-keywords">
            <ul>
              ${inspirationKeywords.map(keyword => `<li>${keyword}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
        </div>
        
        <footer>
          <p>© ${new Date().getFullYear()} ${brandName || businessName} - All Rights Reserved</p>
          <p>Generated with BrandSpark</p>
        </footer>
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Converts HTML to PDF
 */
export const convertHTMLToPDF = async (html: string): Promise<Blob> => {
  // In a real implementation, you would use a library like jsPDF or html2pdf.js
  // For this example, we'll create a simple PDF blob
  
  // This is a placeholder - in a real implementation you would use a proper HTML to PDF conversion
  const pdfBlob = new Blob([html], { type: 'application/pdf' });
  return pdfBlob;
};

/**
 * Generates and returns a PDF blob from the brand data
 */
export const generateBrandGuidelinesPDF = async (
  data: FormData,
  selectedLogo?: GeneratedLogo | null,
  apiKey?: string
): Promise<Blob> => {
  let html;
  
  // If API key is provided, use AI to generate a complete HTML document
  if (apiKey) {
    try {
      // Generate complete HTML document using AI
      html = await generateBrandGuidelinesContent(data, apiKey);
      
      // If AI generation failed, fall back to the template-based approach
      if (!html) {
        html = await generateBrandGuidelinesHTML(data, selectedLogo);
      }
    } catch (error) {
      console.error("Error generating AI content for guidelines:", error);
      // Fall back to the template-based approach
      html = await generateBrandGuidelinesHTML(data, selectedLogo);
    }
  } else {
    // If no API key, use the template-based approach
    html = await generateBrandGuidelinesHTML(data, selectedLogo);
  }
  
  const pdfBlob = await convertHTMLToPDF(html);
  return pdfBlob;
};

/**
 * Downloads the generated PDF
 */
export const downloadBrandGuidelinesPDF = async (
  data: FormData,
  selectedLogo?: GeneratedLogo | null,
  filename: string = 'brand-guidelines.pdf',
  apiKey?: string
): Promise<void> => {
  try {
    let html;
    
    // If API key is provided, use AI to generate a complete HTML document
    if (apiKey) {
      try {
        // Generate complete HTML document using AI
        html = await generateBrandGuidelinesContent(data, apiKey);
        
        // If AI generation failed, fall back to the template-based approach
        if (!html) {
          html = await generateBrandGuidelinesHTML(data, selectedLogo);
        }
      } catch (error) {
        console.error("Error generating AI content for guidelines:", error);
        // Fall back to the template-based approach
        html = await generateBrandGuidelinesHTML(data, selectedLogo);
      }
    } else {
      // If no API key, use the template-based approach
      html = await generateBrandGuidelinesHTML(data, selectedLogo);
    }
    
    // Create a blob from the HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open the HTML in a new window
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      throw new Error('Failed to open new window. Please check your popup blocker settings.');
    }
    
    // Add print script to the new window
    newWindow.onload = () => {
      // Add a small delay to ensure the content is fully loaded
      setTimeout(() => {
        newWindow.document.title = filename.replace('.pdf', '');
        
        // Add a print button to make it more user-friendly
        const printButton = newWindow.document.createElement('button');
        printButton.innerHTML = 'Print / Save as PDF';
        printButton.style.position = 'fixed';
        printButton.style.top = '10px';
        printButton.style.right = '10px';
        printButton.style.zIndex = '9999';
        printButton.style.padding = '10px 20px';
        printButton.style.backgroundColor = '#4F46E5';
        printButton.style.color = 'white';
        printButton.style.border = 'none';
        printButton.style.borderRadius = '5px';
        printButton.style.cursor = 'pointer';
        printButton.style.fontFamily = 'Inter, sans-serif';
        printButton.style.fontWeight = 'bold';
        
        printButton.onclick = () => {
          printButton.style.display = 'none';
          newWindow.print();
          setTimeout(() => {
            printButton.style.display = 'block';
          }, 1000);
        };
        
        newWindow.document.body.appendChild(printButton);
        
        // Add instructions
        const instructions = newWindow.document.createElement('div');
        instructions.innerHTML = `
          <div style="position: fixed; bottom: 10px; right: 10px; background-color: rgba(255, 255, 255, 0.9); 
                      padding: 10px; border-radius: 5px; border: 1px solid #ccc; max-width: 300px; z-index: 9999;
                      font-family: Inter, sans-serif; font-size: 14px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px 0; font-weight: bold;">To save as PDF:</p>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Click the "Print / Save as PDF" button</li>
              <li>Select "Save as PDF" as the destination</li>
              <li>Click "Save"</li>
            </ol>
          </div>
        `;
        newWindow.document.body.appendChild(instructions);
      }, 1000);
    };
    
    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000); // Clean up after 1 minute
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

/**
 * Previews the generated HTML in a new window
 */
export const previewBrandGuidelinesHTML = async (
  data: FormData,
  selectedLogo?: GeneratedLogo | null,
  apiKey?: string
): Promise<Window | null> => {
  try {
    let html;
    
    // If API key is provided, use AI to generate a complete HTML document
    if (apiKey) {
      try {
        // Generate complete HTML document using AI
        html = await generateBrandGuidelinesContent(data, apiKey);
        
        // If AI generation failed, fall back to the template-based approach
        if (!html) {
          html = await generateBrandGuidelinesHTML(data, selectedLogo);
        }
      } catch (error) {
        console.error("Error generating AI content for guidelines:", error);
        // Fall back to the template-based approach
        html = await generateBrandGuidelinesHTML(data, selectedLogo);
      }
    } else {
      // If no API key, use the template-based approach
      html = await generateBrandGuidelinesHTML(data, selectedLogo);
    }
    
    // Create a blob from the HTML
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open the HTML in a new window
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      throw new Error('Failed to open new window. Please check your popup blocker settings.');
    }
    
    // Add title to the new window
    newWindow.onload = () => {
      newWindow.document.title = `${data.brandName || data.businessName || 'Brand'} Guidelines Preview`;
    };
    
    // Clean up the URL object
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000); // Clean up after 1 minute
    
    return newWindow;
  } catch (error) {
    console.error('Error previewing HTML:', error);
    throw error;
  }
};