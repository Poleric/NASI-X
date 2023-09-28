const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        } else {
            entry.target.classList.remove("show");
        }
    })
})

const flyInElements = document.querySelectorAll(".fly-in-all,.fly-in-self")
flyInElements.forEach((elem) => observer.observe(elem));