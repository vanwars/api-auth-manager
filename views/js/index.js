const escapeTags = (str) => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
};

const retrieveJSON = async (ev) => {
    const btn = ev.target;
    const container =
        btn.parentElement.parentElement.parentElement.querySelector(".json");
    if (container.classList.contains("active")) {
        container.classList.remove("active");
        ev.target.innerHTML = '<i class="fas fa-chevron-right"></i> load data';
        return;
    }
    const codeElem = btn.previousElementSibling.querySelector("code");
    url = codeElem.querySelector(".hljs-string").innerText;
    url = url.substring(1, url.length - 1);
    console.log(url);
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Data from server:", data);
        container.querySelector("code").innerHTML = anchorme(
            JSON.stringify(data, null, 4)
        );
        hljs.highlightBlock(container);
        container.classList.add("active");
        ev.target.innerHTML = '<i class="fas fa-chevron-down"></i> hide data';
    } catch (ex) {
        container.querySelector("code").innerHTML = anchorme(
            "Invalid edits to JavaScript"
        );
        container.classList.add("active");
        ev.target.innerHTML = '<i class="fas fa-chevron-down"></i> hide data';
    }
};

const initEventHandlers = () => {
    for (elem of document.querySelectorAll(".show-data")) {
        elem.onclick = retrieveJSON;
    }
    for (elem of document.querySelectorAll("code")) {
        hljs.highlightBlock(elem);
        if (elem.querySelector(".hljs-string")) {
            elem.querySelector(".hljs-string").setAttribute(
                "contenteditable",
                "true"
            );
        }
    }
    for (elem of document.querySelectorAll("nav a")) {
        elem.onclick = scrollToAnchor;
    }
};

const scrollToAnchor = (ev) => {
    const distanceToTop = (el) => {
        return Math.floor(el.getBoundingClientRect().top);
    };
    var targetID = ev.target.getAttribute("href");
    const targetAnchor = document.querySelector(targetID);
    window.scrollBy({
        top: distanceToTop(targetAnchor),
        left: 0,
        behavior: "smooth",
    });
    ev.preventDefault();
};

initEventHandlers();
