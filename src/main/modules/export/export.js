const { spawn } = require('child_process');

export class ExportingSession {
  constructor() {
    this.ffmpegProc = null;
    this.ffmpegStdin = null;
  }

  async start(opts, core) {
    const ffmpegpath = await core.paths.getFFmpegPath()

    const { width = 1920, height = 1080, fps = 30, format = 'png', outputPath = '/home/ninjafire/out.mp4' } = opts
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.format = format;
    this.outputPath = outputPath;

    this.ffmpegProc = spawn(ffmpegpath, [
      '-y',
      '-f', 'image2pipe',
      '-framerate', String(this.fps),
      '-i', '-',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      this.outputPath,
    ]);

    this.ffmpegStdin = this.ffmpegProc.stdin;

    this.ffmpegProc.stderr.on('data', (data) => {
      console.error('FFmpeg error:', data.toString());
    });
    this.ffmpegProc.on('close', (code) => {
      console.log('FFmpeg closed:', code);
    });
  }

  pushFrame(obj) {
    const { data } = obj
    if (this.ffmpegStdin) {
      const buffer = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64");
      this.ffmpegStdin.write(buffer);
    }
  }

  stop() {
    if (this.ffmpegStdin) {
      this.ffmpegStdin.end();
    }
  }

  cancel() {
    if (this.ffmpegProc) {
      this.ffmpegProc.kill('SIGINT');
    }
  }
}
