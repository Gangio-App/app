import React, { useState, useCallback } from 'react';
import GifModal from './GifModal';

interface AttachmentProps {
  attachment: {
    id: string;
    type: string;
    url: string;
    previewUrl?: string;
    width?: number;
    height?: number;
    title?: string;
  };
  maxHeight?: number;
}

export const AttachmentRenderer: React.FC<AttachmentProps> = ({ 
  attachment,
  maxHeight = 200
}) => {
  // Enhanced GIF detection with more patterns
  const isGif = 
    attachment.type === 'gif' || 
    (attachment.url && (
      attachment.url.includes('tenor.com') || 
      attachment.url.includes('giphy.com') || 
      attachment.url.includes('tenor.googleapis.com') || 
      attachment.url.endsWith('.gif')
    )) ||
    (attachment.previewUrl && (
      attachment.previewUrl.includes('tenor.com') || 
      attachment.previewUrl.includes('giphy.com') || 
      attachment.previewUrl.includes('tenor.googleapis.com') || 
      attachment.previewUrl.endsWith('.gif')
    ));
  
  // For GIFs, we need state to handle fallbacks
  const [currentUrl, setCurrentUrl] = useState(attachment.url || attachment.previewUrl || '');
  const [errorCount, setErrorCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Handle image loading errors
  const handleError = useCallback(() => {
    console.log(`Error loading GIF (attempt ${errorCount + 1}):`, currentUrl);
    setErrorCount(prevCount => prevCount + 1);
    
    // Try different fallback URLs in sequence
    if (errorCount === 0 && attachment.previewUrl && attachment.previewUrl !== attachment.url) {
      console.log('Trying preview URL:', attachment.previewUrl);
      setCurrentUrl(attachment.previewUrl);
    } else if (errorCount === 1 && attachment.url) {
      // Try with cache busting
      const cacheBuster = `?cb=${Date.now()}`;
      console.log('Trying URL with cache buster:', attachment.url + cacheBuster);
      setCurrentUrl(`${attachment.url}${cacheBuster}`);
    }
  }, [attachment.previewUrl, attachment.url, currentUrl, errorCount]);
  
  // Determine the source for attribution
  const getGifSource = () => {
    if (attachment.url?.includes('giphy.com')) return 'GIPHY';
    if (attachment.url?.includes('tenor.com') || attachment.url?.includes('tenor.googleapis.com')) return 'Tenor';
    return undefined;
  };
  
  if (isGif) {
    return (
      <>
        <div className="relative max-w-sm rounded-md overflow-hidden bg-gray-800">
          <div 
            className="block cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <img 
              src={currentUrl} 
              alt={attachment.title || 'GIF'}
              className="w-full h-auto rounded-md hover:opacity-90 transition-opacity"
              style={{
                maxHeight: `${maxHeight}px`,
                objectFit: 'contain',
                display: 'block' // Ensure proper rendering
              }}
              onError={handleError}
              loading="eager" // Force eager loading
              crossOrigin="anonymous" // Try to avoid CORS issues
            />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {getGifSource() || 'GIF'} • Click to preview
            </div>
          </div>
        </div>
        
        <GifModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          gifUrl={attachment.url || currentUrl}
          title={attachment.title || 'GIF Preview'}
          source={getGifSource()}
        />
      </>
    );
  } else if (attachment.type === 'image' || (attachment.url && attachment.url.match(/\.(jpeg|jpg|gif|png|webp)$/i))) {
    return (
      <div className="relative max-w-sm rounded-md overflow-hidden bg-gray-800">
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
          <img 
            src={attachment.url} 
            alt={attachment.title || "Image attachment"}
            className="w-full h-auto rounded-md hover:opacity-90 transition-opacity"
            style={{
              maxHeight: `${maxHeight}px`,
              objectFit: 'contain'
            }}
            onError={(e) => {
              console.error('Error loading image:', e);
              // Try fallback if available
              if (attachment.previewUrl && attachment.previewUrl !== attachment.url) {
                console.log('Trying fallback preview URL for image');
                e.currentTarget.src = attachment.previewUrl;
              }
            }}
            loading="eager"
            crossOrigin="anonymous"
          />
        </a>
      </div>
    );
  }
  
  // For other attachment types (like files), we could add more renderers here
  return null;
};

export default AttachmentRenderer;
