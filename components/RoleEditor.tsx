'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Permissions interface matching the one in RoleManagement.tsx
interface Permissions {
  ADMINISTRATOR: boolean;
  MANAGE_SERVER: boolean;
  MANAGE_ROLES: boolean;
  MANAGE_CHANNELS: boolean;
  MANAGE_INVITES: boolean;
  KICK_MEMBERS: boolean;
  BAN_MEMBERS: boolean;
  CREATE_INVITES: boolean;
  CHANGE_NICKNAME: boolean;
  MANAGE_NICKNAMES: boolean;
  READ_MESSAGES: boolean;
  SEND_MESSAGES: boolean;
  MANAGE_MESSAGES: boolean;
  EMBED_LINKS: boolean;
  ATTACH_FILES: boolean;
  READ_MESSAGE_HISTORY: boolean;
  MENTION_EVERYONE: boolean;
  USE_VOICE: boolean;
  SHARE_SCREEN: boolean;
  PRIORITY_SPEAKER: boolean;
  MUTE_MEMBERS: boolean;
  DEAFEN_MEMBERS: boolean;
  MOVE_MEMBERS: boolean;
  // Channel-specific permissions
  VIEW_CHANNEL: boolean;
  MANAGE_CHANNEL_PERMISSIONS: boolean;
}

