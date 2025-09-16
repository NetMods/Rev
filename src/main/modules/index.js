import log from 'electron-log/main';
import exporter from './export';
import annotation from './annotation';
import editor from './editor';
import project from './project';
import screenshot from './screenshot';
import recorder from './recorder';

const modules = [annotation, editor, project, screenshot, recorder, exporter];

export async function loadModules(core) {
  const modulesList = modules.reduce((accumulator, module) => {
    accumulator[module.name] = module
    return accumulator
  }, {});

  Object.entries(modulesList).forEach(([name, module]) => {
    try {
      module.init(core);
      log.info(`Loaded ${name}`);
    } catch (error) {
      log.error(`Failed to load ${name}:`, error);
    }
  })

  return modulesList
}
