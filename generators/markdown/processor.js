const path = require('path');
const pug = require('pug');
const fs = require('fs-extra');
const dateFormat = require('date-fns/format');
const minifyHtml = require('html-minifier').minify;
const MarkdownParser = require('./markdown-parser');

class Processor {
  constructor({
    defaultLayout,
    layoutsPath,
    defaultMinify = false,
    lazyloadImage = false
  }) {
    this.defaultLayout = defaultLayout;
    this.layoutsPath = layoutsPath;
    this.defaultMinify = defaultMinify;
    this.markdownParser = new MarkdownParser({ lazyloadImage });
  }

  process({
    source,
    destination,
    url = null,
    defaultLayout = this.defaultLayout,
    minify = this.defaultMinify,
    viewData = {}
  }) {
    return new Promise(async (resolve, reject) => {
      try {
        const { attributes, content } = await this.markdownParser.parse(source);
        const { layout = defaultLayout } = attributes;
        const pugLayout = pug.compileFile(
          path.join(this.layoutsPath, `${layout}.pug`)
        );

        let html = pugLayout({
          ...attributes,
          content,
          url,
          ...viewData,
          dateFormat
        });

        if (minify) {
          html = minifyHtml(html, {
            collapseWhitespace: true
          });
        }

        await fs.outputFile(destination, html);
        resolve({ ...attributes, url });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = Processor;
