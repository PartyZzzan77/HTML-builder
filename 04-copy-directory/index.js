const path = require('path');
const { readdir, copyFile, rm, mkdir } = require('fs/promises');

const TARGET_PATH = path.join(__dirname, 'files');
const COPY_PATH = path.join(__dirname, 'files-copy');

const copyDirectory = async (target, copy) => {
  try {
    await rm(copy, { recursive: true, force: true });
    await mkdir(copy, { recursive: true });

    const dir = await readdir(target, { withFileTypes: true });
    for await (const chunk of dir) {
      const input = path.join(target, chunk.name);
      const output = path.join(copy, chunk.name);
      if (chunk.isFile()) {
        await copyFile(input, output);
      } else {
        await copyDirectory(input, output);
      }
    }
  } catch (err) {
    console.log(`copyDirectory Error: ${err.message}`);
  }
};

copyDirectory(TARGET_PATH, COPY_PATH);
