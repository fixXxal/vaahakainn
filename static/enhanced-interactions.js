// Enhanced Interactive Features for VAAHAKAINN
// Magical storybook experience with advanced animations and interactions

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initScrollAnimations();
    // initMagicalCursor(); // Disabled - remove custom cursor
    initReadingProgress();
    initParallaxEffects();
    initSoundEffects();
    initThemeTransitions();
    initStorytellingEffects();
});

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Special effects for different elements
                if (entry.target.classList.contains('story-card')) {
                    animateStoryCard(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe all animated elements (excluding episode-content)
    document.querySelectorAll('.story-card, h1, h2, h3').forEach(el => {
        observer.observe(el);
    });
}

// Magical cursor effects
function initMagicalCursor() {
    const cursor = createMagicalCursor();
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor following
    function updateCursor() {
        const speed = 0.1;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Interactive hover effects
    document.querySelectorAll('a, button, .story-card, .btn').forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('cursor-hover');
            createSparkleEffect(mouseX, mouseY);
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('cursor-hover');
        });
    });
}

function createMagicalCursor() {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #f8e8f0, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: transform 0.1s ease;
    `;
    return cursor;
}

// Reading progress indicator
function initReadingProgress() {
    const progressBar = createProgressBar();
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / total) * 100;
        
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        
        // Change color based on progress
        if (progress < 30) {
            progressBar.style.background = 'linear-gradient(90deg, #f8e8f0, #e8d1dc)';
        } else if (progress < 70) {
            progressBar.style.background = 'linear-gradient(90deg, #e8d1dc, #d1bcc7)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #d1bcc7, #f8e8f0)';
        }
    });
}

function createProgressBar() {
    const progress = document.createElement('div');
    progress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 4px;
        background: linear-gradient(90deg, #f8e8f0, #e8d1dc);
        z-index: 10000;
        transition: width 0.3s ease;
        box-shadow: 0 0 10px rgba(218, 165, 32, 0.5);
    `;
    return progress;
}

// Parallax effects for floating elements
function initParallaxEffects() {
    const floatingElements = document.querySelectorAll('[style*="position: fixed"][style*="animation"]');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        floatingElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.01}deg)`;
        });
    });
}

// Interactive sound effects (optional - requires user interaction)
function initSoundEffects() {
    const sounds = {
        hover: createSoundEffect(200, 300, 0.1),
        click: createSoundEffect(300, 400, 0.15),
        page: createSoundEffect(150, 250, 0.08)
    };

    // Add sound to interactive elements
    document.querySelectorAll('a, button, .btn').forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (localStorage.getItem('soundEnabled') === 'true') {
                sounds.hover();
            }
        });
        
        element.addEventListener('click', () => {
            if (localStorage.getItem('soundEnabled') === 'true') {
                sounds.click();
            }
        });
    });
}

function createSoundEffect(freq1, freq2, volume) {
    return function() {
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = window.audioContext.createOscillator();
        const gainNode = window.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(window.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq1, window.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(freq2, window.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(volume, window.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioContext.currentTime + 0.1);
        
        oscillator.start(window.audioContext.currentTime);
        oscillator.stop(window.audioContext.currentTime + 0.1);
    };
}

// Theme transition effects
function initThemeTransitions() {
    // Smooth transitions between pages
    window.addEventListener('beforeunload', () => {
        document.body.style.transition = 'all 0.5s ease';
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.95)';
    });
    
    // Page load animations
    document.body.style.opacity = '0';
    document.body.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        document.body.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        document.body.style.opacity = '1';
        document.body.style.transform = 'scale(1)';
    }, 100);
}

// Storytelling effects
function initStorytellingEffects() {
    // Interactive story cards
    document.querySelectorAll('.story-card').forEach(card => {
        addStoryCardEffects(card);
    });
    
    // Enhanced reading mode
    initReadingMode();
}


function addStoryCardEffects(card) {
    // 3D tilt effect
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
    
    // Sparkle effect on hover
    card.addEventListener('mouseenter', () => {
        createSparkleExplosion(card);
    });
}

function createSparkleEffect(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: #f8e8f0;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        animation: sparkleFloat 1s ease-out forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

function createSparkleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            createSparkleEffect(x, y);
        }, i * 50);
    }
}

function initReadingMode() {
    // Create reading mode toggle
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '🌙';
    toggleButton.id = 'night-mode-toggle';
    toggleButton.style.cssText = `
        position: fixed;
        top: 15px;
        right: 15px;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c287a3, #b4316a);
        color: #ffffff;
        border: 2px solid rgba(255, 255, 255, 0.3);
        font-size: 14px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 15px rgba(194, 135, 163, 0.3);
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('reading-mode');
        toggleButton.innerHTML = document.body.classList.contains('reading-mode') ? '☀️' : '🌙';
        localStorage.setItem('readingMode', document.body.classList.contains('reading-mode'));
    });
    
    document.body.appendChild(toggleButton);
    
    // Restore reading mode from localStorage
    if (localStorage.getItem('readingMode') === 'true') {
        document.body.classList.add('reading-mode');
        toggleButton.innerHTML = '☀️';
    }
}

// Animation helper functions
function animateStoryCard(card) {
    card.style.transform = 'translateY(30px) scale(0.9)';
    card.style.opacity = '0';
    
    setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.opacity = '1';
    }, 100);
}


// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes sparkleFloat {
        0% {
            transform: translateY(0px) scale(1) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(-30px) scale(0) rotate(180deg);
            opacity: 0;
        }
    }
    
    .cursor-hover {
        transform: scale(1.5) !important;
        background: radial-gradient(circle, #f8e8f0, #e8d1dc) !important;
    }
    
    .reading-mode {
        filter: sepia(20%) brightness(0.8) contrast(1.1);
    }
    
    .reading-mode .container {
        background: #ffffff !important;
        color: #1a1a1a !important;
    }
    
    /* Responsive night mode button */
    @media (max-width: 768px) {
        #night-mode-toggle {
            width: 32px !important;
            height: 32px !important;
            top: 12px !important;
            right: 12px !important;
            font-size: 13px !important;
        }
    }
    
    @media (max-width: 480px) {
        #night-mode-toggle {
            width: 28px !important;
            height: 28px !important;
            top: 10px !important;
            right: 10px !important;
            font-size: 12px !important;
        }
    }
    
    @media (max-width: 320px) {
        #night-mode-toggle {
            width: 26px !important;
            height: 26px !important;
            top: 8px !important;
            right: 8px !important;
            font-size: 11px !important;
        }
    }
    
    #night-mode-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(194, 135, 163, 0.5);
    }
    
    #night-mode-toggle:active {
        transform: scale(0.95);
    }
    
    .animate-in {
        animation: slideInFromBottom 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
    @keyframes slideInFromBottom {
        from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
    
    .story-card {
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .story-card:hover {
        transform: translateY(-12px) scale(1.05);
        box-shadow: 0 20px 40px rgba(139, 69, 19, 0.3);
    }
    
    .typing-complete {
        animation: contentGlow 2s ease-in-out infinite alternate;
    }
    
    @keyframes contentGlow {
        from {
            text-shadow: 0 0 5px rgba(218, 165, 32, 0.3);
        }
        to {
            text-shadow: 0 0 20px rgba(218, 165, 32, 0.6);
        }
    }
`;

document.head.appendChild(style);