const escapeTags = (str) => {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
};

const retrieveJSON = (ev) => {
    const btn = ev.target;
    const container = btn.parentElement.querySelector('.json');
    const url = btn.getAttribute('data-url');
    fetch(url)
        .then(response => response.json())
        .then(data => {
            container.innerHTML = escapeTags(JSON.stringify(data, null, 2));
            hljs.highlightBlock(container);
            container.classList.add('active');
        });
};

const initEventHandlers = () => {
    for (elem of document.querySelectorAll('.show-data')) {
        elem.onclick = retrieveJSON;
    }
    for (elem of document.querySelectorAll('code')) {
        hljs.highlightBlock(elem);
    }
    for (elem of document.querySelectorAll('nav a')) {
        elem.onclick = scrollToAnchor;
    }
};


const scrollToAnchor = (ev) => {
    const distanceToTop = (el) => {
        return Math.floor(el.getBoundingClientRect().top);
    };
	var targetID = ev.target.getAttribute('href');
	const targetAnchor = document.querySelector(targetID);
    window.scrollBy({ top: distanceToTop(targetAnchor), left: 0, behavior: 'smooth' });
    ev.preventDefault();
}

initEventHandlers();