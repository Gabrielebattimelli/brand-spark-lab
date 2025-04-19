import { FormData } from '@/pages/projects/BrandWizard';
import { GeneratedColorPalette } from '@/integrations/ai/colorPalette';
import { GeneratedLogo } from '@/integrations/ai/ideogram';

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

  // Format personality traits
  const personalityTraitsHTML = personalityTraits?.map(trait => `
    <div class="personality-trait">
      <div class="trait-label">${trait.label}</div>
      <div class="trait-scale">
        <div class="scale-line">
          <div class="scale-marker" style="left: ${trait.value}%"></div>
        </div>
        <div class="scale-labels">
          <span>${trait.label.split(' vs. ')[0]}</span>
          <span>${trait.label.split(' vs. ')[1]}</span>
        </div>
      </div>
    </div>
  `).join('') || '';

  // Format values
  const valuesHTML = values?.map(value => `
    <div class="value-item">
      <div class="value-name">${value}</div>
    </div>
  `).join('') || '';

  // Format differentiators
  const differentiatorsHTML = differentiators?.map(diff => `
    <li>${diff}</li>
  `).join('') || '';

  // Format target audience
  const targetAudienceHTML = `
    <div class="audience-section">
      <h3>Demographics</h3>
      <ul>
        ${demographics?.ageRange ? `<li><strong>Age Range:</strong> ${demographics.ageRange}</li>` : ''}
        ${demographics?.gender ? `<li><strong>Gender:</strong> ${demographics.gender}</li>` : ''}
        ${demographics?.location ? `<li><strong>Location:</strong> ${demographics.location}</li>` : ''}
        ${demographics?.income ? `<li><strong>Income Level:</strong> ${demographics.income}</li>` : ''}
        ${demographics?.education ? `<li><strong>Education:</strong> ${demographics.education}</li>` : ''}
      </ul>
    </div>
    <div class="audience-section">
      <h3>Psychographics</h3>
      ${psychographics?.interests?.length ? `
        <div class="psycho-item">
          <h4>Interests</h4>
          <ul>
            ${psychographics.interests.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${psychographics?.values?.length ? `
        <div class="psycho-item">
          <h4>Values</h4>
          <ul>
            ${psychographics.values.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${psychographics?.painPoints?.length ? `
        <div class="psycho-item">
          <h4>Pain Points</h4>
          <ul>
            ${psychographics.painPoints.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${psychographics?.goals?.length ? `
        <div class="psycho-item">
          <h4>Goals</h4>
          <ul>
            ${psychographics.goals.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;

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
          ${competitors?.length ? `
            <ul>
              ${competitors.map(comp => `
                <li>
                  <strong>${comp.name}</strong>
                  <ul>
                    <li>Strengths: ${comp.strengths || 'Not specified'}</li>
                    <li>Weaknesses: ${comp.weaknesses || 'Not specified'}</li>
                  </ul>
                </li>
              `).join('')}
            </ul>
          ` : '<p>No competitors specified</p>'}
          
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
  selectedLogo?: GeneratedLogo | null
): Promise<Blob> => {
  const html = await generateBrandGuidelinesHTML(data, selectedLogo);
  const pdfBlob = await convertHTMLToPDF(html);
  return pdfBlob;
};

/**
 * Downloads the generated PDF
 */
export const downloadBrandGuidelinesPDF = async (
  data: FormData,
  selectedLogo?: GeneratedLogo | null,
  filename: string = 'brand-guidelines.pdf'
): Promise<void> => {
  const html = await generateBrandGuidelinesHTML(data, selectedLogo);
  
  // Create a temporary iframe to display the HTML
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  // Write the HTML content to the iframe
  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();
    
    // Trigger print dialog which allows saving as PDF
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Remove the iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  }
};

/**
 * Previews the generated HTML in a new window
 */
export const previewBrandGuidelinesHTML = async (
  data: FormData,
  selectedLogo?: GeneratedLogo | null
): Promise<Window | null> => {
  const html = await generateBrandGuidelinesHTML(data, selectedLogo);
  
  // Open a new window and write the HTML content
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
  
  return newWindow;
};