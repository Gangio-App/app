import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HexColorPicker } from 'react-colorful';

type Theme = 'dark' | 'light' | 'system';
type ColorScheme = 'blue' | 'purple' | 'green' | 'orange' | 'red';
type FontFamily = 
  | 'Inter' 
  | 'Roboto Flex' 
  | 'Montserrat' 
  | 'Open Sans' 
  | 'Lato' 
  | 'Comic Neue' 
  | 'Cascadia Mono' 
  | 'Atkinson Hyperlegible Mono' 
  | 'Tiny5';

interface ThemeColors {
  accent: string;
  background: string;
  foreground: string;
  'primary-background': string;
  'primary-header': string;
  'secondary-background': string;
  'secondary-foreground': string;
  'secondary-header': string;
  'tertiary-background': string;
  'tertiary-foreground': string;
  block: string;
  'message-box': string;
  mention: string;
  'scrollbar-thumb': string;
  'scrollbar-track': string;
  'status-online': string;
  'status-away': string;
  'status-busy': string;
  'status-streaming': string;
  'status-invisible': string;
  success: string;
}

interface AppearanceSettings {
  theme: Theme;
  compactMode: boolean;
  messageGrouping: boolean;
  fontSize: number;
  fontFamily: FontFamily;
  fontWeight: number;
  colorScheme: ColorScheme;
  animationsEnabled: boolean;
  saturation: number;
  customColors: ThemeColors;
  useCustomColors: boolean;
}

