// ===== NAVIGATIE =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');
const navLinks = document.querySelectorAll('.nav-links a');

// Scroll effect op nav
window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Hamburger menu
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
});

// Sluit menu bij klik op link
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
    });
});

// Active nav link tracking
const navSections = document.querySelectorAll('.section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    navSections.forEach(section => {
        const top = section.offsetTop - 150;
        if (window.scrollY >= top) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: pos, behavior: 'smooth' });
        }
    });
});

// ===== FADE-IN ANIMATIE =====
const fadeElements = document.querySelectorAll('.fade-in');
const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

fadeElements.forEach(el => fadeObserver.observe(el));

// ===== BOEKINGSWIDGET TOGGLE =====
function toggleBooking() {
    const content = document.getElementById('bookingContent');
    const btn = document.getElementById('bookingToggle');
    content.classList.toggle('open');
    if (content.classList.contains('open')) {
        btn.textContent = 'Sluit boekingsmodule';
        // Herlaad de Smoobu iframe zodat een eerder gesloten widget weer werkt
        const iframe = content.querySelector('iframe');
        if (iframe && iframe.src) {
            iframe.src = iframe.src;
        }
    } else {
        btn.textContent = 'Bekijk beschikbaarheid & boek';
    }
}

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Verzamel alle klikbare foto's op de site
const allPhotos = [];
document.querySelectorAll('.gallery-item img, .acasia-hero-photo img, .sketch-image .photo, .gallery .sketch-image .photo').forEach(img => {
    if (!allPhotos.includes(img)) {
        allPhotos.push(img);
    }
});

let currentIndex = 0;

// Maak elke foto klikbaar
allPhotos.forEach((img, index) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = index;
        openLightbox();
    });
});

function openLightbox() {
    const img = allPhotos[currentIndex];
    lightboxImg.src = img.src;
    lightboxCaption.textContent = img.alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNav();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

function showPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        openLightbox();
    }
}

function showNext() {
    if (currentIndex < allPhotos.length - 1) {
        currentIndex++;
        openLightbox();
    }
}

function updateNav() {
    lightboxPrev.style.display = currentIndex > 0 ? 'block' : 'none';
    lightboxNext.style.display = currentIndex < allPhotos.length - 1 ? 'block' : 'none';
}

lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
lightbox.addEventListener('click', closeLightbox);
lightboxImg.addEventListener('click', (e) => e.stopPropagation());

// Toetsenbord: Escape, pijltjes
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
});

// ===== MOBIEL: TAP VOOR SCHETS→FOTO =====
// Op mobiel is er geen hover, dus we gebruiken tap
if ('ontouchstart' in window) {
    document.querySelectorAll('.sketch-image').forEach(img => {
        img.addEventListener('click', function() {
            // Toggle 'revealed' class
            this.classList.toggle('revealed');
        });
    });
}
