document.addEventListener('DOMContentLoaded', () => {
    // === 1. HERO CANVAS ANIMATION (ANIMIN SEQUENCE) ===
    const canvas = document.getElementById('hero-bg-anim');
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency

    // We have 80 frames, named Video - Chosen 720p_000.jpg to Video - Chosen 720p_079.jpg
    const frameCount = 80;
    const currentFrame = index => (
        `Animin/Video - Chosen 720p_${index.toString().padStart(3, '0')}.jpg`
    );

    const images = [];
    const airship = { frame: 0 };
    let imagesLoaded = 0;

    // Resize canvas to cover window
    function resizeCanvas() {
        // We ensure canvas covers the view by calculating aspect ratio
        const windowRatio = window.innerWidth / window.innerHeight;
        // The original Animin frames seem to be 720p (1280x720) ratio 1.77
        const videoRatio = 1280 / 720;

        if (windowRatio > videoRatio) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth / videoRatio;
        } else {
            canvas.width = window.innerHeight * videoRatio;
            canvas.height = window.innerHeight;
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // initial sizing

    // Preload images
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === 1) {
                // Draw first frame immediately to avoid blank flash
                renderFrame(0);
            }
        };
    }

    function renderFrame(index) {
        if (!images[index]) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Center image drawing to cover canvas
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

    // Custom loop for slow motion
    let currentImageIndex = 0;
    let lastTime = 0;
    // Lower FPS for slow motion effect. 80 frames over ~4 seconds = 20 fps. Lets try 20fps.
    const fps = 20;
    const fpsInterval = 1000 / fps;

    function animateSequence(time) {
        requestAnimationFrame(animateSequence);

        const elapsed = time - lastTime;
        if (elapsed > fpsInterval && imagesLoaded > 10) { // start animating after a few load
            lastTime = time - (elapsed % fpsInterval);
            renderFrame(currentImageIndex);

            currentImageIndex = (currentImageIndex + 1) % frameCount;
        }
    }

    requestAnimationFrame(animateSequence);


    // === 2. DUST PARTICLES OVERLAY ===
    const dustCanvas = document.getElementById('dust-overlay');
    const dctx = dustCanvas.getContext('2d');

    let particles = [];

    function resizeDustCanvas() {
        dustCanvas.width = window.innerWidth;
        dustCanvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeDustCanvas);
    resizeDustCanvas();

    function initParticles() {
        particles = [];
        const particleCount = window.innerWidth < 768 ? 40 : 100; // Less on mobile
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
        dctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];

            dctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            dctx.beginPath();
            dctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            dctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;

            // Loop edges
            if (p.x < 0) p.x = dustCanvas.width;
            if (p.x > dustCanvas.width) p.x = 0;
            if (p.y < 0) p.y = dustCanvas.height;
            if (p.y > dustCanvas.height) p.y = 0;

            // Subtle shimmering
            p.opacity += (Math.random() - 0.5) * 0.02;
            if (p.opacity < 0) p.opacity = 0;
            if (p.opacity > 0.6) p.opacity = 0.6;
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();


    // === 3. GSAP ANIMATIONS & SCROLL REVEAL ===

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Initial Hero Animation Timeline
    const tlHero = gsap.timeline();

    // Reset initial states for JS
    gsap.set(['.fade-up', '.text-reveal', '.card-reveal'], { autoAlpha: 0 });

    tlHero
        // 1. Scale-in effect on the canvas wrapper (1.05 to 1 over 3s ease)
        .fromTo('#hero-bg-anim',
            { scale: 1.05 },
            { scale: 1, duration: 3, ease: 'power2.out' }
        )
        // 1.5 Fade in Header / Logo
        .fromTo('.main-header',
            { y: -20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' },
            "-=2.5"
        )
        // 2. Fade in headline words staggering
        .fromTo('.hero-title .word',
            { y: 30, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, stagger: 0.15, ease: 'power3.out' },
            "-=1.5" // Start slightly before scale finishes
        )
        // 3. Fade in subtitle
        .fromTo('.hero-subtitle',
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' },
            "-=1.5"
        )
        // 4. Fade in CTA buttons
        .fromTo('.hero-ctas',
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' },
            "-=1.2"
        );

    // Parallax sub-elements on scroll
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

    // Subtitle parallax
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

    // Generic Scroll Reveals
    const revealSections = document.querySelectorAll('.scroll-reveal');

    revealSections.forEach(section => {
        // Text blocks
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

        // Cards (Method, Testimonials)
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

    // === 4. INNOVATIVE UX: MAGNETIC BUTTONS & EDGE LIGHTING ===

    // Edge Lighting on Pricing Cards
    document.querySelectorAll('.pricing-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to card in percentage
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // Magnetic Buttons Hover Effect
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            // Calculate distance from center to mouse
            const h = rect.width / 2;
            const v = rect.height / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - v;

            // Move button slightly towards the mouse
            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
        });
    });

});
