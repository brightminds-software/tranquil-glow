
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

  const formatMoney = (value) => {
    const amount = Number.isFinite(value) ? Math.round(value) : 0;
    try {
      return `KSh ${new Intl.NumberFormat('en-KE').format(amount)}`;
    } catch {
      return `KSh ${amount.toLocaleString()}`;
    }
  };

  const parsePrice = (text) => {
    if (!text) return 0;
    const cleaned = String(text).replace(/,/g, '');
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  };

  const slugify = (value) =>
    String(value || '')
      .toLowerCase()
      .trim()
      .replace(/['’"]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const getText = (el) => (el ? el.textContent.trim() : '');

  const createScrollableLock = () => {
    let savedScrollY = 0;
    const reasons = new Set();

    const sync = () => {
      const shouldLock = reasons.size > 0;

      if (shouldLock) {
        if (document.documentElement.style.overflow !== 'hidden' || document.body.style.overflow !== 'hidden') {
          savedScrollY = window.scrollY || window.pageYOffset || 0;
        }

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      } else {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        window.scrollTo(0, savedScrollY);
      }
    };

    const lock = (reason = 'default') => {
      reasons.add(reason);
      sync();
    };

    const unlock = (reason = 'default') => {
      reasons.delete(reason);
      sync();
    };

    return { lock, unlock, isLocked: () => reasons.size > 0 };
  };

  const pageLock = createScrollableLock();

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
  const modalPanel = modal ? $('.modal-panel', modal) : null;
  const modalBody = modal ? $('.modal-body', modal) : null;
  const modalImage = $('#modalImage');
  const modalTitle = $('#modalTitle');
  const modalPrice = $('#modalPrice');
  const modalDescription = $('#modalDescription');
  const modalBuy = $('#modalBuy');
  const modalClose = modal ? $('.modal-close', modal) : null;

  let lastFocusedElement = null;

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
    pageLock.lock('modal');
    modal.setAttribute('aria-hidden', 'false');

    window.requestAnimationFrame(() => {
      modalClose?.focus({ preventScroll: true });
    });
  };

  const closeModal = () => {
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    pageLock.unlock('modal');

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

    const title = getText(titleEl);
    const priceText = getText(priceEl);
    const priceValue = parsePrice(priceText);
    const isOfferCard = card.classList.contains('offer-card');
    const offerCartImage = 'images/offer/image1.jpg';

    return {
      key: card.dataset.cartId || card.id || slugify(`${title}-${priceText}`),
      title,
      priceText,
      priceValue,
      imageSrc: imgEl ? imgEl.getAttribute('src') : (isOfferCard ? offerCartImage : ''),
      imageAlt: imgEl ? imgEl.getAttribute('alt') : title,
      descriptionHTML: descriptionEl ? descriptionEl.innerHTML : '',
      buyHref: buyEl ? buyEl.getAttribute('href') : '',
      available: priceValue > 0 && !/coming soon/i.test(priceText)
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
     START: CART FUNCTIONALITY
     =========================== */
  const cartDrawer = $('#cartDrawer');
  const cartToggle = $('#cartToggle');
  const cartCount = $('#cartCount');
  const cartItems = $('#cartItems');
  const cartEmpty = $('#cartEmpty');
  const cartTotal = $('#cartTotal');
  const cartCheckout = $('#cartCheckout');
  const cartClear = $('#cartClear');

  const storageKey = 'tranquilGlowBeautyCart';
  const whatsappNumber = (cartDrawer && cartDrawer.dataset.whatsappNumber) || '254795284897';

  const cart = {
    items: []
  };

  const getCartItemCount = () => cart.items.reduce((sum, item) => sum + item.qty, 0);

  const getCartTotal = () => cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const findCartItem = (key) => cart.items.find(item => item.key === key);

  const saveCart = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart.items));
    } catch {
      // Local storage may be unavailable in some browsers; fail silently.
    }
  };

  const loadCart = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        cart.items = parsed
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            key: String(item.key || ''),
            title: String(item.title || ''),
            price: Number(item.price || 0),
            imageSrc: String(item.imageSrc || ''),
            imageAlt: String(item.imageAlt || ''),
            qty: Math.max(1, Number(item.qty || 1)),
            buyHref: String(item.buyHref || '')
          }))
          .filter(item => item.key && item.title && item.price > 0);
      }
    } catch {
      cart.items = [];
    }
  };

  const buildCheckoutMessage = () => {
    if (!cart.items.length) return '';

    const lines = [
      'Hello Tranquil Glow Beauty, I would like to place an order:',
      ''
    ];

    cart.items.forEach((item, index) => {
      const lineTotal = item.price * item.qty;
      lines.push(`${index + 1}. ${item.title} x ${item.qty} = ${formatMoney(lineTotal)}`);
    });

    lines.push('');
    lines.push(`Total: ${formatMoney(getCartTotal())}`);
    lines.push('Please confirm availability and delivery details.');

    return lines.join('\n');
  };

  const updateCheckoutLink = () => {
    if (!cartCheckout) return;

    if (!cart.items.length) {
      cartCheckout.href = '#';
      cartCheckout.setAttribute('aria-disabled', 'true');
      cartCheckout.tabIndex = -1;
      return;
    }

    const message = encodeURIComponent(buildCheckoutMessage());
    cartCheckout.href = `https://wa.me/${whatsappNumber}?text=${message}`;
    cartCheckout.setAttribute('aria-disabled', 'false');
    cartCheckout.tabIndex = 0;
  };

  const renderCart = () => {
    if (cartCount) {
      cartCount.textContent = String(getCartItemCount());
    }

    if (cartItems && cartEmpty) {
      cartItems.innerHTML = '';

      if (!cart.items.length) {
        cartEmpty.style.display = 'block';
        cartItems.appendChild(cartEmpty);
      } else {
        cartEmpty.style.display = 'none';

        cart.items.forEach(item => {
          const itemEl = document.createElement('article');
          itemEl.className = 'cart-item';
          itemEl.dataset.key = item.key;

          const image = document.createElement('img');
          image.className = 'cart-item-image';
          image.src = item.imageSrc || 'images/offer/image1.jpg';
          image.alt = item.imageAlt || item.title;
          image.loading = 'lazy';

          const info = document.createElement('div');
          info.className = 'cart-item-info';

          const title = document.createElement('h4');
          title.className = 'cart-item-title';
          title.textContent = item.title;

          const price = document.createElement('p');
          price.className = 'cart-item-price';
          price.textContent = `${formatMoney(item.price)} × ${item.qty}`;

          const meta = document.createElement('p');
          meta.className = 'cart-item-meta';
          meta.textContent = `Subtotal: ${formatMoney(item.price * item.qty)}`;

          info.appendChild(title);
          info.appendChild(price);
          info.appendChild(meta);

          const actions = document.createElement('div');
          actions.className = 'cart-item-actions';

          const qtyControls = document.createElement('div');
          qtyControls.className = 'qty-controls';

          const minus = document.createElement('button');
          minus.type = 'button';
          minus.className = 'qty-btn';
          minus.dataset.action = 'decrease';
          minus.dataset.key = item.key;
          minus.setAttribute('aria-label', `Decrease quantity for ${item.title}`);
          minus.textContent = '−';

          const qtyValue = document.createElement('span');
          qtyValue.className = 'qty-value';
          qtyValue.textContent = String(item.qty);

          const plus = document.createElement('button');
          plus.type = 'button';
          plus.className = 'qty-btn';
          plus.dataset.action = 'increase';
          plus.dataset.key = item.key;
          plus.setAttribute('aria-label', `Increase quantity for ${item.title}`);
          plus.textContent = '+';

          qtyControls.appendChild(minus);
          qtyControls.appendChild(qtyValue);
          qtyControls.appendChild(plus);

          const remove = document.createElement('button');
          remove.type = 'button';
          remove.className = 'cart-remove';
          remove.dataset.action = 'remove';
          remove.dataset.key = item.key;
          remove.textContent = 'Remove';

          actions.appendChild(qtyControls);
          actions.appendChild(remove);

          itemEl.appendChild(image);
          itemEl.appendChild(info);
          itemEl.appendChild(actions);

          cartItems.appendChild(itemEl);
        });
      }
    }

    if (cartTotal) {
      cartTotal.textContent = formatMoney(getCartTotal());
    }

    updateCheckoutLink();
    saveCart();
  };

  const openCart = () => {
    if (!cartDrawer) return;

    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartToggle?.setAttribute('aria-expanded', 'true');

    cartDrawer.style.opacity = '1';
    cartDrawer.style.visibility = 'visible';
    cartDrawer.style.pointerEvents = 'auto';

    pageLock.lock('cart');

    window.requestAnimationFrame(() => {
      const focusTarget = cartDrawer.querySelector('[data-cart-close], .cart-close, .cart-close-btn');
      if (focusTarget && typeof focusTarget.focus === 'function') {
        focusTarget.focus({ preventScroll: true });
      }
    });
  };

  const closeCart = () => {
    if (!cartDrawer) return;

    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartToggle?.setAttribute('aria-expanded', 'false');

    cartDrawer.style.opacity = '0';
    cartDrawer.style.visibility = 'hidden';
    cartDrawer.style.pointerEvents = 'none';

    pageLock.unlock('cart');
    cartToggle?.focus?.({ preventScroll: true });
  };

  const addItemToCart = (product, qty = 1) => {
    if (!product || !product.available || !product.key || !product.title || product.price <= 0) return false;

    const existing = findCartItem(product.key);

    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({
        key: product.key,
        title: product.title,
        price: product.priceValue,
        imageSrc: product.imageSrc,
        imageAlt: product.imageAlt || product.title,
        qty: Math.max(1, qty),
        buyHref: product.buyHref || ''
      });
    }

    renderCart();
    return true;
  };

  const changeItemQty = (key, delta) => {
    const item = findCartItem(key);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
      cart.items = cart.items.filter(cartItem => cartItem.key !== key);
    }

    renderCart();
  };

  const removeItem = (key) => {
    cart.items = cart.items.filter(item => item.key !== key);
    renderCart();
  };

  const clearCart = () => {
    cart.items = [];
    renderCart();
  };

  const setupCartDrawerLayout = () => {
    if (!cartDrawer) return;

    const overlay = cartDrawer.querySelector('[data-cart-close]');
    const panel = cartDrawer.querySelector('.cart-drawer__panel');

    if (overlay) {
      overlay.classList.add('cart-overlay');
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.background = 'rgba(15, 23, 42, 0.58)';
      overlay.style.backdropFilter = 'blur(6px)';
      overlay.style.webkitBackdropFilter = 'blur(6px)';
      overlay.style.cursor = 'pointer';
    }

    cartDrawer.style.position = 'fixed';
    cartDrawer.style.inset = '0';
    cartDrawer.style.width = '100vw';
    cartDrawer.style.height = '100vh';
    cartDrawer.style.background = 'transparent';
    cartDrawer.style.display = 'block';
    cartDrawer.style.transform = 'none';
    cartDrawer.style.transition = 'opacity 0.22s ease';
    cartDrawer.style.opacity = '0';
    cartDrawer.style.visibility = 'hidden';
    cartDrawer.style.pointerEvents = 'none';
    cartDrawer.style.zIndex = '9999';

    if (panel) {
      panel.style.position = 'relative';
      panel.style.marginLeft = 'auto';
      panel.style.width = 'min(420px, 100vw)';
      panel.style.height = '100%';
      panel.style.background = '#fff';
      panel.style.boxShadow = '-18px 0 50px rgba(15, 23, 42, 0.22)';
      panel.style.borderLeft = '1px solid rgba(15, 23, 42, 0.08)';
      panel.style.display = 'flex';
      panel.style.flexDirection = 'column';
      panel.style.pointerEvents = 'auto';
      panel.style.transform = 'translateX(0)';
    }

    const header = cartDrawer.querySelector('.cart-drawer__header');
    const footer = cartDrawer.querySelector('.cart-drawer__footer');
    const bodyEl = cartDrawer.querySelector('.cart-drawer__body');
    const closeBtn = cartDrawer.querySelector('.cart-close');

    if (header) header.classList.add('cart-header');
    if (bodyEl) {
      bodyEl.style.display = 'flex';
      bodyEl.style.flexDirection = 'column';
      bodyEl.style.flex = '1';
      bodyEl.style.minHeight = '0';
    }
    if (footer) {
      footer.classList.add('cart-footer');
      footer.style.marginTop = 'auto';
    }
    if (closeBtn) closeBtn.classList.add('cart-close');
  };

  const initCartButtons = () => {
    $$('.btn-add-to-cart').forEach(button => {
      const card = button.closest('.product-card, .offer-card');
      if (!card) return;

      const product = getProductData(card);

      if (!product.available) {
        button.disabled = true;
        button.textContent = 'Coming Soon';
        button.classList.add('disabled');
        button.setAttribute('aria-disabled', 'true');
        return;
      }

      button.addEventListener('click', () => {
        addItemToCart(product, 1);
        openCart();
      });
    });
  };

  loadCart();
  setupCartDrawerLayout();
  renderCart();
  initCartButtons();

  if (cartToggle) {
    cartToggle.setAttribute('aria-expanded', 'false');
    cartToggle.addEventListener('click', () => {
      if (cartDrawer && cartDrawer.getAttribute('aria-hidden') === 'false') {
        closeCart();
      } else {
        openCart();
      }
    });
  }

  if (cartDrawer) {
    cartDrawer.addEventListener('click', (e) => {
      if (e.target.matches('[data-cart-close]')) {
        closeCart();
        return;
      }

      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;

      const key = actionBtn.dataset.key;
      const action = actionBtn.dataset.action;

      if (action === 'increase') {
        changeItemQty(key, 1);
      } else if (action === 'decrease') {
        changeItemQty(key, -1);
      } else if (action === 'remove') {
        removeItem(key);
      }
    });
  }

  if (cartClear) {
    cartClear.addEventListener('click', () => {
      clearCart();
    });
  }

  if (cartCheckout) {
    cartCheckout.addEventListener('click', (e) => {
      if (!cart.items.length) {
        e.preventDefault();
        return;
      }

      // Keep the drawer usable after checkout opens in a new tab.
      setTimeout(() => {
        closeCart();
      }, 150);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartDrawer && cartDrawer.getAttribute('aria-hidden') === 'false') {
      closeCart();
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === storageKey) {
      loadCart();
      renderCart();
    }
  });
  /* ===========================
     END: CART FUNCTIONALITY
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
