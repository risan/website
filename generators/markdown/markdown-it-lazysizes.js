const defaultInitialSrc =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

const markdownItLazysizes = (
  md,
  { className = 'lazyload', initialSrc = defaultInitialSrc } = {}
) => {
  /* eslint-disable no-param-reassign */
  md.renderer.rules.image = (tokens, idx) => {
    const token = tokens[idx];
    const alt = token.content;
    const src = token.attrGet('src');

    return `<img src="${initialSrc}" alt="${alt}" data-sizes="auto" data-src="${src}" class="${className}">
      <noscript><img src="${src}" alt="${alt}"></noscript>`;
  };
};

module.exports = markdownItLazysizes;
