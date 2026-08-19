/* =========================================================
   SICILY CUT
   SCRIPT.JS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const splash = document.getElementById("splash");

    const revealElements = document.querySelectorAll(
        ".section,.board,.contact-card,.map-card,.footer-card"
    );

    /* ==========================================
       SPLASH
    ========================================== */

    if (splash) {

        document.body.style.overflow = "hidden";

        setTimeout(() => {

            splash.classList.add("hide");

            document.body.style.overflow = "";

        }, 1800);

        setTimeout(() => {

            splash.remove();

        }, 2600);

    }

    /* ==========================================
       SCROLL REVEAL
    ========================================== */

    const observer = new IntersectionObserver(

        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("active");

                    observer.unobserve(entry.target);

                }

            });

        },

        {

            threshold: .15

        }

    );

    revealElements.forEach((item) => {

        item.classList.add("reveal");

        observer.observe(item);

    });

    /* ==========================================
       BUTTON RIPPLE
    ========================================== */

    document

        .querySelectorAll(".primary-btn,.map-button")

        .forEach((button) => {

            button.addEventListener("click", function (e) {

                const circle = document.createElement("span");

                const diameter = Math.max(

                    this.clientWidth,

                    this.clientHeight

                );

                const radius = diameter / 2;

                circle.style.width = circle.style.height =

                    `${diameter}px`;

                circle.style.left =

                    `${e.clientX - this.getBoundingClientRect().left - radius}px`;

                circle.style.top =

                    `${e.clientY - this.getBoundingClientRect().top - radius}px`;

                circle.classList.add("ripple");

                const ripple = this.querySelector(".ripple");

                if (ripple) ripple.remove();

                this.appendChild(circle);

            });

        });

    /* ==========================================
       HEADER SHADOW ON SCROLL
    ========================================== */

    window.addEventListener("scroll", () => {

        const value = window.scrollY;

        document.body.classList.toggle(

            "scrolled",

            value > 40

        );

    });

    /* ==========================================
       PARALLAX HERO
    ========================================== */

    const heroLogo = document.querySelector(".hero-logo");

    window.addEventListener("scroll", () => {

        if (!heroLogo) return;

        const offset = window.scrollY * .12;

        heroLogo.style.transform =

            `translateY(${offset}px)`;

    });

    /* ==========================================
       SMOOTH HOVER
    ========================================== */

    document

        .querySelectorAll(".contact-card,.service")

        .forEach((card) => {

            card.addEventListener("mouseenter", () => {

                card.style.transition = ".35s";

            });

        });

    /* ==========================================
       IMAGE DRAG DISABLE
    ========================================== */

    document

        .querySelectorAll("img")

        .forEach((img) => {

            img.setAttribute(

                "draggable",

                "false"

            );

        });

});

/* ==============================================
   RIPPLE STYLE
============================================== */

const rippleStyle = document.createElement("style");

rippleStyle.textContent = `

.primary-btn,
.map-button{

    position:relative;

    overflow:hidden;

}

.ripple{

    position:absolute;

    border-radius:50%;

    transform:scale(0);

    animation:ripple .65s linear;

    background:rgba(255,255,255,.35);

    pointer-events:none;

}

@keyframes ripple{

    to{

        transform:scale(4);

        opacity:0;

    }

}

`;

document.head.appendChild(rippleStyle);

/* =========================================================
   END OF FILE
========================================================= */