// Role interface matching the one in RoleManagement.tsx
interface Role {
  id?: string;
  name: string;
  color: string;
  position?: number;
  isDefault?: boolean;
  permissions: Permissions;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RoleEditorProps {
  role: Partial<Role>;
  isNew?: boolean;
  onSave: (updatedRole: Partial<Role>) => void;
  onCancel: () => void;
}

// Group permissions for UI organization
const permissionGroups = [
  {
    name: 'General Permissions',
    permissions: [
      { key: 'ADMINISTRATOR', label: 'Administrator', description: 'Members with this permission have every permission and bypass channel specific permissions.' },
      { key: 'MANAGE_SERVER', label: 'Manage Server', description: 'Allows members to change the server name and settings.' },
      { key: 'MANAGE_ROLES', label: 'Manage Roles', description: 'Allows members to create and edit roles below their highest role.' },
      { key: 'MANAGE_CHANNELS', label: 'Manage Channels', description: 'Allows members to create, edit, and delete channels.' },
      { key: 'MANAGE_INVITES', label: 'Manage Invites', description: 'Allows members to create, edit, and delete invites.' },
    ],
  },
  {
    name: 'Member Permissions',
    permissions: [
      { key: 'KICK_MEMBERS', label: 'Kick Members', description: 'Allows members to remove members from the server.' },
      { key: 'BAN_MEMBERS', label: 'Ban Members', description: 'Allows members to permanently ban members from the server.' },
      { key: 'CREATE_INVITES', label: 'Create Invites', description: 'Allows members to invite new users to the server.' },
      { key: 'CHANGE_NICKNAME', label: 'Change Nickname', description: 'Allows members to change their own nickname.' },
      { key: 'MANAGE_NICKNAMES', label: 'Manage Nicknames', description: 'Allows members to change nicknames of other members.' },
    ],
  },
  {
    name: 'Channel Permissions',
    permissions: [
      { key: 'VIEW_CHANNEL', label: 'View Channel', description: 'Allows members to view channels they have this permission for.' },
      { key: 'MANAGE_CHANNEL_PERMISSIONS', label: 'Manage Channel Permissions', description: 'Allows members to edit channel-specific permissions for roles.' },
    ],
  },
  {
    name: 'Text Channel Permissions',
    permissions: [
      { key: 'READ_MESSAGES', label: 'Read Messages', description: 'Allows members to view messages in channels they have access to.' },
      { key: 'SEND_MESSAGES', label: 'Send Messages', description: 'Allows members to send messages in channels they have access to.' },
      { key: 'MANAGE_MESSAGES', label: 'Manage Messages', description: 'Allows members to delete or pin messages in channels.' },
      { key: 'EMBED_LINKS', label: 'Embed Links', description: 'Allows links sent by members to display rich embeds.' },
      { key: 'ATTACH_FILES', label: 'Attach Files', description: 'Allows members to upload files.' },
      { key: 'READ_MESSAGE_HISTORY', label: 'Read Message History', description: 'Allows members to read messages sent before they joined the channel.' },
      { key: 'MENTION_EVERYONE', label: 'Mention @everyone', description: 'Allows members to use the @everyone and @here mentions.' },
    ],
  },
  {
    name: 'Voice Channel Permissions',
    permissions: [
      { key: 'USE_VOICE', label: 'Use Voice', description: 'Allows members to speak in voice channels.' },
      { key: 'SHARE_SCREEN', label: 'Share Screen', description: 'Allows members to share their screen in voice channels.' },
      { key: 'PRIORITY_SPEAKER', label: 'Priority Speaker', description: 'Allows members to be more easily heard when speaking.' },
      { key: 'MUTE_MEMBERS', label: 'Mute Members', description: 'Allows members to mute members from speaking in voice channels.' },
      { key: 'DEAFEN_MEMBERS', label: 'Deafen Members', description: 'Allows members to deafen members from hearing voice chat.' },
      { key: 'MOVE_MEMBERS', label: 'Move Members', description: 'Allows members to move members between voice channels.' },
    ],
  },
];

export const RoleEditor: React.FC<RoleEditorProps> = ({ role, isNew = false, onSave, onCancel }) => {
  const [name, setName] = useState(role.name || '');
  const [color, setColor] = useState(role.color || '#43b581');
  const [permissions, setPermissions] = useState<Permissions>(role.permissions || {
    ADMINISTRATOR: false,
    MANAGE_SERVER: false,
    MANAGE_ROLES: false,
    MANAGE_CHANNELS: false,
    MANAGE_INVITES: false,
    KICK_MEMBERS: false,
    BAN_MEMBERS: false,
    CREATE_INVITES: true,
    CHANGE_NICKNAME: true,
    MANAGE_NICKNAMES: false,
    READ_MESSAGES: true,
    SEND_MESSAGES: true,
    MANAGE_MESSAGES: false,
    EMBED_LINKS: true,
    ATTACH_FILES: true,
    READ_MESSAGE_HISTORY: true,
    MENTION_EVERYONE: false,
    USE_VOICE: true,
    SHARE_SCREEN: true,
    PRIORITY_SPEAKER: false,
    MUTE_MEMBERS: false,
    DEAFEN_MEMBERS: false,
    MOVE_MEMBERS: false,
    VIEW_CHANNEL: true,
    MANAGE_CHANNEL_PERMISSIONS: false,
  });
  
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Common color presets
  const colorPresets = [
    '#43b581', // Green
    '#7289da', // Blurple
    '#faa61a', // Yellow
    '#f04747', // Red
    '#593695', // Purple
    '#3498db', // Blue
    '#e67e22', // Orange
    '#9b59b6', // Magenta
    '#1abc9c', // Teal
    '#607d8b', // Slate
  ];
  
  const handleTogglePermission = (key: keyof Permissions) => {
    // Special case for Administrator - if true, it overrides all other permissions
    if (key === 'ADMINISTRATOR') {
      if (!permissions.ADMINISTRATOR) {
        // If we're turning on Administrator, make all permissions true
        const allPermissionsEnabled = Object.keys(permissions).reduce((obj, permKey) => {
          obj[permKey as keyof Permissions] = true;
          return obj;
        }, {} as Permissions);
        
        setPermissions(allPermissionsEnabled);
      } else {
        // If we're turning off Administrator, leave other permissions as they are
        setPermissions({
          ...permissions,
          ADMINISTRATOR: false,
        });
      }
    } else {
      // For other permissions, just toggle them
      setPermissions({
        ...permissions,
        [key]: !permissions[key],
        // If turning on any permission while Administrator is true, keep it true
        // If turning off any permission, Administrator must be false
        ADMINISTRATOR: permissions.ADMINISTRATOR && !permissions[key],
      });
    }
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare the updated role data
      const updatedRole: Partial<Role> = {
        ...role,
        name,
        color,
        permissions,
      };
      
      await onSave(updatedRole);
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const isAdminTabActive = activeTab === 'general' || activeTab === 'members';
  const isTextTabActive = activeTab === 'text';
  const isVoiceTabActive = activeTab === 'voice';
  const isChannelTabActive = activeTab === 'channel';
  
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {isNew ? 'Create New Role' : `Edit Role: ${role.name}`}
        </h2>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700/70 hover:bg-gray-600/70 text-white rounded-md transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-md transition-all duration-200 shadow-lg shadow-emerald-700/20 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSaving ? 'Saving...' : (isNew ? 'Create Role' : 'Save Changes')}
          </motion.button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Panel - Role Details */}
        <div className="md:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4">Role Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="role-name" className="block text-sm font-medium text-gray-300 mb-2">
                Role Name
              </label>
              <input
                id="role-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-gray-700/70 border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                required
                placeholder="Enter role name"
                disabled={role.isDefault}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Role Color
              </label>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full shadow-md flex-shrink-0"
                    style={{ backgroundColor: color }}
                  ></div>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-1 rounded-md bg-gray-700/70 border border-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                    placeholder="#RRGGBB"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-md bg-transparent cursor-pointer"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setColor(preset)}
                      className="w-6 h-6 rounded-full shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-110"
                      style={{
                        backgroundColor: preset,
                        border: color === preset ? '2px solid white' : 'none',
                      }}
                      aria-label={`Select color ${preset}`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex border-b border-gray-700 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'general'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-gray-600'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'members'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-gray-600'
                  }`}
                >
                  Members
                </button>
                <button
                  onClick={() => setActiveTab('channel')}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'channel'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-gray-600'
                  }`}
                >
                  Channels
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'text'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-gray-600'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setActiveTab('voice')}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'voice'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-gray-400 hover:text-white hover:border-b-2 hover:border-gray-600'
                  }`}
                >
                  Voice
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Permissions */}
        <div className="md:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4">Role Permissions</h3>
          
          <div className="space-y-4">
            {/* Render permission group based on active tab */}
            {permissionGroups.map((group) => {
              // Skip groups that don't match the current tab
              if (
                (group.name === 'General Permissions' && !isAdminTabActive) ||
                (group.name === 'Member Permissions' && activeTab !== 'members') ||
                (group.name === 'Channel Permissions' && activeTab !== 'channel') ||
                (group.name === 'Text Channel Permissions' && !isTextTabActive) ||
                (group.name === 'Voice Channel Permissions' && !isVoiceTabActive)
              ) {
                return null;
              }
              
              return (
                <div key={group.name} className="mb-6">
                  <h4 className="text-md font-medium text-emerald-400 mb-3">{group.name}</h4>
                  <div className="space-y-2">
                    {group.permissions.map((permission) => {
                      const permKey = permission.key as keyof Permissions;
                      const isEnabled = permissions[permKey];
                      
                      return (
                        <div key={permission.key} className="flex items-start p-2 hover:bg-gray-700/30 rounded-md transition-colors">
                          <div className="flex-shrink-0 pt-0.5">
                            <button
                              onClick={() => handleTogglePermission(permKey)}
                              className={`w-5 h-5 rounded ${
                                isEnabled
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-gray-700 border border-gray-600'
                              } flex items-center justify-center transition-all duration-200`}
                              aria-checked={isEnabled}
                              role="checkbox"
                            >
                              {isEnabled && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-white cursor-pointer" onClick={() => handleTogglePermission(permKey)}>
                                {permission.label}
                              </label>
                              {permission.key === 'ADMINISTRATOR' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-600/30">
                                  Powerful
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{permission.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 
 