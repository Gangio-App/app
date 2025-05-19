import React, { useState } from 'react';
import { Modal } from './Modal';
import { Label } from './label';
import { Input } from './Input';
import { Button } from './Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { toast } from 'sonner';

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FriendModal: React.FC<FriendModalProps> = ({
  isOpen,
  onClose
}) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [activeTab, setActiveTab] = useState('add');

  const validateUsername = (input: string): boolean => {
    // Check if the input follows username#discriminator format
    const regex = /^.+#\d{4}$/;
    
    if (!input.trim()) {
      setInputError('Username cannot be empty');
      return false;
    }
    
    if (!regex.test(input)) {
      setInputError('Username must be in the format username#0000');
      return false;
    }
    
    setInputError('');
    return true;
  };

  const handleAddFriend = async () => {
    if (!validateUsername(username)) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Split username and discriminator
      const [name, discriminator] = username.split('#');
      
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: name, discriminator }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setInputError(data.error || 'Failed to add friend');
        return;
      }
      
      setUsername('');
      toast.success('Friend request sent!');
      // Optionally close the modal or switch tabs
      // onClose();
      
    } catch (error) {
      console.error('Error adding friend:', error);
      setInputError('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full space-y-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="add">Add Friend</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Add a Friend</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                You can add friends with their Username and Discriminator.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">
                USERNAME
              </Label>
              <Input
                id="username"
                placeholder="Enter a Username#0000"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {inputError && (
                <p className="text-red-500 text-xs">{inputError}</p>
              )}
            </div>
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFriend}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Friend Request'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="min-h-[200px] flex items-center justify-center">
            <p className="text-zinc-500 dark:text-zinc-400">No pending friend requests</p>
          </TabsContent>
          
          <TabsContent value="blocked" className="min-h-[200px] flex items-center justify-center">
            <p className="text-zinc-500 dark:text-zinc-400">No blocked users</p>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
}; 