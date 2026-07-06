import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ytDlpModule = require('yt-dlp-exec') as typeof import('yt-dlp-exec');

function getDefaultBinaryPath() {
  const filename = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  return path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', filename);
}

export function resolveYtDlpBinaryPath() {
  const customPath = process.env.YT_DLP_BINARY_PATH?.trim();
  const binaryPath = customPath || getDefaultBinaryPath();

  if (!fs.existsSync(binaryPath)) {
    throw new Error(
      `yt-dlp binary not found at "${binaryPath}". Install the binary or set YT_DLP_BINARY_PATH to a valid yt-dlp executable.`
    );
  }

  return binaryPath;
}

export function getYtDlpClient() {
  const binaryPath = resolveYtDlpBinaryPath();
  return ytDlpModule.create(binaryPath);
}
