const test = require('node:test');
const assert = require('node:assert/strict');

const { buildImageUrl, getRepositoryConfig } = require('./gallery-utils.js');

test('getRepositoryConfig prefers explicit configured repository details', () => {
  const config = getRepositoryConfig(
    { hostname: 'someone.github.io', pathname: '/other-repo/' },
    { githubOwner: 'woshichenghaibo', githubRepo: 'gallary', imagesPath: 'images' }
  );

  assert.deepEqual(config, {
    owner: 'woshichenghaibo',
    repo: 'gallary',
    imagesPath: 'images',
    siteBasePath: ''
  });
});

test('getRepositoryConfig infers owner and repo from GitHub Pages project URLs', () => {
  const config = getRepositoryConfig(
    { hostname: 'woshichenghaibo.github.io', pathname: '/gallary/' },
    {}
  );

  assert.deepEqual(config, {
    owner: 'woshichenghaibo',
    repo: 'gallary',
    imagesPath: 'images',
    siteBasePath: ''
  });
});

test('getRepositoryConfig infers user Pages repositories from root github.io URLs', () => {
  const config = getRepositoryConfig(
    { hostname: 'woshichenghaibo.github.io', pathname: '/' },
    {}
  );

  assert.deepEqual(config, {
    owner: 'woshichenghaibo',
    repo: 'woshichenghaibo.github.io',
    imagesPath: 'images',
    siteBasePath: ''
  });
});

test('getRepositoryConfig normalizes configured site base paths', () => {
  const config = getRepositoryConfig(
    { hostname: 'photos.example.com', pathname: '/' },
    { githubOwner: 'woshichenghaibo', githubRepo: 'gallary', siteBasePath: '/gallery-site/' }
  );

  assert.deepEqual(config, {
    owner: 'woshichenghaibo',
    repo: 'gallary',
    imagesPath: 'images',
    siteBasePath: '/gallery-site'
  });
});

test('buildImageUrl prefers download_url when GitHub returns one', () => {
  const url = buildImageUrl(
    {
      name: 'QQ (1).jpg',
      download_url: 'https://raw.githubusercontent.com/woshichenghaibo/gallary/main/images/QQ%20(1).jpg'
    },
    { owner: 'woshichenghaibo', repo: 'gallary', imagesPath: 'images', siteBasePath: '' },
    { origin: 'https://photos.example.com', hostname: 'photos.example.com', pathname: '/' }
  );

  assert.equal(url, 'https://raw.githubusercontent.com/woshichenghaibo/gallary/main/images/QQ%20(1).jpg');
});

test('buildImageUrl falls back to the deployed Pages path when download_url is absent', () => {
  const url = buildImageUrl(
    {
      name: 'QQ (1).jpg',
      path: 'images/QQ (1).jpg'
    },
    { owner: 'woshichenghaibo', repo: 'gallary', imagesPath: 'images', siteBasePath: '' },
    { origin: 'https://woshichenghaibo.github.io', hostname: 'woshichenghaibo.github.io', pathname: '/gallary/' }
  );

  assert.equal(url, 'https://woshichenghaibo.github.io/gallary/images/QQ%20(1).jpg');
});

test('buildImageUrl keeps root-relative paths for user Pages repositories', () => {
  const url = buildImageUrl(
    {
      name: 'cover.jpg',
      path: 'images/cover.jpg'
    },
    { owner: 'woshichenghaibo', repo: 'woshichenghaibo.github.io', imagesPath: 'images', siteBasePath: '' },
    { origin: 'https://woshichenghaibo.github.io', hostname: 'woshichenghaibo.github.io', pathname: '/posts/demo/' }
  );

  assert.equal(url, 'https://woshichenghaibo.github.io/images/cover.jpg');
});

test('buildImageUrl preserves nested entry paths when download_url is absent', () => {
  const url = buildImageUrl(
    {
      name: 'cover.jpg',
      path: 'assets/photos/cover.jpg'
    },
    { owner: 'woshichenghaibo', repo: 'gallary', imagesPath: 'assets/photos', siteBasePath: '' },
    { origin: 'https://woshichenghaibo.github.io', hostname: 'woshichenghaibo.github.io', pathname: '/gallary/' }
  );

  assert.equal(url, 'https://woshichenghaibo.github.io/gallary/assets/photos/cover.jpg');
});

test('buildImageUrl respects an explicit custom-domain site base path', () => {
  const url = buildImageUrl(
    {
      name: 'cover.jpg',
      path: 'images/cover.jpg'
    },
    { owner: 'woshichenghaibo', repo: 'gallary', imagesPath: 'images', siteBasePath: '/gallery-site' },
    { origin: 'https://photos.example.com', hostname: 'photos.example.com', pathname: '/preview/' }
  );

  assert.equal(url, 'https://photos.example.com/gallery-site/images/cover.jpg');
});
