/* ==========================================================
   YP PRODUCT
   script.js
   Production Version
========================================================== */

"use strict";


/* ==========================================================
   DOM REFERENCES
========================================================== */

const DOM = {

    body: document.body,

    navbar: document.querySelector(".navbar"),

    navLinks: document.querySelectorAll(".navbar__menu a"),

    navIndicator: document.querySelector(".nav-indicator"),

    navMenuWrap: document.querySelector(".navbar__menu-wrap"),

    sections: document.querySelectorAll("section[id]"),

    heroLogo: document.getElementById("hero-logo"),

    portfolioButtons:
        document.querySelectorAll(".portfolio-category"),

    portfolioView:
        document.getElementById("portfolio-view")

};



/* ==========================================================
   NAVBAR
========================================================== */

let lastScrollY = window.scrollY;

let heroHeight =
    document.getElementById("hero")
    ? document.getElementById("hero").offsetHeight
    : 600;


function updateNavbar(){

    if(!DOM.navbar) return;


    const currentY = window.scrollY;


    if(currentY > 40){

        DOM.navbar.classList.add("scrolled");

    }else{

        DOM.navbar.classList.remove("scrolled");

    }


    // لوگوی کوچک — فقط بعد از رد شدن از هیرو

    if(currentY > heroHeight * .8){

        DOM.navbar.classList.add("show-logo");

    }else{

        DOM.navbar.classList.remove("show-logo");

    }


    // مخفی/ظاهر شدن هوشمند بر اساس جهت اسکرول

    if(currentY < 60){

        DOM.navbar.classList.remove("nav-hidden");

    }else if(currentY > lastScrollY + 4){

        DOM.navbar.classList.add("nav-hidden");

    }else if(currentY < lastScrollY - 4){

        DOM.navbar.classList.remove("nav-hidden");

    }


    lastScrollY = currentY;

}


window.addEventListener(
    "scroll",
    updateNavbar,
    {passive:true}
);



/* ==========================================================
   NAV INDICATOR — پیل شیشه‌ای لغزنده
========================================================== */

function moveNavIndicator(link){

    if(
        !DOM.navIndicator ||
        !DOM.navMenuWrap ||
        !link
    ) return;


    const linkRect =
        link.getBoundingClientRect();

    const wrapRect =
        DOM.navMenuWrap.getBoundingClientRect();


    const offsetRight =
        wrapRect.right - linkRect.right;


    DOM.navIndicator.style.width =
        linkRect.width + "px";

    DOM.navIndicator.style.right =
        offsetRight + "px";

    DOM.navIndicator.classList.add("is-ready");

}


function initNavIndicator(){

    if(!DOM.navIndicator) return;


    let activeLink =
        document.querySelector(".navbar__menu a.active") ||
        DOM.navLinks[0];


    DOM.navLinks.forEach(link=>{

        link.addEventListener(
            "mouseenter",
            ()=> moveNavIndicator(link)
        );

    });


    if(DOM.navMenuWrap){

        DOM.navMenuWrap.addEventListener(
            "mouseleave",
            ()=>{

                const current =
                    document.querySelector(
                        ".navbar__menu a.active"
                    ) || activeLink;

                moveNavIndicator(current);

            }
        );

    }


    // موقعیت اولیه، بعد از این‌که فونت‌ها و layout آماده شدن

    window.addEventListener("load", ()=>{

        setTimeout(
            ()=> moveNavIndicator(activeLink),
            500
        );

    });


    window.addEventListener(
        "resize",
        ()=>{

            const current =
                document.querySelector(
                    ".navbar__menu a.active"
                ) || activeLink;

            moveNavIndicator(current);

        },
        {passive:true}
    );

}



/* ==========================================================
   SMOOTH SCROLL
========================================================== */

function initSmoothScroll(){

    DOM.navLinks.forEach(link=>{


        link.addEventListener(
            "click",
            event=>{


                const targetID =
                    link.getAttribute("href");


                if(
                    !targetID ||
                    !targetID.startsWith("#")
                ) return;


                const target =
                    document.querySelector(targetID);


                if(!target) return;


                event.preventDefault();


                window.scrollTo({

                    top:
                    target.offsetTop - 90,

                    behavior:"smooth"

                });


            }
        );


    });

}



