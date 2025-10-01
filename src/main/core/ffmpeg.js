import { spawn as spawnProcess } from "child_process";
import log from "electron-log/main";
import { getFFmpegPath } from "./path";
import { showError } from "./error";
import { app } from "electron";

export class FFmpegManager {
  constructor() {
    this.activeProcesses = new Map(); // Map<processId, proc>
    this.id = 1;
    app.on('before-quit', this.killAllProcesses.bind(this));
  }

  async spawn(args, opts = {}) {
    const {
      onData = () => { },
      onError = () => { },
      onClose = () => { },
      dialogOnError = true,
      name = "unnamed"
    } = opts;

    const ffmpegPath = await getFFmpegPath();

    try {
      const proc = spawnProcess(ffmpegPath, args, { stdio: "pipe" });
      const processId = `${name}-${this.id}`
      this.id++

      // Store the process
      this.activeProcesses.set(processId, proc);

      proc.stdout.on("data", (data) => {
        onData(data);
      });

      proc.stderr.on("data", (data) => {
        log.verbose(`[ffmpeg ${processId} stderr]: ${data}`);
        onError(data);
      });

      proc.on("error", (err) => {
        log.error(`FFmpeg process ${processId} error:`, err);
        this.activeProcesses.delete(processId);
        if (dialogOnError) {
          showError("FFmpeg Error", err.message);
        }
      });

      proc.on("close", (code) => {
        log.info(`FFmpeg process ${processId} closed with code ${code}`);
        this.activeProcesses.delete(processId);
        onClose(code);
      });

      return processId;
    } catch (err) {
      log.error("Failed to spawn FFmpeg:", err);
      if (dialogOnError) {
        showError("FFmpeg Spawn Error", err.message);
      }
      throw err;
    }
  }

  async killProcess(processId) {
    const proc = this.activeProcesses.get(processId);
    if (!proc) {
      log.warn(`FFmpeg process ${processId} not found for kill`);
      return false;
    }

    return new Promise((resolve) => {
      const forceKillTimeout = setTimeout(() => {
        if (!proc.killed) {
          log.warn(`Force killing FFmpeg process ${processId}`);
          proc.kill('SIGKILL');
        }
        resolve(true);
      }, 3000);

      proc.on('close', () => {
        clearTimeout(forceKillTimeout);
        this.activeProcesses.delete(processId);
        log.info(`FFmpeg process ${processId} terminated gracefully`);
        resolve(true);
      });

      try {
        if (proc.stdin && !proc.stdin.destroyed) {
          proc.stdin.write('q\n');
          process.stdin.end();
        } else {
          proc.kill('SIGTERM');
        }
      } catch (err) {
        log.error(`Error sending quit command to process ${processId}:`, err);
        proc.kill('SIGTERM');
      }
    });
  }

  async killAllProcesses() {
    const killPromises = [];
    for (const processId of this.activeProcesses.keys()) {
      killPromises.push(this.killProcess(processId));
    }
    await Promise.all(killPromises);
    log.info(`Killed all FFmpeg processes if existed`);
  }
}

export const ffmpegManager = new FFmpegManager()
