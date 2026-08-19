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

function updateNavbar(){

    if(!DOM.navbar) return;


    if(window.scrollY > 40){

        DOM.navbar.classList.add("scrolled");

    }else{

        DOM.navbar.classList.remove("scrolled");

    }

}


window.addEventListener(
    "scroll",
    updateNavbar,
    {passive:true}
);



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
    document.querySelectorAll(".reveal");


    if(!elements.length)
        return;


    const observer =
    new IntersectionObserver(
        entries=>{


            entries.forEach(entry=>{


                if(
                    entry.isIntersecting
                ){

                    entry.target
                    .classList
                    .add("active");


                    observer.unobserve(
                        entry.target
                    );

                }


            });


        },
        {
            threshold:.15
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




function renderPortfolioContent(item, category){


    const content =
    item.querySelector(".portfolio-content");


    const data =
    galleryData[category];


    if(!data)
        return;



    if(
        !data.images ||
        data.images.length === 0
    ){


        content.innerHTML = `

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



    let html = `

    <div class="portfolio-gallery">

    `;



    data.images.forEach(image=>{


        html += `

        <figure class="portfolio-image">

            <img

            src="assets/images/gallery/${data.folder}/${image}"

            alt="${data.title}"

            loading="lazy"

            decoding="async">

        </figure>

        `;


    });



    html += `

    </div>

    `;



    content.innerHTML = html;


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


    window.addEventListener(
        "load",
        ()=>{

            DOM.body
            .classList
            .add("loaded");

        }
    );


}



/* ==========================================================
   INIT
========================================================== */


document.addEventListener(
    "DOMContentLoaded",
    async()=>{


        updateNavbar();


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
