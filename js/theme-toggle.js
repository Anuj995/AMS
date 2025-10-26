// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const body = document.body;

    // Get saved theme from localStorage or default to 'dark'
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Add animation effect
        themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    });

    function setTheme(theme) {
        body.setAttribute('data-theme', theme);
        
        if (theme === 'light') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Light Mode';
            
            // Add floating elements for light theme
            addFloatingElements();
            
            // Add luxury animations
            addLuxuryAnimations();
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Dark Mode';
            
            // Remove floating elements for dark theme
            removeFloatingElements();
        }
        
        // Trigger theme change animation
        body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            body.style.transition = '';
        }, 300);
    }

    function addFloatingElements() {
        // Remove existing floating elements
        removeFloatingElements();
        
        // Create floating elements for luxury effect
        for (let i = 0; i < 5; i++) {
            const floatingElement = document.createElement('div');
            floatingElement.className = 'floating-element';
            floatingElement.style.cssText = `
                width: ${Math.random() * 100 + 50}px;
                height: ${Math.random() * 100 + 50}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 6}s;
                opacity: 0.1;
                z-index: -1;
            `;
            document.body.appendChild(floatingElement);
        }
    }

    function removeFloatingElements() {
        const existingElements = document.querySelectorAll('.floating-element');
        existingElements.forEach(element => element.remove());
    }

    function addLuxuryAnimations() {
        // Add staggered animation to cards
        const cards = document.querySelectorAll('.stat-card, .gate-card, .admin-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('luxury-entrance');
        });
    }

    // Add CSS for luxury entrance animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes luxuryEntrance {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .luxury-entrance {
            animation: luxuryEntrance 0.6s ease-out forwards;
        }
        
        [data-theme="light"] .stat-card,
        [data-theme="light"] .gate-card,
        [data-theme="light"] .admin-card {
            position: relative;
            overflow: hidden;
        }
        
        [data-theme="light"] .stat-card::after,
        [data-theme="light"] .gate-card::after,
        [data-theme="light"] .admin-card::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            transform: rotate(45deg);
            transition: all 0.5s;
            opacity: 0;
        }
        
        [data-theme="light"] .stat-card:hover::after,
        [data-theme="light"] .gate-card:hover::after,
        [data-theme="light"] .admin-card:hover::after {
            animation: shimmer 1.5s ease-in-out;
        }
        
        @keyframes shimmer {
            0% {
                transform: translateX(-100%) translateY(-100%) rotate(45deg);
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: translateX(100%) translateY(100%) rotate(45deg);
                opacity: 0;
            }
        }
        
        /* Luxury gradient backgrounds for light theme */
        [data-theme="light"] .hero-section {
            background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), 
                        url('https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop');
        }
        
        /* Enhanced button effects for light theme */
        [data-theme="light"] .btn-primary {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #059669, #16a34a);
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        }
        
        [data-theme="light"] .btn-primary:hover {
            box-shadow: 0 8px 25px rgba(5, 150, 105, 0.4);
            transform: translateY(-2px);
        }
        
        /* Glassmorphism effect for modals in light theme */
        [data-theme="light"] .modal-content {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        /* Enhanced table styling for light theme */
        [data-theme="light"] .data-table-container {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        /* Luxury status badges for light theme */
        [data-theme="light"] .status-badge {
            background: linear-gradient(135deg, var(--accent-green), var(--accent-lime));
            color: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* Enhanced navigation for light theme */
        [data-theme="light"] .navbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
});