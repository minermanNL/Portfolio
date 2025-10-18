// Utility: Debounce function to limit how often a function can run
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize AOS (Animate On Scroll) library
document.addEventListener('DOMContentLoaded', () => {
  // Helper: read CSS --header-height
  function getHeaderHeight() {
    const val = getComputedStyle(document.documentElement).getPropertyValue('--header-height');
    const n = parseInt(val, 10);
    return Number.isFinite(n) ? n : 72;
  }
  // Initialize AOS with guard
  try {
    AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: true,
      mirror: false,
      offset: 50,
      disable: 'mobile'
    });
  } catch (err) {
    console.warn('AOS failed to initialize:', err);
  }

  // Mobile navigation toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenu.classList.contains('active');
      mobileMenuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('active');
      // Update ARIA attribute
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
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
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenuBtn.classList.remove('open');
          mobileMenu.classList.remove('active');
          mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }

        // Scroll to the target element accounting for fixed header
        const offset = getHeaderHeight();
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  // Close mobile menu with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
      mobileMenuBtn.classList.remove('open');
      mobileMenu.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });
  
  // Add active class to nav items on scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const offset = getHeaderHeight() + 20; // small buffer
      if (pageYOffset >= sectionTop - offset) {
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
  
  // Enhanced Form submission with validation
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formSubmitBtn = contactForm.querySelector('button[type="submit"]');
      const formSuccessMsg = document.getElementById('form-success');
      const formErrorMsg = document.getElementById('form-error');
      
      // Hide any existing messages
      formSuccessMsg.classList.add('hidden');
      formErrorMsg.classList.add('hidden');
      
      // Get form data
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const subject = formData.get('subject');
      const message = formData.get('message');
      
      // Basic validation
      if (!name || !email || !subject || !message) {
        formErrorMsg.classList.remove('hidden');
        return;
      }
      
      // Update button state
      const originalButtonContent = formSubmitBtn.innerHTML;
      formSubmitBtn.disabled = true;
      formSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
      
      // Simulate form submission (in real app, this would be an API call)
      setTimeout(() => {
        // For demo purposes, we'll always show success
        // In production, you'd integrate with EmailJS, Formspree, or similar service
        
        try {
          // Here you would normally send the data to your backend or email service
          // Example: await fetch('/api/contact', { method: 'POST', body: formData });
          
          contactForm.reset();
          formSubmitBtn.disabled = false;
          formSubmitBtn.innerHTML = originalButtonContent;
          formSuccessMsg.classList.remove('hidden');
          
          // Auto-hide success message after 8 seconds
          const autoHideTimeout = setTimeout(() => {
            formSuccessMsg.classList.add('hidden');
          }, 8000);
          
          // Add close button if it doesn't exist
          if (!formSuccessMsg.querySelector('.close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn ml-4 text-white hover:text-gray-300 transition-colors';
            closeBtn.innerHTML = '&times;';
            closeBtn.style.fontSize = '24px';
            closeBtn.setAttribute('aria-label', 'Close message');
            closeBtn.addEventListener('click', () => {
              formSuccessMsg.classList.add('hidden');
              clearTimeout(autoHideTimeout);
            });
            formSuccessMsg.appendChild(closeBtn);
          }
          
        } catch (error) {
          console.error('Form submission error:', error);
          formSubmitBtn.disabled = false;
          formSubmitBtn.innerHTML = originalButtonContent;
          formErrorMsg.classList.remove('hidden');
        }
      }, 1500);
    });
    
    // Add real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });
    });
  }
  
  // Field validation function with error messages
  function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    const fieldName = field.getAttribute('name') || 'This field';
    
    // Remove existing error styling and messages
    field.classList.remove('border-red-500', 'border-green-500');
    
    // Remove any existing error message
    const existingError = field.parentElement.querySelector('.field-error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Helper to show error message
    function showError(message) {
      field.classList.add('border-red-500');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error-message text-red-500 text-sm mt-1';
      errorDiv.textContent = message;
      field.parentElement.appendChild(errorDiv);
      return false;
    }
    
    // Validation checks
    if (isRequired && !value) {
      return showError(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
    }
    
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return showError('Please enter a valid email address');
      }
    }
    
    if (value) {
      field.classList.add('border-green-500');
    }
    
    return true;
  }
  
  // Typing effect for hero section
  const typedElement = document.getElementById('typing-text');
  let typingTimeoutId = null; // Store timeout ID for cleanup
  
  if (typedElement) {
    const phrases = [
      "Technical Leader & AI Orchestrator",
      "Enterprise IT Strategist",
      "AI Implementation Expert",
      "Music Producer (10M+ Streams)",
      "Startup Founder & CTO",
      "Multi-Disciplinary Innovator"
    ];
    
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
        typingSpeed = 2000; // Wait 2 seconds before deleting
      } else if (isDeleting && currentCharIndex === 0) {
        isDeleting = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typingSpeed = 500; // Pause before typing next phrase
      }
      
      typingTimeoutId = setTimeout(typeNextChar, typingSpeed);
    }
    
    // Start typing animation
    typeNextChar();
    
    // Cleanup on page unload to prevent memory leak
    window.addEventListener('beforeunload', () => {
      if (typingTimeoutId) {
        clearTimeout(typingTimeoutId);
      }
    });
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
        experienceTabs.forEach(t => {
          t.classList.remove('active', 'text-white', 'text-white/70');
          t.setAttribute('aria-selected', 'false');
        });
        // Add active to clicked tab
        this.classList.add('active', 'text-white');
        this.setAttribute('aria-selected', 'true');
        // Show correct content
        const target = this.getAttribute('data-target');
        showExperienceSection(target);
      });
    });
    
    // Keyboard navigation for experience tabs (Arrow keys)
    experienceTabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % experienceTabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + experienceTabs.length) % experienceTabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = experienceTabs.length - 1;
        } else {
          return; // Exit if not a navigation key
        }
        
        // Focus and activate the new tab
        experienceTabs[newIndex].focus();
        experienceTabs[newIndex].click();
      });
    });
  }

  // Selector change (mobile)
  if (experienceSelector) {
    experienceSelector.addEventListener('change', function() {
      showExperienceSection(this.value);
    });
  }

  // Re-run initial state on resize (debounced for performance)
  window.addEventListener('resize', debounce(setInitialExperienceSection, 250));

  // --- Skills Tabs Logic ---
  // Similar to experience tabs but for skills section
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillContents = document.querySelectorAll('.skill-content');

  // Helper: Show the correct skill section
  function showSkillSection(sectionId) {
    skillContents.forEach(content => {
      if (content.id === sectionId) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });
  }

  // Tab click handler
  if (skillTabs.length > 0) {
    skillTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active from all tabs
        skillTabs.forEach(t => {
          t.classList.remove('active', 'text-white');
          t.classList.add('text-white/70');
          t.setAttribute('aria-selected', 'false');
        });
        // Add active to clicked tab
        this.classList.remove('text-white/70');
        this.classList.add('active', 'text-white');
        this.setAttribute('aria-selected', 'true');
        
        // Show corresponding content
        const targetId = this.getAttribute('data-target');
        showSkillSection(targetId);
      });
    });
    
    // Keyboard navigation for skills tabs (Arrow keys)
    skillTabs.forEach((tab, index) => {
      tab.addEventListener('keydown', (e) => {
        let newIndex = index;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % skillTabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + skillTabs.length) % skillTabs.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = skillTabs.length - 1;
        } else {
          return; // Exit if not a navigation key
        }
        
        // Focus and activate the new tab
        skillTabs[newIndex].focus();
        skillTabs[newIndex].click();
      });
    });
  }

  // --- Back to Top Button ---
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Keyboard support (Enter/Space)
    backToTopBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  // --- Scroll Down Indicator ---
  const scrollDownIndicator = document.getElementById('scroll-down-indicator');
  if (scrollDownIndicator) {
    scrollDownIndicator.addEventListener('click', (e) => {
      e.preventDefault();
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        const offset = getHeaderHeight();
        window.scrollTo({
          top: aboutSection.offsetTop - offset,
          behavior: 'smooth'
        });
      }
      // Hide after click to avoid overlap with next section
      scrollDownIndicator.style.opacity = '0';
      scrollDownIndicator.style.pointerEvents = 'none';
    });

    // Hide indicator once user scrolls a bit
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 10) {
        scrollDownIndicator.style.opacity = '0';
        scrollDownIndicator.style.pointerEvents = 'none';
      } else {
        scrollDownIndicator.style.opacity = '1';
        scrollDownIndicator.style.pointerEvents = '';
      }
    });
  }
}); 