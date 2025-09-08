import {
  IoVideocamOutline as Camera,
  IoMicOutline as Mic,
  IoPauseSharp as Pause,
} from 'react-icons/io5';
import { TbScreenshot as Screenshot } from 'react-icons/tb';
import { BsPlay as Play } from 'react-icons/bs';
import { useState, useEffect } from 'react';
import { useRecording } from './hooks/use-recording';
import { useWindowSize } from './hooks/use-window-size';
import { CircularMenu } from './components/radial-menu';
import { CentralDisplay } from './components/center-display';
import { AnnotateIcon, SystemAudioIcon } from './components/icons';
import dslrSound from '../../assets/dslr.wav';
import tickSound from '../../assets/click.wav';
import { playSound } from '../../shared/utils';
import { DeviceSelector } from './components/device-selector';

const hoverSound = new Audio(tickSound);
hoverSound.volume = 0.05;

const screenshotSound = new Audio(dslrSound);
screenshotSound.volume = 0.05;

export default function Page() {
  const { startRecording, stopRecording, togglePause, isRecording, isPaused } = useRecording();
  const dimensions = useWindowSize();

  const [hoveredIndex, setHoveredIndex] = useState(null);
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

        const screenDevice = deviceList.videoDevices.find(d => d.name.toLowerCase().includes('screen'));
        const externalMic = deviceList.audioDevices.find(d => d.name.toLowerCase().includes('external') || !d.name.toLowerCase().includes('monitor'));

        setSelectedVideoDevice(
          deviceList.videoDevices.find(d => d.id === savedVideoId) ||
          screenDevice ||
          deviceList.videoDevices[0] ||
          null
        );
        setSelectedAudioDevice(
          deviceList.audioDevices.find(d => d.id === savedAudioId) ||
          externalMic ||
          deviceList.audioDevices.find(d => d.name.toLowerCase().includes('microphone')) ||
          deviceList.audioDevices[0] ||
          null
        );

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

  const fetchDevices = async (mode) => {
    try {
      const deviceList = await window.api?.core?.getIOdevices();
      setDevices(deviceList || { videoDevices: [], audioDevices: [] });
      setDeviceSelectionMode(mode);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices({ videoDevices: [], audioDevices: [] });
      setDeviceSelectionMode(mode);
    }
  };

  const handleSelectDevice = async (type, device) => {
    if (type === 'Video') {
      setSelectedVideoDevice(device);
      await window.api.core.updateConfig({ videoDeviceId: device.id });
    } else if (type === 'Audio') {
      setSelectedAudioDevice(device);
      await window.api.core.updateConfig({ audioDeviceId: device.id });
    }
  };

  const buttons = [
    {
      icon: <Camera size={30} />,
      action: () => fetchDevices('Video'),
      label: 'Camera',
    },
    {
      icon: <Mic size={30} />,
      action: () => fetchDevices('Audio'),
      label: 'Microphone',
    },
    {
      icon: <AnnotateIcon size={30} />,
      action: () => window.api.annotation.start(),
      label: 'Annotate',
    },
    {
      icon: <Screenshot size={30} />,
      action: () => playSound(screenshotSound),
      label: 'Screenshot',
    },
    {
      icon: isRecording && !isPaused ? <Pause size={30} /> : <Play size={33} />,
      label: isRecording && !isPaused ? 'Pause Recording' : 'Start Recording',
      action: () => {
        if (!isRecording) {
          startRecording({ videoDevice: selectedVideoDevice?.id, audioDevice: selectedAudioDevice?.id });
        } else {
          togglePause();
        }
      },
    },
    {
      icon: <SystemAudioIcon size={30} />,
      action: () => { },
      label: 'System Audio',
    },
  ];

  return (
    <div className="font-sans w-full h-screen select-none">
      <div
        className="w-full h-full bg-base-100 flex justify-center items-center origin-center overflow-hidden shadow-xl transition-[border-radius] duration-300"
        style={{ borderRadius: deviceSelectionMode ? '0' : '100%' }}
      >
        {deviceSelectionMode ? (
          <DeviceSelector
            devices={devices}
            deviceType={deviceSelectionMode}
            onBack={() => setDeviceSelectionMode(null)}
            onSelectDevice={handleSelectDevice}
            selectedDevice={deviceSelectionMode === 'Video' ? selectedVideoDevice : selectedAudioDevice}
          />
        ) : (
          <>
            <CircularMenu
              buttons={buttons}
              dimensions={dimensions}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
              onLeave={() => setHoveredIndex(null)}
              playSound={() => playSound(hoverSound)}
            />
            <CentralDisplay
              isRecording={isRecording}
              isPaused={isPaused}
              stopRecording={stopRecording}
              hoveredIndex={hoveredIndex}
              buttons={buttons}
            />
          </>
        )}
      </div>
    </div>
  );
}
