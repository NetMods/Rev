import log from 'electron-log/main';
import { projectsDirectory } from './paths';
import { ensureDirSync, writeFileSync } from 'fs-extra';
import { v4 as uuid } from 'uuid';
import { join } from "path"
import { mkdirSync } from 'fs';
import { fileEncoding } from './utils';

export const createProjectWithData = async (data) => {
  const { arrayBuffer, mouseClickRecords, timestamp } = data

  try {
    ensureDirSync(projectsDirectory)
    const projectId = uuid()
    const projectDir = join(projectsDirectory, projectId)
    mkdirSync(projectDir, { recursive: true });

    const videoPath = join(projectDir, "raw.webm")
    writeFileSync(videoPath, Buffer.from(arrayBuffer))

    const configFilePath = join(projectDir, "data.json")
    const configData = {
      videoPath,
      mouseClickRecords,
      timestamp
    }
    writeFileSync(configFilePath, JSON.stringify(configData, null, 2), { encoding: fileEncoding })
    log.verbose("Created a project with video and mouse records")

    return projectId
  } catch (error) {
    log.error("Error while creating project", error.msg, error)
    return null
  }
}

