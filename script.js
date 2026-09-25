const PAGE_SIZE = 20;

const gallery = document.getElementById('gallery');
const pagination = document.getElementById('pagination');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-img');
const closeButton = document.querySelector('.close-btn');
const prevButton = document.querySelector('.prev-btn');
const nextButton = document.querySelector('.next-btn');
const year = document.getElementById('year');

year.textContent = String(new Date().getFullYear());

let images = [];
let currentPage = 1;
let totalPages = 1;
let currentIndex = 0;
let lastFocusedElement = null;
const jsonUrl = new URL('images.json', document.baseURI).toString();

fetch(jsonUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  })
  .then((files) => {
    images = Array.isArray(files) ? files : [];
    totalPages = Math.max(1, Math.ceil(images.length / PAGE_SIZE));
    renderPage(1);
  })
  .catch((error) => {
    gallery.innerHTML = '<p class="error">未能加载 images.json，请检查文件是否存在且格式正确。</p>';
    pagination.innerHTML = '';
    console.error(error);
  });

function renderPage(targetPage) {
  currentPage = Math.min(Math.max(targetPage, 1), totalPages);
  gallery.innerHTML = '';

  if (images.length === 0) {
    gallery.innerHTML = '<p class="empty">暂无图片，请将图片添加到 images/ 目录并更新 images.json。</p>';
    pagination.innerHTML = '';
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = images.slice(start, start + PAGE_SIZE);

  pageItems.forEach((filename, index) => {
    const image = document.createElement('img');
    image.src = buildImageUrl(filename);
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

function buildImageUrl(filename) {
  return new URL(`images/${filename}`, document.baseURI).toString();
}

function openLightbox(index) {
  if (images.length === 0) {
    return;
  }

  lastFocusedElement = document.activeElement;
  currentIndex = index;
  lightboxImage.src = buildImageUrl(images[currentIndex]);
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  closeButton.focus();
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function showImage(step) {
  if (images.length === 0) {
    return;
  }

  currentIndex = (currentIndex + step + images.length) % images.length;
  lightboxImage.src = buildImageUrl(images[currentIndex]);

  const targetPage = Math.floor(currentIndex / PAGE_SIZE) + 1;
  if (targetPage !== currentPage) {
    renderPage(targetPage);
  }
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
