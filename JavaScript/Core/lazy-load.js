/**
 * Lazy Loading Module
 * Loads resources (images, video) only when they come into view
 * Optimizes page performance and reduces initial load time
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        setupLazyLoading();
    } else {
        // Fallback for older browsers: load everything immediately
        loadAllResources();
    }
});

/**
 * Setup Intersection Observer for lazy loading
 */
function setupLazyLoading() {
    const options = {
        root: null,
        rootMargin: '50px',
        threshold: 0.01
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadResource(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, options);

    // Observe all lazy-loadable elements
    const observeElements = () => {
        // Images with lazy-load class
        document.querySelectorAll('img.lazy-load').forEach(img => {
            observer.observe(img);
        });

        // Hero video
        const heroVideo = document.querySelector('.hero-video');
        if (heroVideo) {
            observer.observe(heroVideo);
        }
    };

    observeElements();

    // Use MutationObserver to watch for new lazy-load elements added dynamically
    const mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (node.classList.contains('lazy-load')) {
                        observer.observe(node);
                    }
                    node.querySelectorAll('.lazy-load').forEach(child => {
                        observer.observe(child);
                    });
                }
            });
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
}

/**
 * Load a single resource
 * @param {Element} element - The element to load
 */
function loadResource(element) {
    if (element.tagName === 'VIDEO') {
        loadVideo(element);
    } else if (element.tagName === 'IMG') {
        loadImage(element);
    }
}

/**
 * Load image from data-src to src
 * @param {HTMLImageElement} img - The image element
 */
function loadImage(img) {
    if (img.dataset.src) {
        const src = img.dataset.src;
        img.removeAttribute('data-src');
        
        // Ensure image is invisible before Sharp content loads if not from cache
        if (!img.complete) {
            img.style.opacity = '0';
        }

        const onImageLoad = () => {
            img.style.transition = 'opacity 0.3s ease-in, filter 0.3s ease-in';
            img.style.opacity = '1';
            img.style.filter = 'blur(0)';
            img.classList.remove('lazy-load');
        };

        if (img.complete) {
            onImageLoad();
        } else {
            img.onload = onImageLoad;
            img.onerror = () => {
                img.classList.remove('lazy-load');
                img.style.opacity = '1';
            };
        }
        
        img.src = src;
    }
}

/**
 * Load video from data-src to src
 * @param {HTMLVideoElement} video - The video element
 */
function loadVideo(video) {
    if (video.dataset.src && !video.src) {
        const source = video.querySelector('source');
        
        if (source && source.dataset.src) {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
        }
        
        video.dataset.src = '';
        
        // Start video playback after loading
        video.addEventListener('loadeddata', function() {
            video.play().catch(error => {
                console.log('Video autoplay prevented:', error);
            });
        }, { once: true });
        
        video.load();
    }
}

/**
 * Fallback: Load all resources immediately
 * Used for browsers without IntersectionObserver support
 */
function loadAllResources() {
    // Load all lazy images
    document.querySelectorAll('img.lazy-load').forEach(img => {
        loadImage(img);
    });

    // Load video
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        loadVideo(heroVideo);
    }
}

/**
 * Manual trigger to load a specific section
 * Useful if you want to load resources on demand
 * @param {string} sectionId - The ID of the section container
 */
window.loadSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const images = section.querySelectorAll('img.lazy-load');
        const videos = section.querySelectorAll('video[data-src]');
        
        images.forEach(img => loadImage(img));
        videos.forEach(video => loadVideo(video));
    }
};

console.log('Lazy loading module initialized');
