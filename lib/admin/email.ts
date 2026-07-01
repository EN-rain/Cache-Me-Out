import nodemailer from "nodemailer";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBackoff(send: () => Promise<void>): Promise<void> {
  const attempts = parseInt(process.env.EMAIL_RETRY_ATTEMPTS ?? "3", 10) || 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await send();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(250 * 2 ** (attempt - 1));
      }
    }
  }

  throw lastError;
}

async function sendViaResend(
  adminEmail: string,
  verifyUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [adminEmail],
      subject: "Cache Me Outside — Admin Access",
      html: `<p>Use this link to verify admin access (expires in 10 minutes):</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Enter the code from your authenticator app on the verification page.</p>`,
      text: `Use this link to verify admin access (expires in 10 minutes):\n\n${verifyUrl}\n\nEnter the code from your authenticator app on the verification page.`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend failed: ${err}`);
  }
}

async function sendViaSmtp(
  adminEmail: string,
  verifyUrl: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? "587", 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@cachemeoutside.example",
    to: adminEmail,
    subject: "Cache Me Outside — Admin Access",
    text: `Use this link to verify admin access (expires in 10 minutes):\n\n${verifyUrl}\n\nEnter the code from your authenticator app on the verification page.`,
    html: `<p>Use this link to verify admin access (expires in 10 minutes):</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Enter the code from your authenticator app on the verification page.</p>`,
  });
}

export async function sendMagicLinkEmail(verifyUrl: string): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[admin] ADMIN_EMAIL not configured");
    return;
  }

  const emailEnabled = process.env.EMAIL_ENABLED === "true";

  if (!emailEnabled) {
    console.log("[admin] Magic link (dev mode):", verifyUrl);
    return;
  }

  const provider = process.env.EMAIL_PROVIDER ?? (process.env.RESEND_API_KEY ? "resend" : "smtp");

  if (provider === "resend") {
    await withBackoff(() => sendViaResend(adminEmail, verifyUrl));
    return;
  }

  await withBackoff(() => sendViaSmtp(adminEmail, verifyUrl));
}
