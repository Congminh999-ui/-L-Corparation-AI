/**
 * L-Corporation - Charging Station Simulation
 * Handles filtering and interaction for the charging section
 */

document.addEventListener('DOMContentLoaded', function () {
    const chargingPills = document.querySelectorAll('.charging-pill');
    const stationCards = document.querySelectorAll('.charging-station-card');

    chargingPills.forEach(pill => {
        pill.addEventListener('click', function () {
            // Update active pill
            chargingPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');

            const filterType = this.getAttribute('data-filter');

            // Simulation logic
            stationCards.forEach(card => {
                const cardType = card.getAttribute('data-type');

                if (filterType === 'all') {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                } else if (cardType === filterType) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Add click to activate station card (visual only)
    stationCards.forEach(card => {
        card.addEventListener('click', function () {
            stationCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
