export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { title, shopee_link, image_url } = await request.json();

    if (!title || !shopee_link || !image_url) {
      return new Response("Data tidak lengkap", { status: 400 });
    }

    // Insert data ke Cloudflare D1
    await env.DB.prepare(
      "INSERT INTO postingan (title, shopee_link, image_url) VALUES (?, ?, ?)"
    ).bind(title, shopee_link, image_url).run();

    return new Response("Sukses", { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
