import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '@/components/ui/Button';
import { MicrophoneIcon, VideoCameraIcon, SpeakerWaveIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

type InputDevice = {
  deviceId: string;
  label: string;
};

type OutputDevice = {
  deviceId: string;
  label: string;
};

type VoiceVideoSettings = {
  inputDevice: string;
  outputDevice: string;
  inputVolume: number;
  outputVolume: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
  videoDevice: string;
  videoQuality: 'low' | 'medium' | 'high' | 'hd';
  videoMirrored: boolean;
  backgroundBlur: boolean;
  backgroundBlurAmount: number;
  pushToTalk: boolean;
  pushToTalkDelay: number;
  voiceActivityDetection: boolean;
  voiceActivityThreshold: number;
};

const VoiceVideoPanel: React.FC = () => {
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<VoiceVideoSettings>(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      // Try to get settings from localStorage
      const savedSettings = localStorage.getItem('voiceVideoSettings');
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
      inputDevice: 'default',
      outputDevice: 'default',
      inputVolume: 100,
      outputVolume: 100,
      noiseSuppression: true,
      echoCancellation: true,
      autoGainControl: true,
      videoDevice: 'default',
      videoQuality: 'medium',
      videoMirrored: true,
      backgroundBlur: false,
      backgroundBlurAmount: 5,
      pushToTalk: false,
      pushToTalkDelay: 200,
      voiceActivityDetection: true,
      voiceActivityThreshold: 50
    };
  });

  const [inputDevices, setInputDevices] = useState<InputDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<OutputDevice[]>([]);
  const [videoDevices, setVideoDevices] = useState<InputDevice[]>([]);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState({
    audio: false,
    video: false
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('voiceVideoSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // Request permissions and enumerate devices on component mount
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions first
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: true 
        });
        
        setPermissionsGranted({
          audio: true,
          video: true
        });
        
        // Stop the stream immediately after getting permissions
        stream.getTracks().forEach(track => track.stop());
        
        // Now enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}...`
          }));
        
        const audioOutputs = devices
          .filter(device => device.kind === 'audiooutput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Speaker ${device.deviceId.slice(0, 5)}...`
          }));
        
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}...`
          }));
        
        setInputDevices(audioInputs);
        setOutputDevices(audioOutputs);
        setVideoDevices(videoInputs);
        
      } catch (error) {
        console.error('Error accessing media devices:', error);
        
        // Update permissions based on error
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            setPermissionsGranted({
              audio: false,
              video: false
            });
          }
        }
      }
    };

    getDevices();
    
    // Cleanup function
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startMicTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: settings.inputDevice !== 'default' ? { exact: settings.inputDevice } : undefined,
          noiseSuppression: settings.noiseSuppression,
          echoCancellation: settings.echoCancellation,
          autoGainControl: settings.autoGainControl
        }
      });
      
      setIsTestingMic(true);
      
      // Create audio analyzer
      const audioContext = new AudioContext();
      const analyzer = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
      
      analyzer.smoothingTimeConstant = 0.8;
      analyzer.fftSize = 1024;
      
      microphone.connect(analyzer);
      analyzer.connect(javascriptNode);
      javascriptNode.connect(audioContext.destination);
      
      javascriptNode.onaudioprocess = () => {
        const array = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(array);
        let values = 0;
        
        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += (array[i]);
        }
        
        const average = values / length;
        setMicLevel(average);
      };
      
      // Stop the test after 5 seconds
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        javascriptNode.disconnect();
        analyzer.disconnect();
        microphone.disconnect();
        audioContext.close();
        setIsTestingMic(false);
        setMicLevel(0);
      }, 5000);
      
    } catch (error) {
      console.error('Error testing microphone:', error);
      setIsTestingMic(false);
    }
  };

  const startVideoPreview = async () => {
    try {
      // Stop any existing preview
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: settings.videoDevice !== 'default' ? { exact: settings.videoDevice } : undefined,
          width: settings.videoQuality === 'hd' ? 1280 : 
                 settings.videoQuality === 'high' ? 960 :
                 settings.videoQuality === 'medium' ? 640 : 320,
          height: settings.videoQuality === 'hd' ? 720 : 
                  settings.videoQuality === 'high' ? 540 :
                  settings.videoQuality === 'medium' ? 480 : 240
        }
      });
      
      setPreviewStream(stream);
      
      // Connect to video element
      const videoElement = document.getElementById('video-preview') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
      }
      
    } catch (error) {
      console.error('Error starting video preview:', error);
    }
  };

  const stopVideoPreview = () => {
    if (previewStream) {
      previewStream.getTracks().forEach(track => track.stop());
      setPreviewStream(null);
      
      // Clear video element
      const videoElement = document.getElementById('video-preview') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = null;
      }
    }
  };

  const handleSettingChange = <K extends keyof VoiceVideoSettings>(
    key: K, 
    value: VoiceVideoSettings[K]
  ) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Voice & Video Settings</h2>
      
      {/* Input Devices Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white flex items-center">
          <MicrophoneIcon className="h-5 w-5 mr-2" />
          Input Devices
        </h3>
        
        {!permissionsGranted.audio ? (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-3 text-yellow-200">
            <p>Microphone access is required for voice settings. Please grant permission.</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => setPermissionsGranted(prev => ({ ...prev, audio: true })))
                .catch(err => console.error('Error getting mic permission:', err))
              }
            >
              Request Access
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="input-device" className="text-white">Microphone</Label>
                <Select 
                  value={settings.inputDevice} 
                  onValueChange={(value: string) => handleSettingChange('inputDevice', value)}
                >
                  <SelectTrigger id="input-device" className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="default">Default Microphone</SelectItem>
                    {inputDevices.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="input-volume" className="text-white">Input Volume</Label>
                  <span className="text-white text-sm">{settings.inputVolume}%</span>
                </div>
                <Slider
                  id="input-volume"
                  min={0}
                  max={100}
                  step={1}
                  value={[settings.inputVolume]}
                  onValueChange={(value) => handleSettingChange('inputVolume', value[0])}
                  className="my-4"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="noise-suppression"
                  checked={settings.noiseSuppression}
                  onCheckedChange={(checked) => handleSettingChange('noiseSuppression', checked)}
                />
                <Label htmlFor="noise-suppression" className="text-white">Noise Suppression</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="echo-cancellation"
                  checked={settings.echoCancellation}
                  onCheckedChange={(checked) => handleSettingChange('echoCancellation', checked)}
                />
                <Label htmlFor="echo-cancellation" className="text-white">Echo Cancellation</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-gain"
                  checked={settings.autoGainControl}
                  onCheckedChange={(checked) => handleSettingChange('autoGainControl', checked)}
                />
                <Label htmlFor="auto-gain" className="text-white">Auto Gain Control</Label>
              </div>
            </div>
            
            <div className="mt-4 flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={startMicTest}
                disabled={isTestingMic}
              >
                Test Microphone
              </Button>
              
              {isTestingMic && (
                <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-100"
                    style={{ width: `${Math.min(micLevel * 2, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Output Devices Section */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center">
          <SpeakerWaveIcon className="h-5 w-5 mr-2" />
          Output Devices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="output-device" className="text-white">Speaker</Label>
            <Select 
              value={settings.outputDevice} 
              onValueChange={(value: string) => handleSettingChange('outputDevice', value)}
            >
              <SelectTrigger id="output-device" className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select speaker" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="default">Default Speaker</SelectItem>
                {outputDevices.map(device => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="output-volume" className="text-white">Output Volume</Label>
              <span className="text-white text-sm">{settings.outputVolume}%</span>
            </div>
            <Slider
              id="output-volume"
              min={0}
              max={100}
              step={1}
              value={[settings.outputVolume]}
              onValueChange={(value) => handleSettingChange('outputVolume', value[0])}
              className="my-4"
            />
          </div>
        </div>
        
        <Button variant="outline">Test Speaker</Button>
      </div>
      
      {/* Video Devices Section */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center">
          <VideoCameraIcon className="h-5 w-5 mr-2" />
          Video Settings
        </h3>
        
        {!permissionsGranted.video ? (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-3 text-yellow-200">
            <p>Camera access is required for video settings. Please grant permission.</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => setPermissionsGranted(prev => ({ ...prev, video: true })))
                .catch(err => console.error('Error getting camera permission:', err))
              }
            >
              Request Access
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="video-device" className="text-white">Camera</Label>
                <Select 
                  value={settings.videoDevice} 
                  onValueChange={(value: string) => handleSettingChange('videoDevice', value)}
                >
                  <SelectTrigger id="video-device" className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="default">Default Camera</SelectItem>
                    {videoDevices.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="video-quality" className="text-white">Video Quality</Label>
                <Select 
                  value={settings.videoQuality} 
                  onValueChange={(value: string) => 
                    handleSettingChange('videoQuality', value as 'low' | 'medium' | 'high' | 'hd')
                  }
                >
                  <SelectTrigger id="video-quality" className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="low">Low (320x240)</SelectItem>
                    <SelectItem value="medium">Medium (640x480)</SelectItem>
                    <SelectItem value="high">High (960x540)</SelectItem>
                    <SelectItem value="hd">HD (1280x720)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="video-mirrored"
                  checked={settings.videoMirrored}
                  onCheckedChange={(checked) => handleSettingChange('videoMirrored', checked)}
                />
                <Label htmlFor="video-mirrored" className="text-white">Mirror Video</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="background-blur"
                  checked={settings.backgroundBlur}
                  onCheckedChange={(checked) => handleSettingChange('backgroundBlur', checked)}
                />
                <Label htmlFor="background-blur" className="text-white">Background Blur</Label>
              </div>
            </div>
            
            {settings.backgroundBlur && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="blur-amount" className="text-white">Blur Amount</Label>
                  <span className="text-white text-sm">{settings.backgroundBlurAmount}</span>
                </div>
                <Slider
                  id="blur-amount"
                  min={1}
                  max={10}
                  step={1}
                  value={[settings.backgroundBlurAmount]}
                  onValueChange={(value) => handleSettingChange('backgroundBlurAmount', value[0])}
                  className="my-2"
                />
              </div>
            )}
            
            <div className="mt-4 flex flex-col space-y-4">
              <div className="flex space-x-4">
                {!previewStream ? (
                  <Button variant="outline" onClick={startVideoPreview}>
                    Start Video Preview
                  </Button>
                ) : (
                  <Button variant="outline" onClick={stopVideoPreview}>
                    Stop Video Preview
                  </Button>
                )}
              </div>
              
              <div className="relative bg-gray-900 rounded-md overflow-hidden aspect-video max-w-md">
                <video 
                  id="video-preview" 
                  className={`w-full h-full object-cover ${settings.videoMirrored ? 'scale-x-[-1]' : ''}`}
                  muted
                  playsInline
                />
                {!previewStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <p>Video preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Voice Activity Section */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center">
          <Cog6ToothIcon className="h-5 w-5 mr-2" />
          Voice Activity
        </h3>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="push-to-talk"
              checked={settings.pushToTalk}
              onCheckedChange={(checked) => handleSettingChange('pushToTalk', checked)}
            />
            <Label htmlFor="push-to-talk" className="text-white">Push to Talk</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="voice-activity"
              checked={settings.voiceActivityDetection}
              onCheckedChange={(checked) => handleSettingChange('voiceActivityDetection', checked)}
              disabled={settings.pushToTalk}
            />
            <Label htmlFor="voice-activity" className="text-white">Voice Activity Detection</Label>
          </div>
        </div>
        
        {settings.pushToTalk && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="ptt-delay" className="text-white">Release Delay</Label>
              <span className="text-white text-sm">{settings.pushToTalkDelay}ms</span>
            </div>
            <Slider
              id="ptt-delay"
              min={0}
              max={1000}
              step={50}
              value={[settings.pushToTalkDelay]}
              onValueChange={(value) => handleSettingChange('pushToTalkDelay', value[0])}
              className="my-2"
            />
          </div>
        )}
        
        {settings.voiceActivityDetection && !settings.pushToTalk && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="vad-threshold" className="text-white">Sensitivity</Label>
              <span className="text-white text-sm">{settings.voiceActivityThreshold}%</span>
            </div>
            <Slider
              id="vad-threshold"
              min={0}
              max={100}
              step={1}
              value={[settings.voiceActivityThreshold]}
              onValueChange={(value) => handleSettingChange('voiceActivityThreshold', value[0])}
              className="my-2"
            />
            <p className="text-gray-400 text-sm mt-1">
              Higher sensitivity means your microphone will activate more easily.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceVideoPanel;
