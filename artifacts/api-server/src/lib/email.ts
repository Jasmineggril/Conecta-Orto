/**
 * Email service using Resend HTTP API.
 * Set RESEND_API_KEY in environment secrets to enable.
 * Without the key, emails are logged to console only (dev mode).
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "Conecta Orto <noreply@conectaorto.com.br>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Dev mode — log to console
    console.log(`[EMAIL DEV] To: ${opts.to}`);
    console.log(`[EMAIL DEV] Subject: ${opts.subject}`);
    console.log(`[EMAIL DEV] Body (HTML, truncated): ${opts.html.slice(0, 200)}...`);
    return { success: true };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[EMAIL ERROR]", err);
      return { success: false, error: err };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[EMAIL EXCEPTION]", err);
    return { success: false, error: err.message };
  }
}

export function buildConfirmationEmail(opts: {
  name: string;
  confirmUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Confirme sua inscrição — Conecta Orto</title></head>
<body style="margin:0;padding:0;background:#0A1628;font-family:Inter,Arial,sans-serif;color:#fff">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 20px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#0D1F3C;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)">
      <!-- Top bar -->
      <tr><td style="background:linear-gradient(90deg,#1E6FFF,#60a5fa,#1E6FFF);height:6px"></td></tr>
      <!-- Header -->
      <tr><td align="center" style="padding:40px 40px 24px">
        <div style="font-size:28px;font-weight:800;letter-spacing:-0.5px">
          <span style="color:#1E6FFF">Conecta</span><span style="color:#fff"> Orto</span>
        </div>
        <div style="color:#9ca3af;font-size:13px;margin-top:4px">O Futuro dos Implantes Ortopédicos</div>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:0 40px 40px">
        <h2 style="color:#fff;font-size:22px;margin:0 0 16px">Olá, ${opts.name}!</h2>
        <p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 12px">
          Recebemos seu cadastro no <strong style="color:#fff">Conecta Orto 2026 — O Futuro dos Implantes Ortopédicos</strong>.
        </p>
        <p style="color:#d1d5db;font-size:15px;line-height:1.7;margin:0 0 24px">
          Para confirmar sua inscrição e garantir sua vaga, clique no botão abaixo. 
          <strong style="color:#fbbf24">Sua inscrição só será válida após a confirmação.</strong>
        </p>
        <!-- CTA Button -->
        <div style="text-align:center;margin:32px 0">
          <a href="${opts.confirmUrl}" 
             style="display:inline-block;background:#1E6FFF;color:#fff;text-decoration:none;
                    font-weight:700;font-size:16px;padding:16px 40px;border-radius:10px;
                    letter-spacing:0.3px">
            ✅ Confirmar minha inscrição
          </a>
        </div>
        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 8px">
          Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
        </p>
        <p style="color:#60a5fa;font-size:12px;word-break:break-all;margin:0 0 24px">
          ${opts.confirmUrl}
        </p>
        <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px">
          <p style="color:#4b5563;font-size:12px;margin:0">
            📅 09 de Julho de 2026 &nbsp;•&nbsp; 📍 Universidade do Distrito Federal Professor Jorge Amaury Maia Nunes — UnDF, Lago Norte, Brasília — DF
          </p>
          <p style="color:#4b5563;font-size:12px;margin:8px 0 0">
            Verifique também a caixa de spam. Este e-mail foi gerado automaticamente, não responda.
          </p>
        </div>
      </td></tr>
      <!-- Bottom bar -->
      <tr><td style="background:linear-gradient(90deg,#1E6FFF,#60a5fa,#1E6FFF);height:4px"></td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}
