import { app } from 'electron';
import { statSync } from 'fs';
import { ensureFile, ensureDir } from 'fs-extra';
import { homedir, version } from 'os';
import { resolve, join } from 'path';
import log from "electron-log/main"
import { is } from '@electron-toolkit/utils';
import { execFile } from 'child_process';

export const homeDirectory = homedir();

export const applicationName = 'rev';
export const projectFolderName = 'projects';
export const configFileName = 'config.json';

export let projectsDirectory = join(homeDirectory, 'Documents', applicationName, projectFolderName)

export let configDirectory = process.env.XDG_CONFIG_HOME
  ? join(process.env.XDG_CONFIG_HOME, applicationName)
  : version() === 'win32'
    ? app.getPath('userData')
    : join(homeDirectory, '.config', applicationName);

export let configFile = join(configDirectory, configFileName);

let devDirectory = resolve(__dirname, '../..');
let devProjectsDirectory = join(devDirectory, projectFolderName);
let devConfigFile = join(devDirectory, configFileName);

if (is.dev) {
  try {
    statSync(devConfigFile);
    statSync(devProjectsDirectory);
  } catch {
    log.warn('Creating a `projects` folder and a `config.json` file in the root directory of the project for development');
    ensureFile(devConfigFile);
    ensureDir(devProjectsDirectory);
  } finally {
    configFile = devConfigFile;
    configDirectory = devDirectory;
    projectsDirectory = devProjectsDirectory;
  }
} else {
  ensureDir(projectsDirectory);
  ensureDir(configDirectory);
  ensureFile(configFile);
}

let ffmpegPath

async function getFFmpegPath() {
  if (ffmpegPath) return ffmpegPath;

  const hasSystem = () => new Promise(resolve => execFile('ffmpeg', ['-version'], err => resolve(!err)));

  if (await hasSystem()) {
    ffmpegPath = 'ffmpeg';
    return ffmpegPath
  }

  try {
    const mod = await import('ffmpeg-static');
    ffmpegPath = mod?.default ?? mod;
    return ffmpegPath
  } catch {
    throw new Error('No ffmpeg available. Please Install ffmpeg manually for your machine.');
  }
}

export default {
  applicationName,
  projectsDirectory,
  projectFolderName,
  configDirectory,
  configFileName,
  configFile,
  homeDirectory,
  getFFmpegPath
};
