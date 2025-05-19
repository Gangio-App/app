import React from 'react';

interface GifModalProps {
  isOpen: boolean;
  onClose: () => void;
  gifUrl: string;
  title?: string;
  source?: string;
}

const GifModal: React.FC<GifModalProps> = ({
  isOpen,
  onClose,
  gifUrl,
  title,
  source
}) => {
  if (!isOpen) return null;
  
  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 overflow-hidden"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">
            {title || 'GIF Preview'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex justify-center items-center p-4">
          <img 
            src={gifUrl} 
            alt={title || "GIF"} 
            className="max-w-full max-h-[70vh] object-contain"
            loading="eager"
            crossOrigin="anonymous"
          />
        </div>
        
        {source && (
          <div className="px-4 pb-4 text-right">
            <span className="text-sm text-gray-400">
              Source: {source}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GifModal;
