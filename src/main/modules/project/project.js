import log from 'electron-log/main';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { v4 as uuid } from 'uuid';
import { join } from "path"
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { screen } from 'electron';

export const fileEncoding = "utf-8"

const makeZoomEffectFromClicks = (mouseClickRecords) => {
  return mouseClickRecords.map(record => {
    const point = { x: record.x, y: record.y };
    const display = screen.getDisplayNearestPoint(point);
    const relX = record.x - display.bounds.x;
    const relY = record.y - display.bounds.y;
    return {
      id: uuid().slice(0, 8),
      type: 'zoom',
      startTime: parseFloat(record.elapsedTime - 1.5).toFixed(3),
      endTime: parseFloat(record.elapsedTime + 1.5).toFixed(3),
      level: 2,
      center: { x: relX, y: relY },
      duration: 500
    };
  });
};

export const createProjectWithData = async (data, core) => {
  const { arrayBuffer, mouseClickRecords, timestamp, extension } = data
  const projectsDirectory = core.paths.projectsDirectory

  const effects = makeZoomEffectFromClicks(mouseClickRecords)

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
