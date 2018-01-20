const { URL } = require('url');
const path = require('path');
const MarkdownProcessor = require('./markdown-processor');

const getPaginationPath = (pageNumber, paginationPath) => pageNumber === 1 ?
  '' : paginationPath.replace(':num', pageNumber);

const getPaginationFilename = (pageNumber, paginationPath) => {
  if (pageNumber === 1) {
    return 'index.html';
  }

  const filename = paginationPath.replace(':num', pageNumber);

  return path.extname(filename) ? filename : path.join(filename, 'index.html');
};

const nextPageUrl = ({ pageNumber, totalPages, paginationPath, baseUrl }) => {
  if (pageNumber === totalPages) {
    return null;
  }

  const path = getPaginationPath(pageNumber + 1, paginationPath);

  return (new URL(`${baseUrl.pathname}/${path}`, baseUrl.origin)).toString();
};

const previousPageUrl = ({ pageNumber, totalPages, paginationPath, baseUrl }) => {
  if (pageNumber === 1) {
    return null;
  }

  const path = getPaginationPath(pageNumber - 1, paginationPath);

  return (new URL(`${baseUrl.pathname}/${path}`, baseUrl.origin)).toString();
};

const sortPostsByDateDesc = posts => posts.sort((a, b) => b.date - a.date);

const groupPostsByPage = ({ posts, perPage, paginationPath, baseUrl }) => {
  const sortedPosts = sortPostsByDateDesc(posts);

  const totalPages = Math.ceil(sortedPosts.length / perPage);
  const pages = [];

  for (let i = 0; i < totalPages; i++) {
    const startIdx = i * perPage;
    const pageNumber = i + 1;

    pages[i] = {
      posts: sortedPosts.slice(startIdx, startIdx + perPage),
      pagination: {
        number: pageNumber,
        totalPages,
        nextUrl: nextPageUrl({ pageNumber, totalPages, paginationPath, baseUrl }),
        previousUrl: previousPageUrl({ pageNumber, totalPages, paginationPath, baseUrl })
      }
    };
  }

  return pages;
}

const createPostsIndex = (posts, config) => new Promise((resolve, reject) => {
  const baseUrl = new URL(config.posts.destinationDir, config.url);

  const pages = groupPostsByPage({
    posts,
    perPage: config.posts.pagination.perPage,
    paginationPath: config.posts.pagination.path,
    baseUrl
  });

  const markdownProcessor = new MarkdownProcessor({
    defaultLayout: config.defaultLayout,
    layoutsPath: path.join(config.sourcePath, config.layoutsDir)
  });

  const source = path.join(config.sourcePath, config.posts.sourceDir, 'index.md');

  Promise.all(pages.map(({ posts, pagination }) => {
    const filename = getPaginationFilename(pagination.number, config.posts.pagination.path);
    const destination = path.join(config.destinationPath, config.posts.destinationDir, filename);

    return markdownProcessor.process(source, destination, {
      config,
      posts,
      pagination
    });
  }))
  .then(results => resolve(results))
  .catch(err => reject(err));
});

module.exports = createPostsIndex;
