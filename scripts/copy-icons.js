const { copyFile, mkdir, readdir } = require('fs/promises');
const { join, dirname } = require('path');

/**
 * Recursively find all SVG files in a directory
 */
async function findSvgFiles(dir, files = []) {
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			await findSvgFiles(fullPath, files);
		} else if (entry.name.endsWith('.svg')) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Ensure a directory exists
 */
async function ensureDir(dir) {
	try {
		await mkdir(dir, { recursive: true });
	} catch (err) {
		if (err.code !== 'EEXIST') throw err;
	}
}

/**
 * Copy icon files from nodes/ to dist/nodes/
 */
async function copyIcons() {
	const sourceDir = 'nodes';
	const destDir = 'dist/nodes';

	try {
		const svgFiles = await findSvgFiles(sourceDir);

		for (const srcPath of svgFiles) {
			// Convert nodes/Seggwat/seggwat.svg -> dist/nodes/Seggwat/seggwat.svg
			const relativePath = srcPath.substring(sourceDir.length);
			const destPath = join(destDir, relativePath);

			await ensureDir(dirname(destPath));
			await copyFile(srcPath, destPath);
			console.log(`Copied: ${srcPath} -> ${destPath}`);
		}

		console.log(`\nCopied ${svgFiles.length} icon file(s)`);
	} catch (err) {
		console.error('Error copying icons:', err);
		process.exit(1);
	}
}

copyIcons();
