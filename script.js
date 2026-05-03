/* ═══════════════════════════════════════════════════
   EduGuide — Script
   Smooth scrolling, sticky nav, mobile menu,
   scroll-based animations, active link tracking
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = navLinks.querySelectorAll('a');
  const sections = document.querySelectorAll('section[id]');
  const animElements = document.querySelectorAll('.animate-on-scroll');
  const contactForm = document.getElementById('contactForm');

  /* ─── CSV Parser for quoted fields ─── */
  function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        // End of row
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        }
        // Skip \r\n
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        currentField += char;
      }
    }

    // Add last field and row
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      rows.push(currentRow);
    }

    return rows;
  }

  /* ─── Load CSV Checklist ─── */
  function loadChecklistCSV() {
    fetch('assets/Documents/checklist_data.csv')
      .then(response => response.text())
      .then(data => {
        const rows = parseCSV(data);
        let table = '<table class="checklist-table"><tbody>';
        
        rows.forEach((row, index) => {
          const isHeader = index === 0;
          const tag = isHeader ? 'th' : 'td';
          
          table += `<tr ${isHeader ? 'class="checklist-header"' : ''}>`;
          row.forEach(cell => {
            table += `<${tag}>${escapeHtml(cell)}</${tag}>`;
          });
          table += '</tr>';
        });
        
        table += '</tbody></table>';
        const container = document.getElementById('checklistTableContainer');
        if (container) {
          container.innerHTML = table;
        }
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        const container = document.getElementById('checklistTableContainer');
        if (container) {
          container.innerHTML = '<p style="color: var(--dark-500); padding: 16px;">Error loading checklist. <a href="assets/Documents/checklist_data.csv" download>Download CSV</a></p>';
        }
      });
  }

  /* ─── Helper: Escape HTML ─── */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Load checklist on page load
  loadChecklistCSV();


  /* ─── Mobile Menu ─── */
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* ─── Sticky Navbar Shadow ─── */
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  /* ─── Active Section Tracking ─── */
  const updateActiveLink = () => {
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        allNavLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  /* ─── Scroll Animations (Intersection Observer) ─── */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate only once
      }
    });
  }, observerOptions);

  animElements.forEach(el => observer.observe(el));

  /* ─── Scroll Event Listener ─── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Initial calls
  handleScroll();
  updateActiveLink();

  /* ─── Contact Form with EmailJS ─── */
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const originalText = btn.innerHTML;

    // Show loading state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Prepare template parameters
    const templateParams = {
      from_name: document.getElementById('contactName').value,
      from_email: document.getElementById('contactEmail').value,
      message: document.getElementById('contactMessage').value,
      to_email: 'dilinimadushika378@gmail.com'
    };

    // Send email via EmailJS
    // The 4th parameter is the public key from EmailJS dashboard (Account → General)
    emailjs.send('service_shxqutb', 'template_v968p76', templateParams, 'RkeGRVojdx9F-GdN3')
      .then(() => {
        // Success
        btn.innerHTML = '<i class="fas fa-check-circle"></i> Message Sent!';
        btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
        btn.style.opacity = '1';
        contactForm.reset();

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      })
      .catch((error) => {
        // Error
        console.error('EmailJS Error:', error);
        btn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed! Try again';
        btn.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';
        btn.style.opacity = '1';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      });
  });
});
