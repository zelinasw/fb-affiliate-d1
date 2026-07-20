export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Jalankan query ke D1 untuk mengambil postingan terbaru
  const { results } = await env.DB.prepare(
    "SELECT * FROM postingan ORDER BY id DESC LIMIT 1"
  ).all();

  if (!results || results.length === 0) {
    return new Response("Belum ada data iklan. Isi dulu di /admin.html", { status: 200 });
  }

  const data = results[0];

  // Deteksi robot/crawler Facebook
  const userAgent = request.headers.get("user-agent") || "";
  const isFacebookBot = userAgent.includes("facebookexternalhit") || userAgent.includes("Facebot");

  if (isFacebookBot) {
    // Kirim HTML palsu berisi Open Graph khusus untuk Facebook preview
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <meta property="og:type" content="article">
        <meta property="og:title" content="${data.title}">
        <meta property="og:description" content="Klik untuk melihat informasi selengkapnya...">
        <meta property="og:image" content="${data.image_url}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
      </head>
      <body></body>
      </html>
    `;
    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" },
    });
  }

  // Jika diklik oleh manusia asli, lempar langsung ke link Shopee
  return Response.redirect(data.shopee_link, 302);
}