/* ==========================================================
   ACTIVE NAVIGATION
========================================================== */

function initSectionObserver(){


    if(!DOM.sections.length) return;


    const observer =
    new IntersectionObserver(
        entries=>{


            entries.forEach(entry=>{


                if(!entry.isIntersecting)
                    return;


                const id =
                entry.target.id;


                DOM.navLinks.forEach(link=>{


                    link.classList.remove(
                        "active"
                    );


                    if(
                        link.getAttribute("href")
                        === `#${id}`
                    ){

                        link.classList.add(
                            "active"
                        );

                        moveNavIndicator(link);

                    }


                });


            });


        },
        {
            threshold:.45
        }
    );


    DOM.sections.forEach(section=>{

        observer.observe(section);

    });


}



/* ==========================================================
   REVEAL ANIMATION
========================================================== */

function initReveal(){


    const elements =
    document.querySelectorAll(".reveal, .reveal-scale");


    if(!elements.length)
        return;


    const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    if(prefersReducedMotion){

        elements.forEach(element=>{

            element.classList.add("active");

        });

        return;

    }


    const observer =
    new IntersectionObserver(
        entries=>{


            entries.forEach(entry=>{


                if(entry.isIntersecting){

                    entry.target
                    .classList
                    .add("active");

                }else{

                    // allow the element to replay its
                    // enter animation next time it scrolls
                    // back into view (awwwards-style loop)

                    entry.target
                    .classList
                    .remove("active");

                }


            });


        },
        {
            threshold:.15,
            rootMargin:"0px 0px -8% 0px"
        }
    );



    elements.forEach(element=>{

        observer.observe(element);

    });


}



/* ==========================================================
   HERO LOGO
========================================================== */

function initHeroLogo(){


    if(!DOM.heroLogo)
        return;


    DOM.heroLogo.src =
    "assets/images/logo/logo-white.webp";


}


/* ==========================================================
   PORTFOLIO ACCORDION SYSTEM
========================================================== */


let galleryData = {};



async function loadGallery(){


    try{


        const response = await fetch(
            "assets/images/gallery/gallery.json"
        );


        if(!response.ok)
            throw new Error("Gallery not found");


        galleryData = await response.json();


    }catch(error){


        console.error(
            "Gallery Error:",
            error
        );


    }

}




const faDigits = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"];

function toFaDigits(num){

    return String(num)
        .split("")
        .map(d => faDigits[d] ?? d)
        .join("");

}


// نگه‌داری ارجاع به next/prev کاورفلوی فعلاً بازشده،
// برای این‌که کلید ← → همیشه فقط رو یه شنونده‌ی سراسری
// (نه یه شنونده‌ی جدید هر بار که آکاردئون باز میشه) کار کنه

let activeCoverflow = null;


document.addEventListener("keydown", (e)=>{

    if(!activeCoverflow) return;

    if(e.key === "ArrowLeft")  activeCoverflow.next();
    if(e.key === "ArrowRight") activeCoverflow.prev();

});



function renderPortfolioContent(item, category){


    const contentInner =
    item.querySelector(".portfolio-content-inner");


    const data =
    galleryData[category];


    if(!data || !contentInner)
        return;


    activeCoverflow = null;


    if(
        !data.images ||
        data.images.length === 0
    ){


        contentInner.innerHTML = `

        <div class="portfolio-empty">

            <h3>
                به زودی...
            </h3>

            <p>
                نمونه‌کارهای این بخش
                به زودی اضافه می‌شوند.
            </p>

        </div>

        `;


        return;

    }



    contentInner.innerHTML = `

    <div class="cf">

        <button class="cf-arrow cf-arrow--prev" type="button" aria-label="قبلی">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

        <div class="cf-stage">
            <div class="cf-track"></div>
        </div>

        <button class="cf-arrow cf-arrow--next" type="button" aria-label="بعدی">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

    </div>

    <div class="cf-footer">

        <div class="cf-counter"></div>

        <div class="cf-dots"></div>

    </div>

    `;


    activeCoverflow =
        initCoverflow(contentInner, data);


}



/* ==========================================================
   COVERFLOW — تعامل (پیکان، اسکرول، درگ، کیبورد، کلیک)
========================================================== */

