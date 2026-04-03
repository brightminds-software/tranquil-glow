// ===========================
// START TERMS PAGE JS
// ===========================

// Elements
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const toggleIcon = menuToggle.querySelector('i');

// Toggle mobile menu
menuToggle.addEventListener('click', (e) => {
  e.stopPropagation(); // prevent immediate close when clicking toggle
  navLinks.classList.toggle('active');

  // Switch icon between hamburger and X
  if (navLinks.classList.contains('active')) {
    toggleIcon.classList.remove('fa-bars');
    toggleIcon.classList.add('fa-times');
  } else {
    toggleIcon.classList.remove('fa-times');
    toggleIcon.classList.add('fa-bars');
  }
});

// Close menu when clicking anywhere outside
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !menuToggle.contains(e.target)) {
    navLinks.classList.remove('active');
    // Reset icon back to hamburger
    toggleIcon.classList.remove('fa-times');
    toggleIcon.classList.add('fa-bars');
  }
});

// ===========================
// END TERMS PAGE JS
// ===========================