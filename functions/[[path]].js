export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Mengambil text slug dari URL (contoh: '/viral-terbaru' menjadi 'viral-terbaru')
  const slug = url.pathname.replace(/^\/|\/$/g, '');

  // Jika mengakses root/domain utama tanpa path, atau mengakses admin.html, biarkan lewat ke file statis
  if (slug === "" || slug === "admin.html" || slug.startsWith("api/")) {
    return context.next();
  }

  // Cari data di D1 yang slug-nya cocok dengan URL
  const data = await env.DB.prepare(
    "SELECT * FROM postingan WHERE slug = ? LIMIT 1"
  ).bind(slug).first();

  // Jika slug tidak ditemukan di database
  if (!data) {
    return new Response("Halaman berita tidak ditemukan atau telah kedaluwarsa.", { status: 404 });
  }

  // Deteksi robot/crawler Facebook
  const userAgent = request.headers.get("user-agent") || "";
  const isFacebookBot = userAgent.includes("facebookexternalhit") || userAgent.includes("Facebot");

  if (isFacebookBot) {
    // Kirim HTML Open Graph sesuai data slug tersebut
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

  // Jika diklik manusia asli, alihkan langsung ke link Shopee-nya
  return Response.redirect(data.shopee_link, 302);
}
