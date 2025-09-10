import {
  IoVideocamOutline as Camera,
  IoMicOutline as Mic,
  IoArrowBack as BackIcon,
} from 'react-icons/io5';

export function DeviceSelector({ devices, deviceType, onBack, onSelectDevice, selectedDevice }) {
  let filteredDevices = deviceType === 'Video' ? devices.videoDevices : devices.audioDevices;

  if (deviceType === 'Video') {
    filteredDevices = filteredDevices.filter(
      (device) => !device.name.toLowerCase().includes('capture screen')
    );
  }

  const handleDeviceClick = (device) => {
    if (selectedDevice?.id === device.id) {
      onSelectDevice(deviceType, null);
    } else {
      onSelectDevice(deviceType, device);
    }
  };

  return (
    <div>
      <button
        className="mb-2 absolute top-1 left-1 bg-base-100 p-1 rounded-md hover:bg-base-300 cursor-pointer"
        onClick={onBack}
      >
        <BackIcon size={16} />
      </button>
      <h2 className="absolute top-1 left-8 text-md font-semibold text-base-content">
        Select {deviceType} Device
      </h2>

      <div className="flex flex-col max-w-screen gap-3 px-2">
        {filteredDevices?.length > 0 ? (
          filteredDevices.map((device) => (
            <button
              key={device.id}
              className={`w-full p-2 pb-1 cursor-pointer rounded-md transition-all duration-200 overflow-hidden ${selectedDevice?.id === device.id ? 'bg-primary/80 text-primary-content' : 'bg-base-200 text-base-content/70 hover:bg-base-300 hover:text-base-content'}`}
              onClick={() => handleDeviceClick(device)}
            >
              <span className="inline-flex items-center justify-start whitespace-nowrap scroll-container">
                <span>
                  {deviceType.toLowerCase() === 'video' ? (
                    <Camera size={20} className="shrink-0" />
                  ) : (
                    <Mic size={20} className="shrink-0" />
                  )}
                </span>
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
