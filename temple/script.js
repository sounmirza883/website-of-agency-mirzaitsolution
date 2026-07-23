document.addEventListener('DOMContentLoaded', function() {
  // Header scroll
  var header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Mobile menu
  window.toggleMenu = function() {
    document.getElementById('hamburger').classList.toggle('open');
    document.getElementById('navLinks').classList.toggle('open');
  };

  // Close menu on link click
  document.querySelectorAll('.nav-links a').forEach(function(a) {
    a.addEventListener('click', function() {
      document.getElementById('navLinks').classList.remove('open');
      document.getElementById('hamburger').classList.remove('open');
    });
  });

  // Scroll Reveal
  function initReveal() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
  }
  initReveal();

  // Counters
  function initCounters() {
    document.querySelectorAll('.stat-number[data-target]').forEach(function(c) {
      if (c.dataset.animated) return;
      c.dataset.animated = true;
      var target = parseInt(c.dataset.target);
      var is247 = target === 247;
      var suffix = is247 ? '/7' : '+';
      var current = 0;
      var step = Math.ceil(target / 50);
      var timer = setInterval(function() {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        c.textContent = current + (is247 && current < target ? '/' : suffix);
      }, 30);
    });
  }
  initCounters();

  // Skills
  function initSkills() {
    document.querySelectorAll('.skill-fill').forEach(function(bar) {
      if (bar.dataset.animated) return;
      bar.dataset.animated = true;
      bar.style.width = bar.dataset.width + '%';
    });
  }
  initSkills();

  // Portfolio Filter
  document.querySelectorAll('.filter-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
      this.classList.add('active');
      var filter = this.dataset.filter;
      document.querySelectorAll('#portfolioGrid .portfolio-card').forEach(function(item) {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn .4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(function(q) {
    q.addEventListener('click', function() {
      this.parentElement.classList.toggle('active');
    });
  });

  // Contact Form
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Thank you for your message! We will get back to you shortly.');
      this.reset();
    });
  }

  // Active nav link
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.pill)').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href === currentPage) a.classList.add('active');
  });
});
