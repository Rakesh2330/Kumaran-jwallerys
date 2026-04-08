/**
 * Sree Kumaran Jewellery - Interactions & Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. PRELOADER ── */
  const preloader = document.getElementById('preloader');
  
  // Remove preloader after window load or max 3 seconds fallback
  window.addEventListener('load', () => {
    hidePreloader();
  });

  setTimeout(() => {
    if (preloader.style.opacity !== '0') hidePreloader();
  }, 3000);

  function hidePreloader() {
    preloader.style.opacity = '0';
    preloader.style.visibility = 'hidden';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
    
    // Trigger initial reveal animations immediately after preloader hides
    setTimeout(revealElements, 100);
    // Start home stats animation if in view
    startCounters();
  }

  // Prevent scrolling while preloader is active
  document.body.style.overflow = 'hidden';


  /* ── 2. NAVBAR SCROLL EFFECT ── */
  const navbar = document.getElementById('navbar');
  const heroSection = document.querySelector('.hero');
  
  function checkScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      // If hero section is mostly out of view, remove dark mode of navbar
      if (window.scrollY > (heroSection.offsetHeight - 80)) {
        navbar.classList.remove('dark');
      }
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('dark'); // Dark mode transparent over hero
    }
  }

  // Initial check
  navbar.classList.add('dark');
  checkScroll();
  window.addEventListener('scroll', checkScroll);


  /* ── 3. MOBILE MENU TOGGLE ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    // Change navbar styling when mobile menu opens on top
    if (navLinks.classList.contains('active')) {
      navbar.classList.remove('dark');
      navbar.style.backgroundColor = 'var(--color-light)';
    } else {
      checkScroll();
      navbar.style.backgroundColor = '';
    }
  });

  // Close mobile menu on link click
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
      navbar.style.backgroundColor = '';
      checkScroll();
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });


  /* ── 4. SEARCH TOGGLE ── */
  const searchToggle = document.getElementById('searchToggle');
  const searchBar = document.getElementById('searchBar');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');

  searchToggle.addEventListener('click', () => {
    searchBar.classList.add('active');
    setTimeout(() => searchInput.focus(), 300);
  });

  searchClose.addEventListener('click', () => {
    searchBar.classList.remove('active');
  });


  /* ── 5. SCROLL REVEAL ANIMATIONS ── */
  const reveals = document.querySelectorAll('.reveal');

  function revealElements() {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;

    reveals.forEach(reveal => {
      const windowTop = window.scrollY;
      const elementTop = reveal.getBoundingClientRect().top;
      
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });

    // Handle back to top button
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }

  window.addEventListener('scroll', revealElements);


  /* ── 6. BACK TO TOP BUTTON ── */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });


  /* ── 7. CATEGORY FILTERING ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });


  /* ── 8. CART LOGIC ── */
  const cartBtn = document.getElementById('cartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartClose = document.getElementById('cartClose');
  const cartBadge = document.getElementById('cartBadge');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');

  let cart = [];

  // Expose to global scope so HTML inline onclick works
  window.addToCart = function(title, priceItem) {
    // Basic image mapping logic for demo
    let imgSrc = 'assets/necklace.png';
    if(title.toLowerCase().includes('ring')) imgSrc = 'assets/rings.png';
    if(title.toLowerCase().includes('bracelet') || title.toLowerCase().includes('bangle')) imgSrc = 'assets/bracelets.png';
    if(title.toLowerCase().includes('earring')) imgSrc = 'assets/earrings.png';

    const existingItem = cart.find(item => item.title === title);
    
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push({
        title,
        price: priceItem,
        qty: 1,
        img: imgSrc
      });
    }

    updateCartUI();
    openCart();
    
    // Animate badge
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
  };

  window.removeFromCart = function(title) {
    cart = cart.filter(item => item.title !== title);
    updateCartUI();
  };

  window.updateQty = function(title, change) {
    const item = cart.find(i => i.title === title);
    if(item) {
      item.qty += change;
      if(item.qty <= 0) {
        removeFromCart(title);
      } else {
        updateCartUI();
      }
    }
  }

  function updateCartUI() {
    // Update badge count
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartBadge.textContent = totalQty;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <button class="btn btn-primary" style="margin-top:1rem;font-size:.85rem" onclick="document.getElementById('cartClose').click(); location.href='#collections'">Browse Collections</button>
        </div>
      `;
      cartFooter.style.display = 'none';
      return;
    }

    cartFooter.style.display = 'block';
    
    // Generate Items HTML
    let html = '';
    let totalValue = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      totalValue += itemTotal;
      
      html += `
        <div class="cart-item">
          <img src="${item.img}" alt="${item.title}" class="cart-item-img" />
          <div class="cart-item-info">
            <h4 class="cart-item-title">${item.title}</h4>
            <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
            <div class="cart-item-actions">
              <div class="qty-control">
                <button class="qty-btn" onclick="updateQty('${item.title}', -1)">-</button>
                <div class="qty-val">${item.qty}</div>
                <button class="qty-btn" onclick="updateQty('${item.title}', 1)">+</button>
              </div>
              <button class="cart-item-remove" onclick="removeFromCart('${item.title}')">Remove</button>
            </div>
          </div>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;
    cartTotalEl.textContent = `₹${totalValue.toLocaleString()}`;
  }

  function openCart() {
    cartOverlay.classList.add('active');
    cartSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);


  /* ── 9. TESTIMONIAL SLIDER ── */
  const track = document.getElementById('testimonialTrack');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('sliderDots');
  
  let currentIndex = 0;
  let cardsToShow = window.innerWidth >= 768 ? 2 : 1;
  let maxIndex = Math.max(0, cards.length - cardsToShow);

  // Generate dots
  for (let i = 0; i <= maxIndex; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
  
  let dots = document.querySelectorAll('.dot');

  function updateSliderLayout() {
    cardsToShow = window.innerWidth >= 768 ? 2 : 1;
    maxIndex = Math.max(0, cards.length - cardsToShow);
    
    // Recreate dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
    dots = document.querySelectorAll('.dot');
    
    // Fix current index if out of bounds
    if(currentIndex > maxIndex) currentIndex = maxIndex;
    goToSlide(currentIndex);
  }

  window.addEventListener('resize', () => {
    // Debounce resize
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(updateSliderLayout, 200);
  });

  function goToSlide(index) {
    currentIndex = index;
    const cardWidth = cards[0].offsetWidth;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // Auto slide
  setInterval(() => {
    if(maxIndex > 0) {
      let nextIndex = currentIndex + 1;
      if (nextIndex > maxIndex) nextIndex = 0;
      goToSlide(nextIndex);
    }
  }, 5000);


  /* ── 10. ANIMATED NUMBERS ── */
  const counters = document.querySelectorAll('.stat-num');
  let started = false;

  function startCounters() {
    if(started) return;
    
    // Check if hero stats are in view
    const statsSection = document.querySelector('.hero-stats');
    if(!statsSection) return;
    
    const rect = statsSection.getBoundingClientRect();
    if(rect.top < window.innerHeight && rect.bottom >= 0) {
      started = true;
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // ms
        const increment = target / (duration / 16); // 60fps
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.innerText = Math.ceil(current).toLocaleString();
            requestAnimationFrame(updateCounter);
          } else {
            counter.innerText = target.toLocaleString();
          }
        };

        updateCounter();
      });
    }
  }
  
  window.addEventListener('scroll', startCounters);


  /* ── 11. FORM HANDLING ── */
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');

  if(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      
      btn.innerHTML = 'Sending... ✦';
      btn.disabled = true;
      
      // Simulate API call
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        form.reset();
        
        successMsg.style.display = 'block';
        setTimeout(() => {
          successMsg.style.display = 'none';
        }, 5000);
      }, 1500);
    });
  }

});
