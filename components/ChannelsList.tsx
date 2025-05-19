import React from 'react';

type ChannelType = 'text' | 'voice' | 'video';

type Channel = {
  id: string;
  name: string;
  type: ChannelType;
  unreadCount?: number;
};

type Category = {
  id: string;
  name: string;
  channels: Channel[];
  isCollapsed?: boolean;
};

interface ChannelsListProps {
  categories: Category[];
  serverName: string;
  activeChannelId?: string;
  onChannelClick: (channelId: string) => void;
  onCategoryToggle: (categoryId: string) => void;
}

export const ChannelsList: React.FC<ChannelsListProps> = ({
  categories,
  serverName,
  activeChannelId,
  onChannelClick,
  onCategoryToggle,
}) => {
  const getChannelIcon = (type: ChannelType) => {
    switch (type) {
      case 'text':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5 discord-channel-symbol"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        );
      case 'voice':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5 discord-channel-symbol"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        );
      case 'video':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-5 h-5 discord-channel-symbol"
          >
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="discord-channel-list h-full w-60 flex flex-col">
      {/* Server name header */}
      <div className="p-4 shadow-sm font-bold text-header-primary border-b border-background-tertiary flex justify-between items-center">
        <h2 className="truncate">{serverName}</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-text-muted cursor-pointer hover:text-text-normal"
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <div 
              className="text-xs font-semibold text-text-muted uppercase px-1 py-2 flex items-center cursor-pointer hover:text-text-normal"
              onClick={() => onCategoryToggle(category.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-3 h-3 mr-1 transition-transform ${!category.isCollapsed ? 'rotate-90' : ''}`}
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>
              {category.name}
            </div>

            {!category.isCollapsed && (
              <div className="ml-2">
                {category.channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`discord-channel ${activeChannelId === channel.id ? 'active' : ''}`}
                    onClick={() => onChannelClick(channel.id)}
                  >
                    {getChannelIcon(channel.type)}
                    <span className="truncate">{channel.name}</span>
                    
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <div className="ml-auto bg-red text-white rounded-full px-1.5 text-xs font-semibold">
                        {channel.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User info */}
      <div className="p-2 bg-background-tertiary mt-auto flex items-center">
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center mr-2">
          <span className="text-white font-semibold text-sm">U</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-header-primary truncate">User</div>
          <div className="text-xs text-text-muted truncate">#0000</div>
        </div>
        <div className="flex space-x-1">
          <button className="text-text-muted hover:text-text-normal p-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
              <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
            </svg>
          </button>
          <button className="text-text-muted hover:text-text-normal p-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
            </svg>
          </button>
          <button className="text-text-muted hover:text-text-normal p-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L5.03 5.196c-.84-.3-1.8.114-2.227.91l-1.09 2.02c-.424.8-.087 1.83.67 2.396l1.913 1.427c.085.063.125.175.127.281.013.428.282.78.355 1.023.325 1.084.809 1.648 1.254 1.86a.75.75 0 01.285.038l1.797.684c.711.27 1.485-.066 1.9-.701l.827-1.28c.051-.08.149-.125.247-.122.099.004.197.042.249.121l.83 1.28c.414.636 1.188.973 1.9.701l1.796-.683a.75.75 0 01.285-.038c.445-.212.93-.776 1.254-1.86.073-.243.142-.595.355-1.023.002-.106.042-.218.127-.28l1.913-1.428c.757-.565 1.094-1.596.67-2.396l-1.09-2.02c-.427-.795-1.387-1.21-2.228-.91l-2.286.693c-.116.043-.283.031-.45-.083a7.49 7.49 0 00-.985-.57c-.182-.087-.277-.227-.297-.348l-.179-1.073c-.152-.903-.933-1.567-1.85-1.567h-2.184z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}; 