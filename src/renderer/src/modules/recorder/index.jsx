import {
  IoVideocamOutline as Camera,
  IoMicOutline as Mic,
  IoPauseSharp as Pause,
} from 'react-icons/io5';
import { RiScreenshotLine as Screenshot } from "react-icons/ri";
import { BsPlay as Play } from 'react-icons/bs';
import { useState, useEffect, useCallback } from 'react';
import { useRecording } from './hooks/use-recording';
import { useWindowSize } from './hooks/use-window-size';
import { CircularMenu } from './components/radial-menu';
import { CentralDisplay } from './components/center-display';
import { AnnotateIcon, SystemAudioIcon } from './components/icons';
import tickSound from '../../assets/click.wav';
import { cn, playSound } from '../../shared/utils';
import { DeviceSelector } from './components/device-selector';
import { ModeSelector } from './components/mode-selector';

const hoverSound = new Audio(tickSound);
hoverSound.volume = 0.05;

export default function Page() {
  const { startRecording, stopRecording, togglePause, isRecording, isPaused, elapsedTime } = useRecording();
  const dimensions = useWindowSize();

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null);
  const [deviceSelectionMode, setDeviceSelectionMode] = useState(null);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState(null);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState(null);

  const [devices, setDevices] = useState({ videoDevices: [], audioDevices: [] });

  useEffect(() => {
    (async () => {
      try {
        const config = await window.api.core.getConfig();
        const deviceList = await window.api?.core?.getIOdevices();

        setDevices(deviceList || { videoDevices: [], audioDevices: [] });

        const savedVideoId = config?.videoDeviceId;
        const savedAudioId = config?.audioDeviceId;

        setSelectedVideoDevice(deviceList.videoDevices.find(d => d.id === savedVideoId));
        setSelectedAudioDevice(deviceList.audioDevices.find(d => d.id === savedAudioId));

        if (!savedVideoId && selectedVideoDevice) {
          await window.api.core.updateConfig({ videoDeviceId: selectedVideoDevice.id });
        }
        if (!savedAudioId && selectedAudioDevice) {
          await window.api.core.updateConfig({ audioDeviceId: selectedAudioDevice.id });
        }
      } catch (error) {
        console.error('Error fetching config or devices:', error);
        setDevices({ videoDevices: [], audioDevices: [] });
      }
    })();
  }, []);

  const showDevices = async (mode) => {
    try {
      const deviceList = await window.api?.core?.getIOdevices();
      setDevices(deviceList || { videoDevices: [], audioDevices: [] });
      setDeviceSelectionMode(mode);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices({ videoDevices: [], audioDevices: [] });
      setDeviceSelectionMode(mode);
    }
    handleLeave()
  };

  const handleSelectDevice = async (type, device) => {
    if (type === 'Video') {
      setSelectedVideoDevice(device);
      await window.api.core.updateConfig({ videoDeviceId: device?.id });
    } else if (type === 'Audio') {
      setSelectedAudioDevice(device);
      await window.api.core.updateConfig({ audioDeviceId: device?.id });
    }
  };

  const buttons = [
    {
      icon: <Camera size={30} />,
      action: () => showDevices('Video'),
      label: 'Camera',
      isDisabled: false
    },
    {
      icon: <Mic size={30} />,
      action: () => showDevices('Audio'),
      label: 'Microphone',
      isDisabled: false
    },
    {
      icon: <AnnotateIcon size={30} />,
      action: () => window.api.annotation.start(),
      label: 'Annotate',
      isDisabled: false
    },
    {
      icon: <Screenshot size={26} />,
      action: () => {
        setSelectionMode('Screenshot');
        handleLeave();
      },
      label: 'Screenshot',
      isDisabled: false
    },
    {
      icon: (!isRecording || isPaused) ? <Play size={33} /> : <Pause size={30} />,
      label: !isRecording ? 'Start Recording' : (isPaused ? 'Resume Recording' : 'Pause Recording'),
      action: () => {
        if (!isRecording) {
          startRecording({ videoDevice: selectedVideoDevice?.id, audioDevice: selectedAudioDevice?.id });
        } else {
          togglePause();
        }
      },
      isDisabled: false
    },
    {
      icon: <SystemAudioIcon size={30} />,
      action: () => { },
      label: 'System Audio',
      isDisabled: false
    },
  ];

  const handleHover = useCallback((index) => {
    setHoveredIndex(index);
    playSound(hoverSound);
  }, [])

  const handleLeave = useCallback(() => {
    setHoveredIndex(null);
  }, [])

  return (
    <div className="font-sans w-full h-screen select-none">
      <div
        className={cn("no-drag w-full h-full bg-base-100 origin-center overflow-hidden shadow-xl ", (!deviceSelectionMode || !selectionMode) && "flex justify-center items-center ")}
        style={{ borderRadius: deviceSelectionMode || selectionMode ? '0' : '100%' }}
      >
        {deviceSelectionMode ? (
          <DeviceSelector
            devices={devices}
            deviceType={deviceSelectionMode}
            onBack={() => setDeviceSelectionMode(null)}
            onSelectDevice={handleSelectDevice}
            selectedDevice={deviceSelectionMode === 'Video' ? selectedVideoDevice : selectedAudioDevice}
          />
        ) : selectionMode ? (
          <ModeSelector
            onBack={() => setSelectionMode(null)}
            type={selectionMode}
            devices={devices}
          />
        ) : (
          <>
            <CircularMenu
              buttons={buttons}
              dimensions={dimensions}
              hoveredIndex={hoveredIndex}
              onHover={handleHover}
              onLeave={handleLeave}
              selectedVideoDevice={selectedVideoDevice}
              selectedAudioDevice={selectedAudioDevice}
            />
            <CentralDisplay
              isRecording={isRecording}
              stopRecording={stopRecording}
              hoveredIndex={hoveredIndex}
              buttons={buttons}
              elapsedTime={elapsedTime}
            />
          </>
        )}
      </div>
    </div>
  );
}
