// Initialize AOS (Animate On Scroll) library
document.addEventListener('DOMContentLoaded', () => {
  // Hide page loader when the page is fully loaded
  window.addEventListener('load', function() {
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
      setTimeout(() => {
        pageLoader.style.opacity = '0';
        pageLoader.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          pageLoader.style.display = 'none';
        }, 500);
      }, 300);
    }
  });
  
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
    console.log('Mobile menu elements found in main.js');
    mobileMenuBtn.addEventListener('click', function(e) {
      console.log('Mobile menu button clicked');
      e.stopPropagation();
      mobileMenu.classList.toggle('active');
      
      // Toggle icon
      const icon = this.querySelector('i');
      if (mobileMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });

    // Close menu when clicking links
    const menuLinks = mobileMenu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (mobileMenu.classList.contains('active') && 
          !mobileMenu.contains(e.target) && 
          !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
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
  
  // Back to top button functionality
  const backToTopButton = document.getElementById('back-to-top');
    
  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
    
    // Scroll to top when clicked
    backToTopButton.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Skills filtering system
  const filterButtons = document.querySelectorAll('.skill-filter-btn');
  const skillBadges = document.querySelectorAll('.skill-badge');
      
  if (filterButtons.length > 0 && skillBadges.length > 0) {
    // Add data attributes to skill badges if not already set
    skillBadges.forEach(badge => {
      if (!badge.hasAttribute('data-category')) {
        const text = badge.textContent.toLowerCase();
        if (text.includes('pc') || text.includes('hardware') || text.includes('system') || text.includes('windows') || text.includes('network')) {
          badge.setAttribute('data-category', 'technical');
        } else if (text.includes('fl studio') || text.includes('production') || text.includes('mix') || text.includes('audio') || text.includes('sound') || text.includes('beat')) {
          badge.setAttribute('data-category', 'music');
        } else {
          badge.setAttribute('data-category', 'professional');
        }
      }
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active', 'bg-primary/20', 'bg-secondary/20', 'bg-accent/20'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get filter value
        const filterValue = this.getAttribute('data-filter');
        
        // Apply appropriate background based on category
        if (filterValue === 'technical') {
          this.classList.add('bg-primary/20');
        } else if (filterValue === 'music') {
          this.classList.add('bg-secondary/20');
        } else if (filterValue === 'professional') {
          this.classList.add('bg-accent/20');
        } else {
          this.classList.add('bg-primary/20');
        }
        
        // Filter skill badges
        skillBadges.forEach(badge => {
          if (filterValue === 'all' || badge.getAttribute('data-category') === filterValue) {
            badge.style.display = 'inline-block';
            badge.classList.add('animate__animated', 'animate__fadeIn');
          setTimeout(() => {
              badge.classList.remove('animate__animated', 'animate__fadeIn');
            }, 500);
          } else {
            badge.style.display = 'none';
          }
        });
      });
    });
  }
  
  // Animation on scroll elements
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.feature-card, .skill-badge, .glass-effect');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        if (!element.classList.contains('animate__animated')) {
          element.classList.add('animate__animated', 'animate__fadeInUp');
        }
      }
    });
  };

  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll(); // Run once on page load

  // Dark mode toggle
  const darkToggle = document.getElementById('dark-toggle');
  if (darkToggle) {
    const htmlElement = document.documentElement;
    const darkIcon = '<i class="fas fa-moon"></i>';
    const lightIcon = '<i class="fas fa-sun"></i>';

    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      htmlElement.classList.add('dark-mode');
      darkToggle.innerHTML = lightIcon;
    } else {
      darkToggle.innerHTML = darkIcon;
    }

    // Toggle theme on button click
    darkToggle.addEventListener('click', () => {
      htmlElement.classList.toggle('dark-mode');
      
      // Update button icon
      if (htmlElement.classList.contains('dark-mode')) {
        darkToggle.innerHTML = lightIcon;
        localStorage.setItem('theme', 'dark');
      } else {
        darkToggle.innerHTML = darkIcon;
        localStorage.setItem('theme', 'light');
      }
      
      // Add animation
      darkToggle.classList.add('animate__animated', 'animate__rubberBand');
      setTimeout(() => {
        darkToggle.classList.remove('animate__animated', 'animate__rubberBand');
      }, 1000);
    });
  }
  
  // Typed.js initialization
  const typedElement = document.querySelector('.typed-text');
  if (typedElement && !window.typedInitialized) {  // Check if already initialized
    window.typedInitialized = true;  // Set flag to prevent double initialization
    const typed = new Typed(typedElement, {
      strings: JSON.parse(typedElement.getAttribute('data-typed-items')),
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000,  // Increased delay between words
      startDelay: 300,  // Slight delay before starting
      loop: true,
      loopCount: Infinity,
      showCursor: true,
      cursorChar: '|',
      smartBackspace: true, // Only backspace what doesn't match the previous string
      shuffle: false,       // Don't randomize the order
      fadeOut: false,       // Don't fade out
      fadeOutClass: 'typed-fade-out',
      fadeOutDelay: 500,
      autoInsertCss: true,
      bindInputFocusEvents: false,
      attr: null,
      contentType: 'html',
      onBegin: function(self) {
        // Prevent other scripts from interfering
        window.typedInitialized = true;
      },
      onComplete: function(self) {
        // Ensure complete words are displayed before moving on
        setTimeout(function() {
          self.reset();
        }, self.backDelay);
      }
    });
  }

  // Experience Tabs Functionality
  const experienceTabs = document.querySelectorAll('.experience-tab');
  const experienceContents = document.querySelectorAll('.experience-content');
  const experienceSelector = document.getElementById('experience-selector');

  // Set initial visibility for desktop tabs
  if (experienceTabs.length > 0 && experienceContents.length > 0 && window.innerWidth >= 768) {
    let activeTargetId = 'it-experience'; // Default to the first tab's content ID
    // Find the initially active tab's target ID
    experienceTabs.forEach(tab => {
      if (tab.classList.contains('active')) {
        activeTargetId = tab.getAttribute('data-target');
      }
    });

    // Hide all content sections *except* the active one
    experienceContents.forEach(content => {
      if (content.id !== activeTargetId) {
        content.classList.add('hidden');
      } else {
        content.classList.remove('hidden'); // Ensure the active one is shown
      }
    });
    
    // Ensure the correct tab has the active styles
    experienceTabs.forEach(tab => {
        if (tab.getAttribute('data-target') === activeTargetId) {
            tab.classList.add('active', 'text-white');
            tab.classList.remove('text-white/70');
        } else {
            tab.classList.remove('active', 'text-white');
            tab.classList.add('text-white/70');
        }
    });
  }

  // Handle desktop tab clicks
  if (experienceTabs.length > 0 && experienceContents.length > 0) {
    experienceTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        console.log('Experience tab clicked:', this.getAttribute('data-target')); // DEBUG LOG
        // Remove active class from all tabs
        experienceTabs.forEach(t => t.classList.remove('active', 'text-white'));
        experienceTabs.forEach(t => t.classList.add('text-white/70'));
        
        // Add active class to clicked tab
        this.classList.add('active', 'text-white');
        this.classList.remove('text-white/70');
        
        // Get target content
        const target = this.getAttribute('data-target');
        console.log('Target content ID:', target); // DEBUG LOG
        
        // Hide all content
        experienceContents.forEach(content => {
          console.log('Hiding content:', content.id); // DEBUG LOG
          content.classList.add('hidden');
          // Add fade out animation
          content.classList.remove('animate__animated', 'animate__fadeIn');
        });
        
        // Show target content
        const targetContent = document.getElementById(target);
        if (targetContent) {
          console.log('Attempting to show content:', targetContent.id); // DEBUG LOG
          targetContent.classList.remove('hidden');
          // Add fade in animation
          targetContent.classList.add('animate__animated', 'animate__fadeIn');
        } else {
            console.error('Target content not found for ID:', target); // DEBUG LOG
        }
      });
    });
  }

  // Handle mobile selector change
  if (experienceSelector) {
    experienceSelector.addEventListener('change', function() {
      const selectedValue = this.value;
      
      // Hide all content
      experienceContents.forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('animate__animated', 'animate__fadeIn');
      });
      
      // Show selected content
      const targetContent = document.getElementById(selectedValue);
      if (targetContent) {
        targetContent.classList.remove('hidden');
        targetContent.classList.add('animate__animated', 'animate__fadeIn');
      }
    });
  }
}); 