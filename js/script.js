document.addEventListener("DOMContentLoaded", () => {
    // Ano atual no rodapé
    const year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // 1. Animações de entrada
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(".fade-in, .slide-up").forEach((el) => {
        revealObserver.observe(el);
    });

    // 2. Glow dos cards seguindo o cursor
    document.querySelectorAll(".bento-card").forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            card.style.setProperty("--x", `${x}px`);
            card.style.setProperty("--y", `${y}px`);
        });
    });

    // 3. Menu mobile
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");
    const navbar = document.getElementById("navbar");

    const closeMenu = () => {
        if (!navLinks || !navToggle) return;
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Abrir menu");
        document.body.classList.remove("menu-open");
    };

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
            navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
            document.body.classList.toggle("menu-open", isOpen);
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) {
                closeMenu();
            }
        });
    }

    // 4. Navbar recolhe ao descer (sem atrapalhar o menu aberto)
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
        if (!navbar) return;
        if (navLinks && navLinks.classList.contains("is-open")) return;

        const currentScroll = window.pageYOffset;

        if (currentScroll > 140 && currentScroll > lastScroll) {
            navbar.classList.add("is-hidden");
        } else {
            navbar.classList.remove("is-hidden");
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // 5. Link ativo na navegação
    const sections = Array.from(document.querySelectorAll("section[id]"));
    const internalLinks = Array.from(
        document.querySelectorAll('.nav-links a[href^="#"]')
    );

    const setActiveLink = () => {
        if (!sections.length || !internalLinks.length) return;

        const scrollPosition = window.scrollY + 140;
        let currentSection = sections[0].id;

        sections.forEach((section) => {
            if (section.offsetTop <= scrollPosition) {
                currentSection = section.id;
            }
        });

        internalLinks.forEach((link) => {
            link.classList.toggle(
                "is-active",
                link.getAttribute("href") === `#${currentSection}`
            );
        });
    };

    window.addEventListener("scroll", setActiveLink, { passive: true });
    setActiveLink();
});
