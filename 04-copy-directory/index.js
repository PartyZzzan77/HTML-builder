const path = require('path');
const { readdir, copyFile, rm, mkdir } = require('fs/promises');

const { stdout } = process;
const TARGET_PATH = path.join(__dirname, 'files');
const COPY_PATH = path.join(__dirname, 'files-copy');

const copyDirectory = async (target, copy) => {
  await rm(copy, { recursive: true, force: true });
  await mkdir(copy, { recursive: true });

  readdir(target, { withFileTypes: true })
    .then((resolve) => {
      resolve.forEach((file) => {
        const input = path.join(target, file.name);
        const output = path.join(copy, file.name);
        if (file.isFile()) {
          copyFile(input, output);
        } else {
          copyDirectory(input, output);
        }
      });
    })
    .catch((err) => stdout.write(`ERROR: ${err.message}`));
};

(async function () {
  await copyDirectory(TARGET_PATH, COPY_PATH);
})();
