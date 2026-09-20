// Mobile Hamburger Menu Interactivity
document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            menuOverlay.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                menuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        }

        // Close menu on overlay click outside content
        menuOverlay.addEventListener('click', (e) => {
            if (e.target === menuOverlay) {
                menuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Initialize contact hand alignment
    alignContactHand();
    const handImg = document.querySelector('.contact-illustration-left');
    if (handImg) {
        handImg.addEventListener('load', alignContactHand);
    }
});

// Contact Page: Align contact text dynamically with desktop pointing hand illustration
function alignContactHand() {
    const handImg = document.querySelector('.contact-illustration-left');
    const textBlock = document.querySelector('.contact-info-block-right');
    if (!handImg || !textBlock) return;

    if (window.innerWidth <= 768) {
        textBlock.style.removeProperty('--contact-finger-y');
        return;
    }

    const rect = handImg.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        const naturalW = handImg.naturalWidth || 2161;
        const naturalH = handImg.naturalHeight || 1278;
        const elemAspect = rect.width / rect.height;
        const imgAspect = naturalW / naturalH;

        let scale = (elemAspect > imgAspect) ? (rect.width / naturalW) : (rect.height / naturalH);
        // Fingertip is at natural Y = 184 in 1278h image (or 189 in 887h image)
        const tipNaturalY = (naturalH < 1000) ? 189 : 184;
        const fingerY = tipNaturalY * scale;
        // First contact line center is ~12px from the top of the block
        const targetMarginTop = Math.max(16, Math.round(fingerY - 12));
        textBlock.style.setProperty('--contact-finger-y', `${targetMarginTop}px`);
    }
}

window.addEventListener('resize', alignContactHand);
window.addEventListener('load', alignContactHand);


