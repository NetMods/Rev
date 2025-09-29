import {
  IoVideocamOutline as Camera,
  IoMicOutline as Mic,
  IoArrowBack as BackIcon,
} from 'react-icons/io5';
import { RiScreenshotLine as Screenshot } from "react-icons/ri";
import { getOS } from '../../../shared/utils';
import log from 'electron-log/renderer'

export function DeviceSelector({ devices, deviceType, onBack, onSelectDevice, selectedDevice }) {
  let filteredDevices = ["Video", "Screenshot"].includes(deviceType) ? devices.videoDevices : devices.audioDevices;
  let iconComponent;
  const platform = getOS()

  if (deviceType === 'Video') {
    filteredDevices = filteredDevices.filter(
      (device) => !device.name.toLowerCase().includes('capture screen')
    );
  } else if (deviceType === "Screenshot") {
    log.info(filteredDevices)
    const screenDevice = filteredDevices.find(device =>
      device.name.toLowerCase().includes("capture screen")
    );
    filteredDevices = []
    if (platform === "mac") {
      filteredDevices.push({
        name: "Full-screen",
        id: screenDevice.id
      })
      filteredDevices.push({
        name: "Select An Area",
        id: -1 * screenDevice.id
      })
    } else {
      filteredDevices.push({
        name: "Full-screen",
        id: 1
      })
      filteredDevices.push({
        name: "Select An Area",
        id: -1
      })

    }
  }


  switch (deviceType.toLowerCase()) {
    case 'video':
      iconComponent = <Camera size={20} className="shrink-0" />
      break
    case 'audio':
      iconComponent = <Mic size={20} className="shrink-0" />
      break;
    case 'screenshot':
      iconComponent = <Screenshot size={20} className='shrink-0' />
  }

  const handleDeviceClick = (device) => {
    if (selectedDevice?.id === device.id) {
      onSelectDevice(deviceType, null);
    } else {
      onSelectDevice(deviceType, device);
    }
  };

  return (
    <div className='drag'>
      <button
        className="absolute mb-2 top-1 left-1 bg-base-100 p-1 rounded-md hover:bg-base-300 cursor-pointer"
        onClick={onBack}
      >
        <BackIcon size={16} />
      </button>
      <h2 className="top-1 absolute left-8 text-md font-semibold text-base-content">
        Select {deviceType} Device
      </h2>

      <div className="flex flex-col max-w-screen gap-3 px-2 no-drag">
        {filteredDevices?.length > 0 ? (
          filteredDevices.map((device) => (
            <button
              key={device.id}
              className={`w-full p-2 pb-1 cursor-pointer rounded-md transition-all duration-200 overflow-hidden ${selectedDevice?.id === device.id ? 'bg-primary/80 text-primary-content' : 'bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content'}`}
              onClick={() => handleDeviceClick(device)}
            >
              <span className="inline-flex items-center justify-start whitespace-nowrap scroll-container">
                <span> {iconComponent} </span>
                <span className="pl-2 text-left pr-5">{device.name}</span>
              </span>
            </button>
          ))
        ) : (
          <p className="text-base-content/70">No {deviceType} devices found.</p>
        )}
      </div>
    </div>
  );
}
