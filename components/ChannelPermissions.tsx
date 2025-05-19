import React, { useState, useEffect } from 'react';
import { Channel, Role } from '@/types/models';
// Create a simple spinner component instead of importing one
import { motion } from 'framer-motion';

// Simple Spinner component
const Spinner = ({ size = "default", className = "" }: { size?: "sm" | "default", className?: string }) => {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div className={`${sizeClass} animate-spin rounded-full border-2 border-t-transparent border-blue-500 ${className}`}></div>
  );
};

interface ChannelPermissionProps {
  serverId: string;
  userId: string;
  roles: Role[];
  channels: Channel[];
}

interface ChannelPermission {
  read: boolean;
  write: boolean;
  react: boolean;
  embed: boolean;
  upload: boolean;
}

export const ChannelPermissions: React.FC<ChannelPermissionProps> = ({ 
  serverId, 
  userId,
  roles, 
  channels 
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(roles && roles.length > 0 ? roles[0] : null);
  const role = selectedRole;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<Record<string, ChannelPermission>>({});
  
  // Fetch current channel permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!role) return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`/api/servers/${serverId}/roles/${role._id}/channel-permissions`);
        if (!response.ok) {
          throw new Error('Failed to fetch channel permissions');
        }
        
        const data = await response.json();
        setPermissions(data.channelPermissions || {});
      } catch (err) {
        console.error('Error fetching channel permissions:', err);
        setError('Failed to load channel permissions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPermissions();
  }, [serverId, role]);
  
  // Handle permission toggle
  const handlePermissionToggle = (channelId: string, permType: keyof ChannelPermission) => {
    setPermissions(prev => {
      const channelPerms = prev[channelId] || {
        read: false,
        write: false,
        react: false,
        embed: false,
        upload: false
      };
      
      return {
        ...prev,
        [channelId]: {
          ...channelPerms,
          [permType]: !channelPerms[permType]
        }
      };
    });
  };
  
  // Save permissions
  const savePermissions = async () => {
    if (!role) return;
    
    setSaving(true);
    setError('');
    
    try {
      const response = await fetch(`/api/servers/${serverId}/roles/${role._id}/channel-permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ channelPermissions: permissions })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save permissions');
      }
      
      // Show success message or notification here
      console.log('Permissions saved successfully');
    } catch (err) {
      console.error('Error saving permissions:', err);
      setError('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-4"><Spinner /></div>;
  }
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Channel Permissions for {role?.name}</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-gray-800 rounded-md p-4">
        <div className="grid grid-cols-6 gap-2 font-semibold pb-2 border-b border-gray-700">
          <div className="col-span-1">Channel</div>
          <div className="col-span-1 text-center">Read</div>
          <div className="col-span-1 text-center">Write</div>
          <div className="col-span-1 text-center">React</div>
          <div className="col-span-1 text-center">Embed</div>
          <div className="col-span-1 text-center">Upload</div>
        </div>
        
        {channels.map(channel => {
          // Handle potential undefined _id by using string or fallback to a generated id
          const channelId = channel._id ? channel._id.toString() : `temp-${channel.name}`;
          const channelPerms = permissions[channelId] || {
            read: false,
            write: false,
            react: false,
            embed: false,
            upload: false
          };
          
          return (
            <motion.div 
              key={channelId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-6 gap-2 py-2 border-b border-gray-700"
            >
              <div className="col-span-1 flex items-center">
                <span className="truncate">{channel.name}</span>
              </div>
              
              {(['read', 'write', 'react', 'embed', 'upload'] as const).map(permType => (
                <div key={permType} className="col-span-1 flex justify-center items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={channelPerms[permType]}
                      onChange={() => handlePermissionToggle(channelId, permType)}
                    />
                    <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={savePermissions}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          {saving ? <Spinner size="sm" className="mr-2" /> : null}
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>
    </div>
  );
}; 
 