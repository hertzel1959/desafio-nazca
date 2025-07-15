/**
 * DESAFÍO DUNAS DE NAZCA - ADVANCED ANIMATIONS
 * Animaciones avanzadas y efectos visuales
 */

class AnimationController {
    constructor() {
        this.isInitialized = false;
        this.animations = new Map();
        this.observers = new Map();
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupCounterAnimations();
        this.setupParallaxEffects();
        this.setupTypewriterEffect();
        
        this.isInitialized = true;
        console.log('🎬 AnimationController inicializado');
    }
    
    /**
     * ANIMACIONES DE SCROLL
     */
    setupScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -10% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1]
        };
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerScrollAnimation(entry.target);
                }
            });
        }, observerOptions);
        
        // Elementos a animar
        const animatedElements = document.querySelectorAll(`
            .day-card,
            .requirement-card,
            .sponsor-card,
            .contact-item,
            .section-title
        `);
        
        animatedElements.forEach(el => {
            scrollObserver.observe(el);
        });
        
        this.observers.set('scroll', scrollObserver);
    }
    
    triggerScrollAnimation(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        const delay = element.dataset.delay || 0;
        
        setTimeout(() => {
            element.style.animation = `${animationType} 0.6s ease-out forwards`;
            element.classList.add('animated');
        }, delay);
    }
    
    /**
     * EFECTOS HOVER AVANZADOS
     */
    setupHoverEffects() {
        // Efecto 3D para cards
        document.querySelectorAll('.day-card, .requirement-card, .sponsor-card').forEach(card => {
            card.addEventListener('mouseenter', (e) => this.handleCardHover(e, true));
            card.addEventListener('mouseleave', (e) => this.handleCardHover(e, false));
            card.addEventListener('mousemove', (e) => this.handleCardTilt(e));
        });
        
        // Efecto magnético para botones
        document.querySelectorAll('.submit-btn, .join-button').forEach(btn => {
            btn.addEventListener('mouseenter', (e) => this.handleMagneticEffect(e, true));
            btn.addEventListener('mouseleave', (e) => this.handleMagneticEffect(e, false));
            btn.addEventListener('mousemove', (e) => this.handleMagneticMove(e));
        });
    }
    
    handleCardHover(e, isEntering) {
        const card = e.currentTarget;
        
        if (isEntering) {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 25px 50px rgba(0,0,0,0.4)';
            card.style.zIndex = '10';
        } else {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.zIndex = '';
        }
    }
    
    handleCardTilt(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        const rotateX = (deltaY / rect.height) * 10;
        const rotateY = (deltaX / rect.width) * -10;
        
        card.style.transform = `
            translateY(-10px) 
            scale(1.02) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `;
    }
    
    handleMagneticEffect(e, isEntering) {
        const btn = e.currentTarget;
        
        if (isEntering) {
            btn.style.transition = 'transform 0.1s ease-out';
        } else {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.3s ease-out';
        }
    }
    
    handleMagneticMove(e) {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.1;
        const deltaY = (e.clientY - centerY) * 0.1;
        
        btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
    
    /**
     * ANIMACIONES DE CONTADOR
     */
    setupCounterAnimations() {
        const counters = document.querySelectorAll('.counter');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    animateCounter(element) {
        const target = parseInt(element.dataset.target) || 0;
        const duration = parseInt(element.dataset.duration) || 2000;
        const start = performance.now();
        
        const updateCounter = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(eased * target);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCounter);
    }
    
    /**
     * EFECTOS PARALLAX
     */
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }
    
    /**
     * EFECTO TYPEWRITER
     */
    setupTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            element.style.borderRight = '2px solid #FF6B35';
            
            this.typeWriter(element, text, 0, 100);
        });
    }
    
    typeWriter(element, text, index, speed) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(() => this.typeWriter(element, text, index, speed), speed);
        } else {
            // Efecto de cursor parpadeante
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 1000);
        }
    }
    
    /**
     * ANIMACIONES DE ENTRADA PERSONALIZADAS
     */
    fadeInUp(element, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, delay);
    }
    
    slideInLeft(element, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(-100px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, delay);
    }
    
    scaleIn(element, delay = 0) {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
        }, delay);
    }
    
    /**
     * ANIMACIONES ESPECÍFICAS DEL SITIO
     */
    animateVehicleConvoy() {
        const convoy = document.querySelector('.vehicle-convoy');
        if (!convoy) return;
        
        const vehicles = convoy.querySelectorAll('.vehicle');
        
        vehicles.forEach((vehicle, index) => {
            // Agregar variación en la animación
            vehicle.style.animationDelay = `${-index * 2}s`;
            
            // Efecto de polvo al pasar
            vehicle.addEventListener('animationiteration', () => {
                this.createDustEffect(vehicle);
            });
        });
    }
    
    createDustEffect(vehicle) {
        const dust = document.createElement('div');
        dust.className = 'dust-effect';
        dust.style.cssText = `
            position: absolute;
            width: 20px;
            height: 10px;
            background: rgba(244, 164, 96, 0.6);
            border-radius: 50%;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            animation: dustFade 1s ease-out forwards;
            pointer-events: none;
        `;
        
        vehicle.appendChild(dust);
        
        setTimeout(() => {
            if (dust.parentNode) {
                dust.parentNode.removeChild(dust);
            }
        }, 1000);
    }
    
    /**
     * EFECTOS DE PARTÍCULAS MEJORADOS
     */
    createAdvancedParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        
        // Crear diferentes tipos de partículas
        this.createSandParticles(container);
        this.createGlowParticles(container);
        this.createWindEffect(container);
    }
    
    createSandParticles(container) {
        const particleCount = window.innerWidth < 768 ? 15 : 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'sand-particle';
            
            const size = Math.random() * 3 + 1;
            const opacity = Math.random() * 0.6 + 0.2;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: #F4A460;
                border-radius: 50%;
                opacity: ${opacity};
                left: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 15}s linear infinite;
                animation-delay: ${Math.random() * 10}s;
            `;
            
            container.appendChild(particle);
        }
    }
    
    createGlowParticles(container) {
        const glowCount = window.innerWidth < 768 ? 5 : 10;
        
        for (let i = 0; i < glowCount; i++) {
            const glow = document.createElement('div');
            glow.className = 'glow-particle';
            
            glow.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #FFE4B5, transparent);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            container.appendChild(glow);
        }
    }
    
    createWindEffect(container) {
        const windLines = 5;
        
        for (let i = 0; i < windLines; i++) {
            const line = document.createElement('div');
            line.className = 'wind-line';
            
            line.style.cssText = `
                position: absolute;
                width: 50px;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                top: ${Math.random() * 100}%;
                left: -60px;
                animation: windMove ${Math.random() * 5 + 8}s linear infinite;
                animation-delay: ${Math.random() * 10}s;
            `;
            
            container.appendChild(line);
        }
    }
    
    /**
     * UTILIDADES DE ANIMACIÓN
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }
    
    /**
     * CONTROL DE RENDIMIENTO
     */
    pauseAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }
    
    resumeAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
    
    /**
     * CLEANUP
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animations.clear();
        this.isInitialized = false;
    }
}

/**
 * ANIMACIONES CSS DINÁMICAS
 */
function injectAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes dustFade {
            0% { opacity: 0.6; transform: translateX(-50%) scale(1); }
            100% { opacity: 0; transform: translateX(-50%) scale(2); }
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes windMove {
            0% { left: -60px; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { left: 100%; opacity: 0; }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes scaleIn {
            from {
                opacity: 0;
                transform: scale(0.8);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .animate-in {
            animation-fill-mode: forwards;
        }
        
        /* Efecto de carga para elementos */
        .loading-skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * INICIALIZACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si las animaciones deben estar habilitadas
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        injectAnimationStyles();
        
        // Inicializar controlador de animaciones con delay
        setTimeout(() => {
            window.animationController = new AnimationController();
        }, 500);
    }
});

// Exportar para uso global
window.AnimationController = AnimationController;