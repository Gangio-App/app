"use client";

import React, { createContext, useContext, useState } from "react";

// Create context for managing tab state
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (id: string) => void;
}>({
  activeTab: "",
  setActiveTab: () => {},
});

// Main Tabs component that wraps the tab list and content
interface TabsProps {
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  onValueChange,
  children,
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

// TabsList component - container for the tab buttons
interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className, children }) => {
  return (
    <div className={`flex border-b border-gray-700 ${className || ""}`}>
      {children}
    </div>
  );
};

// TabsTrigger component - the actual tab buttons
interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
}) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
        isActive
          ? "text-emerald-400 border-b-2 border-emerald-400"
          : "text-gray-400 hover:text-white hover:border-b-2 hover:border-gray-600"
      } ${className || ""}`}
    >
      {children}
    </button>
  );
};

// TabsContent component - the content area for each tab
interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
}) => {
  const { activeTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  if (!isActive) return null;

  return <div className={className}>{children}</div>;
}; 