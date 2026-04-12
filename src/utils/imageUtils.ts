export const convertWebPToJPG = async (webpUrl: string): Promise<string> => {
  try {
    // Fetch the WebP image
    const response = await fetch(webpUrl);
    const blob = await response.blob();
    
    // Create an image element
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image onto the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        
        // Convert to JPEG
        const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(jpegUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Create object URL from blob
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Error converting WebP to JPG:', error);
    throw error;
  }
};