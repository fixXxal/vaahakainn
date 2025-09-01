/**
 * VAAHAKAINN Onboarding Tutorial System
 * Provides an interactive tutorial experience for new users
 * Integrates seamlessly with the existing website design and functionality
 */

class VaahakainTutorial {
    constructor() {
        this.currentStep = 0;
        this.steps = [];
        this.isActive = false;
        this.hasStarted = false;
        this.overlay = null;
        this.card = null;
        
        // Configuration
        this.config = {
            autoStart: true,
            skipOnMobile: false,
            showProgress: true,
            enableHighlight: true,
            welcomeDelay: 2000,
            storageKey: 'vaahakainn_tutorial_completed',
            version: '1.0'
        };
        
        this.initialize();
    }
    
    initialize() {
        // Check if tutorial has been completed
        if (this.isCompleted()) {
            return;
        }
        
        // Load tutorial steps
        this.loadSteps();
        
        // Create tutorial elements
        this.createElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Auto-start if enabled and not on mobile (unless specifically enabled)
        if (this.config.autoStart && (!this.isMobile() || !this.config.skipOnMobile)) {
            this.showWelcomeNotice();
        }
    }
    
    loadSteps() {
        this.steps = [
            {
                id: 'welcome',
                title: 'Welcome to VAAHAKAINN',
                subtitle: 'Get Started',
                description: 'Welcome to the magical world of VAAHAKAINN! Let us take you on a quick tour to discover the most beautiful stories and tales.',
                icon: '✨',
                highlight: null,
                position: 'center'
            },
            {
                id: 'navigation',
                title: 'Navigation',
                subtitle: 'Getting Around',
                description: 'Use the top menu to navigate between pages. You can access the home page and stories section from here.',
                icon: '🧭',
                highlight: '.main-nav',
                position: 'bottom'
            },
            {
                id: 'stories',
                title: 'Featured Stories',
                subtitle: 'Discover Content',
                description: 'Here you will find a curated collection of the most beautiful stories. Click on any story to read more details.',
                icon: '📚',
                highlight: '.stories-grid',
                position: 'top'
            },
            {
                id: 'story-card',
                title: 'Story Cards',
                subtitle: 'Interactive Elements',
                description: 'Hover over any story card to see the story description and additional details. Click "Explore Story" to start reading.',
                icon: '🎭',
                highlight: '.story-card:first-child',
                position: 'right'
            },
            {
                id: 'social',
                title: 'Follow Us',
                subtitle: 'Stay Connected',
                description: 'Don\'t forget to follow us on social media to get the latest updates and new stories!',
                icon: '💫',
                highlight: 'footer',
                position: 'top'
            },
            {
                id: 'complete',
                title: 'Welcome Aboard!',
                subtitle: 'Ready to Explore',
                description: 'You are now ready to explore the magical world of VAAHAKAINN! Enjoy reading and discover wonderful stories that take you to different worlds.',
                icon: '🎉',
                highlight: null,
                position: 'center'
            }
        ];
    }
    
    createElements() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        
        // Create tutorial card
        this.card = document.createElement('div');
        this.card.className = 'tutorial-card';
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'tutorial-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => this.close();
        
        // Create header
        const header = document.createElement('div');
        header.className = 'tutorial-header';
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'tutorial-content';
        
        // Create progress bar (if enabled)
        let progressBar = '';
        if (this.config.showProgress) {
            progressBar = `
                <div class="tutorial-progress">
                    <div class="tutorial-progress-bar">
                        <div class="tutorial-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="tutorial-progress-text">Step 1 of ${this.steps.length}</div>
                </div>
            `;
        }
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'tutorial-controls';
        
        // Assemble the card
        this.card.appendChild(closeBtn);
        this.card.appendChild(header);
        this.card.appendChild(content);
        if (this.config.showProgress) {
            content.insertAdjacentHTML('afterend', progressBar);
        }
        this.card.appendChild(controls);
        
