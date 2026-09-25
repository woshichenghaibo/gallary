const PAGE_SIZE = 20;

const gallery = document.getElementById('gallery');
const pagination = document.getElementById('pagination');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const closeButton = document.querySelector('.close-btn');
const prevButton = document.querySelector('.prev-btn');
const nextButton = document.querySelector('.next-btn');
const year = document.getElementById('year');
const pageContent = document.querySelectorAll('header, main, footer');

year.textContent = String(new Date().getFullYear());

let images = [];
let currentPage = 1;
let totalPages = 1;
let currentIndex = 0;
let lastFocusedElement = null;

renderMessage('empty', '正在从 GitHub 读取图片目录...');

initializeGallery();

function initializeGallery() {
  let repositoryConfig;

  try {
    repositoryConfig = GalleryUtils.getRepositoryConfig(window.location, document.body.dataset);
  } catch (error) {
    renderMessage('error', getDisplayErrorMessage(error));
    console.error(error);
    return;
  }

  const imagesApiUrl = `https://api.github.com/repos/${repositoryConfig.owner}/${repositoryConfig.repo}/contents/${repositoryConfig.imagesPath}`;

  fetchDirectoryImages(imagesApiUrl)
    .then((entries) => {
      images = entries
        .sort((first, second) => first.name.localeCompare(second.name, undefined, { numeric: true, sensitivity: 'base' }))
        .map((entry) => ({
          name: entry.name,
          url: GalleryUtils.buildImageUrl(entry, repositoryConfig, window.location)
        }));

      totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
      renderPage(1);
    })
    .catch((error) => {
      renderMessage('error', getDisplayErrorMessage(error));
      console.error(error);
    });
}

async function fetchDirectoryImages(url) {
  const entries = await fetchDirectoryEntries(url);
  const imagesInDirectory = [];

  for (const entry of entries) {
    if (!entry) {
      continue;
    }

    if (entry.type === 'file' && GalleryUtils.isSupportedImageFile(entry.name)) {
      imagesInDirectory.push(entry);
      continue;
    }

    if (entry.type === 'dir' && entry.url) {
      const nestedImages = await fetchDirectoryImages(entry.url);
      imagesInDirectory.push(...nestedImages);
    }
  }

  return imagesInDirectory;
}

function fetchDirectoryEntries(url) {
  return fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(getFetchErrorMessage(response.status));
      }
      return response.json();
    })
    .then((entries) => {
      if (!Array.isArray(entries)) {
        throw new Error('GitHub API 返回的数据格式不正确。');
      }

      return entries;
    });
}

function renderPage(targetPage) {
  currentPage = Math.min(Math.max(targetPage, 1), totalPages);
  gallery.innerHTML = '';

  if (images.length === 0) {
    renderMessage('empty', 'images/ 目录里还没有可显示的图片。请上传 .jpg、.jpeg、.png、.gif、.webp 或 .avif 文件。');
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = images.slice(start, start + PAGE_SIZE);

  pageItems.forEach((imageEntry, index) => {
    const image = document.createElement('img');
    image.src = imageEntry.url;
    image.alt = `照片 ${start + index + 1}`;
    image.loading = 'lazy';
    image.addEventListener('load', () => image.classList.add('loaded'));
    image.addEventListener('click', () => openLightbox(start + index));
    gallery.appendChild(image);
  });

  renderPagination();
}

function renderPagination() {
  pagination.innerHTML = '';

  if (totalPages <= 1) {
    return;
  }

  pagination.appendChild(createPageButton('« 上一页', currentPage - 1, currentPage === 1));

  getVisiblePages(currentPage, totalPages).forEach((value) => {
    if (value === '...') {
      const span = document.createElement('span');
      span.className = 'ellipsis';
      span.textContent = '...';
      pagination.appendChild(span);
      return;
    }

    pagination.appendChild(createPageButton(String(value), value, false, value === currentPage));
  });

  pagination.appendChild(createPageButton('下一页 »', currentPage + 1, currentPage === totalPages));
}

function createPageButton(label, page, disabled, active = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.disabled = disabled;

  if (active) {
    button.classList.add('active');
    button.setAttribute('aria-current', 'page');
  }

  button.addEventListener('click', () => renderPage(page));
  return button;
}

function getVisiblePages(page, pages) {
  if (pages <= 7) {
    return Array.from({ length: pages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, '...', pages];
  }

  if (page >= pages - 3) {
    return [1, '...', pages - 4, pages - 3, pages - 2, pages - 1, pages];
  }

  return [1, '...', page - 1, page, page + 1, '...', pages];
}

function getFetchErrorMessage(status) {
  if (status === 403) {
    return 'GitHub Contents API 暂时不可用，可能触发了未登录访问频率限制，请稍后刷新重试。';
  }

  if (status === 404) {
    return '未能读取 images/ 目录。请确认仓库是公开仓库，且默认分支中存在 images/ 文件夹。';
  }

  return `未能从 GitHub 读取 images/ 目录（HTTP ${status}）。`;
}

function getDisplayErrorMessage(error) {
  if (error instanceof TypeError) {
    return '网络连接异常，暂时无法访问 GitHub Contents API，请稍后刷新重试。';
  }

  return error.message || '未能从 GitHub 读取 images/ 目录。';
}

function renderMessage(className, message) {
  gallery.innerHTML = `<p class="${className}">${message}</p>`;
  pagination.innerHTML = '';
}

function openLightbox(index) {
  if (images.length === 0) {
    return;
  }

  lastFocusedElement = document.activeElement;
  currentIndex = index;
  updateLightboxContent();
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  pageContent.forEach((element) => {
    element.setAttribute('aria-hidden', 'true');
    element.inert = true;
  });
  closeButton.focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  pageContent.forEach((element) => {
    element.removeAttribute('aria-hidden');
    element.inert = false;
  });
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function showImage(step) {
  if (images.length === 0) {
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, images.length);
  const pageLength = end - start;
  const pageOffset = (currentIndex - start + step + pageLength) % pageLength;

  currentIndex = start + pageOffset;
  updateLightboxContent();
}

closeButton.addEventListener('click', closeLightbox);
prevButton.addEventListener('click', () => showImage(-1));
nextButton.addEventListener('click', () => showImage(1));

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('active')) {
    return;
  }

  if (event.key === 'Tab') {
    trapFocus(event);
  } else if (event.key === 'Escape') {
    closeLightbox();
  } else if (event.key === 'ArrowLeft') {
    showImage(-1);
  } else if (event.key === 'ArrowRight') {
    showImage(1);
  }
});

function trapFocus(event) {
  const focusableElements = lightbox.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
  if (focusableElements.length === 0) {
    return;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function updateLightboxContent() {
  const imageEntry = images[currentIndex];
  lightboxImage.src = imageEntry.url;
  lightboxImage.alt = `预览图片 ${currentIndex + 1}: ${imageEntry.name}`;
  lightboxTitle.textContent = `图片预览（第 ${currentIndex + 1} 张）`;
}
