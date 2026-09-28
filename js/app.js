
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");



if (mobileMenuBtn && mobileMenu) {

    mobileMenuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("hidden");

      
        if (mobileMenu.classList.contains("hidden")) {

            mobileMenuBtn.textContent = "☰";

        } else {

            mobileMenuBtn.textContent = "✕";

        }

    });

}


if (mobileMenu) {

    const mobileLinks = mobileMenu.querySelectorAll("a");

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {

            mobileMenu.classList.add("hidden");

            if (mobileMenuBtn) {
                mobileMenuBtn.textContent = "☰";
            }

        });

    });

}


const anchorLinks = document.querySelectorAll('a[href^="#"]');

anchorLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
            return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement) {

            event.preventDefault();

            targetElement.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


const currentYear = new Date().getFullYear();

const yearElements = document.querySelectorAll("[data-year]");

yearElements.forEach((element) => {
    element.textContent = currentYear;
});


console.log("MoneyMap loaded successfully.");