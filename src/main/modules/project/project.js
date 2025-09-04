import log from 'electron-log/main';
import { ensureDirSync, writeFileSync, existsSync, mkdirSync, readJsonSync } from 'fs-extra';
import { join } from "path"
import { randomUUID as uuid } from "crypto"

export const fileEncoding = "utf-8"

export const createProjectWithData = async (data = {}, core) => {
  const projectsDirectory = core.paths.projectsDirectory

  try {
    ensureDirSync(projectsDirectory)
    const projectId = uuid()
    const projectDir = join(projectsDirectory, projectId)
    mkdirSync(projectDir, { recursive: true });

    const configFilePath = join(projectDir, "data.json")
    const configData = {
      status: "in-progress",
      startedAt: new Date().toISOString(),
      ...data
    }

    writeFileSync(configFilePath, JSON.stringify(configData, null, 2), { encoding: fileEncoding })
    log.verbose("Created a empty project")

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

    const configData = readJsonSync(configFilePath)
    return configData
  } catch (error) {
    log.error(`Error whiile loading project ${projectId}: `, error.message)
    return null
  }
}

export const updateProjectData = async (projectId, data, core) => {
  const projectsDirectory = core.paths.projectsDirectory;
  const projectDir = join(projectsDirectory, projectId);
  const configFilePath = join(projectDir, "data.json");

  try {
    if (!existsSync(configFilePath)) {
      log.error(`Project ${projectId} does not exist`);
      return false;
    }

    if (data.mouseClickRecords && data.mouseDragRecords) {
      data['effects'] = core.modules.editor.createEffects(data.mouseClickRecords, data.mouseDragRecords)

      delete data.mouseClickRecords
      delete data.mouseDragRecords
    }

    const configData = readJsonSync(configFilePath)
    const updatedData = { ...configData, ...data }

    writeFileSync(configFilePath, JSON.stringify(updatedData, null, 2), { encoding: fileEncoding });
    log.verbose(`Updated effects for project ${projectId}`);
    return true;
  } catch (error) {
    log.error(`Error updating effects for project ${projectId}:`, error.message);
    return false;
  }
};


