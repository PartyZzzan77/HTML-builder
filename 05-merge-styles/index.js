const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

const MERGE_PATH = path.join(__dirname, 'project-dist', 'bundle.css');
const STYLES_PATH = path.join(__dirname, 'styles');

const mergeStyles = async (styles, container) => {
  try {
    const writableStream = fs.createWriteStream(container);
    const stylesBuffer = [];

    const dir = await readdir(styles, { withFileTypes: true });
    for await (let chunk of dir) {
      const filePath = path.join(styles, chunk.name);
      const fileParams = path.parse(filePath);

      if (fileParams.ext === '.css') {
        const readableStream = fs.createReadStream(filePath, 'utf-8');
        for await (let chunk of readableStream) {
          stylesBuffer.push(chunk);
        }
      }
    }
    writableStream.write(stylesBuffer.join('\n').toString());
  } catch (err) {
    console.log('Error: ', err.message);
  }
};

(async () => {
  await mergeStyles(STYLES_PATH, MERGE_PATH);
})();
