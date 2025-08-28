import log from 'electron-log/main';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { v4 as uuid } from 'uuid';
import { join } from "path"
import { existsSync, mkdirSync, readFileSync } from 'fs';

export const fileEncoding = "utf-8"

export const createProjectWithData = async (data, core) => {
  const { arrayBuffer, mouseClickRecords, mouseDragRecords, timestamp, extension } = data
  const projectsDirectory = core.paths.projectsDirectory

  const effects = core.modules.editor.createEffects(mouseClickRecords, mouseDragRecords)

  try {
    ensureDirSync(projectsDirectory)
    const projectId = uuid()
    const projectDir = join(projectsDirectory, projectId)
    mkdirSync(projectDir, { recursive: true });

    const videoPath = join(projectDir, `raw.${extension}`)
    writeFileSync(videoPath, Buffer.from(arrayBuffer))

    const configFilePath = join(projectDir, "data.json")
    const configData = { videoPath, effects, timestamp }

    writeFileSync(configFilePath, JSON.stringify(configData, null, 2), { encoding: fileEncoding })
    log.verbose("Created a project with video and mouse records")

    return projectId
  } catch (error) {
    log.error("Error while creating project", error.msg, error)
    return null
  }
}

export const getProjectFromId = async (projectId, core) => {
  const projectsDirectory = core.paths.projectsDirectory
  const projectDir = join(projectsDirectory, projectId)
  const configFilePath = join(projectDir, "data.json")

  try {
    if (!existsSync(configFilePath)) {
      log.error(`Project ${projectId} does not exist`)
      return null
    }

    const configData = JSON.parse(readFileSync(configFilePath, { encoding: fileEncoding }))
    return {
      ...configData,
      videoPath: `app://${configData.videoPath}`
    }
  } catch (error) {
    log.error(`Error whiile loading project ${projectId}: `, error.message)
    return null
  }
}

export const updateProjectEffects = async (projectId, effects, core) => {
  const projectsDirectory = core.paths.projectsDirectory;
  const projectDir = join(projectsDirectory, projectId);
  const configFilePath = join(projectDir, "data.json");

  try {
    if (!existsSync(configFilePath)) {
      log.error(`Project ${projectId} does not exist`);
      return false;
    }

    const configData = JSON.parse(readFileSync(configFilePath, { encoding: fileEncoding }));
    configData.effects = effects;

    writeFileSync(configFilePath, JSON.stringify(configData, null, 2), { encoding: fileEncoding });
    log.verbose(`Updated effects for project ${projectId}`);
    return true;
  } catch (error) {
    log.error(`Error updating effects for project ${projectId}:`, error.message);
    return false;
  }
};
