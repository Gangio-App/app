import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange?: (url: string) => void;
  size?: number;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  size = 100
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session, status } = useSession();

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('AvatarUpload: Session status:', status, 'Session data:', session);

    // Basic session check, actual token for header is not used here
    if (status === 'loading') {
      setError('Verifying session, please try again in a moment...');
      console.log('AvatarUpload: Session status is loading.');
      return;
    }

    if (status === 'unauthenticated' || !session || !session.user || !session.user.id) {
      setError('User not authenticated. Please log in to upload an avatar.');
      console.error('AvatarUpload: User unauthenticated or session/user.id missing. Status:', status, 'Session:', session);
      return;
    }

    // Check file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      setError('Avatar image must be less than 4MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload avatar
    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('avatar', file);
      

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        // Cookies should be sent automatically by the browser
        body: formData
      });

      if (!response.ok) {
        // Try to parse JSON, but handle cases where it might not be JSON (e.g., 405 error page)
        let errorMsg = 'Failed to upload avatar';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || `Failed to upload avatar: ${response.statusText}`;
        } catch (e) {
          errorMsg = `Failed to upload avatar: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      // Call the onAvatarChange callback with the new avatar URL
      if (onAvatarChange && data.avatarUrl) { // Expect data.avatarUrl from /api/profile/avatar
        onAvatarChange(data.avatarUrl);
      } else if (!data.avatarUrl) {
        throw new Error('New avatar URL (avatarUrl) not found in response.');
      }

    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
      // Reset preview on error
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Use the preview if available, otherwise use the current avatar URL
  const displayUrl = avatarPreview || currentAvatarUrl || '/default-avatar.png';

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`relative rounded-full overflow-hidden cursor-pointer border-2 border-emerald-500/40 hover:border-emerald-500/80 transition-colors`}
        style={{ width: size, height: size }}
        onClick={handleClick}
      >
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : null}
        
        <Image 
          src={displayUrl} 
          alt="User Avatar" 
          fill 
          className="object-cover"
          onError={() => {
            // Fallback to default avatar if the image fails to load
            if (displayUrl !== '/default-avatar.png') {
              setAvatarPreview('/default-avatar.png');
            }
          }}
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <button 
        onClick={handleClick}
        className="mt-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors"
      >
        Change Avatar
      </button>
    </div>
  );
};

export default AvatarUpload;
