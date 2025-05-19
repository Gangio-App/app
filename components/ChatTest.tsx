import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface MessageAttachment {
  id: string;
  type: string;
  url: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  title?: string;
}

interface Message {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    discriminator: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  attachments?: MessageAttachment[];
}

// Separate component for rendering attachments to avoid hooks in loops
const AttachmentRenderer: React.FC<{ attachment: MessageAttachment; index: number }> = ({ attachment, index }) => {
  console.log(`Rendering attachment:`, attachment);
  
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
  
  if (isGif) {
    return (
      <div className="relative max-w-sm rounded-md overflow-hidden bg-gray-800">
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block">
          <img 
            src={currentUrl} 
            alt={attachment.title || 'GIF'}
            className="w-full h-auto rounded-md hover:opacity-90 transition-opacity"
            style={{
              maxHeight: '200px',
              objectFit: 'contain',
              display: 'block' // Ensure proper rendering
            }}
            onError={handleError}
            loading="eager" // Force eager loading
            crossOrigin="anonymous" // Try to avoid CORS issues
          />
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {attachment.url?.includes('giphy.com') ? 'GIPHY' : 'Tenor'} GIF
          </div>
        </a>
      </div>
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
              maxHeight: '200px',
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
  return null;
};

export const ChatTest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    // Sample text message
    {
      id: uuidv4(),
      content: 'This is a sample text message',
      authorId: 'system',
      author: {
        id: 'system',
        name: 'System',
        discriminator: '0000',
        avatarUrl: null
      },
      createdAt: new Date().toISOString()
    },
    // Sample GIF message with Tenor GIF
    {
      id: uuidv4(),
      content: 'This is a sample GIF message from Tenor',
      authorId: 'system',
      author: {
        id: 'system',
        name: 'System',
        discriminator: '0000',
        avatarUrl: null
      },
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: uuidv4(),
          type: 'gif',
          url: 'https://media.tenor.com/87l1U8Lir8oAAAAC/cookie-and-cream-aiscream-cookie-%26-cream-aiscream.gif',
          previewUrl: 'https://media.tenor.com/87l1U8Lir8oAAAAM/cookie-and-cream-aiscream-cookie-%26-cream-aiscream.gif',
          width: 359,
          height: 270,
          title: 'Cookie And Cream Aiscream Cookie & Cream Aiscream GIF'
        }
      ]
    },
    // Sample GIF message with Giphy GIF
    {
      id: uuidv4(),
      content: 'This is a sample GIF message from Giphy',
      authorId: 'system',
      author: {
        id: 'system',
        name: 'System',
        discriminator: '0000',
        avatarUrl: null
      },
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: uuidv4(),
          type: 'gif',
          url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmJqZWJpMnE5MHZpMnBnbzRxODZ1ZnRtdGNrZzA3dGNmcXNuaHYwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYJlyOwdlT0SeQU/giphy.gif',
          previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmJqZWJpMnE5MHZpMnBnbzRxODZ1ZnRtdGNrZzA3dGNmcXNuaHYwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYJlyOwdlT0SeQU/giphy.gif',
          width: 480,
          height: 270,
          title: 'Happy Dance GIF'
        }
      ]
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState('Ready to test GIF rendering');

  // Add a new text message
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newTextMessage: Message = {
      id: uuidv4(),
      content: newMessage,
      authorId: 'user',
      author: {
        id: 'user',
        name: 'Test User',
        discriminator: '0000',
        avatarUrl: null
      },
      createdAt: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, newTextMessage]);
    setNewMessage('');
    setStatus('Text message added');
  };

  // Add a new GIF message
  const handleSendGif = () => {
    // Create a new GIF message with a random GIF from a predefined list
    const gifOptions = [
      {
        url: 'https://media.tenor.com/87l1U8Lir8oAAAAC/cookie-and-cream-aiscream-cookie-%26-cream-aiscream.gif',
        previewUrl: 'https://media.tenor.com/87l1U8Lir8oAAAAM/cookie-and-cream-aiscream-cookie-%26-cream-aiscream.gif',
        width: 359,
        height: 270,
        title: 'Cookie And Cream Aiscream Cookie & Cream Aiscream GIF'
      },
      {
        url: 'https://media.tenor.com/YnxQ5l1RuQwAAAAC/cat-cute.gif',
        previewUrl: 'https://media.tenor.com/YnxQ5l1RuQwAAAAM/cat-cute.gif',
        width: 498,
        height: 498,
        title: 'Cat Cute GIF'
      },
      {
        url: 'https://media.tenor.com/GdLdgXBD6MMAAAAC/tenor.gif',
        previewUrl: 'https://media.tenor.com/GdLdgXBD6MMAAAAC/tenor.gif',
        width: 220,
        height: 220,
        title: 'Dancing Parrot GIF'
      },
      {
        url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmJqZWJpMnE5MHZpMnBnbzRxODZ1ZnRtdGNrZzA3dGNmcXNuaHYwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYJlyOwdlT0SeQU/giphy.gif',
        previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmJqZWJpMnE5MHZpMnBnbzRxODZ1ZnRtdGNrZzA3dGNmcXNuaHYwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYJlyOwdlT0SeQU/giphy.gif',
        width: 480,
        height: 270,
        title: 'Happy Dance GIF'
      }
    ];
    
    // Select a random GIF from the options
    const selectedGif = gifOptions[Math.floor(Math.random() * gifOptions.length)];
    
    const newGifMessage: Message = {
      id: uuidv4(),
      content: 'Test GIF message',
      authorId: 'user',
      author: {
        id: 'user',
        name: 'Test User',
        discriminator: '0000',
        avatarUrl: null
      },
      createdAt: new Date().toISOString(),
      attachments: [
        {
          id: uuidv4(),
          type: 'gif',
          ...selectedGif
        }
      ]
    };
    
    setMessages(prevMessages => [...prevMessages, newGifMessage]);
    setStatus('GIF message added');
  };
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg max-w-2xl mx-auto my-8">
      <h1 className="text-2xl font-bold text-white mb-4">GIF Rendering Test</h1>
      
      <div className="mb-4 p-3 bg-gray-800 rounded text-sm text-gray-300">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Messages:</strong> {messages.length}</p>
      </div>
      
      <div className="mb-4 h-96 overflow-y-auto bg-gray-800 rounded p-3">
        {messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map(message => (
              <div key={message.id} className="bg-gray-700 rounded p-3">
                <div className="flex items-center mb-1">
                  <span className="font-medium text-emerald-400">{message.author?.name || 'Unknown'}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white">{message.content}</p>
                
                {/* Render attachments if any */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2">
                    {message.attachments.map((attachment, index) => (
                      <AttachmentRenderer 
                        key={attachment.id || `attachment-${index}`}
                        attachment={attachment}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            No messages yet
          </div>
        )}
      </div>
      
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleSendGif}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Send Test GIF
        </button>
      </div>
      
      <div className="mt-4 text-xs text-gray-400">
        <p>This is a test component to verify GIF rendering functionality.</p>
        <p>Check the browser console for detailed logs.</p>
      </div>
    </div>
  );
};

export default ChatTest;
