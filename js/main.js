/* =============================================================
   IServe Facilities – main.js
   Vanilla JS: nav dropdown, mobile menu, FAQ accordion,
   scroll-reveal animations, grime button, contact form
   ============================================================= */

(function () {
  'use strict';

  /* ─── Active Nav Link ────────────────────────────────────── */
  function setActiveNav() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    document.querySelectorAll('[data-nav]').forEach(function (el) {
      const navPage = el.getAttribute('data-nav');
      let isActive = false;

      if (navPage === 'home' && (filename === 'index.html' || filename === '')) {
        isActive = true;
      } else if (navPage === 'about' && filename === 'about.html') {
        isActive = true;
      } else if (navPage === 'services' && filename === 'services.html') {
        isActive = true;
      } else if (navPage === 'gallery' && filename === 'gallery.html') {
        isActive = true;
      } else if (navPage === 'locations' && (filename === 'locations.html' || path.includes('/locations/'))) {
        isActive = true;
      } else if (navPage === 'contact' && filename === 'contact.html') {
        isActive = true;
      } else if (navPage === 'apply' && filename === 'apply.html') {
        isActive = true;
      }

      if (isActive) {
        el.classList.add('active');
        if (el.tagName === 'BUTTON') el.style.color = 'var(--primary)';
      }
    });
  }

  /* ─── Desktop Locations Dropdown ────────────────────────── */
  function initDropdown() {
    const wrap = document.getElementById('locations-dropdown-wrap');
    const dropdown = document.getElementById('locations-dropdown');
    const trigger = wrap ? wrap.querySelector('button') : null;
    if (!wrap || !dropdown || !trigger) return;

    function openDropdown() {
      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeDropdown() {
      dropdown.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    wrap.addEventListener('mouseenter', openDropdown);

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      const isOpen = dropdown.classList.contains('open');
      if (isOpen) {
        window.location.href = 'locations.html';
      } else {
        openDropdown();
      }
    });

    dropdown.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeDropdown();
      });
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) closeDropdown();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
    });
  }

  /* ─── Mobile Menu ────────────────────────────────────────── */
  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-nav');
    const locToggle = document.getElementById('mobile-locations-toggle');
    const locSub = document.getElementById('mobile-locations-sub');

    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      menu.classList.toggle('open');
      // Toggle hamburger icon
      const open = menu.classList.contains('open');
      btn.querySelector('.icon-menu').style.display = open ? 'none' : 'block';
      btn.querySelector('.icon-close').style.display = open ? 'block' : 'none';
    });

    if (locToggle && locSub) {
      locToggle.addEventListener('click', function () {
        locSub.classList.toggle('open');
        locToggle.classList.toggle('open');
      });
    }
  }

  /* ─── FAQ Accordion ──────────────────────────────────────── */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all others
        document.querySelectorAll('.faq-item').forEach(function (i) {
          i.classList.remove('open');
        });

        // Toggle current
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  /* ─── Scroll-Reveal Animations ───────────────────────────── */
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show everything
      document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ─── Staggered Children ─────────────────────────────────── */
  function initStaggeredChildren() {
    document.querySelectorAll('[data-stagger]').forEach(function (parent) {
      const children = parent.querySelectorAll('.animate-on-scroll');
      children.forEach(function (child, i) {
        child.style.transitionDelay = (i * 0.08) + 's';
      });
    });
  }

  /* ─── Grime Button ───────────────────────────────────────── */
  function initGrimeButtons() {
    document.querySelectorAll('.btn-grime').forEach(function (btn) {
      var timeout;
      var dirty = btn.querySelector('.btn-grime-dirty');
      var clean = btn.querySelector('.btn-grime-clean');
      if (!dirty || !clean) return;

      // On hover: clean
      btn.addEventListener('mouseenter', function () {
        clearTimeout(timeout);
        dirty.style.opacity = '0';
        clean.style.opacity = '0.45';
      });

      // On leave: start 30s reset timer
      btn.addEventListener('mouseleave', function () {
        timeout = setTimeout(function () {
          dirty.style.opacity = '0.35';
          clean.style.opacity = '0';
        }, 30000);
      });

      // Mobile: trigger clean after 3s of being in viewport
      if ('IntersectionObserver' in window) {
        var triggered = false;
        var mobileObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !triggered && window.innerWidth < 768) {
              triggered = true;
              setTimeout(function () {
                dirty.style.opacity = '0';
                clean.style.opacity = '0.45';
              }, 3000);
            }
          });
        });
        mobileObs.observe(btn);
      }
    });
  }

  /* ─── Contact Form ───────────────────────────────────────── */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    var submitBtn = document.getElementById('form-submit-btn');
    var successModal = document.getElementById('contact-success-modal');
    var successBackdrop = document.getElementById('contact-success-backdrop');

    if (!form) return;

    function clearErrors() {
      form.querySelectorAll('.error').forEach(function (field) {
        field.classList.remove('error');
      });
    }

    function validateForm() {
      clearErrors();
      var firstInvalid = null;
      Array.from(form.querySelectorAll('input, textarea, select')).forEach(function (field) {
        if (!field.checkValidity()) {
          field.classList.add('error');
          if (!firstInvalid) firstInvalid = field;
        }
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    function closeSuccessModal() {
      if (successModal) successModal.classList.remove('show');
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      var data = {
        name: form.name.value,
        business: form.business ? form.business.value : '',
        phone: form.phone.value,
        email: form.email.value,
        city: form.city ? form.city.value : '',
        service_needed: form.service_needed ? form.service_needed.value : '',
        message: form.message ? form.message.value : '',
      };

      try {
        var endpoint = form.getAttribute('data-endpoint') || 'https://formspree.io/f/YOUR_FORM_ID';
        var res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          form.reset();
          clearErrors();
          if (successModal) successModal.classList.add('show');
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        var subject = encodeURIComponent('Quote Request from ' + data.name);
        var body = encodeURIComponent(
          'Name: ' + data.name + '\n' +
          'Business: ' + data.business + '\n' +
          'Phone: ' + data.phone + '\n' +
          'Email: ' + data.email + '\n' +
          'City: ' + data.city + '\n' +
          'Service: ' + data.service_needed + '\n\n' +
          data.message
        );
        window.location.href = 'mailto:service@iservefacilities.com?subject=' + subject + '&body=' + body;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Request a Quote';
        }
      }
    });

    form.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        if (field.checkValidity()) field.classList.remove('error');
      });
    });

    if (successModal) {
      successModal.addEventListener('click', closeSuccessModal);
    }
    if (successBackdrop) {
      successBackdrop.addEventListener('click', closeSuccessModal);
    }
  }

  /* ─── Gallery Hover ──────────────────────────────────────── */
  function initGallery() {
    // CSS handles hover transitions; nothing extra needed
  }

  function initApplyForm() {
    var form = document.getElementById('apply-form');
    var successBox = document.getElementById('apply-success');
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    if (!form || !successBox) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      try {
        var data = {
          name: form.name ? form.name.value : '',
          phone: form.phone ? form.phone.value : '',
          email: form.email ? form.email.value : '',
          about: form.about ? form.about.value : '',
        };

        // Read resume file as base64
        var fileInput = form.querySelector('input[type="file"]');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          var file = fileInput.files[0];
          data.resumeFilename = file.name;
          data.resumeMimeType = file.type || 'application/octet-stream';
          data.resumeBase64 = await new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
              // strip the data:...;base64, prefix
              var result = reader.result;
              resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }

        var res = await fetch('https://iserve-apply-form.notifications-27c.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (res.ok) {
          form.style.display = 'none';
          successBox.style.display = 'block';
        } else {
          throw new Error('Server error ' + res.status);
        }
      } catch (err) {
        alert('Something went wrong submitting your application. Please try again or email us directly at service@iservefacilities.com.');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
        }
      }
    });
  }

  /* ─── Init ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    setActiveNav();
    initDropdown();
    initMobileMenu();
    initFAQ();
    initScrollReveal();
    initStaggeredChildren();
    initGrimeButtons();
    initContactForm();
    initGallery();
    initApplyForm();
  });

})();
