// Global Navigation
window.appNavigate = function(pageId, event) {
    if (event) event.preventDefault();
    if (window.isMenuOpen) window.toggleMenu();
    window.history.pushState(null, null, `#${pageId}`);

    const currentActive = document.querySelector('.page-view.active');
    
    if (currentActive && currentActive.id === `page-${pageId}`) return;

    if (currentActive) {
        currentActive.classList.add('fade-out');
        setTimeout(() => {
            currentActive.classList.remove('active', 'fade-out');
            window.showNextPage(pageId);
        }, 400);
    } else {
        window.showNextPage(pageId);
    }
    window.updateNavHighlights(pageId);
};

window.showNextPage = function(pageId) {
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.querySelectorAll('.reveal').forEach(el => el.classList.remove('active'));
        targetPage.classList.add('active');
        
        // Toggle Global CTA visibility based on page
        const globalCta = document.getElementById('global-cta');
        if (globalCta) {
            globalCta.style.display = (pageId === 'enquire') ? 'none' : 'block';
            globalCta.querySelectorAll('.reveal').forEach(el => el.classList.remove('active'));
        }

        // Reset projects carousel reveal state
        if (pageId === 'projects') {
            const wrapper = document.getElementById('categories-wrapper');
            if (wrapper) wrapper.classList.remove('revealed');
        }
        
        window.scrollTo({ top: 0, behavior: 'instant' }); 
        
        setTimeout(() => {
            if (window.initObservers) window.initObservers();
            if (window.initInteractiveElements) window.initInteractiveElements();
            if (pageId === 'studio' && window.updateStudioScroll) window.updateStudioScroll();
            if (pageId === 'projects' && window.initSwipers) window.initSwipers();
        }, 50);

        // Re-calculate layouts after page fade animation completes to ensure perfect centering
        setTimeout(() => {
            if (pageId === 'projects' && window.activeSwipers) {
                window.activeSwipers.forEach(s => s.update());
            }
        }, 850);
    }
};

window.updateNavHighlights = function(pageId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === `#${pageId}`) {
            link.classList.add('text-arch-accent');
            link.classList.remove('text-arch-text');
        } else {
            link.classList.remove('text-arch-accent');
            link.classList.add('text-arch-text');
        }
    });
};

