const navbar = document.querySelector(".navbar")

document.querySelector(".dropdown-icon").onclick = () => {
    if (!matchMedia("(max-width: 850px)"))
        return;

    if (navbar.classList.contains("show"))
        navbar.classList.remove("show");
    else
        navbar.classList.add("show");
}