function initCoverflow(root, data){


    const track   = root.querySelector(".cf-track");
    const stage   = root.querySelector(".cf-stage");
    const prevBtn = root.querySelector(".cf-arrow--prev");
    const nextBtn = root.querySelector(".cf-arrow--next");
    const counter = root.querySelector(".cf-counter");
    const dotsWrap = root.querySelector(".cf-dots");

    const images = data.images;
    const total  = images.length;

    let current = 0;


    const slideEls = images.map((image, i)=>{

        const el = document.createElement("div");
        el.className = "cf-slide";
        el.dataset.index = i;

        const img = document.createElement("img");
        img.src =
            `assets/images/gallery/${data.folder}/${image}`;
        img.alt = `${data.title} — ${i + 1}`;
        img.loading = "lazy";
        img.decoding = "async";
        img.draggable = false;

        el.appendChild(img);

        el.addEventListener("click", ()=>{

            if(hasDragged) return;

            goTo(i);

        });

        track.appendChild(el);

        return el;

    });


    const dotEls = images.map((_, i)=>{

        const dot = document.createElement("div");
        dot.className = "cf-dot";
        dot.addEventListener("click", ()=> goTo(i));
        dotsWrap.appendChild(dot);
        return dot;

    });


    function shortestOffset(index, current, total){

        let diff = index - current;

        if(diff > total / 2)  diff -= total;
        if(diff < -total / 2) diff += total;

        return diff;

    }


    function render(){

        slideEls.forEach((el, i)=>{

            const offset = shortestOffset(i, current, total);
            const abs = Math.abs(offset);

            let transform, opacity, filter, zIndex;

            if(abs === 0){

                transform = "translate(-50%,-50%) translateX(0) translateZ(0) rotateY(0deg) scale(1)";
                opacity   = 1;
                filter    = "brightness(1)";
                zIndex    = 30;

            }else if(abs === 1){

                const dir = offset > 0 ? 1 : -1;

                transform = `translate(-50%,-50%) translateX(${dir * 62}%) translateZ(-140px) rotateY(${-dir * 38}deg) scale(.76)`;
                opacity   = .6;
                filter    = "brightness(.55)";
                zIndex    = 20;

            }else if(abs === 2){

                const dir = offset > 0 ? 1 : -1;

                transform = `translate(-50%,-50%) translateX(${dir * 106}%) translateZ(-280px) rotateY(${-dir * 46}deg) scale(.58)`;
                opacity   = .3;
                filter    = "brightness(.4)";
                zIndex    = 10;

            }else{

                const dir = offset > 0 ? 1 : -1;

                transform = `translate(-50%,-50%) translateX(${dir * 136}%) translateZ(-360px) rotateY(${-dir * 50}deg) scale(.48)`;
                opacity   = 0;
                filter    = "brightness(.3)";
                zIndex    = 0;

            }

            el.style.transform = transform;
            el.style.opacity   = opacity;
            el.style.filter    = filter;
            el.style.zIndex    = zIndex;

            el.classList.toggle("is-active", abs === 0);

        });

        dotEls.forEach((dot, i)=>{

            dot.classList.toggle("is-active", i === current);

        });

        counter.textContent =
            toFaDigits(String(current + 1).padStart(2,"0")) +
            " / " +
            toFaDigits(String(total).padStart(2,"0"));

    }


    function goTo(index){

        current = ((index % total) + total) % total;
        render();

    }

    function next(){ goTo(current + 1); }
    function prev(){ goTo(current - 1); }


    nextBtn.addEventListener("click", next);
    prevBtn.addEventListener("click", prev);


    let wheelLock = false;

    stage.addEventListener("wheel", (e)=>{

        const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        const delta = horizontal ? e.deltaX : e.deltaY;

        if(Math.abs(delta) < 12) return;

        e.preventDefault();

        if(wheelLock) return;
        wheelLock = true;

        if(delta > 0) next(); else prev();

        setTimeout(()=>{ wheelLock = false; }, 420);

    }, { passive:false });


    let startX = 0;
    let startY = 0;
    let isDown = false;
    let axisLocked = null;
    let hasDragged = false;
    let activePointerId = null;


    function pointerDownHandler(e){

        isDown = true;
        hasDragged = false;
        axisLocked = null;
        startX = e.clientX;
        startY = e.clientY;
        activePointerId = e.pointerId;

        stage.classList.add("is-dragging");

        // با pointer capture، حرکت حتی اگه انگشت/ماوس از
        // محدوده‌ی stage بیرون بره هم درست دنبال میشه —
        // این همون چیزیه که قبلاً با mouse/touch جدا از
        // هم می‌شکست و باعث می‌شد لمس‌کردن روی موبایل
        // رفتار غیرمنتظره (ناپدیدشدن تصویر) داشته باشه

        if(stage.setPointerCapture){

            stage.setPointerCapture(e.pointerId);

        }

    }

    function pointerMoveHandler(e){

        if(!isDown || e.pointerId !== activePointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if(axisLocked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)){

            axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";

        }

        if(axisLocked === "x"){

            if(e.cancelable) e.preventDefault();

            if(Math.abs(dx) > 8) hasDragged = true;

        }

    }

    function pointerUpHandler(e){

        if(!isDown || e.pointerId !== activePointerId) return;

        isDown = false;
        stage.classList.remove("is-dragging");

        if(stage.releasePointerCapture){

            try{
                stage.releasePointerCapture(e.pointerId);
            }catch(err){}

        }

        if(axisLocked !== "x"){

            axisLocked = null;
            return;

        }

        const dx = e.clientX - startX;
        const threshold = 55;

        if(dx > threshold)       prev();
        else if(dx < -threshold) next();

        axisLocked = null;

        setTimeout(()=>{ hasDragged = false; }, 50);

    }

    stage.addEventListener("pointerdown", pointerDownHandler);
    stage.addEventListener("pointermove", pointerMoveHandler, { passive:false });
    stage.addEventListener("pointerup",   pointerUpHandler);
    stage.addEventListener("pointercancel", pointerUpHandler);



    render();


    return { next, prev, goTo };

}




