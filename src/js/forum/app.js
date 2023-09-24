const posts_json_uri = "../../json/forum.json"


/**
 * Fetch the JSON containing the forum details.
 * @return {JSON}
 */
async function fetch_json() {
    const response = await fetch(posts_json_uri);
    return await response.json();
}

/**
 * Fetch the user json given the id.
 * @return {JSON}
 * @param {String} id The user id
 */
async function fetch_user(id) {
    const json = await fetch_json();

    for (const user of json.users) {
        if (user.id === id)
            return user;
    }
    return null;
}

/**
 * Fetch the forum post json given the id.
 * @return {JSON}
 * @param {String} id The forum post id
 */
async function fetch_post(id) {
    const json = await fetch_json();

    for (const post of json.posts) {
        if (post.id === id)
            return post;
    }
    return null;
}

/**
 * Shorthand to read the url param
 * @return {String} The param value
 * @param {String} param The param key
 */
function get_url_param(param){
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param)
}

/**
 * Renders and add post onto the DOM.
 */
async function render_post_page() {
    const html = await get_post_html();
    document.body.append(html);
}

/**
 * Get the full forum post DOM html.
 * @return {HTMLDivElement} The DOM html for the entire post.
 * @param {Number} id The post id
 */
async function get_post_html(id) {
    const post_id = get_url_param("id")
    if (!post_id) {
        console.log("ID parameter not found");
        return get_404_html();
    }

    const post = await fetch_post(post_id);

    if (!post) {
        console.log(`id ${post_id} is not found.`);
        return get_404_html();
    }

    let html = document.createElement("div")
    html.innerHTML.trim();
    html.classList.add("posts")
    html.innerHTML = `<h2>${post.title}</h2>`;

    let is_first = true;
    for (const message of post.posts) {
        let inner_html = document.createElement("div");
        inner_html.innerHTML.trim();
        inner_html.classList.add("post");

        let author = await fetch_user(message.author_id);
        let title;
        if (is_first) {
            title = post.title;
            is_first = false;
        }
        else
            title = `Re: ${post.title}`
        let time = new Date(message.time_posted);
        let time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;

        inner_html.innerHTML = `<div class="mini-title">${title}</div><div class="author">by <a href="./user.html?id=${author.id}">${author.name}</a> » ${time_str}</div><div class="content">${message.content}</div>`
        html.append(inner_html);
    }

    return html;
}

/**
 * Get the 404 html DOM
 * @return {HTMLDivElement}
 */
function get_404_html() {
    let html = document.createElement("div")
    html.innerHTML.trim();
    html.classList.add("not-found");
    html.innerHTML = `<h1>404 Not Found</h1><a href='./'><h2>Would you like to go back?</h2></a>`;
    return html;
}
