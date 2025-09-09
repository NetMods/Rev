import { spawn } from "child_process";
import { join } from "path";
import { readdir, readFile } from "fs-extra";

export const getInputDevices = async () => {
  const platform = process.platform;
  let videoDevices = [];
  let audioDevices = [];

  if (platform === 'win32') {
    const cmd = spawn('ffmpeg', ['-list_devices', 'true', '-f', 'dshow', '-i', 'dummy']);
    const output = await runCommand(cmd);
    const lines = output.split('\n');
    let section = '';
    lines.forEach(line => {
      line = line.trim();
      if (line.includes('DirectShow video devices')) {
        section = 'video';
      } else if (line.includes('DirectShow audio devices')) {
        section = 'audio';
      } else if (line.startsWith('[') && line.includes('] ') && (section === 'video' || section === 'audio')) {
        const match = line.match(/^\[dshow @ [^\]]+\] (.*?)(\s*\(.*?\))?$/);
        if (match) {
          const friendlyName = match[1].trim();
          const devices = section === 'video' ? videoDevices : audioDevices;
          devices.push({ name: friendlyName, id: friendlyName });
        }
      }
    });

  } else if (platform === 'darwin') {
    const cmd = spawn('ffmpeg', ['-f', 'avfoundation', '-list_devices', 'true', '-i', '']);
    const output = await runCommand(cmd);
    const lines = output.split('\n');
    let section = '';
    lines.forEach(line => {
      line = line.trim();
      if (line.includes('AVFoundation video devices:')) {
        section = 'video';
      } else if (line.includes('AVFoundation audio devices:')) {
        section = 'audio';
      } else if (line.match(/^\[\d+\]/) && (section === 'video' || section === 'audio')) {
        const match = line.match(/\[(\d+)\]\s*(.*)/);
        if (match) {
          const index = match[1];
          const name = match[2].trim();
          const devices = section === 'video' ? videoDevices : audioDevices;
          devices.push({ name, id: index });
        }
      }
    });

  } else {
    // Linux: read file directly from /sys/class/video4linux for video,
    // pactl for audio (PulseAudio; fallback to arecord -l for ALSA if pactl fails)
    try {
      const videoDir = '/sys/class/video4linux';
      const entries = await readdir(videoDir);
      const videoEntries = entries.filter(entry => entry.startsWith('video'));

      for (const entry of videoEntries) {
        const namePath = join(videoDir, entry, 'name');
        let name;
        try {
          name = (await readFile(namePath, 'utf8')).trim();
        } catch {
          name = `Unknown (${entry})`; // Fallback if 'name' file unreadable
        }
        const devicePath = `/dev/${entry}`;
        videoDevices.push({ name, id: devicePath });
      }
    } catch (err) {
      console.error('Failed to list video devices via sysfs', err);
      // Optional: Fallback to basic ls /dev/video* (requires 'ls' but no parsing)
      try {
        const devCmd = spawn('ls', ['/dev/video*']);
        const devOutput = await runCommand(devCmd);
        const devPaths = devOutput.split('\n').filter(line => line.trim().startsWith('/dev/video'));
        devPaths.forEach(path => {
          videoDevices.push({ name: `Unknown Video Device (${path})`, id: path });
        });
      } catch (lsErr) {
        console.error('No video devices, You are hopeless', lsErr);
      }
    }

    // Audio: pactl list short sources (for PulseAudio)
    // Audio: Use pactl list sources for detailed names, fallback to pactl list short
    try {
      const audioCmd = spawn('pactl', ['list', 'sources']); // Full output for descriptions
      const audioOutput = await runCommand(audioCmd);
      const audioLines = audioOutput.split('\n');
      let currentDevice = null;
      audioDevices = audioLines.reduce((devices, line) => {
        line = line.trim();
        if (line.startsWith('Source #')) {
          if (currentDevice) {
            devices.push(currentDevice);
          }
          currentDevice = { name: 'Unknown Audio Source', id: '' };
        } else if (line.startsWith('Name: ') && currentDevice) {
          currentDevice.id = line.replace('Name: ', '').trim();
        } else if (line.startsWith('Description: ') && currentDevice) {
          currentDevice.name = line.replace('Description: ', '').trim() || currentDevice.id;
        }
        return devices;
      }, []);
      if (currentDevice) {
        audioDevices.push(currentDevice);
      }
    } catch (err) {
      console.warn('pactl list sources failed; trying pactl list short', err);
      try {
        const shortAudioCmd = spawn('pactl', ['list', 'short', 'sources']);
        const shortAudioOutput = await runCommand(shortAudioCmd);
        const shortAudioLines = shortAudioOutput.split('\n');
        shortAudioLines.forEach(line => {
          if (line.includes('\t')) {
            const [, sourceName] = line.split('\t');
            if (sourceName) {
              let friendlyName = sourceName
                .replace('alsa_input.', 'Input: ')
                .replace('alsa_output.', 'Output: ')
                .replace('.analog-stereo', ' (Analog Stereo)')
                .replace('.monitor', ' (Monitor)')
                .replace(/pci-[\w\d_]+/, 'Built-in');
              if (sourceName.includes('.monitor')) {
                friendlyName = `Monitor: ${friendlyName.replace('.monitor', '')}`;
              } else if (sourceName.includes('alsa_input')) {
                friendlyName = `Microphone: ${friendlyName.replace('Input: ', '')}`;
              } else if (sourceName.includes('alsa_output')) {
                friendlyName = `Speaker Output: ${friendlyName.replace('Output: ', '')}`;
              }
              friendlyName = friendlyName || `Audio Source #${audioDevices.length + 1} (${sourceName})`;
              audioDevices.push({ name: friendlyName, id: sourceName });
            }
          }
        });
      } catch (shortErr) {
        console.warn('pactl list short failed; trying ALSA', shortErr);
        const alsaCmd = spawn('arecord', ['-l']);
        const alsaOutput = await runCommand(alsaCmd);
        const alsaLines = alsaOutput.split('\n');
        alsaLines.forEach(line => {
          if (line.includes('card ') || line.includes('subdevice')) {
            const match = line.match(/card (\d+): \[([^\]]+)\]/);
            if (match) {
              const cardId = match[1];
              const name = match[2].trim();
              audioDevices.push({ name, id: `hw:${cardId},0` });
            }
          }
        });
      }
    }
  }

  return { videoDevices, audioDevices }
}

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    let output = '';
    cmd.stderr.on('data', (data) => { output += data.toString(); });
    cmd.stdout.on('data', (data) => { output += data.toString(); });
    cmd.on('close', (code) => {
      if (code === 0 || code === 255) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    cmd.on('error', reject);
  });
}
