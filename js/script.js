/* SciNEXA Infotech - site interactions */
document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const nav = document.getElementById("nav");
    const menuBtn = document.getElementById("mobileMenuBtn");
    const MOBILE = () => window.innerWidth <= 1100;

    /* Mobile menu */
    const setMenu = (open) => {
        nav?.classList.toggle("active", open);
        menuBtn?.setAttribute("aria-expanded", String(open));
    };
    menuBtn?.addEventListener("click", () => setMenu(!nav.classList.contains("active")));

    /* GMP Solutions dropdown: tap-to-expand on mobile, normal link on desktop */
    document.querySelectorAll(".dropdown-trigger").forEach((trigger) => {
        trigger.addEventListener("click", (ev) => {
            if (MOBILE()) {
                ev.preventDefault();
                trigger.parentElement.classList.toggle("open");
            }
        });
    });
    document.querySelectorAll(".nav-link:not(.dropdown-trigger), .dropdown-column a").forEach((link) => {
        link.addEventListener("click", () => { if (MOBILE()) setMenu(false); });
    });
    document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
            setMenu(false);
            document.querySelectorAll(".dropdown.open").forEach((d) => d.classList.remove("open"));
            document.activeElement?.blur?.();
        }
    });

    /* Sticky header shadow */
    const onScroll = () => header?.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Hero particles */
    const particles = document.getElementById("particles");
    if (particles) {
        for (let i = 0; i < 24; i += 1) {
            const p = document.createElement("span");
            p.className = "particle";
            p.style.left = `${Math.random() * 100}%`;
            p.style.top = `${Math.random() * 100}%`;
            p.style.animationDelay = `${Math.random() * 12}s`;
            p.style.animationDuration = `${12 + Math.random() * 10}s`;
            particles.appendChild(p);
        }
    }


    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Scroll progress bar */
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    const setProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    };
    setProgress();
    window.addEventListener("scroll", setProgress, { passive: true });

    /* Scroll-reveal with stagger (applied by JS so content is always visible without it) */
    if ("IntersectionObserver" in window && !reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        const sel = ".gmp-card, .module-card, .feature-item, .about-feature, .contact-item, .section-header, .benefits-card, .about-card, .contact-form-card, .map-container, .industry-tag, .logo-slider, .stat-badge, [class$='-card']:not(.about-card):not(.contact-form-card):not(.benefits-card), [class*='-metric-chip'], .qcplanning-bullet-list li";
        document.querySelectorAll(sel).forEach((el) => {
            const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.tagName === el.tagName) : [el];
            el.style.setProperty("--i", Math.min(sibs.indexOf(el), 8));
            el.classList.add("reveal");
            io.observe(el);
        });
    }

    /* Count-up numbers in hero stats */
    document.querySelectorAll("[data-count]").forEach((el) => {
        const end = parseInt(el.dataset.count, 10);
        const suffix = el.textContent.replace(/[0-9]/g, "");
        if (reduceMotion || !end) return;
        const t0 = performance.now();
        const tick = (now) => {
            const p = Math.min((now - t0) / 1400, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        el.textContent = "0" + suffix;
        requestAnimationFrame(tick);
    });

    /* Gentle 3D tilt on hero logo card */
    const visual = document.querySelector(".hero-visual");
    const card = document.querySelector(".logo-card");
    if (visual && card && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
        visual.addEventListener("mousemove", (ev) => {
            const r = visual.getBoundingClientRect();
            const x = (ev.clientX - r.left) / r.width - 0.5;
            const y = (ev.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
        });
        visual.addEventListener("mouseleave", () => { card.style.transform = ""; });
    }

    /* Contact form -> Formspree (action URL is set on the <form> in index.html) */
    const form = document.getElementById("contactForm");
    const msg = document.getElementById("formMessage");
    form?.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const btn = form.querySelector("button[type=submit]");
        btn.disabled = true;
        msg.className = "form-message";
        msg.textContent = "Sending...";
        try {
            const res = await fetch(form.action, {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: new FormData(form),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                msg.className = "form-message success";
                msg.textContent = "Thank you for your message! Our team will get back to you within 24 hours.";
                form.reset();
            } else {
                msg.className = "form-message error";
                msg.textContent = (data.errors && data.errors.map((e) => e.message).join(" ")) || "Something went wrong. Please try again or email us directly.";
            }
        } catch (err) {
            msg.className = "form-message error";
            msg.textContent = "Could not reach the server. Please email us directly.";
        } finally {
            btn.disabled = false;
        }
    });
});