// Scroll to Category Logic (Table of Contents Style)
window.scrollToCategory = function(category) {
    const wrapper = document.getElementById('categories-wrapper');
    if (wrapper && !wrapper.classList.contains('revealed')) {
        wrapper.classList.add('revealed');
        // Allow a tiny frame for transform to initiate
        setTimeout(() => doScroll(category), 50);
    } else {
        doScroll(category);
    }

    function doScroll(cat) {
        const targetSection = document.querySelector(`.category-section[data-category="${cat}"]`);
        if (targetSection) {
            // Adjust scroll offset to clear sticky elements seamlessly across all screen sizes
            const offset = window.innerWidth < 1024 ? 140 : window.innerHeight * 0.15;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;
    
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
};

// UI State Triggers (Horizontal Tabs, Glass Sidebar, & Left Fade Overlay)
window.updateTabScrollState = function() {
    const projectsPage = document.getElementById('page-projects');
    if (!projectsPage || !projectsPage.classList.contains('active')) return;

    const horizontalTabs = document.getElementById('project-tabs-placeholder');
    const glassSidebar = document.getElementById('tabs-scrolled');
    const leftFadeOverlay = document.getElementById('left-fade-overlay');
    const projectsSec = document.getElementById('projects-section');
    const residentialSec = document.querySelector('.category-section[data-category="residential"]');

    if (horizontalTabs && projectsSec) {
        const projRect = projectsSec.getBoundingClientRect();
        if (projRect.top < 50) {
            horizontalTabs.classList.add('scrolled-state');
        } else {
            horizontalTabs.classList.remove('scrolled-state');
        }
    }

    if (glassSidebar && residentialSec) {
        const resRect = residentialSec.getBoundingClientRect();
        if (resRect.top < window.innerHeight * 0.2) {
            glassSidebar.classList.add('visible');
            if(leftFadeOverlay) leftFadeOverlay.classList.add('visible');
        } else {
            glassSidebar.classList.remove('visible');
            if(leftFadeOverlay) leftFadeOverlay.classList.remove('visible');
        }
    }
};

// Scroll Spy tracking for highlighting sidebar
window.updateScrollSpy = function() {
    const sections = document.querySelectorAll('.category-section');
    let currentSectionId = null; 
    const offset = window.innerHeight * 0.5; 

    sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= offset) {
            currentSectionId = sec.getAttribute('data-category');
        }
    });

    if (!currentSectionId && sections.length > 0) {
        currentSectionId = sections[0].getAttribute('data-category');
    }

    if (currentSectionId) {
        document.querySelectorAll('.project-tab').forEach(tab => {
            if(tab.getAttribute('data-filter') === currentSectionId) {
                tab.classList.add('active');

                // Auto-center horizontal scrollable tab gracefully on tablet/mobile
                if (window.innerWidth < 1024 && tab.classList.contains('horizontal-tab')) {
                    const container = tab.parentElement;
                    const scrollLeft = tab.offsetLeft - (container.offsetWidth / 2) + (tab.offsetWidth / 2);
                    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }
            } else {
                tab.classList.remove('active');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Custom Cursor Logic
    const cursor = document.getElementById('cursor-main');
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;

    window.addEventListener('mousemove', (e) => {
        if (window.innerWidth >= 1024) {
            mouseX = e.clientX; mouseY = e.clientY;
        }
    });

    function animateCursor() {
        if (window.innerWidth >= 1024) {
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            if (cursor) cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Advanced Interactive Parallax for Story Section 
    let pmMouseX = 0, pmMouseY = 0;
    const parallaxMiceItems = [];
    
    const storyWrapperForParallax = document.getElementById('story-scroll-wrapper');
    if (storyWrapperForParallax) {
        const initParallaxElements = () => {
            parallaxMiceItems.length = 0;
            document.querySelectorAll('.parallax-mouse').forEach(el => {
                parallaxMiceItems.push({
                    el,
                    speed: parseFloat(el.getAttribute('data-mouse-speed') || '0.05'),
                    currentX: 0, currentY: 0,
                    targetX: 0, targetY: 0
                });
            });
        };
        initParallaxElements();

        storyWrapperForParallax.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 1024) return;
            const rect = storyWrapperForParallax.getBoundingClientRect();
            if(rect.top > window.innerHeight || rect.bottom < 0) return;
            
            const mouseRelX = e.clientX - window.innerWidth / 2;
            const mouseRelY = e.clientY - window.innerHeight / 2;
            
            parallaxMiceItems.forEach(item => {
                item.targetX = mouseRelX * item.speed;
                item.targetY = mouseRelY * item.speed;
            });
        });

        storyWrapperForParallax.addEventListener('mouseleave', () => {
            parallaxMiceItems.forEach(item => {
                item.targetX = 0;
                item.targetY = 0;
            });
        });
    }

    // Projects Dots Parallax Logic
    const projectsSection = document.getElementById('projects-section');
    const projectsDots = document.getElementById('projects-dots');
    const projectsGlow = document.getElementById('projects-cursor-glow');
    
    if (projectsSection && projectsDots && projectsGlow) {
        projectsSection.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 1024) return;
            const rect = projectsSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Move glowing orb natively to cursor pos
            projectsGlow.style.transform = `translate(${x}px, ${y}px)`;
            
            // Move dots slightly for a parallax depth effect
            const dotX = (e.clientX / window.innerWidth - 0.5) * -30;
            const dotY = (e.clientY / window.innerHeight - 0.5) * -30;
            projectsDots.style.transform = `translate(${dotX}px, ${dotY}px)`;
        });
    }

    // 3D Background Logic
    try {
        let scene, camera, renderer, terrain;
        function initThreeJS() {
            const canvas = document.getElementById('hero-canvas');
            if (!canvas || typeof THREE === 'undefined') return;

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            const geometry = new THREE.PlaneGeometry(200, 200, 60, 60);
            const pos = geometry.attributes.position;
            
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x333333, wireframe: true, transparent: true, opacity: 0.8
            });
            
            terrain = new THREE.Mesh(geometry, material);
            terrain.rotation.x = -Math.PI / 2 + 0.2; 
            terrain.position.y = -10; terrain.position.z = -30;
            scene.add(terrain);

            camera.position.z = 20; camera.position.y = 5;

            let targetRotationX = 0, targetRotationY = 0;
            
            canvas.addEventListener('mousemove', (e) => {
                targetRotationY = ((e.clientX / window.innerWidth) - 0.5) * 0.5;
                targetRotationX = ((e.clientY / window.innerHeight) - 0.5) * 0.5;
            });

            function animateThree() {
                requestAnimationFrame(animateThree);
                terrain.rotation.z += 0.0005;
                terrain.rotation.y += (targetRotationY - terrain.rotation.y) * 0.05;
                terrain.position.y += (targetRotationX * 5 - terrain.position.y - 10) * 0.05;

                const time = Date.now() * 0.0005;
                for (let i = 0; i < pos.count; i++) {
                    const x = pos.getX(i), y = pos.getY(i);
                    const z = Math.sin(x * 0.1 + time) * Math.cos(y * 0.1 + time) * 4;
                    pos.setZ(i, z);
                }
                pos.needsUpdate = true;
                renderer.render(scene, camera);
            }
            animateThree();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
        initThreeJS();

        // 2. STORY CANVAS (Abstract Minimal House)
        function initStoryThreeJS() {
            const canvas = document.getElementById('story-3d-canvas');
            if (!canvas || typeof THREE === 'undefined') return;

            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x0a0a0a, 0.04);

            const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(0, 4, 18);
            
            const renderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                alpha: true, 
                antialias: true,
                logarithmicDepthBuffer: true // Helps prevent distant Z-fighting
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            window.storyArchitecturalGroup = new THREE.Group();
            scene.add(window.storyArchitecturalGroup);

            // Materials: Luxury Minimalist Palette (Brighter values)
            const concreteMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8, metalness: 0.2 });
            const copperMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.3, metalness: 0.7 });
            // depthWrite: false ensures transparency doesn't cause Z-fighting with inner models
            const glassMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.0, metalness: 1.0, transparent: true, opacity: 0.85, depthWrite: false });
            const darkMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.6, metalness: 0.1 });

            // Abstract House Construction
            // Use BoxGeometry for ground instead of PlaneGeometry to completely avoid plane self-shadowing acne
            const ground = new THREE.Mesh(new THREE.BoxGeometry(30, 2, 30), concreteMat);
            ground.position.y = -3; 
            ground.receiveShadow = true;
            window.storyArchitecturalGroup.add(ground);

            const core = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 4), concreteMat);
            core.position.set(-1, 1.5, -1);
            core.castShadow = true;
            core.receiveShadow = true;
            window.storyArchitecturalGroup.add(core);

            const cantilever = new THREE.Mesh(new THREE.BoxGeometry(9, 2.5, 5), darkMat);
            cantilever.position.set(1.5, 4, 0);
            cantilever.castShadow = true;
            cantilever.receiveShadow = true;
            window.storyArchitecturalGroup.add(cantilever);

            const glassVol = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 3), glassMat);
            glassVol.position.set(2, -0.25, 1);
            glassVol.castShadow = true;
            window.storyArchitecturalGroup.add(glassVol);

            const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 0.4), copperMat);
            pillar.position.set(5, 1, 1.5);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            window.storyArchitecturalGroup.add(pillar);
            
            const beam = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 0.2), copperMat);
            beam.position.set(1, 5.3, 2.6);
            beam.castShadow = true;
            window.storyArchitecturalGroup.add(beam);

            // Lighting (Brighter setup)
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
            scene.add(ambientLight);

            const spotLight = new THREE.SpotLight(0xffffff, 2.5);
            spotLight.position.set(-10, 15, 10);
            spotLight.angle = Math.PI / 6;
            spotLight.penumbra = 0.5;
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 2048;
            spotLight.shadow.mapSize.height = 2048;
            spotLight.shadow.bias = -0.001; // Prevents shadow acne
            spotLight.shadow.normalBias = 0.02; // Prevents shadow acne on rounded surfaces
            scene.add(spotLight);

            const copperLight = new THREE.PointLight(0xc28e5e, 1.8, 25);
            copperLight.position.set(5, 2, 5);
            scene.add(copperLight);

            window.storyArchitecturalGroup.rotation.y = -Math.PI / 4;

            function renderStory() {
                requestAnimationFrame(renderStory);
                const time = Date.now() * 0.001;
                if(window.storyArchitecturalGroup) {
                    window.storyArchitecturalGroup.position.y = Math.sin(time * 0.5) * 0.2;
                }
                renderer.render(scene, camera);
            }
            renderStory();

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
        initStoryThreeJS();
    } catch(e) { console.warn("ThreeJS initialization skipped", e); }

    // Swiper Carousels Logic 
    window.activeSwipers = [];
    window.initSwipers = function() {
        if(typeof Swiper === 'undefined') return;
        
        window.activeSwipers.forEach(s => s.destroy(true, true));
        window.activeSwipers = [];

        document.querySelectorAll('.category-swiper').forEach(el => {
            const swiperInstance = new Swiper(el, {
                slidesPerView: 'auto',
                initialSlide: 2, 
                spaceBetween: 30, // Reduced slightly for mobile layout perfection
                centeredSlides: true,
                grabCursor: false, // Let custom drag cursor handle this entirely
                loop: true,
                speed: 700, // Responsive, snappy speed
                observer: true,
                observeParents: true,
                roundLengths: true, // Prevents blurring/glitches during translation
                breakpoints: {
                    1024: { spaceBetween: 50 } // Wider gap on desktop
                },
                pagination: {
                    el: el.querySelector('.swiper-pagination'),
                    clickable: true,
                }
            });
            window.activeSwipers.push(swiperInstance);
        });
    };

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('py-5', 'bg-[#0a0a0a]/80', 'backdrop-blur-xl', 'border-b', 'border-white/5');
            navbar.classList.remove('py-6', 'bg-transparent');
        } else {
            navbar.classList.add('py-6', 'bg-transparent');
            navbar.classList.remove('py-5', 'bg-[#0a0a0a]/80', 'backdrop-blur-xl', 'border-b', 'border-white/5');
        }
    });

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = mobileMenuBtn ? mobileMenuBtn.querySelector('i') : null;
    window.isMenuOpen = false;

    window.toggleMenu = function() {
        window.isMenuOpen = !window.isMenuOpen;
        if (window.isMenuOpen) {
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
            if(mobileMenuBtn) mobileMenuBtn.classList.add('menu-open');
        } else {
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
            if(mobileMenuBtn) mobileMenuBtn.classList.remove('menu-open');
        }
    };
    if(mobileMenuBtn) mobileMenuBtn.addEventListener('click', window.toggleMenu);

    // Intersection Observer
    let revealObserver;
    window.initObservers = function() {
        if (revealObserver) revealObserver.disconnect();
        // Select reveals in active page AND global CTA
        const revealElements = document.querySelectorAll('.page-view.active .reveal, .page-view.active .reveal-slow, #global-cta .reveal');
        
        revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); 
                }
            });
        }, { root: null, threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

        revealElements.forEach(el => revealObserver.observe(el));
    };

    // Studio Page Vertical-to-Horizontal Scroll Logic
    window.updateStudioScroll = function() {
        const wrapper = document.getElementById('studio-scroll-wrapper');
        const track = document.getElementById('studio-scroll-track');
        if (!wrapper || !track) return;

        const rect = wrapper.getBoundingClientRect();
        const wrapperTop = rect.top;
        const wrapperHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Calculate vertical scroll progress strictly within the wrapper bounds (0 to 1)
        let progress = 0;
        if (wrapperTop <= 0) {
            progress = Math.abs(wrapperTop) / (wrapperHeight - windowHeight);
        }
        progress = Math.max(0, Math.min(1, progress));

        // Translate track horizontally
        const maxScroll = track.scrollWidth - window.innerWidth;
        if (maxScroll > 0) {
            track.style.transform = `translateX(-${progress * maxScroll}px)`;
        }

        // Calculate center proximity to trigger highlights
        const cards = track.querySelectorAll('.studio-card');
        const viewportCenter = window.innerWidth / 2;

        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + (cardRect.width / 2);
            const distFromCenter = Math.abs(viewportCenter - cardCenter);
            
            // Fade logic: fully visible at center, completely hidden at edges
            const fadeDistance = window.innerWidth * 0.55; 
            let opacity = 1 - (distFromCenter / fadeDistance);
            opacity = Math.max(0, Math.min(1, opacity));
            card.style.opacity = opacity.toFixed(3); // Apply dynamic fade
            
            if (distFromCenter < window.innerWidth * 0.3) {
                card.classList.add('card-active');
            } else {
                card.classList.remove('card-active');
            }
        });
    };

    // Interactive Elements logic
    const addCursorHover = () => document.body.classList.add('cursor-hover');
    const removeCursorHover = () => document.body.classList.remove('cursor-hover');
    const addCursorDrag = () => document.body.classList.add('cursor-drag');
    const removeCursorDrag = () => document.body.classList.remove('cursor-drag');

    window.initInteractiveElements = function() {
        const interactables = document.querySelectorAll('.page-view.active .cursor-interact, nav .cursor-interact');
        interactables.forEach(el => {
            el.removeEventListener('mouseenter', addCursorHover); el.removeEventListener('mouseleave', removeCursorHover);
            el.addEventListener('mouseenter', addCursorHover); el.addEventListener('mouseleave', removeCursorHover);
        });

        const draggables = document.querySelectorAll('.page-view.active .cursor-drag');
        draggables.forEach(el => {
            el.removeEventListener('mouseenter', addCursorDrag); el.removeEventListener('mouseleave', removeCursorDrag);
            el.addEventListener('mouseenter', addCursorDrag); el.addEventListener('mouseleave', removeCursorDrag);
        });

        const magnetics = document.querySelectorAll('.page-view.active .magnetic, nav .magnetic');
        magnetics.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                if(window.innerWidth < 1024) return;
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
                btn.style.transition = 'transform 0.1s ease-out';
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                if(window.innerWidth < 1024) return;
                btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
        
        // Interactive Hero Logo
        const heroBgLogo = document.getElementById('hero-bg-logo');
        const homeHero = document.getElementById('home-hero');
        if (heroBgLogo && homeHero) {
            homeHero.addEventListener('mousemove', (e) => {
                if(window.innerWidth < 1024) return;
                const x = (e.clientX / window.innerWidth - 0.5) * -40; 
                const y = (e.clientY / window.innerHeight - 0.5) * -40;
                heroBgLogo.style.transform = `translate(${x}px, ${y}px) rotate(${x*0.1}deg) scale(1.05)`;
            });
            homeHero.addEventListener('mouseleave', () => {
                if(window.innerWidth < 1024) return;
                heroBgLogo.style.transform = `translate(0px, 0px) rotate(0deg) scale(1)`;
                heroBgLogo.style.transition = 'transform 0.5s ease-out';
            });
        }

        // Add parallax mice loop to the main animation ticker
        const loopParallaxMice = () => {
            if (window.innerWidth >= 1024 && typeof parallaxMiceItems !== 'undefined') {
                parallaxMiceItems.forEach(item => {
                    item.currentX += (item.targetX - item.currentX) * 0.08;
                    item.currentY += (item.targetY - item.currentY) * 0.08;
                });
            }
            requestAnimationFrame(loopParallaxMice);
        }
        loopParallaxMice();
    };

    // Global Scroll/Parallax handler
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        document.querySelectorAll('.page-view.active .parallax-el').forEach(el => {
            const speed = el.getAttribute('data-speed') || 0.1;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        document.querySelectorAll('.page-view.active .parallax-inner').forEach(el => {
            const rect = el.parentElement.getBoundingClientRect();
            const centerOffset = (rect.top + rect.height/2) - (window.innerHeight/2);
            const speed = window.innerWidth < 1024 ? 0.08 : 0.12; 
            el.style.transform = `translateY(${centerOffset * speed}px)`;
        });
        
        // ----------------------------------------------------
        // NEW: STORY SECTION SCROLL LOGIC
        // ----------------------------------------------------
        const storyWrapper = document.getElementById('story-scroll-wrapper');
        if (storyWrapper && document.getElementById('page-studio')?.classList.contains('active')) {
            const rect = storyWrapper.getBoundingClientRect();
            const totalScroll = rect.height - window.innerHeight;
            
            let progress = -rect.top / totalScroll;
            progress = Math.max(0, Math.min(1, progress));

            // 1. Rotate the 3D Model seamlessly
            if (typeof window.storyArchitecturalGroup !== 'undefined' && window.storyArchitecturalGroup) {
                window.storyArchitecturalGroup.rotation.y = (-Math.PI / 4) + (progress * Math.PI * 2);
            }

            // Standard block update helper
            function updateBlock(el, p, inStart, inEnd, outStart, outEnd) {
                if (!el) return;
                let opacity = 0;
                let translateY = 40; 
                
                if (p >= inStart && p <= inEnd) {
                    const t = (p - inStart) / (inEnd - inStart);
                    opacity = t;
                    translateY = 40 * (1 - t);
                } else if (p > inEnd && p < outStart) {
                    opacity = 1;
                    translateY = 0;
                } else if (p >= outStart && p <= outEnd) {
                    const t = (p - outStart) / (outEnd - outStart);
                    opacity = 1 - t;
                    translateY = -40 * t;
                } else if (p > outEnd) {
                    opacity = 0;
                    translateY = -40;
                }

                el.style.opacity = opacity;
                
                const pItem = typeof parallaxMiceItems !== 'undefined' ? parallaxMiceItems.find(i => i.el === el) : null;
                if(pItem) {
                    el.style.transform = `translate(calc(${pItem.currentX}px), calc(${translateY + pItem.currentY}px))`;
                } else {
                    el.style.transform = `translateY(${translateY}px)`;
                }
                
                el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
            }

            // Simplified Floating Image Animation (Vertical Rise & Sine Fade)
            function updateFloatingImg(el, p, start, end, moveDist) {
                if (!el) return;
                
                if (p >= start && p <= end) {
                    // Map timeline 0 to 1
                    const t = (p - start) / (end - start);
                    
                    // Sine wave for smooth 0 -> 1 -> 0 fade
                    const opacity = Math.sin(t * Math.PI);
                    
                    // Linear vertical slide from +moveDist to -moveDist
                    const translateY = moveDist - (moveDist * 2 * t);
                    
                    el.style.opacity = opacity.toFixed(3);

                    const pItem = typeof parallaxMiceItems !== 'undefined' ? parallaxMiceItems.find(i => i.el === el) : null;
                    const px = pItem ? pItem.currentX : 0;
                    const py = pItem ? pItem.currentY : 0;
                    
                    // No rotation, perfect vertical float
                    el.style.transform = `translate(calc(${px}px), calc(${translateY + py}px))`;
                } else {
                    el.style.opacity = 0;
                    el.style.transform = `translateY(${moveDist}px)`;
                }
            }

            // Step 1: Mission text
            updateBlock(document.getElementById('story-block-1'), progress, 0.02, 0.06, 0.12, 0.16);
            
            // Step 2 & 3: Vision Text overlaps with 2 Images floating vertically
            // Cascading image timing
            updateFloatingImg(document.getElementById('seq-img-1'), progress, 0.15, 0.35, 150);
            updateFloatingImg(document.getElementById('seq-img-2'), progress, 0.20, 0.40, 150);
            // Vision text delayed slightly to allow images to emerge first
            updateBlock(document.getElementById('story-block-2'), progress, 0.30, 0.34, 0.43, 0.49);

            // Step 4 & 5: Quote Text overlaps with 3 Images floating vertically
            // Cascading image timing
            updateFloatingImg(document.getElementById('seq-img-3'), progress, 0.40, 0.75, 150);
            updateFloatingImg(document.getElementById('seq-img-4'), progress, 0.47, 0.79, 150);
            updateFloatingImg(document.getElementById('seq-img-5'), progress, 0.58, 0.83, 150);
            // Quote text delayed slightly to allow images to emerge first
            updateBlock(document.getElementById('story-block-3'), progress, 0.65, 0.77, 0.87, 0.93); 
            
            // Step 6: Fade out the 3D model canvas simultaneously with the final quote
            const storyCanvas = document.getElementById('story-3d-canvas');
            if (storyCanvas) {
                let canvasOpacity = 1;
                if (progress >= 0.87 && progress <= 0.93) {
                    // Calculate fade out from 1 to 0 perfectly synced with quote out-animation (0.87 to 0.93)
                    canvasOpacity = 1 - ((progress - 0.87) / 0.06);
                } else if (progress > 0.93) {
                    canvasOpacity = 0;
                }
                storyCanvas.style.opacity = canvasOpacity;
            }
        }

        if (document.getElementById('page-projects')?.classList.contains('active')) {
            window.updateTabScrollState();
            window.updateScrollSpy();

            // Reveal carousels smoothly on scroll
            const categoriesWrapper = document.getElementById('categories-wrapper');
            if (categoriesWrapper && !categoriesWrapper.classList.contains('revealed')) {
                const rect = categoriesWrapper.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.85) {
                    categoriesWrapper.classList.add('revealed');
                }
            }
        }

        if (document.getElementById('page-studio')?.classList.contains('active')) {
            window.updateStudioScroll();
        }
    });

    // Initial Startup Routine
    const hash = window.location.hash.replace('#', '') || 'home';
    const validPages = ['home', 'studio', 'projects', 'expertise', 'team', 'enquire'];
    const pageToLoad = validPages.includes(hash) ? hash : 'home';
    
    setTimeout(() => {
        window.initInteractiveElements();
        if (window.initObservers) window.initObservers();
        if (pageToLoad === 'projects' && window.initSwipers) window.initSwipers();
        if (pageToLoad === 'studio' && window.updateStudioScroll) window.updateStudioScroll();
    }, 100);

    window.appNavigate(pageToLoad);

    window.addEventListener('popstate', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        window.appNavigate(hash);
    });
});
