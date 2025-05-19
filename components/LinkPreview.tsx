'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
};

interface LinkPreviewProps {
  url: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API endpoint to fetch the link preview data
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch link preview');
        }
        
        const data = await response.json();
        setPreviewData(data);
      } catch (err) {
        console.error('Error fetching link preview:', err);
        setError('Failed to load preview');
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchLinkPreview();
    }
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2 my-1 rounded-md bg-gray-800/70 border border-gray-700 backdrop-blur-sm">
        <div className="text-xs text-gray-300 flex items-center">
          <div className="w-3 h-3 mr-2 rounded-full bg-emerald-500/30 border border-emerald-500/50 animate-pulse"></div>
          Loading preview...
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    return null; // Don't show anything if there's an error
  }

  return (
    <a 
      href={previewData.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group block p-3 my-2 rounded-md bg-gray-800/80 border border-gray-700/80 hover:border-emerald-600/50 hover:bg-gray-800/95 transition-all duration-200 shadow-md backdrop-blur-sm"
    >
      <div className="flex items-start gap-3">
        {previewData.image && (
          <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded relative group-hover:shadow-emerald-500/20 shadow-sm">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-300 hover:scale-110" 
              style={{ backgroundImage: `url(${previewData.image})` }}
            ></div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {previewData.favicon && (
            <div className="flex items-center gap-1 mb-1">
              <div 
                className="w-4 h-4 bg-contain bg-no-repeat rounded-sm overflow-hidden" 
                style={{ backgroundImage: `url(${previewData.favicon})` }}
              ></div>
              <span className="text-xs text-emerald-400/90 truncate">
                {new URL(previewData.url).hostname}
              </span>
            </div>
          )}
          <h3 className="font-medium text-sm text-white line-clamp-1 group-hover:text-emerald-400">
            {previewData.title || "No title"}
          </h3>
          {previewData.description && (
            <p className="text-xs text-gray-300 mt-1 line-clamp-2 opacity-80">
              {previewData.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;