const AppearancePanel: React.FC = () => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<AppearanceSettings>(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      // Try to get settings from localStorage
      const savedSettings = localStorage.getItem('appearanceSettings');
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch (e) {
          console.error('Failed to parse saved settings:', e);
        }
      }
    }
    
    // Default settings if nothing in localStorage
    return {
      theme: 'dark',
      compactMode: false,
      messageGrouping: true,
      fontSize: 16,
      fontFamily: 'Inter',
      fontWeight: 400,
      colorScheme: 'blue',
      animationsEnabled: true,
      saturation: 100,
      customColors: {
        accent: '#FD6671',
        background: '#292937',
        foreground: '#F6F6F6',
        'primary-background': 'rgb(33 33 44)',
        'primary-header': 'rgb(44 44 55)',
        'secondary-background': 'rgb(28 28 36)',
        'secondary-foreground': '#C8C8C8',
        'secondary-header': 'rgb(37 37 48)',
        'tertiary-background': 'rgb(77 77 88)',
        'tertiary-foreground': 'rgb(133 133 144)',
        block: 'rgb(25 25 30)',
        'message-box': 'rgb(55 55 66)',
        mention: 'rgba(251, 255, 0, 0)',
        'scrollbar-thumb': '#a44937',
        'scrollbar-track': 'transparent',
        'status-online': '#3ABF7E',
        'status-away': '#F39F00',
        'status-busy': '#F84848',
        'status-streaming': '#977EFF',
        'status-invisible': '#A5A5A5',
        success: '#65E572'
      },
      useCustomColors: false
    };
  });
  
  const handleThemeChange = (theme: Theme) => {
    setSettings({ ...settings, theme });
    // localStorage is handled in the useEffect
  };
  
  const handleToggleChange = (key: keyof AppearanceSettings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    // localStorage is handled in the useEffect
  };
  
  const handleSliderChange = (key: 'fontSize' | 'saturation', value: number[]) => {
    setSettings({ ...settings, [key]: value[0] });
    // localStorage is handled in the useEffect
  };
  
  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    setSettings({ ...settings, colorScheme });
    // localStorage is handled in the useEffect
  };
  
  const handleFontFamilyChange = (value: FontFamily) => {
    setSettings({ ...settings, fontFamily: value });
    // Font application is handled in the useEffect
  };
  
  const handleFontWeightChange = (value: number) => {
    setSettings({ ...settings, fontWeight: value });
    // localStorage is handled in the useEffect
  };
  
  const handleCustomColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setSettings({
      ...settings,
      customColors: {
        ...settings.customColors,
        [colorKey]: value
      }
    });
    // localStorage is handled in the useEffect
    // applyThemeColors is called in the useEffect
  };
  
  const handleToggleCustomColors = (value: boolean) => {
    setSettings({ ...settings, useCustomColors: value });
    // localStorage and theme application are handled in the useEffect
  };
  
  // Function to apply theme colors to the document
  const applyThemeColors = () => {
    if (!settings.useCustomColors) return;
    
    Object.entries(settings.customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  };
  
  // Apply theme colors and fonts on component mount and when they change
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    if (settings.useCustomColors) {
      applyThemeColors();
    }
    
    // Apply font family
    document.documentElement.style.setProperty('--font-family', `"${settings.fontFamily}"`);
    document.documentElement.style.fontFamily = settings.fontFamily;
    
    // Apply font weight
    document.documentElement.style.setProperty('--font-weight', settings.fontWeight.toString());
    document.documentElement.style.fontWeight = settings.fontWeight.toString();
    
    // Apply font size
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    
    // Save settings to localStorage whenever they change
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);
  
  // Also apply settings when component mounts to ensure persistence across refreshes
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Apply font family from localStorage on initial load
    document.documentElement.style.setProperty('--font-family', `"${settings.fontFamily}"`);
    document.documentElement.style.fontFamily = settings.fontFamily;
    
    // Apply font weight
    document.documentElement.style.setProperty('--font-weight', settings.fontWeight.toString());
    document.documentElement.style.fontWeight = settings.fontWeight.toString();
    
    // Apply font size
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
    
    // Apply theme colors if needed
    if (settings.useCustomColors) {
      applyThemeColors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Color scheme preview dots
  const colorSchemes = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
      
      {/* Theme Section */}
      <div className="mb-8">
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">THEME</h3>
        <div className="bg-gray-800 rounded-md p-4">
          <RadioGroup 
            value={settings.theme} 
            onValueChange={(value) => handleThemeChange(value as Theme)}
            className="flex flex-col space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="text-white cursor-pointer">Dark</Label>
              </div>
              <div className="w-10 h-6 bg-gray-900 rounded border border-gray-700"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="text-white cursor-pointer">Light</Label>
              </div>
              <div className="w-10 h-6 bg-gray-100 rounded border border-gray-300"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system" className="text-white cursor-pointer">Sync with system</Label>
              </div>
              <div className="w-10 h-6 bg-gradient-to-r from-gray-900 to-gray-100 rounded border border-gray-700"></div>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      {/* Typography Section */}
      <div className="mb-8">
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">TYPOGRAPHY</h3>
        <div className="bg-gray-800 rounded-md p-4 space-y-4">
          <div>
            <h4 className="text-white font-medium mb-2">Font Family</h4>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={settings.fontFamily}
                onChange={(e) => handleFontFamilyChange(e.target.value as FontFamily)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontFamily: settings.fontFamily }}
              >
                <option value="Inter" style={{ fontFamily: 'Inter' }}>Inter</option>
                <option value="Roboto Flex" style={{ fontFamily: 'Roboto Flex' }}>Roboto Flex</option>
                <option value="Montserrat" style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                <option value="Open Sans" style={{ fontFamily: 'Open Sans' }}>Open Sans</option>
                <option value="Lato" style={{ fontFamily: 'Lato' }}>Lato</option>
                <option value="Comic Neue" style={{ fontFamily: 'Comic Neue' }}>Comic Neue</option>
                <option value="Cascadia Mono" style={{ fontFamily: 'Cascadia Mono' }}>Cascadia Mono</option>
                <option value="Atkinson Hyperlegible Mono" style={{ fontFamily: 'Atkinson Hyperlegible Mono' }}>Atkinson Hyperlegible Mono</option>
                <option value="Tiny5" style={{ fontFamily: 'Tiny5' }}>Tiny5</option>
              </select>
            </div>
            
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2">Font Weight</h4>
              <div className="grid grid-cols-3 gap-2">
                {[300, 400, 500, 600, 700, 800].map((weight) => (
                  <button
                    key={weight}
                    className={`py-2 px-3 rounded-md transition-all ${settings.fontWeight === weight ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    onClick={() => handleFontWeightChange(weight)}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-700 rounded-md">
              <p className="text-white" style={{
                fontFamily: settings.fontFamily,
                fontWeight: settings.fontWeight,
                fontSize: `${settings.fontSize}px`
              }}>
                This is a preview of your selected font. The quick brown fox jumps over the lazy dog.
              </p>
              <p className="text-white mt-2" style={{
                fontFamily: settings.fontFamily,
                fontWeight: settings.fontWeight,
                fontSize: `${settings.fontSize}px`
              }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789!@#$%^&*()
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Font Size</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">12px</span>
              <Slider 
                value={[settings.fontSize]}
                min={12}
                max={20}
                step={1}
                onValueChange={(value) => handleSliderChange('fontSize', value)}
                className="flex-grow"
              />
              <span className="text-xs text-gray-400">20px</span>
            </div>
            <div className="text-center text-sm text-gray-400 mt-1">
              {settings.fontSize}px
            </div>
          </div>
        </div>
      </div>
      
      {/* Layout Section */}
      <div className="mb-8">
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">LAYOUT</h3>
        <div className="bg-gray-800 rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Compact Mode</h4>
              <p className="text-sm text-gray-400 mt-1">
                Make messages take up less vertical space.
              </p>
            </div>
            <Switch 
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleToggleChange('compactMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Message Grouping</h4>
              <p className="text-sm text-gray-400 mt-1">
                Group messages from the same user.
              </p>
            </div>
            <Switch 
              checked={settings.messageGrouping}
              onCheckedChange={(checked) => handleToggleChange('messageGrouping', checked)}
            />
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Font Size</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">12px</span>
              <Slider 
                value={[settings.fontSize]}
                min={12}
                max={20}
                step={1}
                onValueChange={(value) => handleSliderChange('fontSize', value)}
                className="flex-grow"
              />
              <span className="text-xs text-gray-400">20px</span>
            </div>
            <div className="text-center text-sm text-gray-400 mt-1">
              {settings.fontSize}px
            </div>
          </div>
        </div>
      </div>
      
      {/* Colors Section */}
      <div className="mb-8">
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">COLORS</h3>
        <div className="bg-gray-800 rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Custom Theme</h4>
              <p className="text-sm text-gray-400 mt-1">
                Customize individual colors for your theme
              </p>
            </div>
            <Switch 
              checked={settings.useCustomColors}
              onCheckedChange={(checked) => handleToggleCustomColors(checked)}
            />
          </div>
          
          {!settings.useCustomColors && (
            <>
              <div>
                <h4 className="text-white font-medium mb-2">Color Scheme</h4>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(colorSchemes) as ColorScheme[]).map((color) => (
                    <button
                      key={color}
                      className={`w-full aspect-square rounded-full border-2 transition-all ${
                        settings.colorScheme === color 
                          ? 'border-white scale-110' 
                          : 'border-transparent hover:border-gray-400'
                      } ${colorSchemes[color]}`}
                      onClick={() => handleColorSchemeChange(color)}
                      aria-label={`${color} theme`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-medium mb-2">Saturation</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">50%</span>
                  <Slider 
                    value={[settings.saturation]}
                    min={50}
                    max={150}
                    step={5}
                    onValueChange={(value) => handleSliderChange('saturation', value)}
                    className="flex-grow"
                  />
                  <span className="text-xs text-gray-400">150%</span>
                </div>
                <div className="text-center text-sm text-gray-400 mt-1">
                  {settings.saturation}%
                </div>
              </div>
            </>
          )}
          
          {settings.useCustomColors && (
            <div className="mt-4">
              <Tabs defaultValue="basics">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basics">Basics</TabsTrigger>
                  <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basics" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPickerItem 
                      label="Accent" 
                      value={settings.customColors.accent}
                      onChange={(value) => handleCustomColorChange('accent', value)}
                    />
                    <ColorPickerItem 
                      label="Background" 
                      value={settings.customColors.background}
                      onChange={(value) => handleCustomColorChange('background', value)}
                    />
                    <ColorPickerItem 
                      label="Foreground" 
                      value={settings.customColors.foreground}
                      onChange={(value) => handleCustomColorChange('foreground', value)}
                    />
                    <ColorPickerItem 
                      label="Message Box" 
                      value={settings.customColors['message-box']}
                      onChange={(value) => handleCustomColorChange('message-box', value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="backgrounds" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPickerItem 
                      label="Primary Background" 
                      value={settings.customColors['primary-background']}
                      onChange={(value) => handleCustomColorChange('primary-background', value)}
                    />
                    <ColorPickerItem 
                      label="Primary Header" 
                      value={settings.customColors['primary-header']}
                      onChange={(value) => handleCustomColorChange('primary-header', value)}
                    />
                    <ColorPickerItem 
                      label="Secondary Background" 
                      value={settings.customColors['secondary-background']}
                      onChange={(value) => handleCustomColorChange('secondary-background', value)}
                    />
                    <ColorPickerItem 
                      label="Secondary Header" 
                      value={settings.customColors['secondary-header']}
                      onChange={(value) => handleCustomColorChange('secondary-header', value)}
                    />
                    <ColorPickerItem 
                      label="Tertiary Background" 
                      value={settings.customColors['tertiary-background']}
                      onChange={(value) => handleCustomColorChange('tertiary-background', value)}
                    />
                    <ColorPickerItem 
                      label="Block" 
                      value={settings.customColors.block}
                      onChange={(value) => handleCustomColorChange('block', value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="status" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPickerItem 
                      label="Status Online" 
                      value={settings.customColors['status-online']}
                      onChange={(value) => handleCustomColorChange('status-online', value)}
                    />
                    <ColorPickerItem 
                      label="Status Away" 
                      value={settings.customColors['status-away']}
                      onChange={(value) => handleCustomColorChange('status-away', value)}
                    />
                    <ColorPickerItem 
                      label="Status Busy" 
                      value={settings.customColors['status-busy']}
                      onChange={(value) => handleCustomColorChange('status-busy', value)}
                    />
                    <ColorPickerItem 
                      label="Status Streaming" 
                      value={settings.customColors['status-streaming']}
                      onChange={(value) => handleCustomColorChange('status-streaming', value)}
                    />
                    <ColorPickerItem 
                      label="Status Invisible" 
                      value={settings.customColors['status-invisible']}
                      onChange={(value) => handleCustomColorChange('status-invisible', value)}
                    />
                    <ColorPickerItem 
                      label="Success" 
                      value={settings.customColors.success}
                      onChange={(value) => handleCustomColorChange('success', value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-4 p-4 bg-gray-700 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-medium">Theme Preview</h4>
                  <Button 
                    onClick={() => applyThemeColors()} 
                    size="sm"
                    variant="outline"
                  >
                    Apply Changes
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 rounded-md" style={{ backgroundColor: settings.customColors.accent }}>
                    <span className="text-xs text-white">Accent</span>
                  </div>
                  <div className="p-2 rounded-md" style={{ backgroundColor: settings.customColors.background }}>
                    <span className="text-xs text-white">Background</span>
                  </div>
                  <div className="p-2 rounded-md" style={{ backgroundColor: settings.customColors['primary-background'] }}>
                    <span className="text-xs text-white">Primary BG</span>
                  </div>
                  <div className="p-2 rounded-md" style={{ backgroundColor: settings.customColors['secondary-background'] }}>
                    <span className="text-xs text-white">Secondary BG</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Accessibility Section */}
      <div>
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">ACCESSIBILITY</h3>
        <div className="bg-gray-800 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">Animations</h4>
              <p className="text-sm text-gray-400 mt-1">
                Enable or disable animations and transitions.
              </p>
            </div>
            <Switch 
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) => handleToggleChange('animationsEnabled', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Color Picker Item Component
interface ColorPickerItemProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPickerItem: React.FC<ColorPickerItemProps> = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
      <div className="flex items-center">
        <div 
          className="w-8 h-8 rounded-md mr-2 cursor-pointer border border-gray-600"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <span className="text-white">{label}</span>
      </div>
      <div className="relative">
        <Input 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-8 bg-gray-800 border-gray-600 text-white text-xs"
        />
        {isOpen && (
          <div className="absolute z-10 right-0 mt-2 p-2 bg-gray-800 rounded-md shadow-lg">
            <HexColorPicker color={value} onChange={onChange} />
            <div className="flex justify-between mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  onChange(value);
                  setIsOpen(false);
                }}
                className="text-xs"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppearancePanel; 