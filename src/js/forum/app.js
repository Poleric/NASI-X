const posts_json_uri = "../../json/forum.json"
const posts_per_page = 30;
const post_messages_per_page = 10;


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
 * Render and put up the full forum post DOM html.
 * @return {HTMLDivElement} The DOM html for the entire post.
 * @param {Number} page The page number currently on. For pagination.
 */
async function render_posts_list(page) {
    const html = await get_posts_list_html(page);
    document.body.querySelector("div.content").replaceWith(html);
}

/**
 * Get the full forum post DOM html.
 * @return {HTMLDivElement} The DOM html for the entire post.
 * @param {Number} page The page number currently on. For pagination.
 */
async function get_posts_list_html(page) {
    const html = document.createElement("div");
    html.innerHTML.trim();
    html.classList.add("content");

    const table_html = document.createElement("table");
    table_html.classList.add("posts-list", "block");
    const table_head = table_html.createTHead()
    table_head.innerHTML = "<tr class='block-header'><th>Posts</th><th>Replies</th><th>Views</th><th>Last Post</th></tr>"
    const table_body = table_html.createTBody();

    const posts = (await fetch_json()).posts;
    if (!posts) {
        console.log("No posts found");
        return html;
    }
    const number_of_posts = Object.keys(posts).length

    for (let i = (page - 1) * posts_per_page, j = 0; i < number_of_posts && i < page * posts_per_page; i++, j++) {
        let post = posts[i];

        let number_of_post_messages = Object.keys(post.posts).length;
        let first_message = post.posts[0];
        let last_message = post.posts[number_of_post_messages-1];

        let row_html = table_body.insertRow(j);
        row_html.classList.add("block-content");

        let author = await fetch_user(first_message.author_id);
        let time = new Date(first_message.time_posted);
        let time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        row_html.innerHTML = "<td>"
            + `<div><a href="./posts.html?id=${post.id}">${post.title}</a></div>`
            + `<div class="author">by <a href="./user.html?id=${author.id}">${author.name}</a> » <time datetime="${time.toJSON()}">${time_str}</time></div>`
            + "</td>";

        row_html.innerHTML += `<td>${number_of_post_messages - 1}</td>`;
        row_html.innerHTML += `<td>${post.views}</td>`;

        author = await fetch_user(last_message.author_id);
        time = new Date(last_message.time_posted);
        time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        row_html.innerHTML += "<td>"
            + `<div class="last-post">by <a href="./user.html?id=${author.id}">${author.name}</a><br><time datetime="${time.toJSON()}">${time_str}</time></div>`
            + "</td>";
    }

    html.append(table_html);
    /* TODO: pagination here  but im too lazy for now */

    return html;
}

/**
 * Renders and add post onto the DOM.
 * @param {Number} page The page number currently on. For pagination.
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
    html.classList.add("content");

    const posts = await fetch_post(id);
    if (!posts) {
        console.log(`id ${id} is not found.`);
        html.innerHTML = get_404_html().innerHTML;
        return html;
    }
    const number_of_post_messages = Object.keys(posts.posts).length

    html.innerHTML = `<h2>${posts.title}</h2>`;
    html.innerHTML += `<div class="post-header"><a href="" class="reply" title="Post a reply (This does not work lmao)">Post Reply</a><div class="pages-details">${number_of_post_messages} post(s) • Page <b>${page}</b> of <b>${Math.ceil(number_of_post_messages / post_messages_per_page)}</b></div></div>`;

    // might need to put it somewhere else
    document.title = `${posts.title} - NASI-X Forums`

    let is_first = true;
    for (let i = (page - 1) * post_messages_per_page; i < number_of_post_messages && i < page * post_messages_per_page; i++) {
        let post_message = posts.posts[i];

        let inner_html = document.createElement("div");
        inner_html.classList.add("post", "block");
        let title;
        if (is_first) {
            title = posts.title;
            inner_html.innerHTML = `<div class="block-header">Message</div>`;
            is_first = false;
        }
        else
            title = `Re: ${posts.title}`;

        let content_html = document.createElement("div");
        content_html.innerHTML.trim();
        content_html.classList.add("block-content");
        content_html.innerHTML += `<div class="mini-title">${title}</div>`;

        let author = await fetch_user(post_message.author_id);
        let time = new Date(post_message.time_posted);
        let time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        content_html.innerHTML += `<div class="author">#${i + 1} by <a href="./user.html?id=${author.id}">${author.name}</a> » <time datetime="${time.toJSON()}">${time_str}</time></div>`;
        content_html.innerHTML += `<div class="post-content">${post_message.content}</div>`;

        inner_html.append(content_html);
        html.append(inner_html);
    }

    html.innerHTML += `<div class="post-footer"><a href="" class="reply" title="Post a reply (This does not work lmao)">Post Reply</a><div class="pages-details">${number_of_post_messages} post(s) • Page <b>${page}</b> of <b>${Math.ceil(number_of_post_messages / post_messages_per_page)}</b></div>`
    return html;
}

/**
 * Get the 404 html DOM
 * @return {HTMLDivElement}
 */
function get_404_html() {
    let html = document.createElement("div")
    html.innerHTML = `<div class="block not-found"><div class="block-content"><h2>404 Not Found</h2><hr><a href='./' class="go-back"><h3>Would you like to go back?</h3></a></div></div>`;
    return html;
}
