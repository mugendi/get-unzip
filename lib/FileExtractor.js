import fs from 'fs/promises';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import path from 'path';
import zlib from 'zlib';
import * as tar from 'tar';  // Fixed: Import all exports from tar
import unzipper from 'unzipper';
import { promisify } from 'util';

const gunzip = promisify(zlib.gunzip);

class FileExtractor {
    static SUPPORTED_FORMATS = {
        '.zip': 'ZIP',
        '.gz': 'GZIP',
        '.tgz': 'TAR_GZIP',
        '.tar': 'TAR'
    };

    #validatePaths(sourcePath, destPath) {
        if (!existsSync(sourcePath)) {
            throw new Error(`Source file does not exist: ${sourcePath}`);
        }

        if (!existsSync(destPath)) {
            mkdirSync(destPath, { recursive: true });
        }
    }

    async #extractZip(sourcePath, destPath) {
        return new Promise((resolve, reject) => {
            createReadStream(sourcePath)
                .pipe(unzipper.Extract({ path: destPath }))
                .on('close', resolve)
                .on('error', reject);
        });
    }

    async #extractTarGz(sourcePath, destPath) {
        return tar.x({
            file: sourcePath,
            cwd: destPath,
            sync: false
        });
    }

    async #extractTar(sourcePath, destPath) {
        return tar.x({
            file: sourcePath,
            cwd: destPath,
            sync: false
        });
    }

    async #extractGzip(sourcePath, destPath) {
        const content = await fs.readFile(sourcePath);
        const decompressed = await gunzip(content);
        const fileName = path.basename(sourcePath, '.gz');
        await fs.writeFile(path.join(destPath, fileName), decompressed);
    }

    async extract(sourcePath, destPath) {
        try {
            this.#validatePaths(sourcePath, destPath);
            
            const fileExt = path.extname(sourcePath).toLowerCase();
            const isTarGz = sourcePath.toLowerCase().endsWith('.tar.gz');
            
            if (!FileExtractor.SUPPORTED_FORMATS[fileExt] && !isTarGz) {
                throw new Error(`Unsupported file format: ${fileExt}`);
            }

            switch (true) {
                case fileExt === '.zip':
                    await this.#extractZip(sourcePath, destPath);
                    break;
                case isTarGz:
                case fileExt === '.tgz':
                    await this.#extractTarGz(sourcePath, destPath);
                    break;
                case fileExt === '.tar':
                    await this.#extractTar(sourcePath, destPath);
                    break;
                case fileExt === '.gz':
                    await this.#extractGzip(sourcePath, destPath);
                    break;
            }

            return {
                success: true,
                message: `Successfully extracted ${sourcePath} to ${destPath}`,
                sourcePath,
                destPath
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error,
                sourcePath,
                destPath
            };
        }
    }

    static async extractFile(sourcePath, destPath) {
        const extractor = new FileExtractor();
        return extractor.extract(sourcePath, destPath);
    }
}

export default FileExtractor;