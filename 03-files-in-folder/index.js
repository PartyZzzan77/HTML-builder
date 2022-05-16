const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
const { stdout } = process;
const TARGET_PATH = path.join(__dirname, 'secret-folder');

fs.stat(TARGET_PATH, (err, stats) => {
  if (err) throw new Error(err.message);
  if (stats.isDirectory()) {
    readdir(TARGET_PATH, { withFileTypes: true })
      .then((resolve) => {
        resolve.forEach((file) => {
          if (file.isFile()) {
            const filePath = path.join(TARGET_PATH, file.name);
            const fileParams = path.parse(filePath);

            fs.stat(filePath, (err, stats) => {
              if (err) throw new Error(err);
              stdout.write(
                `${fileParams.name} - ${fileParams.ext.slice(1)} - ${(
                  stats.size / 1024
                ).toFixed(3)}kb\n`
              );
            });
          }
        });
      })
      .catch((err) => stdout.write(err.message));
  }
});
