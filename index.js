/**
 * Copyright (c) 2024 Anthony Mugendi
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import axios from 'axios';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { isCompressed } from './lib/extensions.js';
import FileExtractor from './lib/FileExtractor.js';

export async function download(url) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(path.basename(url));
    const file = String(Date.now()) + ext;
    const downloadPath = path.resolve(os.tmpdir(), file);

    // axios image download with response type "stream"
    axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
    }).then((response) => {
      //   console.log(resp);
      const stream = response.data;
      // pipe the result stream into a file on disc
      stream.pipe(fs.createWriteStream(downloadPath));
      stream.on('error', (error) => reject(error));
      stream.on('end', function () {
        resolve({ url, ext, filePath: downloadPath });
      });
    });
  });
}

export async function getCompressed(url, downloadPath) {
  fs.mkdirSync(downloadPath, { recursive: true });

  const { ext, filePath } = await download(url);
  let destPath;

  // console.log({ url, filePath });
  if (isCompressed(ext)) {
    // await decompress(filePath, downloadPath);
    ({ destPath } = await FileExtractor.extractFile(filePath, downloadPath));
  }

  return { url, destPath };
}
