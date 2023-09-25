const posts_json_uri = "../../json/forum.json"
const posts_per_page = 10;


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
 * @param {String | null} id The user id
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
 * @param {String | null} id The forum post id
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
async function render_post_page(page) {
    const post_id = get_url_param("id");
    const html = await get_post_html(post_id, page);
    document.body.querySelector("div.content").replaceWith(html);
}

/**
 * Get the full forum post DOM html.
 * @return {HTMLDivElement} The DOM html for the entire post.
 * @param {String} id The post id
 * @param {Number} page The page number currently on. For pagination.
 */
async function get_post_html(id, page) {
    const html = document.createElement("div")
    html.innerHTML.trim();
    html.classList.add("content");

    const posts = await fetch_post(id);
    if (!posts) {
        console.log(`id ${id} is not found.`);
        html.innerHTML = get_404_html().innerHTML;
        return html;
    }
    const number_of_posts = Object.keys(posts.posts).length

    html.innerHTML = `<h2>${posts.title}</h2><div class="post-header"><a href="" class="reply" title="Post a reply (This does not work lmao)">Post Reply</a><div class="pages-details">${number_of_posts} post(s) • Page <b>${page}</b> of <b>${Math.ceil(number_of_posts / posts_per_page)}</b></div></div>`;

    // might need to put it somewhere else
    document.title = `${posts.title} - NASI-X Forums`

    let is_first = true;
    for (let i = (page - 1) * (posts_per_page - 1); i < number_of_posts && i < page * posts_per_page; i++) {
        let post = posts.posts[i];

        let inner_html = document.createElement("div");
        inner_html.innerHTML.trim();
        inner_html.classList.add("post");
        inner_html.classList.add("block");
        let title;
        if (is_first) {
            title = posts.title;
            inner_html.innerHTML += `<div class="block-header">Message</div>`;
            is_first = false;
        }
        else
            title = `Re: ${posts.title}`;

        let content_html = document.createElement("div");
        content_html.innerHTML.trim();
        content_html.classList.add("block-content");
        content_html.innerHTML = `<div class="mini-title">${title}</div>`;

        let author = await fetch_user(post.author_id);
        let time = new Date(post.time_posted);
        let time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        content_html.innerHTML += `<div class="author">#${i + 1} by <a href="./user.html?id=${author.id}">${author.name}</a> » <time datetime="${time.toJSON()}">${time_str}</time></div>`;
        content_html.innerHTML += `<div class="post-content">${post.content}</div>`;

        inner_html.append(content_html);
        html.append(inner_html);
    }

    html.innerHTML += `<div class="post-footer"><a href="" class="reply" title="Post a reply (This does not work lmao)">Post Reply</a><div class="pages-details">${number_of_posts} post(s) • Page <b>${page}</b> of <b>${Math.ceil(number_of_posts / posts_per_page)}</b></div>`
    return html;
}

/**
 * Get the 404 html DOM
 * @return {HTMLDivElement}
 */
function get_404_html() {
    let html = document.createElement("div")
    html.innerHTML.trim();
    html.innerHTML = `<div class="block not-found"><div class="block-content"><h2>404 Not Found</h2><hr><a href='./' class="go-back"><h3>Would you like to go back?</h3></a></div></div>`;
    return html;
}
