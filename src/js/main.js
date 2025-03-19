// Initialize AOS (Animate On Scroll) library
document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
  });

  // Mobile navigation toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('hidden');
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
  if (typedElement && !window.preventOtherTypedInit && !window.typedInitialized) {
    // Only run if our custom implementation isn't active
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
}); 