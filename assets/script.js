// Theme toggle & utilities
(function(){
  const root = document.documentElement;
  const themeBtn = document.querySelector('#themeToggle');
  const saved = localStorage.getItem('theme');
  // Respect OS preference on first load
  if (!saved) {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    if (prefersLight) root.classList.add('light');
  } else if (saved === 'light') {
    root.classList.add('light');
  }
  themeBtn && themeBtn.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  });

  // Footer year
  const y = document.querySelector('#year');
  if (y) y.textContent = new Date().getFullYear();
})();

// Reveal on scroll
(function(){
  const nodes = document.querySelectorAll('.card, section h2, .timeline .item, .list .row');
  nodes.forEach(n => n.classList.add('reveal'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  nodes.forEach(n => io.observe(n));
})();
