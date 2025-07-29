import { app } from 'electron';
import { statSync } from 'fs';
import { isDev } from "./utils"
import { ensureFile, ensureDir } from 'fs-extra';
import { homedir, version } from 'os';
import { resolve, join } from 'path';
import log from "electron-log/main"

const homeDirectory = homedir();

const applicationName = 'rev';
const projectFolderName = 'projects';
const configFileName = 'config.json';

let projectsDirectory = join(homeDirectory, 'Documents', applicationName, projectFolderName)

let configDirectory = process.env.XDG_CONFIG_HOME
  ? join(process.env.XDG_CONFIG_HOME, applicationName)
  : version() === 'win32'
    ? app.getPath('userData')
    : join(homeDirectory, '.config', applicationName);

let configFile = join(configDirectory, configFileName);

let devDirectory = resolve(__dirname, '../..');
let devProjectsDirectory = join(devDirectory, projectFolderName);
let devConfigFile = join(devDirectory, configFileName);

if (isDev) {
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

export {
  projectsDirectory,
  projectFolderName,
  configDirectory,
  configFileName,
  configFile,
  homeDirectory,
};
