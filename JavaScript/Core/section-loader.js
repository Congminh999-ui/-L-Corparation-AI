/**
 * Section Content Loader Module
 * Loads HTML sections with entrance animations when user scrolls to them
 * Reduces initial page load and improves performance
 */

// Map sections to their specific animations
const SECTION_ANIMATIONS = {
    'featured-cars': 'animation-slide-up',
    'featured-scooters': 'animation-slide-left',
    'accessory': 'animation-slide-up',
    'charging': 'animation-fade-in',
    'about-us': 'animation-slide-right',
    'footer': 'animation-fade-in'
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize section lazy loading
    if ('IntersectionObserver' in window) {
        setupSectionLoading();
    }
});

/**
 * Setup Intersection Observer for section loading
 */
function setupSectionLoading() {
    const options = {
        root: null,
        rootMargin: '100px',
        threshold: 0.01
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                const sectionId = section.id || section.tagName.toLowerCase();
                
                // Get animation type for this section
                const animationClass = SECTION_ANIMATIONS[sectionId] || 'animation-fade-in';
                
                // Remove hidden class and add animation class
                section.classList.remove('section-hidden');
                section.classList.add('section-loaded', animationClass);
                
                // Initialize section-specific content if needed
                initializeSection(section);
                
                // Stop observing this section
                observer.unobserve(section);
            }
        });
    }, options);

    // Observe sections that should be lazy loaded
    const lazyLoadedSections = [
        document.getElementById('featured-cars'),
        document.getElementById('featured-scooters'),
        document.getElementById('accessory'),
        document.getElementById('charging'),
        document.getElementById('about-us'),
        document.querySelector('footer')
    ];

    lazyLoadedSections.forEach(section => {
        if (section) {
            // Hide section by default (will be shown when scrolled to)
            section.classList.add('section-hidden');
            observer.observe(section);
        }
    });
}

/**
 * Initialize section content
 * Triggers any section-specific functionality
 * @param {Element} section - The section element
 */
function initializeSection(section) {
    const sectionId = section.id;
    
    if (sectionId === 'featured-cars' || sectionId === 'featured-scooters') {
        if (window.initVehicleSpecCarousel) window.initVehicleSpecCarousel();
    } else if (sectionId === 'accessory') {
        if (window.initAccessories) window.initAccessories();
    }
}

console.log('Section lazy loading module initialized');
