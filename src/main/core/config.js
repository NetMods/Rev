import { readFileSync, writeFileSync } from 'fs';
import { configFile } from './path';

const fileEncoding = "utf-8"

export async function getConfig() {
  try {
    const rawFileData = readFileSync(configFile, { encoding: fileEncoding });
    return rawFileData.length > 0 ? JSON.parse(rawFileData) : { plugins: [] };
  } catch (error) {
    console.log('Error while getting configuration', error);
    return { plugins: [] };
  }
}

export async function updateConfig(content) {
  try {
    const configuration = await getConfig() || {};
    const updatedConfiguration = { ...configuration, ...content };
    writeFileSync(configFile, JSON.stringify(updatedConfiguration, null, 2), { encoding: fileEncoding });
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
