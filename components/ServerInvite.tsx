import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Spinner } from './ui/Spinner';
import { toast } from 'react-hot-toast';

interface ServerInviteProps {
  serverId: string;
  userId: string;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const ServerInvite = ({ serverId, userId, isAdmin, isOpen, onClose }: ServerInviteProps) => {
  const [inviteCode, setInviteCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && serverId) {
      fetchInviteCode();
    }
  }, [isOpen, serverId]);

  const fetchInviteCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/servers/${serverId}/invite`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invite code');
      }
      
      const data = await response.json();
      setInviteCode(data.inviteCode || '');
    } catch (error) {
      console.error('Error fetching invite code:', error);
      toast.error('Failed to fetch invite code');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = async () => {
    try {
      setRegenerating(true);
      const response = await fetch(`/api/servers/${serverId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }
      
      const data = await response.json();
      setInviteCode(data.inviteCode);
      toast.success('New invite code generated!');
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Failed to generate invite code');
    } finally {
      setRegenerating(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/invite/${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard!');
  };

  const inviteLink = inviteCode ? `${window.location.origin}/invite/${inviteCode}` : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite People">
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Invite Link</h3>
              <p className="text-sm text-gray-500">
                Share this link with others to invite them to your server
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Input
                value={inviteLink}
                readOnly
                className="flex-1"
                placeholder="No invite code available"
              />
              <Button onClick={copyInviteLink} disabled={!inviteCode}>
                Copy
              </Button>
            </div>
            
            {isAdmin && (
              <div className="pt-4 border-t border-gray-200">
                <Button 
                  onClick={generateInviteCode} 
                  variant="outline"
                  disabled={regenerating}
                  className="w-full"
                >
                  {regenerating ? <Spinner size="sm" /> : 'Generate New Invite Code'}
                </Button>
                <p className="mt-2 text-xs text-gray-500">
                  Generating a new link will make the previous link invalid
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}; 
 