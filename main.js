document.addEventListener('DOMContentLoaded', () => {

    // Respect the user's motion preference. Disables decorative,
    // JS-driven continuous motion (particles, 3D tilt) that CSS
    // transition overrides alone can't reach.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse-only flourishes (custom cursor, magnetic buttons) are gated
    // on a fine pointer so touch and keyboard users never lose function
    // they never had access to in the first place.
    const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // =============================================
    // NAVBAR: scroll state + active highlight
    // =============================================
    const navbar  = document.getElementById('navbar');
    const sections = document.querySelectorAll('main section[id]');

    const scrollProgress = document.getElementById('scroll-progress');

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);

        // Back-to-top
        document.getElementById('back-to-top')
            .classList.toggle('visible', window.scrollY > 400);

        // Scroll progress bar
        if (scrollProgress) {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
            scrollProgress.style.width = pct + '%';
        }

        // Hero content parallax, only while hero is in view
        const heroContent = document.getElementById('hero-content');
        if (heroContent) {
            const sy = window.scrollY;
            const vh = window.innerHeight;
            if (sy < vh) {
                heroContent.style.transform = `translateY(${sy * 0.28}px)`;
                heroContent.style.opacity   = String(Math.max(0, 1 - (sy / (vh * 0.72))));
            }
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });


    // =============================================
    // HAMBURGER MOBILE NAV
    // =============================================
    const hamburger = document.getElementById('hamburger');
    const mobileNav  = document.getElementById('mobile-nav');
    const mobileClose = document.getElementById('mobile-close');

    const openMobileNav  = () => { mobileNav.classList.add('open');  hamburger.classList.add('open'); };
    const closeMobileNav = () => { mobileNav.classList.remove('open'); hamburger.classList.remove('open'); };

    hamburger.addEventListener('click', () =>
        mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav()
    );
    mobileClose.addEventListener('click', closeMobileNav);
    document.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', closeMobileNav));


    // =============================================
    // SMOOTH SCROLL
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    // =============================================
    // HERO CANVAS: particle network
    // =============================================
    const canvas = document.getElementById('hero-canvas');
    const ctx    = canvas.getContext('2d');
    let   w, h, particles = [];

    const resize = () => {
        w = canvas.width  = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    // Mouse influence
    let mouse = { x: w / 2, y: h / 2 };
    canvas.parentElement.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    });

    class Particle {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x  = Math.random() * w;
            this.y  = initial ? Math.random() * h : -5;
            this.vx = (Math.random() - .5) * .5;
            this.vy = (Math.random() - .5) * .5;
            this.r  = Math.random() * 1.4 + .4;
            this.a  = Math.random() * .35 + .08;
            this.color = Math.random() > .5
                ? `rgba(165,180,252,${this.a})`
                : `rgba(6,182,212,${this.a})`;
        }
        update() {
            // Slight attraction toward mouse
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 200) {
                this.vx += (dx / dist) * .008;
                this.vy += (dy / dist) * .008;
            }
            // Damping
            this.vx *= .99;
            this.vy *= .99;
            this.x += this.vx;
            this.y += this.vy;
            // Wrap
            if (this.x < -5) this.x = w + 5;
            if (this.x > w + 5) this.x = -5;
            if (this.y < -5) this.y = h + 5;
            if (this.y > h + 5) this.y = -5;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    const initParticles = () => {
        const n = Math.min(Math.floor((w * h) / 14000), 90);
        particles = Array.from({ length: n }, () => new Particle());
    };
    initParticles();

    const MAX_DIST = 130;
    const drawLines = () => {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d  = Math.sqrt(dx*dx + dy*dy);
                if (d < MAX_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const alpha = .18 * (1 - d / MAX_DIST);
                    ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
                    ctx.lineWidth   = .6;
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        if (!reduceMotion) requestAnimationFrame(animate);
    };
    animate();


    // =============================================
    // TYPEWRITER
    // =============================================
    const TITLES = [
        'Full Stack Developer',
        'SAP Integration Developer',
        'Industrial Automation Engineer',
        'React & TypeScript Engineer',
    ];
    let  ti = 0, ci = 0, deleting = false;
    const twEl = document.getElementById('typewriter-text');

    const type = () => {
        const cur = TITLES[ti];
        twEl.textContent = deleting
            ? cur.substring(0, --ci)
            : cur.substring(0, ++ci);

        let delay = deleting ? 55 : 95;
        if (!deleting && ci === cur.length) { delay = 2200; deleting = true; }
        else if (deleting && ci === 0)      { deleting = false; ti = (ti + 1) % TITLES.length; delay = 400; }
        setTimeout(type, delay);
    };
    type();


    // =============================================
    // COUNTER ANIMATION (stats)
    // =============================================
    const animCount = (el, target) => {
        const start = performance.now();
        const dur   = 1800;
        const tick  = (now) => {
            const p    = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);        // ease-out cubic
            el.textContent = Math.floor(ease * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        };
        requestAnimationFrame(tick);
    };

    let countersStarted = false;
    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !countersStarted) {
            countersStarted = true;
            document.querySelectorAll('.stat-num').forEach(el =>
                animCount(el, parseInt(el.dataset.target, 10))
            );
        }
    }, { threshold: .5 }).observe(document.getElementById('hero'));


    // =============================================
    // SCROLL REVEAL (sections + stagger items)
    // =============================================
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                revealObs.unobserve(e.target);
            }
        });
    }, { threshold: .08 });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

    // Stagger: observe each item individually
    const staggerObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                staggerObs.unobserve(e.target);
            }
        });
    }, { threshold: .08 });

    document.querySelectorAll('.reveal-stagger').forEach(el => staggerObs.observe(el));

    // Skills section: trigger reveal-stagger inside it
    const skillsObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            document.querySelectorAll('#skills .reveal-stagger').forEach(el =>
                el.classList.add('visible')
            );
            skillsObs.disconnect();
        }
    }, { threshold: .1 });
    const skillsEl = document.getElementById('skills');
    if (skillsEl) skillsObs.observe(skillsEl);

    // International section same treatment
    const intlObs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            document.querySelectorAll('#international .reveal-stagger').forEach(el =>
                el.classList.add('visible')
            );
            intlObs.disconnect();
        }
    }, { threshold: .1 });
    const intlEl = document.getElementById('international');
    if (intlEl) intlObs.observe(intlEl);


    // =============================================
    // SKILLS PROGRESS BARS
    // =============================================
    let barsAnimated = false;
    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !barsAnimated) {
            barsAnimated = true;
            document.querySelectorAll('.progress-bar').forEach(bar => {
                const fill = document.createElement('div');
                fill.className = 'progress-bar-fill';
                bar.appendChild(fill);
                setTimeout(() => {
                    fill.style.width = bar.dataset.progress + '%';
                }, 120);
            });
        }
    }, { threshold: .25 }).observe(skillsEl || document.body);


    // =============================================
    // 3D CARD TILT
    // =============================================
    if (!reduceMotion) {
        document.querySelectorAll('.tilt-card').forEach(card => {
            const MAX_ROT = 7;
            card.addEventListener('mousemove', e => {
                const r  = card.getBoundingClientRect();
                const cx = r.left + r.width  / 2;
                const cy = r.top  + r.height / 2;
                const rx = -(e.clientY - cy) / (r.height / 2) * MAX_ROT;
                const ry =  (e.clientX - cx) / (r.width  / 2) * MAX_ROT;
                card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
                card.style.boxShadow = `0 20px 50px rgba(0,0,0,.15), ${-ry * .5}px ${rx * .5}px 20px rgba(37,99,235,.1)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform  = '';
                card.style.boxShadow  = '';
                card.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1), box-shadow .5s cubic-bezier(.4,0,.2,1)';
                setTimeout(() => { card.style.transition = ''; }, 500);
            });
        });
    }


    // =============================================
    // CUSTOM CURSOR (desktop, fine pointer only)
    // =============================================
    if (pointerFine) {
        const cursorDot  = document.createElement('div');
        cursorDot.id = 'cursor-dot';
        const cursorRing = document.createElement('div');
        cursorRing.id = 'cursor-ring';
        document.body.append(cursorDot, cursorRing);

        window.addEventListener('mousemove', e => {
            cursorDot.style.left  = cursorRing.style.left = e.clientX + 'px';
            cursorDot.style.top   = cursorRing.style.top  = e.clientY + 'px';
        });

        const HOVER_TARGETS = 'a, button, .tilt-card, .chip, .ds-swatch, input, textarea, [role="button"]';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(HOVER_TARGETS)) cursorRing.classList.add('cursor-hover');
        });
        document.addEventListener('mouseout', e => {
            if (e.target.closest(HOVER_TARGETS)) cursorRing.classList.remove('cursor-hover');
        });
    }


    // =============================================
    // MAGNETIC HERO BUTTONS
    // =============================================
    if (pointerFine && !reduceMotion) {
        document.querySelectorAll('.hero-actions .btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width  / 2) * .25;
                const y = (e.clientY - r.top  - r.height / 2) * .35;
                btn.style.transition = '';
                btn.style.transform  = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
                btn.style.transform  = '';
            });
        });
    }


    // =============================================
    // LIVE DESIGN SYSTEM (color copy + motion demo)
    // =============================================
    document.querySelectorAll('.ds-swatch').forEach(sw => {
        sw.addEventListener('click', () => {
            const hex  = sw.dataset.hex;
            const hexEl = sw.querySelector('.ds-swatch-hex');
            const original = hexEl ? hexEl.textContent : '';
            navigator.clipboard?.writeText(hex).catch(() => {});
            sw.classList.add('copied');
            if (hexEl) hexEl.textContent = 'Copied!';
            setTimeout(() => {
                sw.classList.remove('copied');
                if (hexEl) hexEl.textContent = original;
            }, 1200);
        });
    });

    const motionDot  = document.getElementById('ds-motion-dot');
    const motionBtn  = document.getElementById('ds-motion-replay');
    if (motionDot && motionDot.parentElement) {
        const track = motionDot.parentElement;
        const runMotionDemo = () => {
            motionDot.style.transition = 'none';
            motionDot.style.transform  = 'translateX(0)';
            void motionDot.offsetWidth;
            requestAnimationFrame(() => {
                const dist = track.clientWidth - motionDot.clientWidth - 8;
                motionDot.style.transition = reduceMotion ? 'none' : 'transform 1.1s cubic-bezier(.4,0,.2,1)';
                motionDot.style.transform  = `translateX(${dist}px)`;
            });
        };
        motionBtn?.addEventListener('click', runMotionDemo);
        new IntersectionObserver((entries, obs) => {
            if (entries[0].isIntersecting) { runMotionDemo(); obs.disconnect(); }
        }, { threshold: .5 }).observe(track);
    }

});
