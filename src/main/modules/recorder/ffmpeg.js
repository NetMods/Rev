import { dialog } from "electron";
import { writeFileSync } from "fs-extra";
import { spawn } from "child_process";
import log from "electron-log/main"
import { join } from "path";

export const spawnScreenCapture = (ffmpegPath, outputPath) => {
  const platform = process.platform;
  let args = [];

  const videoArgs = [
    '-video_size', '1920x1080',
    '-framerate', '60',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
  ];

  const audioArgs = [
    '-c:a', 'aac',
    '-b:a', '192k',
  ];

  if (platform === 'win32') {
    // ## Windows: Use 'dshow' to capture system audio via "Stereo Mix".
    // 1. Find your device name by running:
    //    ffmpeg -list_devices true -f dshow -i dummy
    // 2. Look for a device like "Stereo Mix", "What U Hear", or "Wave Out Mix".
    //    This device must be ENABLED in your Windows Sound Control Panel (Recording tab).
    // 3. Replace the placeholder below with your exact device name.
    args = [
      '-f', 'gdigrab', '-i', 'desktop',                                // Video Input: Entire desktop
      '-f', 'dshow', '-i', 'audio=Stereo Mix (Realtek(R) Audio)',      // Audio Input: REPLACE WITH YOUR SYSTEM AUDIO DEVICE
    ];
  } else if (platform === 'darwin') {
    // ## macOS: Requires a virtual audio device like BlackHole.
    // 1. Install BlackHole (https://github.com/ExistentialAudio/BlackHole).
    // 2. In System Settings > Sound, set your Mac's OUTPUT to "BlackHole".
    // 3. Find BlackHole's device index by running:
    //    ffmpeg -f avfoundation -list_devices true -i ""
    // 4. In the output, find the index for "BlackHole" under "AVFoundation audio devices".
    // 5. Replace the audio index '0' in '-i', '1:0' with the BlackHole index.
    args = [
      '-f', 'avfoundation', '-i', '1:2', // Video index 1, Audio index 2 (REPLACE with [video_idx]:[blackhole_idx])
    ];
  } else if (platform === 'linux') {
    // ## Linux: Use 'pulse' and find the ".monitor" source of your output.
    // 1. Find your monitor source name by running:
    //    pactl list sources
    // 2. Look for the "Name:" of a source whose description is "Monitor of [Your Speakers]".
    //    The name will typically end in ".monitor".
    // 3. Replace 'default' with that exact monitor source name.
    args = [
      '-f', 'x11grab', '-i', process.env.DISPLAY || ':0.0',           // Video Input: X11 display
      '-f', 'pulse', '-i', 'alsa_output.pci-0000_00_1f.3.analog-stereo.monitor', // Audio Input: REPLACE WITH YOUR MONITOR SOURCE
    ];
  } else {
    dialog.showErrorBox('Platform Not Supported', `Unsupported platform: ${platform}`);
    return null;
  }

  args.push(...videoArgs, ...audioArgs, outputPath);

  const ffmpegProcess = spawn(ffmpegPath, args, { stdio: 'pipe' });

  ffmpegProcess.stderr.on('data', (data) => {
    log.verbose(`[ffmpeg capture stderr]: ${data}`);
  });

  ffmpegProcess.on('error', (err) => {
    log.error('Failed to start ffmpeg capture:', err);
  });

  return ffmpegProcess;
};

export const mergeVideoClips = (ffmpegPath, clipPaths, tempDirectory) => {
  const videoName = 'raw.mkv';
  const outputPath = join(tempDirectory, videoName);

  if (clipPaths.length === 0) {
    return Promise.reject(new Error('No clips to merge.'));
  }

  if (clipPaths.length === 1) {
    log.info('Only one clip found, no merge necessary. Renaming instead.');
    return Promise.resolve({ outputPath: clipPaths[0], videoName });
  }

  const listFile = join(tempDirectory, 'concat_list.txt');
  const listContent = clipPaths.map(p => `file '${p}'`).join('\n');
  writeFileSync(listFile, listContent, { encoding: 'utf-8' });

  return new Promise((resolve, reject) => {
    const args = [
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      outputPath,
    ];

    const ffmpegMerge = spawn(ffmpegPath, args);

    ffmpegMerge.stderr.on('data', (data) => {
      log.verbose(`[ffmpeg merge stderr]: ${data}`);
    });

    ffmpegMerge.on('error', (err) => {
      log.error('Failed to start ffmpeg for merge:', err);
      reject(err);
    });

    ffmpegMerge.on('exit', (code) => {
      if (code === 0) {
        log.info(`Successfully merged clips into ${outputPath}`);
        resolve({ outputPath, videoName });
      } else {
        reject(new Error(`ffmpeg merge failed with exit code ${code}`));
      }
    });
  });
};

export const gracefullyStopProcess = (process) => {
  if (!process || process.exitCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    process.on('exit', () => {
      log.verbose('ffmpeg process exited gracefully.');
      resolve();
    });
    process.stdin.write('q');
    process.stdin.end();
  });
};
