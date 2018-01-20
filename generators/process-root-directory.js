const { URL } = require('url');
const path = require('path');
const fs = require('fs-extra');
const getProcessableFiles = require('./file-finder/get-processable-files');
const MarkdownProcessor = require('./markdown-processor');

const processRootDirectory = config => new Promise((resolve, reject) =>
  getProcessableFiles({ ...config, baseUrl: new URL(config.url) })
    .then(({ markdownFiles, copyableFiles }) => {
      const copyFiles = Promise.all(
        copyableFiles.map(({ source, destination }) =>
          fs.copy(source, destination)
        )
      ).then(() => console.log('✅ Done copying files on root directory...'));

      const markdownProcessor = new MarkdownProcessor({
        defaultLayout: config.defaultLayout,
        layoutsPath: path.join(config.sourcePath, config.layoutsDir)
      });

      const processMarkdownFiles = Promise.all(
        markdownFiles.map(({ source, destination, url }) =>
          markdownProcessor.process(source, destination, { config })
        )
      ).then(() => console.log('✅ Done processing markdown files on root directory...'));;

      Promise.all([copyFiles, processMarkdownFiles])
        .then(results => {
          console.log('✅ Done processing root directory...')
          resolve(results);
        })
        .catch(err => reject(err));
    })
    .catch(err => reject(err))
);

module.exports = processRootDirectory;
