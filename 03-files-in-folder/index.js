const path = require('path');
const { readdir, stat } = require('fs/promises');
const { stdout } = process;

const TARGET_PATH = path.join(__dirname, 'secret-folder');

(async () => {
  try {
    const stats = await stat(TARGET_PATH);
    if (stats.isDirectory()) {
      const dir = await readdir(TARGET_PATH, { withFileTypes: true });
      for await (const file of dir) {
        if (file.isFile()) {
          const filePath = path.join(TARGET_PATH, file.name);
          const fileParams = path.parse(filePath);

          const filesStat = await stat(filePath);
          stdout.write(
            `${fileParams.name} - ${fileParams.ext.slice(1)} - ${(
              filesStat.size / 1024
            ).toFixed(3)}kb\n`
          );
        }
      }
    }
  } catch (err) {
    console.log('Error: ', err.message);
  }
})();
