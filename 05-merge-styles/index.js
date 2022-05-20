const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

const MERGE_PATH = path.join(__dirname, 'project-dist', 'bundle.css');
const STYLES_PATH = path.join(__dirname, 'styles');

const mergeStyles = async (styles, container) => {
  try {
    const writableStream = fs.createWriteStream(container);
    const dir = await readdir(styles, { withFileTypes: true });
    let buffer = [];

    for await (let chunk of dir) {
      const filePath = path.join(styles, chunk.name);
      const fileParams = path.parse(filePath);

      if (chunk.isFile() && fileParams.ext === '.css') {
        const readableStream = fs.createReadStream(filePath, 'utf-8');
        for await (const chunk of readableStream) {
          buffer.push(chunk.trim());
        }
      }
    }
    writableStream.write(buffer.join('\n'));
  } catch (err) {
    console.log(`mergeStyles Error: ${err.message}`);
  }
};

mergeStyles(STYLES_PATH, MERGE_PATH);
