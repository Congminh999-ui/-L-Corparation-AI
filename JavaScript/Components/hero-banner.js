/**
 * L-Corparation — Hero Banner (Tesla-style minimal)
 * Smooth scroll on chevron click + subtle video fade-in
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {

        /* ---- Scroll indicator click → scroll to next section ---- */
        const scrollIndicator = document.querySelector('.hero-scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.cursor = 'pointer';
            scrollIndicator.addEventListener('click', function () {
                const heroSection = document.getElementById('hero');
                if (!heroSection) return;
                const nextSection = heroSection.nextElementSibling;
                if (nextSection) {
                    nextSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        /* ---- Fade-in the video smoothly after it starts loading ---- */
        const video = document.querySelector('.hero-video');
        if (video) {
            video.style.opacity = '0';
            video.style.transition = 'opacity 1.5s ease';

            const showVideo = function () {
                video.style.opacity = '1';
            };

            if (video.readyState >= 2) {
                showVideo();
            } else {
                video.addEventListener('loadeddata', showVideo);
                // Fallback — show after 2 s even if still buffering
                setTimeout(showVideo, 2000);
            }
        }
    });
})();
