const posts_json_uri = "../../json/forum.json"

async function render_post() {
    const html = await get_post_html();
    document.body.append(html);
}

async function get_post_html() {
    const searchParams = new URLSearchParams(window.location.search);

    if (!searchParams.has("id")) {
        console.log("ID parameter not found");
        return get_404_html();
    }

    const post_id = parseInt(searchParams.get("id"));
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

        if (is_first) {
            var title = post.title;
            is_first = false;
        }
        else
            title = `Re: ${post.title}`

        inner_html.innerHTML = `<div class="mini-title">${title}</div><div class="author-details">by ${message.author_details.name} ${message.time_posted}</div><div class="content">${message.content}</div>`
        html.append(inner_html);
    }

    return html;
}

function get_404_html() {
    let html = document.createElement("div")
    html.innerHTML.trim();
    html.classList.add("not-found");
    html.innerHTML = `<h1>404 Not Found</h1><a href='./'><h2>Would you like to go back?</h2></a>`;
    return html;
}

async function fetch_post(id) {
    const response = await fetch(posts_json_uri);
    const json = await response.json();

    for (const post of json) {
        if (post.id === id)
            return post;
    }
    return null;
}