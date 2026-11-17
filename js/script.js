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

    // 2. Glow dos cards seguindo o cursor em todo o site
    const glowCardSelectors = [
        ".bento-card",
        ".mvv-card",
        ".action-card",
        ".persona-card",
        ".extension-card",
        ".stack-card",
        ".service-item",
        ".location-info",
        ".step",
        ".principle"
    ].join(", ");

    document.querySelectorAll(glowCardSelectors).forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            card.style.setProperty("--x", `${x}px`);
            card.style.setProperty("--y", `${y}px`);
        });
    });

    // 2.1. Brilho ambiente laranja global que segue o cursor pelo site
    const siteGlow = document.querySelector(".site-cursor-glow");
    if (siteGlow && window.matchMedia("(pointer: fine)").matches) {
        let isGlowSuppressed = false;

        window.addEventListener("mousemove", (event) => {
            // Não passa na frente nem fica sobre imagens ou mapa
            const isOverMedia = Boolean(
                event.target && event.target.closest("img, picture, iframe, .location-map")
            );

            if (isOverMedia) {
                siteGlow.style.opacity = "0";
                isGlowSuppressed = true;
                return;
            }

            if (isGlowSuppressed || siteGlow.style.opacity !== "1") {
                siteGlow.style.opacity = "1";
                isGlowSuppressed = false;
            }

            siteGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
        }, { passive: true });

        // Quando o mouse sai da janela ou entra em iframe (perda de foco)
        document.addEventListener("mouseleave", () => {
            siteGlow.style.opacity = "0";
            isGlowSuppressed = true;
        });

        window.addEventListener("blur", () => {
            siteGlow.style.opacity = "0";
            isGlowSuppressed = true;
        });

        // Eventos diretos em imagens e mapa para garantia total
        document.querySelectorAll("img, picture, iframe, .location-map").forEach((media) => {
            media.addEventListener("mouseenter", () => {
                siteGlow.style.opacity = "0";
                isGlowSuppressed = true;
            });
            media.addEventListener("mouseleave", () => {
                isGlowSuppressed = false;
            });
        });
    }

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

    // 6. Efeito Matrix Laranja de 1 e 0 atrás do quadro
    const matrixCanvas = document.getElementById("matrixCanvas");
    if (matrixCanvas) {
        const ctx = matrixCanvas.getContext("2d");
        const sectionParent = matrixCanvas.closest(".cta-section") || matrixCanvas.parentElement;

        const chars = ["1", "0"];
        const fontSize = 16;
        let columns = 0;
        let drops = [];
        let animId = null;
        let isSectionVisible = false;

        const setupMatrix = () => {
            if (!sectionParent) return;
            const width = sectionParent.offsetWidth;
            const height = sectionParent.offsetHeight;
            matrixCanvas.width = width;
            matrixCanvas.height = height;

            columns = Math.floor(width / fontSize);
            drops = [];
            for (let i = 0; i < columns; i++) {
                drops[i] = Math.floor(Math.random() * -(height / fontSize));
            }
        };

        const renderMatrix = () => {
            if (!isSectionVisible) return;

            // Fundo escuro com leve transparência para criar o rastro
            ctx.fillStyle = "rgba(5, 5, 5, 0.1)";
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);

            ctx.font = `bold ${fontSize}px "Courier New", monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Caractere da ponta em branco/laranja brilhante
                ctx.fillStyle = "#fff4eb";
                ctx.shadowColor = "#ea580c";
                ctx.shadowBlur = 10;
                ctx.fillText(char, x, y);

                // Caractere anterior em laranja neon
                ctx.fillStyle = "#ea580c";
                ctx.shadowBlur = 4;
                ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - fontSize);

                ctx.shadowBlur = 0;

                // Reinicia a coluna após descer
                if (y > matrixCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        let lastFrameTime = 0;
        const targetFps = 30;
        const frameInterval = 1000 / targetFps;

        const loopMatrix = (timestamp) => {
            animId = requestAnimationFrame(loopMatrix);
            const delta = timestamp - lastFrameTime;
            if (delta > frameInterval) {
                lastFrameTime = timestamp - (delta % frameInterval);
                renderMatrix();
            }
        };

        const matrixObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                isSectionVisible = entry.isIntersecting;
                if (isSectionVisible && !animId) {
                    lastFrameTime = performance.now();
                    animId = requestAnimationFrame(loopMatrix);
                } else if (!isSectionVisible && animId) {
                    cancelAnimationFrame(animId);
                    animId = null;
                }
            });
        }, { threshold: 0.05 });

        matrixObserver.observe(sectionParent);

        const resizeObserver = new ResizeObserver(() => {
            setupMatrix();
        });
        resizeObserver.observe(sectionParent);

        setupMatrix();
    }
});
