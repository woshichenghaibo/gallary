(function (global) {
  const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

  function isSupportedImageFile(filename) {
    const lowercaseFilename = filename.toLowerCase();
    return SUPPORTED_IMAGE_EXTENSIONS.some((extension) => lowercaseFilename.endsWith(extension));
  }

  function getRepositoryConfig(locationLike, dataset = {}) {
    const configuredOwner = dataset.githubOwner || '';
    const configuredRepo = dataset.githubRepo || '';
    const configuredImagesPath = dataset.imagesPath || 'images';
    const configuredSiteBasePath = dataset.siteBasePath || '';
    const hostname = locationLike.hostname || '';
    const pathname = locationLike.pathname || '/';

    if (configuredOwner && configuredRepo) {
      return {
        owner: configuredOwner,
        repo: configuredRepo,
        imagesPath: configuredImagesPath,
        siteBasePath: normalizeBasePath(configuredSiteBasePath)
      };
    }

    if (hostname.endsWith('.github.io')) {
      const pathSegments = pathname.split('/').filter(Boolean);
      const inferredOwner = hostname.split('.')[0];
      const inferredRepo = pathSegments[0] || `${inferredOwner}.github.io`;

      if (inferredOwner && inferredRepo) {
        return {
          owner: inferredOwner,
          repo: inferredRepo,
          imagesPath: configuredImagesPath,
          siteBasePath: normalizeBasePath(configuredSiteBasePath)
        };
      }
    }

    throw new Error('未配置 GitHub 仓库信息。请在页面的 data-github-owner 和 data-github-repo 属性中指定公开仓库。');
  }

  function buildImageUrl(entry, repositoryConfig, locationLike) {
    if (entry.download_url) {
      return entry.download_url;
    }

    const basePath = getSiteBasePath(locationLike, repositoryConfig);
    const relativeContentPath = entry.path || joinUrlPath(repositoryConfig.imagesPath, entry.name || extractImageName(entry.path || ''));
    const imagePath = joinUrlPath(basePath, relativeContentPath);
    return new URL(imagePath, locationLike.origin).toString();
  }

  function extractImageName(entryPath) {
    const parts = entryPath.split('/');
    return parts[parts.length - 1] || '';
  }

  function getSiteBasePath(locationLike, repositoryConfig) {
    if (repositoryConfig.siteBasePath) {
      return repositoryConfig.siteBasePath;
    }

    const hostname = locationLike.hostname || '';
    const pathname = locationLike.pathname || '/';
    const userSiteRepoName = `${repositoryConfig.owner}.github.io`;

    if (hostname.endsWith('.github.io')) {
      if (repositoryConfig.repo === userSiteRepoName) {
        return '';
      }

      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments[0] === repositoryConfig.repo) {
        return `/${repositoryConfig.repo}`;
      }
    }

    return '';
  }

  function normalizeBasePath(siteBasePath) {
    if (!siteBasePath || siteBasePath === '/') {
      return '';
    }

    return `/${siteBasePath.replace(/^\/+|\/+$/g, '')}`;
  }

  function joinUrlPath(...parts) {
    return parts
      .filter(Boolean)
      .map((part, index) => {
        if (index === 0) {
          return part.replace(/\/+$/g, '');
        }

        return part.replace(/^\/+|\/+$/g, '');
      })
      .join('/');
  }

  const GalleryUtils = {
    SUPPORTED_IMAGE_EXTENSIONS,
    buildImageUrl,
    getRepositoryConfig,
    isSupportedImageFile
  };

  global.GalleryUtils = GalleryUtils;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryUtils;
  }
})(typeof globalThis !== 'undefined' ? globalThis : window);
