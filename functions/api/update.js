export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { slug, title, shopee_link, image_url } = await request.json();

    if (!slug || !title || !shopee_link || !image_url) {
      return new Response("Data tidak lengkap", { status: 400 });
    }

    // Cek dulu apakah slug sudah pernah dipakai
    const existing = await env.DB.prepare("SELECT id FROM postingan WHERE slug = ?").bind(slug).first();
    
    if (existing) {
      // Jika slug sudah ada, kita update data yang lama saja
      await env.DB.prepare(
        "UPDATE postingan SET title = ?, shopee_link = ?, image_url = ? WHERE slug = ?"
      ).bind(title, shopee_link, image_url, slug).run();
    } else {
      // Jika belum ada, masukkan sebagai data baru
      await env.DB.prepare(
        "INSERT INTO postingan (slug, title, shopee_link, image_url) VALUES (?, ?, ?, ?)"
      ).bind(slug, title, shopee_link, image_url).run();
    }

    return new Response("Sukses", { status: 200 });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
