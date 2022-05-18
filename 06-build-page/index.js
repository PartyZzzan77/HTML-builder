const path = require('path');
const fs = require('fs');
const { readdir, copyFile, rm, mkdir } = require('fs/promises');

const COPY_FOLDER_PATH = path.join(__dirname, 'project-dist');
const COPY_ASSETS_PATH = path.join(__dirname, 'project-dist', 'assets');
const RESULT_PATH = path.join(__dirname, 'project-dist', 'index.html');
const MERGE_PATH = path.join(__dirname, 'project-dist', 'style.css');

const ASSETS_PATH = path.join(__dirname, 'assets');
const COMPONENTS_PATH = path.join(__dirname, 'components');
const STYLES_PATH = path.join(__dirname, 'styles');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');

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
    console.log('copyDirectory Error: ', err.message);
  }
};

const createTemplate = async (template, components, result) => {
  try {
    const writableStream = fs.createWriteStream(result);
    const dir = await readdir(components, { withFileTypes: true });
    let targetTemplate = fs.createReadStream(template, 'utf-8');
    for await (const chunk of targetTemplate) {
      targetTemplate = chunk;
    }
    for await (const chunkComponent of dir) {
      const filePath = path.join(components, chunkComponent.name);
      const fileParams = path.parse(filePath);

      if (fileParams.ext === '.html' && chunkComponent.isFile()) {
        let readableStream = fs.createReadStream(filePath);
        for await (const chunk of readableStream) {
          readableStream = chunk;
        }
        targetTemplate = targetTemplate.replace(
          `{{${fileParams.name}}}`,
          readableStream
        );
      }
    }
    writableStream.write(targetTemplate);
  } catch (err) {
    console.log('createTemplate Error: ', err.message);
  }
};

const mergeStyles = async (styles, container) => {
  try {
    const writableStream = fs.createWriteStream(container);
    const dir = await readdir(styles, { withFileTypes: true });
    for await (let chunk of dir) {
      const filePath = path.join(styles, chunk.name);
      const fileParams = path.parse(filePath);

      if (fileParams.ext === '.css' && chunk.isFile()) {
        const readableStream = fs.createReadStream(filePath, 'utf-8');
        readableStream.pipe(writableStream);
      }
    }
  } catch (err) {
    console.log('mergeStyles Error: ', err.message);
  }
};

const builderPage = async () => {
  try {
    await rm(COPY_FOLDER_PATH, { recursive: true, force: true });
    await mkdir(COPY_FOLDER_PATH, { recursive: true });
    await copyDirectory(ASSETS_PATH, COPY_ASSETS_PATH);
    await createTemplate(TEMPLATE_PATH, COMPONENTS_PATH, RESULT_PATH);
    await mergeStyles(STYLES_PATH, MERGE_PATH);
  } catch (err) {
    console.log('builderPage: ', err.message);
  }
};

builderPage();
