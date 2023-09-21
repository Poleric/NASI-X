const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("fly-in");
        } else {
            entry.target.classList.remove("fly-in");
        }
    })
})

const flyInElements = document.querySelectorAll(".fly-in-elems")
flyInElements.forEach((elem) => observer.observe(elem));