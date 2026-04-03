

/* ===========================
   START NAVIGATION JS
   =========================== */

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const menuIcon = menuToggle.querySelector('i');

// Toggle menu open/close
menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');

  // Change icon between bars and X
  if (navLinks.classList.contains('active')) {
    menuIcon.classList.remove('fa-bars');
    menuIcon.classList.add('fa-times');
  } else {
    menuIcon.classList.remove('fa-times');
    menuIcon.classList.add('fa-bars');
  }
});

// Close menu when clicking outside
document.body.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
    navLinks.classList.remove('active');
    menuIcon.classList.remove('fa-times');
    menuIcon.classList.add('fa-bars');
  }
});

// Close menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    menuIcon.classList.remove('fa-times');
    menuIcon.classList.add('fa-bars');
  });
});

/* ===========================
   END NAVIGATION JS
   =========================== */



/* START SMOOTH SCROLL JS */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
/* END SMOOTH SCROLL JS */




/* ===========================
   START PRODUCTS JS
   =========================== */

const modal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalClose = document.querySelector('.modal-close');

// Handle "View Details" buttons
document.querySelectorAll('.btn-details').forEach(button => {
  button.addEventListener('click', () => {
    const product = button.getAttribute('data-product');
    const price = button.getAttribute('data-price');
    const description = button.getAttribute('data-description');
    const image = button.getAttribute('data-image');

    // Populate modal
    modalTitle.textContent = product;
    modalPrice.textContent = price;
    modalDescription.innerHTML = description;
    modalImage.src = image;
    modalImage.alt = product;

    // Show modal
    modal.style.display = 'flex';
  });
});

// Close modal when clicking X
modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal when clicking outside content
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

/* ===========================
   END PRODUCTS JS
   =========================== */



/* ===========================
   START FAQ JS
   =========================== */

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');
  const icon = item.querySelector('.icon');

  question.addEventListener('click', () => {
    // Toggle active class
    item.classList.toggle('active');

    // Change icon between + and -
    if (item.classList.contains('active')) {
      icon.classList.remove('fa-plus');
      icon.classList.add('fa-minus');
    } else {
      icon.classList.remove('fa-minus');
      icon.classList.add('fa-plus');
    }

    // Close other items (accordion style)
    faqItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('active');
        const otherIcon = otherItem.querySelector('.icon');
        otherIcon.classList.remove('fa-minus');
        otherIcon.classList.add('fa-plus');
      }
    });
  });
});

/* ===========================
   END FAQ JS
   =========================== */



/* ===========================
   START CONTACT FORM JS
   =========================== */

// Select the form
const contactForm = document.getElementById('contactForm');

// Create a feedback element (hidden by default)
const feedback = document.createElement('p');
feedback.id = "formFeedback";
feedback.style.display = "none";
feedback.style.textAlign = "center";
feedback.style.marginTop = "15px";
feedback.style.fontFamily = "var(--font-body)";
feedback.style.color = "var(--color-primary)";
contactForm.appendChild(feedback);

// Handle form submission
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();

  // Collect values
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  // Refine into neat format
  const refinedMessage = `My name is ${name}, my email is ${email}, and here is my message: ${message}`;

  // Encode for URL
  const encodedMessage = encodeURIComponent(refinedMessage);

  // WhatsApp number (international format, no + or spaces)
  const whatsappNumber = "32467859094";

  // Show feedback before redirect
  feedback.textContent = "Redirecting to WhatsApp…";
  feedback.style.display = "block";

  // Redirect after short delay
  setTimeout(() => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");

    // Clear form fields after submission
    contactForm.reset();

    // Hide feedback after a few seconds
    setTimeout(() => {
      feedback.style.display = "none";
    }, 3000);
  }, 1000);
});

/* ===========================
   END CONTACT FORM JS
   =========================== */



// ===========================
// SMOOTH SCROLL NAVIGATION
// ===========================

// Select all anchor links with hashes
document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    // Prevent default jump
    e.preventDefault();

    // Get target section ID
    const targetID = this.getAttribute('href').split('#')[1];
    const targetElement = document.getElementById(targetID);

    if (targetElement) {
      // Smooth scroll into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===========================
// SMOOTH SCROLL NAVIGATION ENDS
// ===========================
