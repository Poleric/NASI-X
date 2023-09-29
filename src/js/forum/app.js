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

        let author = await fetch_user(first_message.author_id);
        let time = new Date(first_message.time_posted);
        let time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        row_html.innerHTML = "<td class='block-content'>"
            + `<div><a href="./posts.html?id=${post.id}">${post.title}</a></div>`
            + `<div class="author">by <a href="./user.html?id=${author.id}">${author.name}</a> » <time datetime="${time.toJSON()}">${time_str}</time></div>`
            + "</td>";

        row_html.innerHTML += `<td class="block-content">${number_of_post_messages - 1}</td>`;
        row_html.innerHTML += `<td class="block-content">${post.views}</td>`;

        author = await fetch_user(last_message.author_id);
        time = new Date(last_message.time_posted);
        time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        row_html.innerHTML += "<td class='block-content'>"
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
        console.log(`post id ${id} is not found.`);
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
        content_html.innerHTML += `<div class="mini-title">${title}<img src="https://www.svgrepo.com//show/220662/like.svg" class="like-button" alt=""></div>`;

        let author = await fetch_user(post_message.author_id);
        let time = new Date(post_message.time_posted);
        let time_str = `${time.getFullYear()}-${time.getMonth()}-${time.getDate()} ${time.getHours()}:${time.getMinutes()}`;
        content_html.innerHTML += `<div class="author">#${i + 1} by <a href="./user.html?id=${author.id}">${author.name}</a> » <time datetime="${time.toJSON()}">${time_str}</time></div>`
             + "<hr>"
             +  `<div class="post-content">${post_message.content}</div>`;

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

/**
 * Renders and add user onto the DOM.
 */
async function render_user_page() {
    const user_id = get_url_param("id");
    const html = await get_user_html(user_id);
    document.body.querySelector("div.content").replaceWith(html);
}

/**
 * Get the html content of a user
 * @param {String} id The user id
 * @return {HTMLDivElement}
 */
async function get_user_html(id) {
    const html = document.createElement("div")
    html.classList.add("content");

    const user = await fetch_user(id);
    if (!user) {
        console.log(`user id ${id} is not found.`);
        html.innerHTML = get_404_html().innerHTML;
        return html;
    }
    const [last_thread, last_post] = await fetch_user_last_post(id);

    time_joined = new Date(user.time_joined);
    time_joined_str = `${time_joined.getFullYear()}-${time_joined.getMonth()}-${time_joined.getDate()} ${time_joined.getHours()}:${time_joined.getMinutes()}`;
    if (last_thread) {
        var last_post_time = new Date(last_post.time_posted);
        var last_post_time_str = `${last_post_time.getFullYear()}-${last_post_time.getMonth()}-${last_post_time.getDate()} ${last_post_time.getHours()}:${last_post_time.getMinutes()}`;
    }

    html.innerHTML += `<h2>Viewing profile - ${user.name}</h2>`;
    html.innerHTML = "<div class='block'><div class='user-info'>"
        + "<div class='block-header'>User Info</div><div class='block-header'>Other Infos</div>"
        + `<div class='block-content user-left'>`
        + (user.avatar_url ? `<img src="${user.avatar_url}" alt="" class='avatar' width="250px">` : "")
        + "<ul>"
        + `<li><div class='info-field'>Username:</div><div class='info'>${user.name}</div></li>`
        + `<li><div class='info-field'>Time joined:</div><div class="info"><time datetime="${time_joined.toJSON()}">${time_joined_str}</time></div></li>`
        + `<li><div class='info-field'>Number of posts:</div><div class="info">${user.post_history}</div></li>`
        + (last_thread ? `<li class="last-post"><div class='info-field'>Last post:</div><div class="info">in <a href="./posts.html?id=${last_thread.id}">${last_thread.title}</a> at <time datetime="${last_post_time.toJSON()}">${last_post_time_str}</time></div></li>` : "")
        + `<li class='bio'><div class='info-field'>Bio:</div><div class='info'>${user.bio}</div></li>`
        + "</ul>"
        + "</div>"
        + "<div class='block-content user-right'>"
        + `<div>User is thanked a total of <b>${user.thanks}</b> times.</div>`
        + (last_thread ? ("<div class='last-post block'><div class='block-header'>Last post</div><div class='block-content'>"
        + `<div class="mini-title">${last_thread.title}</div>`
        + `<div class="author">by <a href="./user.html?id=${user.id}">${user.name}</a> » <time datetime="${last_post_time.toJSON()}">${last_post_time_str}</time></div>`
        + "<hr>"
        + `<div class="post-content">${last_post.content}</div>`
        + "</div></div>") : "")
        + "</div>"
        + "</div></div>";

    return html;
}

/**
 * Shorthand for retrieving the post data of user last post.
 * @param id {String} User id
 * @return {Array[JSON]} THe post data of the user last post
 */
async function fetch_user_last_post(id) {
    const user = await fetch_user(id);
    if (!user.last_post_id)
        return [null, null];

    const [post_id, index] = user.last_post_id.split("-");

    const thread = await fetch_post(post_id);
    return [thread, thread.posts[parseInt(index)]];  // god i love looking at the shit filled code i made
}

