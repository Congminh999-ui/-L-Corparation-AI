/**
 * L-Corparation - Dashboard Style Car Sidebar Functions
 */

document.addEventListener('DOMContentLoaded', () => {
    const carMenuToggle = document.getElementById('carMenuToggle');
    const carSidebarOverlay = document.getElementById('carSidebarOverlay');
    const carSidebarClose = document.getElementById('carSidebarClose');
    const carSidebarSearch = document.getElementById('carSidebarSearch');

    if (!carMenuToggle || !carSidebarOverlay) return;

    // Open Sidebar
    carMenuToggle.addEventListener('click', () => {
        carSidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close Sidebar
    const closeSidebar = () => {
        carSidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    carSidebarClose.addEventListener('click', closeSidebar);
    
    carSidebarOverlay.addEventListener('click', (e) => {
        if (e.target === carSidebarOverlay) closeSidebar();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && carSidebarOverlay.classList.contains('active')) closeSidebar();
    });

    // Submenu Toggle Logic
    const menuItems = document.querySelectorAll('.menu-item.has-submenu');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const chevron = this.querySelector('.submenu-chevron');
            if (chevron) {
                chevron.classList.toggle('fa-chevron-down');
                chevron.classList.toggle('fa-chevron-up');
            }
            // Add actual submenu toggle logic here if needed
        });
    });

    // Active State Logic
    const allItems = document.querySelectorAll('.menu-item, .icon-nav-item');
    allItems.forEach(item => {
        item.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.active').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Search Logic (Simple Filter)
    if (carSidebarSearch) {
        carSidebarSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.menu-item:not(.has-submenu)');
            items.forEach(item => {
                const text = item.querySelector('.item-text').textContent.toLowerCase();
                if (text.includes(term)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
});
