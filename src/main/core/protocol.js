import log from "electron-log/main";
import { protocol } from "electron";
import path from "path"
import { createReadStream, statSync, existsSync } from "fs-extra";

export function registerProtocolScheme(name) {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: name,
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true,
        bypassCSP: true,
        stream: true,
      },
    },
  ]);
}

export function handleProtocolRequests(name) {
  protocol.handle(name, async (request) => {
    try {
      let filePath = request.url.slice(`${name}:/`.length);
      // Decode +URI (in case of spaces or special chars)
      filePath = decodeURIComponent(filePath)

      // Handle Windows paths
      if (process.platform === 'win32') {
        // Remove leading slash from "/C:/..." → "C:/..."
        if (filePath.startsWith('/')) {
          filePath = filePath.slice(1)
        }

        // Fix missing colon after drive letter if needed
        if (/^[a-zA-Z](\\|\/)/.test(filePath)) {
          filePath = filePath[0] + ':' + filePath.slice(1)
        }

        // Normalize to Windows path
        filePath = path.normalize(filePath)
      }
      log.verbose(`Handling ${name}:// request for: ${filePath}`);

      if (!existsSync(filePath)) {
        log.error(`File not found: ${filePath}`);
        return new Response(null, { status: 404 });
      }

      const stats = statSync(filePath);
      const fileSize = stats.size;
      const range = request.headers.get("Range");

      let status = 200;
      const headers = {
        "Content-Type": "video/mkv",
        "Accept-Ranges": "bytes",
      };
      let body;

      if (range) {
        log.info(`Range request: ${range}`);
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${fileSize}` },
          });
        }

        if (end >= fileSize) end = fileSize - 1;

        status = 206;
        headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
        headers["Content-Length"] = (end - start + 1).toString();

        body = createReadStream(filePath, { start, end: end + 1 });
      } else {
        headers["Content-Length"] = fileSize.toString();
        body = createReadStream(filePath);
      }

      return new Response(body, { status, headers });
    } catch (error) {
      log.error(`Failed to handle ${name}:// request:`, error.message);
      return new Response(null, { status: 500 });
    }
  });
}
