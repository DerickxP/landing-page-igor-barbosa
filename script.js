document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('hero-bg-anim');
    const ctx = canvas.getContext('2d', { alpha: false });

    const frameCount = 80;
    const currentFrame = index => (
        `Animin/Video - Chosen 720p_${index.toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const airship = { frame: 0 };
    let imagesLoaded = 0;

    let winWidth = window.innerWidth;
    let winHeight = window.innerHeight;
    let isHeroVisible = true;

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isHeroVisible = entry.isIntersecting;
        });
    }, { rootMargin: "0px" });
    const heroEl = document.querySelector('.hero-section');
    if (heroEl) heroObserver.observe(heroEl);

    function resizeCanvas() {
        const windowRatio = winWidth / winHeight;
        const videoRatio = 1280 / 720;

        if (windowRatio > videoRatio) {
            canvas.width = winWidth;
            canvas.height = winWidth / videoRatio;
        } else {
            canvas.width = winHeight * videoRatio;
            canvas.height = winHeight;
        }
    }

    // Load FIRST frame immediately for LCP
    const firstImg = new Image();
    firstImg.src = currentFrame(0);
    images[0] = firstImg;
    firstImg.onload = () => {
        imagesLoaded++;
        renderFrame(0);

        // Lazy load the rest of the frames to unblock the main thread
        function loadRemainingFrames() {
            // Yield the thread by loading in small chunks or at least deferring
            // For now, simply deferring the creation of 79 Image objects is enough 
            // to get it out of the critical LCP path.
            for (let i = 1; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFrame(i);
                images[i] = img;
                img.onload = () => {
                    imagesLoaded++;
                };
            }
        }

        if ('requestIdleCallback' in window) {
            requestIdleCallback(loadRemainingFrames, { timeout: 2000 });
        } else {
            setTimeout(loadRemainingFrames, 500);
        }
    };

    function renderFrame(index) {
        if (!images[index]) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const hRatio = canvas.width / images[index].width;
        const vRatio = canvas.height / images[index].height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - images[index].width * ratio) / 2;
        const centerShift_y = (canvas.height - images[index].height * ratio) / 2;

        ctx.drawImage(
            images[index],
            0, 0, images[index].width, images[index].height,
            centerShift_x, centerShift_y, images[index].width * ratio, images[index].height * ratio
        );
    }

    let currentImageIndex = 0;
    let lastTime = 0;
    const fps = 20;
    const fpsInterval = 1000 / fps;

    function animateSequence(time) {
        requestAnimationFrame(animateSequence);
        if (!isHeroVisible) return;

        const elapsed = time - lastTime;
        if (elapsed > fpsInterval && imagesLoaded > 10) {
            lastTime = time - (elapsed % fpsInterval);
            renderFrame(currentImageIndex);

            currentImageIndex = (currentImageIndex + 1) % frameCount;
        }
    }

    requestAnimationFrame(animateSequence);

    function initNonCriticalJS() {
        const dustCanvas = document.getElementById('dust-overlay');
        const dctx = dustCanvas.getContext('2d');

        let particles = [];

        function resizeDustCanvas() {
            dustCanvas.width = winWidth;
            dustCanvas.height = winHeight;
        }

        function initParticles() {
            particles = [];
            const particleCount = winWidth < 768 ? 20 : 60;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * dustCanvas.width,
                    y: Math.random() * dustCanvas.height,
                    size: Math.random() * 2 + 0.5,
                    speedX: Math.random() * 0.5 - 0.25,
                    speedY: Math.random() * 0.5 - 0.25,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        }

        initParticles();

        function animateParticles() {
            requestAnimationFrame(animateParticles);
            if (!isHeroVisible) return;

            dctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];

                dctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                dctx.beginPath();
                dctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                dctx.fill();

                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = dustCanvas.width;
                if (p.x > dustCanvas.width) p.x = 0;
                if (p.y < 0) p.y = dustCanvas.height;
                if (p.y > dustCanvas.height) p.y = 0;

                p.opacity += (Math.random() - 0.5) * 0.02;
                if (p.opacity < 0) p.opacity = 0;
                if (p.opacity > 0.6) p.opacity = 0.6;
            }
        }

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                winWidth = window.innerWidth;
                winHeight = window.innerHeight;
                requestAnimationFrame(() => {
                    resizeCanvas();
                    resizeDustCanvas();
                });
            }, 150);
        });

        requestAnimationFrame(() => {
            resizeCanvas();
            resizeDustCanvas();
            animateParticles();
        });

        gsap.registerPlugin(ScrollTrigger);

        const tlHero = gsap.timeline();

        gsap.set(['.fade-up', '.text-reveal', '.card-reveal'], { autoAlpha: 0 });

        tlHero
            .fromTo('#hero-bg-anim',
                { scale: 1.05 },
                { scale: 1, duration: 3, ease: 'power2.out' }
            );

        gsap.to('.hero-content', {
            y: "25%",
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });

        gsap.to('.split-image-container', {
            y: 50,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        const revealSections = document.querySelectorAll('.scroll-reveal');

        revealSections.forEach(section => {
            const texts = section.querySelectorAll('.text-reveal');
            if (texts.length > 0) {
                gsap.fromTo(texts,
                    { y: 40, autoAlpha: 0 },
                    {
                        y: 0, autoAlpha: 1,
                        duration: 1,
                        stagger: 0.2,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }

            const cards = section.querySelectorAll('.card-reveal');
            if (cards.length > 0) {
                gsap.fromTo(cards,
                    { y: 50, autoAlpha: 0 },
                    {
                        y: 0, autoAlpha: 1,
                        duration: 0.8,
                        stagger: 0.15,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 75%",
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            }
        });

        document.querySelectorAll('.pricing-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
        });

        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    if ('requestIdleCallback' in window) {
        requestIdleCallback(initNonCriticalJS, { timeout: 2000 });
    } else {
        setTimeout(initNonCriticalJS, 500);
    }
});
