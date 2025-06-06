// Initialize AOS (Animate On Scroll) library
document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS
  AOS.init({
    duration: 1000, // Smoother, longer animation
    easing: 'ease-in-out',
    once: true, // Only animate once per element
    mirror: false
  });

  // Mobile navigation toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('active');
    });
  }
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Close mobile menu if it's open
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenuBtn.classList.remove('open');
          mobileMenu.classList.add('hidden');
        }
        
        // Scroll to the target element
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Add active class to nav items on scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= sectionTop - 100) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === currentSection) {
        link.classList.add('active');
      }
    });
  });
  
  // Form submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // In a real implementation, you would send the form data to a server
      // For now, we'll just show a success message
      const formSubmitBtn = contactForm.querySelector('button[type="submit"]');
      const formSuccessMsg = document.getElementById('form-success');
      
      if (formSubmitBtn && formSuccessMsg) {
        formSubmitBtn.disabled = true;
        formSubmitBtn.innerText = 'Sending...';
        
        // Simulate form submission delay
        setTimeout(() => {
          contactForm.reset();
          formSubmitBtn.disabled = false;
          formSubmitBtn.innerText = 'Send Message';
          formSuccessMsg.classList.remove('hidden');
          
          // Hide success message after 5 seconds
          setTimeout(() => {
            formSuccessMsg.classList.add('hidden');
          }, 5000);
        }, 1500);
      }
    });
  }
  
  // Typing effect for hero section
  const typedElement = document.querySelector('.typed-text');
  if (typedElement) {
    const phrases = JSON.parse(typedElement.getAttribute('data-typed-items'));
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeNextChar() {
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (isDeleting) {
        typedElement.textContent = currentPhrase.substring(0, currentCharIndex - 1);
        currentCharIndex--;
        typingSpeed = 50;
      } else {
        typedElement.textContent = currentPhrase.substring(0, currentCharIndex + 1);
        currentCharIndex++;
        typingSpeed = 100;
      }
      
      if (!isDeleting && currentCharIndex === currentPhrase.length) {
        // Pause at the end of typing
        isDeleting = true;
        typingSpeed = 1000; // Wait a second before deleting
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before typing next phrase
      }
      
      setTimeout(typeNextChar, typingSpeed);
    }
    
    typeNextChar();
  }

  // Hide page loader
  const pageLoader = document.getElementById('page-loader');
  if (pageLoader) {
    pageLoader.style.transition = 'opacity 0.5s ease-out';
    pageLoader.style.opacity = '0';
    setTimeout(() => {
      pageLoader.style.display = 'none';
    }, 500); // Match timeout with transition duration
  }

  // --- Experience Tabs & Selector Logic ---
  // Handles switching between IT and Music/Business experience sections
  const experienceTabs = document.querySelectorAll('.experience-tab');
  const experienceContents = document.querySelectorAll('.experience-content');
  const experienceSelector = document.getElementById('experience-selector');

  // Helper: Show the correct experience section
  function showExperienceSection(sectionId) {
    experienceContents.forEach(content => {
      if (content.id === sectionId) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });
  }

  // Set initial state on page load (desktop: active tab, mobile: selector value)
  function setInitialExperienceSection() {
    if (window.innerWidth >= 768) { // Desktop: use active tab
      const activeTab = document.querySelector('.experience-tab.active');
      if (activeTab) {
        showExperienceSection(activeTab.getAttribute('data-target'));
      }
    } else if (experienceSelector) { // Mobile: use selector value
      showExperienceSection(experienceSelector.value);
    }
  }
  setInitialExperienceSection();

  // Tab click (desktop)
  if (experienceTabs.length > 0) {
    experienceTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active from all tabs
        experienceTabs.forEach(t => t.classList.remove('active', 'text-white', 'text-white/70'));
        // Add active to clicked tab
        this.classList.add('active', 'text-white');
        // Show correct content
        const target = this.getAttribute('data-target');
        showExperienceSection(target);
      });
    });
  }

  // Selector change (mobile)
  if (experienceSelector) {
    experienceSelector.addEventListener('change', function() {
      showExperienceSection(this.value);
    });
  }

  // Re-run initial state on resize (in case user resizes window)
  window.addEventListener('resize', setInitialExperienceSection);
}); 