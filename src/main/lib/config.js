import { readFileSync, writeFileSync } from 'fs';
import { fileEncoding } from "./utils"
import { configFile } from './paths';

export async function getUserConfiguration() {
  try {
    const rawFileData = readFileSync(configFile, { encoding: fileEncoding });
    return rawFileData.length > 0 ? JSON.parse(rawFileData) : {};
  } catch (error) {
    console.log('Error while getting configuration', error);
    return null;
  }
}

export async function updateUserConfiguration(content) {
  try {
    const configuration = await getUserConfiguration() || {};
    const updatedConfiguration = { ...configuration, ...content };
    writeFileSync(configFile, JSON.stringify(updatedConfiguration, null, 2), { encoding: fileEncoding });
    return true;
  } catch (error) {
    console.log('Error while updating configuration', error);
    return false;
  }
}