        this.overlay.appendChild(this.card);
        document.body.appendChild(this.overlay);
    }
    
    setupEventListeners() {
        // Close on overlay click
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.close();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.isActive) {
                this.positionCard();
            }
        });
    }
    
    showWelcomeNotice() {
        // Create welcome notice
        const notice = document.createElement('div');
        notice.className = 'tutorial-auto-notice';
        notice.innerHTML = `
            <div class="tutorial-auto-notice-text">
                هل تريد جولة سريعة في الموقع؟<br>
                <small>Would you like a quick site tour?</small>
            </div>
            <div class="tutorial-auto-notice-actions">
                <button class="tutorial-btn tutorial-btn-primary" onclick="window.vaahakainTutorial.start(); this.closest('.tutorial-auto-notice').remove();">
                    نعم
                </button>
                <button class="tutorial-btn tutorial-btn-skip" onclick="window.vaahakainTutorial.markCompleted(); this.closest('.tutorial-auto-notice').remove();">
                    لا شكرا
                </button>
            </div>
        `;
        
        document.body.appendChild(notice);
        
        // Show the notice
        setTimeout(() => {
            notice.classList.add('show');
        }, this.config.welcomeDelay);
        
        // Auto-hide after 10 seconds if no interaction
        setTimeout(() => {
            if (notice.parentNode) {
                notice.style.transform = 'translateX(100%)';
                setTimeout(() => notice.remove(), 500);
            }
        }, 10000);
    }
    
    start() {
        if (this.isActive || this.steps.length === 0) return;
        
        this.isActive = true;
        this.hasStarted = true;
        this.currentStep = 0;
        
        // Show overlay
        this.overlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Show first step
        this.showStep(this.currentStep);
        
        // Track tutorial start
        this.trackEvent('tutorial_started');
    }
    
    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;
        
        const step = this.steps[stepIndex];
        const header = this.card.querySelector('.tutorial-header');
        const content = this.card.querySelector('.tutorial-content');
        const controls = this.card.querySelector('.tutorial-controls');
        const progressBar = this.card.querySelector('.tutorial-progress');
        
        // Clear previous highlights
        this.clearHighlights();
        
        // Update header
        header.innerHTML = `
            <div class="tutorial-icon">${step.icon}</div>
            <h2 class="tutorial-title">${step.title}</h2>
            <p class="tutorial-subtitle">${step.subtitle}</p>
        `;
        
        // Update content
        content.innerHTML = `
            <div class="tutorial-step active">
                <div class="tutorial-step-number">${stepIndex + 1}</div>
                <h3 class="tutorial-step-title">${step.title}</h3>
                <p class="tutorial-step-description">${step.description}</p>
            </div>
        `;
        
        // Update progress
        if (progressBar) {
            const progress = ((stepIndex + 1) / this.steps.length) * 100;
            const progressFill = progressBar.querySelector('.tutorial-progress-fill');
            const progressText = progressBar.querySelector('.tutorial-progress-text');
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Step ${stepIndex + 1} of ${this.steps.length}`;
        }
        
        // Update controls
        const isFirst = stepIndex === 0;
        const isLast = stepIndex === this.steps.length - 1;
        
        controls.innerHTML = `
            ${!isFirst ? `<button class="tutorial-btn" onclick="window.vaahakainTutorial.previousStep()">السابق</button>` : ''}
            <button class="tutorial-btn tutorial-btn-skip" onclick="window.vaahakainTutorial.skip()">تخطي</button>
            ${!isLast ? `<button class="tutorial-btn tutorial-btn-primary" onclick="window.vaahakainTutorial.nextStep()">التالي</button>` : 
                       `<button class="tutorial-btn tutorial-btn-primary" onclick="window.vaahakainTutorial.complete()">إنهاء</button>`}
        `;
        
        // Add highlight if specified
        if (step.highlight && this.config.enableHighlight) {
            this.highlightElement(step.highlight);
        }
        
        // Position card
        this.positionCard();
        
        // Track step view
        this.trackEvent('tutorial_step_viewed', { step: step.id });
    }
    
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }
    
    skip() {
        this.trackEvent('tutorial_skipped', { step: this.currentStep });
        this.close();
        this.markCompleted();
    }
    
    complete() {
        this.trackEvent('tutorial_completed');
        this.close();
        this.markCompleted();
        
        // Show completion message
        this.showCompletionMessage();
    }
    
    close() {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Hide overlay
        this.overlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Clear highlights
        this.clearHighlights();
        
        // Track close event
        if (this.hasStarted) {
            this.trackEvent('tutorial_closed', { step: this.currentStep });
        }
    }
    
    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('tutorial-highlight');
            
            // Scroll element into view
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 300);
        }
    }
    
    clearHighlights() {
        const highlights = document.querySelectorAll('.tutorial-highlight');
        highlights.forEach(el => el.classList.remove('tutorial-highlight'));
    }
    
    positionCard() {
        // For now, keep card centered. Could be enhanced to position relative to highlighted elements
        const step = this.steps[this.currentStep];
        if (step && step.highlight && step.position !== 'center') {
            const element = document.querySelector(step.highlight);
            if (element) {
                // Could add logic to position card relative to highlighted element
                // For simplicity, keeping it centered for now
            }
        }
    }
    
    showCompletionMessage() {
        // Create temporary completion message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #faf8f2, #f0ebd8);
            border: 3px solid #d4af37;
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            z-index: 10001;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(139, 69, 19, 0.3);
        `;
        
        message.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
            <h3 style="color: #b4316a; font-family: 'Faruma', serif; margin-bottom: 0.5rem;">أهلا وسهلا!</h3>
            <p style="color: #8b4513; margin-bottom: 1.5rem;">أنت الآن جاهز لاستكشاف عالم القصص الساحر!</p>
            <button onclick="this.parentElement.remove()" style="background: linear-gradient(145deg, #f8f6f0, #ede8d8); border: 2px solid #d4af37; border-radius: 15px; padding: 0.8rem 1.5rem; color: #8b4513; font-weight: 700; cursor: pointer;">
                ابدأ الاستكشاف
            </button>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
    
    isCompleted() {
        try {
            const completed = localStorage.getItem(this.config.storageKey);
            return completed === this.config.version;
        } catch (e) {
            return false;
        }
    }
    
    markCompleted() {
        try {
            localStorage.setItem(this.config.storageKey, this.config.version);
        } catch (e) {
            // Silently fail if localStorage is not available
        }
    }
    
    reset() {
        try {
            localStorage.removeItem(this.config.storageKey);
            this.close();
        } catch (e) {
            // Silently fail
        }
    }
    
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    trackEvent(eventName, data = {}) {
        // Basic event tracking - can be enhanced with analytics
        console.log(`[VAAHAKAINN Tutorial] ${eventName}`, data);
        
        // Could integrate with Google Analytics, mixpanel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'tutorial',
                ...data
            });
        }
    }
    
    // Public API methods
    startManual() {
        this.start();
    }
    
    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.remove();
        }
        this.isActive = false;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on home page or when specifically requested
    if (window.location.pathname === '/' || document.body.dataset.enableTutorial === 'true') {
        // Add a small delay to ensure all page elements are loaded
        setTimeout(() => {
            window.vaahakainTutorial = new VaahakainTutorial();
        }, 1000);
    }
});

// Expose tutorial control functions globally
window.startVaahakainTutorial = function() {
    if (window.vaahakainTutorial) {
        window.vaahakainTutorial.startManual();
    } else {
        window.vaahakainTutorial = new VaahakainTutorial();
        window.vaahakainTutorial.startManual();
    }
};

window.resetVaahakainTutorial = function() {
    if (window.vaahakainTutorial) {
        window.vaahakainTutorial.reset();
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VaahakainTutorial;
}