function initPortfolio(){


    const items =
    document.querySelectorAll(
        ".portfolio-item"
    );


    const buttons =
    document.querySelectorAll(
        ".portfolio-category"
    );



    buttons.forEach(button=>{


        button.addEventListener(
            "click",
            ()=>{


                const item =
                button.closest(
                    ".portfolio-item"
                );


                const isActive =
                item.classList.contains(
                    "active"
                );



                items.forEach(other=>{


                    other.classList.remove(
                        "active"
                    );


                    other
                    .querySelector(
                        ".portfolio-category"
                    )
                    .setAttribute(
                        "aria-expanded",
                        "false"
                    );


                });



                if(!isActive){


                    item.classList.add(
                        "active"
                    );


                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );


                    renderPortfolioContent(
                        item,
                        button.dataset.category
                    );


                }


            }
        );


    });


}
/* ==========================================================
   IMAGE SETTINGS
========================================================== */


function disableImageDrag(){


    document
    .querySelectorAll("img")
    .forEach(image=>{


        image.draggable=false;


    });


}



/* ==========================================================
   PERFORMANCE
========================================================== */


function initPerformance(){


    // قبلاً به window.load وابسته بود که تو شبکه‌ی ضعیف
    // ممکنه دیر بیاد یا اصلاً نیاد — همون باگی که ناوبار رو
    // مخفی نگه می‌داشت. الان بلافاصله همینجا (که خودش تو
    // DOMContentLoaded صدا زده میشه) اجرا میشه.

    DOM.body
    .classList
    .add("loaded");


}



/* ==========================================================
   INIT
========================================================== */


document.addEventListener(
    "DOMContentLoaded",
    async()=>{


        updateNavbar();


        initNavIndicator();


        initSmoothScroll();


        initSectionObserver();


        initReveal();


        initHeroLogo();


        await loadGallery();


        initPortfolio();


        disableImageDrag();


        initPerformance();



        console.log(
            "%cYP Product",
            "font-size:18px;font-weight:bold;color:white;background:#111;padding:8px 14px;border-radius:8px;"
        );


        console.log(
            "%cDesigned & Developed by Sicily Design",
            "color:#888;font-size:12px;"
        );


    }
);
