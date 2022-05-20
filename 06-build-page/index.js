const path = require('path');
const fs = require('fs');
const { readdir, copyFile, rm, mkdir } = require('fs/promises');

const paths = {
  COPY_FOLDER_PATH: path.join(__dirname, 'project-dist'),
  COPY_ASSETS_PATH: path.join(__dirname, 'project-dist', 'assets'),
  RESULT_PATH: path.join(__dirname, 'project-dist', 'index.html'),
  MERGE_PATH: path.join(__dirname, 'project-dist', 'style.css'),
  ASSETS_PATH: path.join(__dirname, 'assets'),
  COMPONENTS_PATH: path.join(__dirname, 'components'),
  STYLES_PATH: path.join(__dirname, 'styles'),
  TEMPLATE_PATH: path.join(__dirname, 'template.html'),
};
class BuilderPage {
  constructor(paths) {
    this.copyFolderPath = paths.COPY_FOLDER_PATH;
    this.copyAssetsPath = paths.COPY_ASSETS_PATH;
    this.resultPath = paths.RESULT_PATH;
    this.mergePath = paths.MERGE_PATH;
    this.assetsPath = paths.ASSETS_PATH;
    this.componentPath = paths.COMPONENTS_PATH;
    this.stylePath = paths.STYLES_PATH;
    this.templatePath = paths.TEMPLATE_PATH;
  }
  async _copyDirectory(target, copy) {
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
          await this._copyDirectory(input, output);
        }
      }
    } catch (err) {
      console.log(`_copyDirectory Error: ${err.message}`);
    }
  }

  async _createTemplate(template, components, result) {
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

        if (chunkComponent.isFile() && fileParams.ext === '.html') {
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
      console.log(`_createTemplate Error: ${err.message}`);
    }
  }

  async _mergeStyles(styles, container) {
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
      writableStream.write(buffer.reverse().join('\n'));
    } catch (err) {
      console.log(`_mergeStyles Error: ${err.message}`);
    }
  }

  async buildPage() {
    try {
      await rm(this.copyFolderPath, { recursive: true, force: true });
      await mkdir(this.copyFolderPath, { recursive: true });
      await this._copyDirectory(this.assetsPath, this.copyAssetsPath);
      await this._createTemplate(
        this.templatePath,
        this.componentPath,
        this.resultPath
      );
      await this._mergeStyles(this.stylePath, this.mergePath);
    } catch (err) {
      console.log(`buildPage: ${err.message}`);
    }
  }
}

const builderPage = new BuilderPage(paths);
builderPage.buildPage();
