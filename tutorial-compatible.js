// Cross-browser compatible onboarding tutorial
(function() {
    'use strict';
    
    function OnboardingTutorial() {
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
    
    OnboardingTutorial.prototype.init = function() {
        console.log('Tutorial initializing...');
        if (this.isCompleted()) {
            console.log('Tutorial already completed, skipping');
            return;
        }
        
        console.log('Starting tutorial...');
        this.bindEvents();
        var self = this;
        setTimeout(function() {
            self.start();
        }, 1000);
    };
    
    OnboardingTutorial.prototype.bindEvents = function() {
        var self = this;
        var nextBtn = document.getElementById('next-step');
        var skipBtn = document.getElementById('skip-tutorial');
        var backdrop = document.querySelector('.tutorial-backdrop');
        
        if (nextBtn) {
            this.addEventListenerCompat(nextBtn, 'click', function() {
                self.nextStep();
            });
        }
        
        if (skipBtn) {
            this.addEventListenerCompat(skipBtn, 'click', function() {
                self.skip();
            });
        }
        
        if (backdrop) {
            this.addEventListenerCompat(backdrop, 'click', function() {
                self.skip();
            });
        }
        
        this.addEventListenerCompat(document, 'keydown', function(e) {
            if (!self.isActive) return;
            
            var key = e.key || e.keyCode;
            if (key === 'Escape' || key === 27) {
                self.skip();
            } else if (key === 'Enter' || key === 13 || key === 'ArrowRight' || key === 39) {
                self.nextStep();
            }
        });
    };
    
    OnboardingTutorial.prototype.addEventListenerCompat = function(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        }
    };
    
    OnboardingTutorial.prototype.start = function() {
        console.log('Tutorial starting - showing overlay and first step');
        this.isActive = true;
        this.currentStep = 0;
        this.showStep();
        this.showOverlay();
    };
    
    OnboardingTutorial.prototype.showOverlay = function() {
        var overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            this.removeClassCompat(overlay, 'hidden');
        }
    };
    
    OnboardingTutorial.prototype.hideOverlay = function() {
        var overlay = document.getElementById('tutorial-overlay');
        if (overlay) {
            this.addClassCompat(overlay, 'hidden');
        }
        this.clearHighlight();
    };
    
    OnboardingTutorial.prototype.showStep = function() {
        var step = this.steps[this.currentStep];
        var target = document.querySelector(step.target);
        
        if (!target) {
            this.nextStep();
            return;
        }
        
        this.highlightElement(target);
        this.positionTooltip(target, step);
        this.updateTooltipContent(step);
        this.updateProgress();
    };
    
    OnboardingTutorial.prototype.highlightElement = function(element) {
        this.clearHighlight();
        this.addClassCompat(element, 'tutorial-highlight');
    };
    
    OnboardingTutorial.prototype.clearHighlight = function() {
        var highlighted = document.querySelector('.tutorial-highlight');
        if (highlighted) {
            this.removeClassCompat(highlighted, 'tutorial-highlight');
        }
    };
    
    OnboardingTutorial.prototype.positionTooltip = function(target, step) {
        var tooltip = document.getElementById('tutorial-tooltip');
        var arrow = document.getElementById('tooltip-arrow');
        
        if (!tooltip || !arrow || !target) return;
        
        var rect = this.getBoundingClientRectCompat(target);
        
        // Ensure tooltip is visible to get accurate measurements
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        
        var tooltipRect = this.getBoundingClientRectCompat(tooltip);
        
        // Reset arrow classes
        arrow.className = 'tooltip-arrow';
        
        var top, left;
        
        switch (step.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                this.addClassCompat(arrow, 'bottom');
                break;
                
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                this.addClassCompat(arrow, 'top');
                break;
                
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 20;
                this.addClassCompat(arrow, 'right');
                break;
                
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 20;
                this.addClassCompat(arrow, 'left');
                break;
                
            default:
                top = rect.bottom + 20;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                this.addClassCompat(arrow, 'top');
        }
        
        // Ensure tooltip stays within viewport
        var padding = 20;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        
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
        
        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
    };
    
    OnboardingTutorial.prototype.getBoundingClientRectCompat = function(element) {
        if (element.getBoundingClientRect) {
            return element.getBoundingClientRect();
        }
        
        // Fallback for older browsers
        var rect = {
            top: element.offsetTop,
            left: element.offsetLeft,
            width: element.offsetWidth,
            height: element.offsetHeight
        };
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;
        return rect;
    };
    
    OnboardingTutorial.prototype.updateTooltipContent = function(step) {
        var title = document.getElementById('tooltip-title');
        var description = document.getElementById('tooltip-description');
        var nextBtn = document.getElementById('next-step');
        
        if (title) title.textContent = step.title;
        if (description) description.textContent = step.description;
        
        // Update next button text for last step
        if (nextBtn) {
            if (this.currentStep === this.steps.length - 1) {
                nextBtn.textContent = 'Finish';
            } else {
                nextBtn.textContent = 'Next';
            }
        }
    };
    
    OnboardingTutorial.prototype.updateProgress = function() {
        var counter = document.getElementById('step-counter');
        if (counter) {
            counter.textContent = (this.currentStep + 1) + ' of ' + this.steps.length;
        }
    };
    
    OnboardingTutorial.prototype.nextStep = function() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            this.complete();
        }
    };
    
    OnboardingTutorial.prototype.skip = function() {
        this.complete();
    };
    
    OnboardingTutorial.prototype.complete = function() {
        this.isActive = false;
        this.hideOverlay();
        this.markAsCompleted();
        
        // Show completion message
        this.showCompletionMessage();
    };
    
    OnboardingTutorial.prototype.showCompletionMessage = function() {
        var message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = 
            '<div class="completion-content">' +
                '<div class="completion-icon">🎉</div>' +
                '<h3>Welcome aboard!</h3>' +
                '<p>You\'re all set to start using MyApp. Enjoy exploring!</p>' +
            '</div>';
        
        // Add styles for completion message
        message.style.cssText = 
            'position: fixed; top: 20px; right: 20px; background: white; padding: 20px; ' +
            'border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); ' +
            'z-index: 1003; max-width: 300px; animation: slideInRight 0.3s ease-out;';
        
        var style = document.createElement('style');
        style.textContent = 
            '@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } ' +
            '.completion-content { text-align: center; } ' +
            '.completion-icon { font-size: 32px; margin-bottom: 12px; } ' +
            '.completion-content h3 { color: #1f2937; margin-bottom: 8px; } ' +
            '.completion-content p { color: #6b7280; font-size: 14px; }';
        
        if (document.head) document.head.appendChild(style);
        document.body.appendChild(message);
        
        setTimeout(function() {
            if (message.parentNode) message.parentNode.removeChild(message);
            if (style.parentNode) style.parentNode.removeChild(style);
        }, 4000);
    };
    
    OnboardingTutorial.prototype.markAsCompleted = function() {
        try {
            if (localStorage) {
                localStorage.setItem(this.storageKey, 'true');
            }
        } catch (e) {
            // Fallback for browsers without localStorage
            document.cookie = this.storageKey + '=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/';
        }
    };
    
    OnboardingTutorial.prototype.isCompleted = function() {
        try {
            if (localStorage) {
                return localStorage.getItem(this.storageKey) === 'true';
            }
        } catch (e) {
            // Fallback to cookies
            return document.cookie.indexOf(this.storageKey + '=true') !== -1;
        }
        return false;
    };
    
    OnboardingTutorial.prototype.reset = function() {
        try {
            if (localStorage) {
                localStorage.removeItem(this.storageKey);
            }
        } catch (e) {
            // Remove cookie
            document.cookie = this.storageKey + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }
        location.reload();
    };
    
    // Class helper methods for older browser compatibility
    OnboardingTutorial.prototype.addClassCompat = function(element, className) {
        if (element.classList) {
            element.classList.add(className);
        } else {
            var classes = element.className.split(' ');
            if (classes.indexOf(className) === -1) {
                classes.push(className);
                element.className = classes.join(' ');
            }
        }
    };
    
    OnboardingTutorial.prototype.removeClassCompat = function(element, className) {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            var classes = element.className.split(' ');
            var index = classes.indexOf(className);
            if (index !== -1) {
                classes.splice(index, 1);
                element.className = classes.join(' ');
            }
        }
    };
    
    // Initialize tutorial when page loads
    function initTutorial() {
        window.tutorial = new OnboardingTutorial();
        
        // Add reset function to window for easy testing
        window.resetTutorial = function() {
            if (window.tutorial) {
                window.tutorial.reset();
            }
        };
    }
    
    // Cross-browser DOM ready
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initTutorial();
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', initTutorial, false);
    } else if (document.attachEvent) {
        document.attachEvent('onreadystatechange', function() {
            if (document.readyState === 'complete') {
                initTutorial();
            }
        });
    }
    
})();