import { dialog } from "electron";
import { writeFileSync } from "fs-extra";
import { spawn } from "child_process";
import log from "electron-log/main"
import { join } from "path";

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

export const spawnScreenCapture = (ffmpegPath, outputPath) => {
  const platform = process.platform;
  let args = [];

  const commonArgs = [
    '-video_size', '1920x1080',
    '-framerate', '60',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-f', 'matroska',
  ];

  if (platform === 'win32') {
    args = ['-f', 'gdigrab', '-i', 'desktop', ...commonArgs, outputPath];
  } else if (platform === 'darwin') {
    args = ['-f', 'avfoundation', '-i', '1', ...commonArgs, outputPath];
  } else if (platform === 'linux') {
    args = ['-f', 'x11grab', '-i', process.env.DISPLAY || ':0.0', ...commonArgs, outputPath];
  } else {
    dialog.showErrorBox('Platform Not Supported', `Unsupported platform: ${platform}`);
    return null;
  }

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

