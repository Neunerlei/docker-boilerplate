import fs from 'fs';
import {promisify} from 'util';

export async function ensureDirectoryExists(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
        await promisify(fs.mkdir)(dir, { recursive: true });
    }
}
