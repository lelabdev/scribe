import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = '.data/uploads';

async function ensureUploadDir() {
	try {
		await fs.access(UPLOAD_DIR);
	} catch {
		await fs.mkdir(UPLOAD_DIR, { recursive: true });
	}
}

export async function uploadFile(filename: string, file: Buffer | Uint8Array): Promise<string> {
	await ensureUploadDir();
	const filePath = path.join(UPLOAD_DIR, filename);
	await fs.writeFile(filePath, file);
	return `/uploads/${filename}`;
}

export async function getFile(filename: string): Promise<Buffer> {
	const filePath = path.join(UPLOAD_DIR, filename);
	return await fs.readFile(filePath);
}

export async function deleteFile(filename: string): Promise<void> {
	const filePath = path.join(UPLOAD_DIR, filename);
	await fs.unlink(filePath);
}
