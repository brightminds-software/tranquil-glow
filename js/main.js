/* ===========================
   START: GLOBAL HELPERS
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const setMenuIcon = (menuIcon, open) => {
    if (!menuIcon) return;
    menuIcon.classList.toggle('fa-bars', !open);
    menuIcon.classList.toggle('fa-times', open);
  };

  const closeAllFaqs = (exceptItem = null) => {
    $$('.faq-item').forEach(item => {
      if (item === exceptItem) return;

      item.classList.remove('active');
      const icon = $('.icon', item);
      if (icon) {
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
      }
    });
  };

  /* ===========================
     START: MAIN NAVIGATION
     =========================== */
  const menuToggle = $('.menu-toggle');
  const navLinks = $('.nav-links');
  const menuIcon = menuToggle ? $('i', menuToggle) : null;

  const closeMenu = () => {
    if (!navLinks || !menuIcon) return;
    navLinks.classList.remove('active');
    setMenuIcon(menuIcon, false);
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    if (!navLinks || !menuIcon) return;

    const isOpen = navLinks.classList.toggle('active');
    setMenuIcon(menuIcon, isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  };

  if (menuToggle && navLinks && menuIcon) {
    menuToggle.setAttribute('aria-expanded', 'false');

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }
  /* ===========================
     END: MAIN NAVIGATION
     =========================== */


  /* ===========================
     START: PRODUCT NAV SCROLL CONTROL
     =========================== */
  const productNav = $('#product-nav');

  if (productNav) {
    body.classList.add('has-product-nav');

    let lastScrollY = window.scrollY;
    let ticking = false;

    const getNavItems = () => {
      return Array.from(productNav.querySelectorAll('a'))
        .map(link => ({
          link,
          section: document.querySelector(link.getAttribute('href'))
        }))
        .filter(item => item.section);
    };

    const updateActiveProductLink = () => {
      const items = getNavItems();
      if (!items.length) return;

      const scrollPos = window.scrollY + 140;
      let activeHref = items[0].link.getAttribute('href');

      items.forEach(({ link, section }) => {
        if (section.offsetTop <= scrollPos) {
          activeHref = link.getAttribute('href');
        }
      });

      items.forEach(({ link }) => {
        link.classList.toggle('active', link.getAttribute('href') === activeHref);
      });
    };

    const updateProductNavVisibility = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        productNav.classList.remove('nav-hidden');
      } else if (currentScrollY > lastScrollY) {
        productNav.classList.add('nav-hidden');
      } else {
        productNav.classList.remove('nav-hidden');
      }

      lastScrollY = currentScrollY;
      ticking = false;
      updateActiveProductLink();
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateProductNavVisibility);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateActiveProductLink();
  }
  /* ===========================
     END: PRODUCT NAV SCROLL CONTROL
     =========================== */


  /* ===========================
     START: SMOOTH SCROLL
     =========================== */
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"], a[href*="index.html#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href') || '';
    const hashIndex = href.indexOf('#');
    const targetId = hashIndex >= 0 ? href.slice(hashIndex + 1) : '';

    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
  /* ===========================
     END: SMOOTH SCROLL
     =========================== */


  /* ===========================
     START: PRODUCT MODAL
     =========================== */
  const modal = $('#productModal');
  const modalPanel = $('.modal-panel', modal);
  const modalBody = $('.modal-body', modal);
  const modalImage = $('#modalImage');
  const modalTitle = $('#modalTitle');
  const modalPrice = $('#modalPrice');
  const modalDescription = $('#modalDescription');
  const modalBuy = $('#modalBuy');
  const modalClose = $('.modal-close', modal);

  let lastFocusedElement = null;
  let savedScrollY = 0;

  const lockPageScroll = () => {
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const unlockPageScroll = () => {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    window.scrollTo(0, savedScrollY);
  };

  const applyModalSizing = () => {
    if (!modal || !modalPanel || !modalBody || !modalImage) return;

    const w = window.innerWidth;

    if (w >= 992) {
      modalPanel.style.width = 'min(980px, 90vw)';
      modalPanel.style.maxHeight = '88vh';
      modalPanel.style.overflow = 'hidden';

      modalBody.style.display = 'grid';
      modalBody.style.gridTemplateColumns = 'minmax(360px, 1fr) minmax(320px, 0.95fr)';
      modalBody.style.alignItems = 'stretch';
      modalBody.style.minHeight = '520px';

      modalImage.style.width = '100%';
      modalImage.style.height = '100%';
      modalImage.style.minHeight = '520px';
      modalImage.style.objectFit = 'cover';
      modalImage.style.objectPosition = 'center';
      modalImage.style.display = 'block';
    } else {
      modalPanel.style.width = 'min(100%, 96vw)';
      modalPanel.style.maxHeight = '90vh';
      modalPanel.style.overflow = 'hidden';

      modalBody.style.display = 'flex';
      modalBody.style.flexDirection = 'column';
      modalBody.style.minHeight = 'auto';

      modalImage.style.width = '100%';
      modalImage.style.height = 'clamp(220px, 50vw, 320px)';
      modalImage.style.minHeight = '220px';
      modalImage.style.objectFit = 'cover';
      modalImage.style.objectPosition = 'center';
      modalImage.style.display = 'block';
    }
  };

  const openModal = ({ title, price, imageSrc, imageAlt, descriptionHTML, buyHref }) => {
    if (!modal || !modalImage || !modalTitle || !modalPrice || !modalDescription || !modalBuy) return;

    lastFocusedElement = document.activeElement;

    modalTitle.textContent = title || '';
    modalPrice.textContent = price || '';
    modalImage.src = imageSrc || '';
    modalImage.alt = imageAlt || title || '';
    modalDescription.innerHTML = descriptionHTML || '<p>No extra details available.</p>';

    if (buyHref) {
      modalBuy.href = buyHref;
      modalBuy.style.display = '';
    } else {
      modalBuy.href = '#';
      modalBuy.style.display = 'none';
    }

    applyModalSizing();
    lockPageScroll();
    modal.setAttribute('aria-hidden', 'false');

    window.requestAnimationFrame(() => {
      modalClose?.focus({ preventScroll: true });
    });
  };

  const closeModal = () => {
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    unlockPageScroll();

    window.requestAnimationFrame(() => {
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus({ preventScroll: true });
      }
    });
  };

  const getProductData = (card) => {
    const titleEl = $('h3', card);
    const priceEl = $('.price', card);
    const imgEl = $('img', card);
    const descriptionEl = $('.product-full-description', card);
    const buyEl = $('.btn-buy', card);

    return {
      title: titleEl ? titleEl.textContent.trim() : '',
      price: priceEl ? priceEl.textContent.trim() : '',
      imageSrc: imgEl ? imgEl.getAttribute('src') : '',
      imageAlt: imgEl ? imgEl.getAttribute('alt') : '',
      descriptionHTML: descriptionEl ? descriptionEl.innerHTML : '',
      buyHref: buyEl ? buyEl.getAttribute('href') : ''
    };
  };

  $$('.btn-view-more, .btn-details').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      const card = button.closest('.product-card');
      if (!card) return;

      openModal(getProductData(card));
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close], .modal-overlay')) {
        closeModal();
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  window.addEventListener('resize', () => {
    if (modal && modal.getAttribute('aria-hidden') === 'false') {
      applyModalSizing();
    }
  });
  /* ===========================
     END: PRODUCT MODAL
     =========================== */


  /* ===========================
     START: FAQ
     =========================== */
  $$('.faq-item').forEach(item => {
    const question = $('.faq-question', item);
    const icon = $('.icon', item);

    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      closeAllFaqs(item);
      item.classList.toggle('active', !isActive);

      if (icon) {
        icon.classList.toggle('fa-plus', isActive);
        icon.classList.toggle('fa-minus', !isActive);
      }
    });
  });
  /* ===========================
     END: FAQ
     =========================== */


  /* ===========================
     START: CONTACT FORM
     =========================== */
  const contactForm = $('#contactForm');

  if (contactForm) {
    let feedback = $('#formFeedback');

    if (!feedback) {
      feedback = document.createElement('p');
      feedback.id = 'formFeedback';
      feedback.style.display = 'none';
      feedback.style.textAlign = 'center';
      feedback.style.marginTop = '15px';
      feedback.style.fontFamily = 'var(--font-body)';
      feedback.style.color = 'var(--color-primary)';
      contactForm.appendChild(feedback);
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEl = $('#name', contactForm);
      const emailEl = $('#email', contactForm);
      const messageEl = $('#message', contactForm);

      const name = nameEl ? nameEl.value.trim() : '';
      const email = emailEl ? emailEl.value.trim() : '';
      const message = messageEl ? messageEl.value.trim() : '';

      const refinedMessage = `My name is ${name}, my email is ${email}, and here is my message: ${message}`;
      const encodedMessage = encodeURIComponent(refinedMessage);
      const whatsappNumber = '254795284897';

      feedback.textContent = 'Redirecting to WhatsApp…';
      feedback.style.display = 'block';

      setTimeout(() => {
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank', 'noopener');
        contactForm.reset();

        setTimeout(() => {
          feedback.style.display = 'none';
        }, 3000);
      }, 1000);
    });
  }
  /* ===========================
     END: CONTACT FORM
     =========================== */
});
/* ===========================
   END: GLOBAL HELPERS
   =========================== */