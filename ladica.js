/* ============================================================
   LADICA.JS — Drag-and-drop + lightbox for the Ladica page
   ============================================================ */

(function () {
    'use strict';

    const canvas = document.getElementById('ladica-canvas');
    if (!canvas) return; // only runs on ladica.html

    const lightbox = document.getElementById('ladica-lightbox');
    const lightboxMedia = document.getElementById('ladica-lightbox-media');
    const lightboxClose = document.getElementById('ladica-lightbox-close');

    let topZ = 10; // z-index counter so the last-grabbed item comes to front

    // Mobile gets its own scattered positions — different from desktop % values
    const mobilePositions = {
        1:  { left: 3,  top: 2  },
        2:  { left: 52, top: 5  },
        3:  { left: 8,  top: 26 },
        4:  { left: 38, top: 18 },
        5:  { left: 2,  top: 48 },
        6:  { left: 55, top: 38 },
        7:  { left: 18, top: 58 },
        8:  { left: 44, top: 55 },
        9:  { left: 0,  top: 73 },
        10: { left: 30, top: 70 },
        11: { left: 60, top: 68 },
    };

    const isMobile = window.innerWidth <= 768;

    // ── Convert initial %-based positions to px once canvas is sized ──────────
    function initPositions() {
        const cw = canvas.clientWidth;
        const ch = canvas.clientHeight;

        document.querySelectorAll('.ladica-item').forEach((item) => {
            // only convert if not yet set as px (first run)
            if (item.dataset.positioned) return;
            item.dataset.positioned = '1';

            const idx = parseInt(item.dataset.index, 10);

            let leftPct, topPct;
            if (isMobile && mobilePositions[idx]) {
                leftPct = mobilePositions[idx].left;
                topPct  = mobilePositions[idx].top;
            } else {
                leftPct = parseFloat(item.style.left);
                topPct  = parseFloat(item.style.top);
            }

            item.style.left = (leftPct / 100 * cw) + 'px';
            item.style.top  = (topPct  / 100 * ch) + 'px';
        });
    }

    // ── Drag logic (Pointer Events — works for mouse AND touch) ───────────────
    function makeDraggable(item) {
        let startX, startY, startLeft, startTop;
        let didDrag = false;
        let dragThreshold = 6; // px moved before we consider it a drag

        item.addEventListener('pointerdown', function (e) {
            // Only primary button (left click / first touch)
            if (e.button !== undefined && e.button !== 0) return;

            e.preventDefault();
            item.setPointerCapture(e.pointerId);

            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(item.style.left, 10) || 0;
            startTop  = parseInt(item.style.top,  10) || 0;
            didDrag = false;

            item.classList.add('dragging');
            item.style.zIndex = ++topZ;
        });

        item.addEventListener('pointermove', function (e) {
            if (!item.classList.contains('dragging')) return;
            e.preventDefault();

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (!didDrag && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) {
                didDrag = true;
            }

            item.style.left = (startLeft + dx) + 'px';
            item.style.top  = (startTop  + dy) + 'px';
        });

        item.addEventListener('pointerup', function (e) {
            item.classList.remove('dragging');
            item.releasePointerCapture(e.pointerId);

            // If barely moved → treat as a click → open lightbox
            if (!didDrag) {
                openLightbox(item);
            }
            didDrag = false;
        });

        item.addEventListener('pointercancel', function () {
            item.classList.remove('dragging');
            didDrag = false;
        });
    }

    document.querySelectorAll('.ladica-item').forEach(makeDraggable);

    // ── Lightbox ──────────────────────────────────────────────────────────────
    function openLightbox(item) {
        // Clone the media element (img or video) for the lightbox
        const original = item.querySelector('img, video');
        if (!original) return;

        lightboxMedia.innerHTML = '';

        let clone;
        if (original.tagName === 'VIDEO') {
            clone = document.createElement('video');
            clone.src = original.src;
            clone.autoplay = true;
            clone.loop = true;
            clone.muted = true;
            clone.playsInline = true;
            clone.controls = true;
        } else {
            clone = document.createElement('img');
            clone.src = original.src;
            clone.alt = original.alt || '';
        }

        lightboxMedia.appendChild(clone);
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        // Pause any video that was playing
        const v = lightboxMedia.querySelector('video');
        if (v) v.pause();
        lightboxMedia.innerHTML = '';
    }

    // Close on overlay click (but NOT on the media itself)
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target === lightboxMedia) {
            closeLightbox();
        }
    });

    lightboxClose.addEventListener('click', closeLightbox);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });

    // ── Init on load + resize ─────────────────────────────────────────────────
    window.addEventListener('load', initPositions);
    window.addEventListener('DOMContentLoaded', initPositions);

    // On resize, don't reposition (items stay where user dragged them)
    // but re-run once on first paint if canvas wasn't ready
    if (canvas.clientHeight > 0) initPositions();

})();
