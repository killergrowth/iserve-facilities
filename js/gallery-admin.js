(function () {
  'use strict';

  async function loadGalleryData() {
    const res = await fetch('data/gallery.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load gallery data');
    return res.json();
  }

  function renderGalleryPage(data) {
    const nav = document.getElementById('gallery-tag-nav');
    const grid = document.getElementById('gallery-unified-grid');
    const emptyNote = document.getElementById('gallery-empty-note');
    if (!nav || !grid) return;

    var currentFilter = 'all';

    // Build service label lookup
    var serviceLabels = {};
    data.services.forEach(function (s) { serviceLabels[s.id] = s.label; });

    // Build nav: All + each service — two rows, row 1 wider (6 items), row 2 narrower (5 items)
    function buildNav() {
      nav.innerHTML = '';
      var buttons = [];

      var allBtn = document.createElement('a');
      allBtn.href = '#';
      allBtn.textContent = 'All Photos';
      allBtn.className = 'active';
      allBtn.dataset.filter = 'all';
      buttons.push(allBtn);

      data.services.forEach(function (service) {
        var btn = document.createElement('a');
        btn.href = '#';
        btn.textContent = service.label;
        btn.dataset.filter = service.id;
        buttons.push(btn);
      });

      var splitAt = Math.ceil(buttons.length / 2);
      var row1 = document.createElement('div');
      row1.className = 'gallery-tag-row';
      var row2 = document.createElement('div');
      row2.className = 'gallery-tag-row';

      buttons.forEach(function (btn, i) {
        if (i < splitAt) { row1.appendChild(btn); }
        else { row2.appendChild(btn); }
      });

      nav.appendChild(row1);
      nav.appendChild(row2);
    }

    function renderPhotos(filter) {
      grid.innerHTML = '';
      var photos = filter === 'all'
        ? data.photos
        : data.photos.filter(function (p) { return (p.tags || []).includes(filter); });

      if (emptyNote) emptyNote.style.display = photos.length ? 'none' : '';

      photos.forEach(function (photo) {
        var item = document.createElement('div');
        item.className = 'gallery-unified-item';

        var img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.caption || '';
        img.loading = 'lazy';

        // Corner tag — show first tag label
        var firstTag = (photo.tags || [])[0];
        var tagLabel = firstTag ? (serviceLabels[firstTag] || firstTag) : '';
        var tag = document.createElement('span');
        tag.className = 'gallery-corner-tag';
        tag.textContent = tagLabel;

        item.appendChild(img);
        item.appendChild(tag);
        grid.appendChild(item);
      });
    }

    nav.addEventListener('click', function (e) {
      e.preventDefault();
      var btn = e.target.closest('a[data-filter]');
      if (!btn) return;
      nav.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderPhotos(currentFilter);
    });

    buildNav();
    renderPhotos('all');
  }

  function renderUploadPage(data) {
    const servicesWrap = document.getElementById('upload-tag-list');
    const listWrap = document.getElementById('upload-photo-list');
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('upload-files');
    const applyAllBtn = document.getElementById('apply-all-tags-btn');
    const deleteBtn = document.getElementById('delete-photo-btn');
    const status = document.getElementById('upload-status');
    if (!servicesWrap || !listWrap || !form) return;

    servicesWrap.innerHTML = '';
    data.services.forEach(function (service) {
      const label = document.createElement('label');
      label.innerHTML = '<input type="checkbox" value="' + service.id + '"> ' + service.label;
      servicesWrap.appendChild(label);
    });

    function renderPhotos() {
      listWrap.innerHTML = '';
      data.photos.forEach(function (photo, index) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'upload-photo-item';
        item.dataset.photoId = photo.id;
        item.innerHTML = '<img src="' + photo.src + '" alt="' + photo.caption + '"><span>' + photo.caption + '</span><small>' + (photo.tags || []).join(', ') + '</small>';
        item.addEventListener('click', function () {
          listWrap.querySelectorAll('.upload-photo-item').forEach(function (node) { node.classList.remove('selected'); });
          item.classList.add('selected');
          listWrap.dataset.selectedPhotoId = photo.id;
          servicesWrap.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
            box.checked = (photo.tags || []).includes(box.value);
          });
        });
        if (index === 0) item.click();
        listWrap.appendChild(item);
      });
    }

    function selectedPhoto() {
      const selectedId = listWrap.dataset.selectedPhotoId;
      return data.photos.find(function (photo) { return photo.id === selectedId; });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const files = fileInput.files;
      if (!files || !files.length) {
        status.textContent = 'Front-end scaffold ready. File persistence needs backend storage next.';
        return;
      }
      status.textContent = 'Upload UI is ready, but actual file saving still needs backend storage.';
    });

    applyAllBtn.addEventListener('click', function () {
      const photo = selectedPhoto();
      if (!photo) return;
      photo.tags = Array.from(servicesWrap.querySelectorAll('input[type="checkbox"]:checked')).map(function (box) { return box.value; });
      renderPhotos();
      status.textContent = 'Tags updated in the current browser session. Backend save is the next step.';
    });

    deleteBtn.addEventListener('click', function () {
      const selectedId = listWrap.dataset.selectedPhotoId;
      if (!selectedId) return;
      data.photos = data.photos.filter(function (photo) { return photo.id !== selectedId; });
      delete listWrap.dataset.selectedPhotoId;
      renderPhotos();
      status.textContent = 'Photo removed from the current browser session. Backend delete is the next step.';
    });

    renderPhotos();
  }

  document.addEventListener('DOMContentLoaded', async function () {
    try {
      const data = await loadGalleryData();
      renderGalleryPage(data);
      renderUploadPage(data);
    } catch (err) {
      console.error(err);
    }
  });
})();