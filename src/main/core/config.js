import { writeJsonSync } from 'fs-extra';
import { configFile } from './path';
import { writeJSONSync, readJsonSync } from 'fs-extra';

const fileEncoding = "utf-8"

export async function getConfig() {
  try {
    const fileData = await readJsonSync(configFile, { encoding: fileEncoding });
    return fileData
  } catch (error) {
    console.error('Error while getting configuration:', error.message);
    if (error instanceof SyntaxError) {
      console.warn('Invalid JSON detected, reinitializing config file');
      writeJsonSync(configFile, {}, { encoding: fileEncoding });
    }
    return {};
  }
}

export async function updateConfig(content) {
  try {
    const configuration = await getConfig() || {};
    const updatedConfiguration = { ...configuration, ...content };
    writeJSONSync(configFile, updatedConfiguration, { encoding: fileEncoding });
    return true;
  } catch (error) {
    console.log('Error while updating configuration', error);
    return false;
  }
}

export default {
  getConfig,
  updateConfig,
}
