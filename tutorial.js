class OnboardingTutorial {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.storageKey = 'onboarding-tutorial-completed';
        
        this.steps = [
            {
                target: '#welcome',
                title: 'Welcome to MyApp!',
                description: 'This is your main dashboard where you\'ll see an overview of your work and quick access to key features.',
                position: 'bottom'
            },
            {
                target: '#sidebar',
                title: 'Navigation Sidebar',
                description: 'Use this sidebar to navigate between different sections like Dashboard, Projects, Tasks, and Calendar.',
                position: 'right'
            },
            {
                target: '#create-project',
                title: 'Create Your First Project',
                description: 'Click here to create your first project and start organizing your work.',
                position: 'bottom'
            },
            {
                target: '#invite-team',
                title: 'Invite Your Team',
                description: 'Collaboration is key! Invite team members to work together on projects.',
                position: 'bottom'
            },
            {
                target: '#notifications',
                title: 'Stay Updated',
                description: 'Check notifications here to stay updated on project changes and team activity.',
                position: 'bottom'
            },
            {
                target: '#profile',
                title: 'Profile & Settings',
                description: 'Access your profile and customize your workspace settings from here.',
                position: 'bottom'
            }
        ];
        
        this.init();
    }
    
    init() {
        if (this.isCompleted()) {
            return;
        }
        
        this.bindEvents();
        setTimeout(() => this.start(), 1000);
    }
    
    bindEvents() {
        const nextBtn = document.getElementById('next-step');
        const skipBtn = document.getElementById('skip-tutorial');
        const backdrop = document.querySelector('.tutorial-backdrop');
        
        nextBtn.addEventListener('click', () => this.nextStep());
        skipBtn.addEventListener('click', () => this.skip());
        backdrop.addEventListener('click', () => this.skip());
        
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'Escape') {
                this.skip();
            } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
                this.nextStep();
            }
        });
    }
    
    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.showStep();
        this.showOverlay();
    }
    
    showOverlay() {
        const overlay = document.getElementById('tutorial-overlay');
        overlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        const overlay = document.getElementById('tutorial-overlay');
        overlay.classList.add('hidden');
        this.clearHighlight();
    }
    
    showStep() {
        const step = this.steps[this.currentStep];
        const target = document.querySelector(step.target);
        
        if (!target) {
            this.nextStep();
            return;
        }
        
        this.highlightElement(target);
        this.positionTooltip(target, step);
        this.updateTooltipContent(step);
        this.updateProgress();
    }
    
    highlightElement(element) {
        this.clearHighlight();
        element.classList.add('tutorial-highlight');
    }
    
    clearHighlight() {
        const highlighted = document.querySelector('.tutorial-highlight');
        if (highlighted) {
            highlighted.classList.remove('tutorial-highlight');
        }
    }
    
    positionTooltip(target, step) {
        const tooltip = document.getElementById('tutorial-tooltip');
        const arrow = document.getElementById('tooltip-arrow');
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Reset arrow classes
        arrow.className = 'tooltip-arrow';
        
        let top, left;
        
        switch (step.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                arrow.classList.add('bottom');
                break;
                
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                arrow.classList.add('top');
                break;
                
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 20;
                arrow.classList.add('right');
                break;
                
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 20;
                arrow.classList.add('left');
                break;
                
            default:
                top = rect.bottom + 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                arrow.classList.add('top');
        }
        
        // Ensure tooltip stays within viewport
        const padding = 20;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < padding) {
            left = padding;
        } else if (left + tooltipRect.width > viewportWidth - padding) {
            left = viewportWidth - tooltipRect.width - padding;
        }
        
        if (top < padding) {
            top = padding;
        } else if (top + tooltipRect.height > viewportHeight - padding) {
            top = viewportHeight - tooltipRect.height - padding;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }
    
    updateTooltipContent(step) {
        const title = document.getElementById('tooltip-title');
        const description = document.getElementById('tooltip-description');
        const nextBtn = document.getElementById('next-step');
        
        title.textContent = step.title;
        description.textContent = step.description;
        
        // Update next button text for last step
        if (this.currentStep === this.steps.length - 1) {
            nextBtn.textContent = 'Finish';
        } else {
            nextBtn.textContent = 'Next';
        }
    }
    
    updateProgress() {
        const counter = document.getElementById('step-counter');
        counter.textContent = `${this.currentStep + 1} of ${this.steps.length}`;
    }
    
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            this.complete();
        }
    }
    
    skip() {
        this.complete();
    }
    
    complete() {
        this.isActive = false;
        this.hideOverlay();
        this.markAsCompleted();
        
        // Show completion message
        this.showCompletionMessage();
    }
    
    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
            <div class="completion-content">
                <div class="completion-icon">🎉</div>
                <h3>Welcome aboard!</h3>
                <p>You're all set to start using MyApp. Enjoy exploring!</p>
            </div>
        `;
        
        // Add styles for completion message
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1003;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .completion-content {
                text-align: center;
            }
            .completion-icon {
                font-size: 32px;
                margin-bottom: 12px;
            }
            .completion-content h3 {
                color: #1f2937;
                margin-bottom: 8px;
            }
            .completion-content p {
                color: #6b7280;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
            style.remove();
        }, 4000);
    }
    
    markAsCompleted() {
        localStorage.setItem(this.storageKey, 'true');
    }
    
    isCompleted() {
        return localStorage.getItem(this.storageKey) === 'true';
    }
    
    // Public method to reset tutorial (for testing)
    reset() {
        localStorage.removeItem(this.storageKey);
        location.reload();
    }
}

// Initialize tutorial when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tutorial = new OnboardingTutorial();
});

// Add reset function to window for easy testing
window.resetTutorial = () => {
    if (window.tutorial) {
        window.tutorial.reset();
    }
};