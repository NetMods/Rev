import { join } from "path";
import { dialog } from "electron";
import { writeFileSync } from "fs-extra";
import { spawn } from "child_process";
import log from "electron-log/main"

export const spawnScreenCapture = async (ffmpegPath, outputPath, opts, core) => {
  const platform = process.platform;
  const { audioDevice } = opts;
  let args = [];

  const videoArgs = [
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
    args = [
      '-f', 'gdigrab', '-i', 'desktop', // Video Input: Entire desktop
    ];
    if (audioDevice) {
      args.push('-f', 'dshow', '-i', `audio=${audioDevice}`); // Audio Input: Only if audioDevice is provided
    }
  } else if (platform === 'darwin') {
    const { videoDevices } = await core.input.getInputDevices()
    const screenDevice = videoDevices.find(device => device.name.toLowerCase().includes('capture screen'));
    const screenIndex = screenDevice ? screenDevice.id : null

    args = [
      '-f', 'avfoundation', '-i', `${screenIndex}:${audioDevice ?? 'none'}`,                  // Video index 1, Audio index from audioDevice
    ];
  } else if (platform === 'linux') {
    args = [
      '-f', 'x11grab', '-i', process.env.DISPLAY || ':0.0', // Video Input: X11 display
    ];
    if (audioDevice) {
      args.push('-f', 'pulse', '-i', audioDevice); // Audio Input: Only if audioDevice is provided
    }
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

export const spawnWebcamCapture = (ffmpegPath, outputPath, opts) => {
  const platform = process.platform;
  const { videoDevice } = opts;
  let args = [];

  const videoArgs = [
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
  ];

  if (platform === 'win32') {
    args = [
      '-framerate', '30',
      '-f', 'dshow',
      '-i', `video=${videoDevice}`,                     // Video Input: Webcam
    ];
  } else if (platform === 'darwin') {
    args = [
      '-framerate', '30',
      '-video_size', '1280x720',
      '-f', 'avfoundation',
      '-i', `${videoDevice}:none`,
    ];
  } else if (platform === 'linux') {
    args = [
      '-f', 'v4l2', '-i', videoDevice,                                // Video Input: Webcam device
    ];
  } else {
    dialog.showErrorBox('Platform Not Supported', `Unsupported platform: ${platform}`);
    return null;
  }

  args.push(...videoArgs, outputPath);

  const ffmpegProcess = spawn(ffmpegPath, args, { stdio: 'pipe' });

  ffmpegProcess.stderr.on('data', (data) => {
    log.verbose(`[ffmpeg webcam capture stderr]: ${data}`);
  });

  ffmpegProcess.on('error', (err) => {
    log.error('Failed to start ffmpeg webcam capture:', err);
  });

  return ffmpegProcess;
};

export const mergeVideoClips = (ffmpegPath, clipPaths, tempDirectory, videoName) => {
  const outputPath = join(tempDirectory, videoName);

  if (clipPaths.length === 0) {
    return Promise.reject(new Error('No clips to merge.'));
  }

  if (clipPaths.length === 1) {
    log.info('Only one clip found, no merge necessary. Renaming instead.');
    return Promise.resolve(clipPaths[0]);
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
        resolve(outputPath);
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
