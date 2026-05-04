var SERVICE_ACCOUNT_EMAIL = "openclaw-agent@killergrowth.iam.gserviceaccount.com";
var IMPERSONATE_USER = "notifications@killergrowth.com";
var TO_EMAIL = "service@iservefacilities.com";
var FROM_NAME = "IServe Facilities Website";
var TOKEN_URI = "https://oauth2.googleapis.com/token";
var GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";
var PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDwW503MpsZnSok
WdKCxI4oSAGztnmWRQkpmoiTokgnjyjYU1Mmg5YWPsgEA3TsiAYdoBJDMlXrHAZ0
EVokgFc/qTxHhVVclsd5FrBOheh4CPD+9w9tmOB3b3hMlWVeuu22Lvqj9Np/cUA6
5zydPDzVu4Id9hyPLgyaXILuMWhsb+Enof4rkUodNAZyaubt9dscVHuNK8TNts1X
XbaPFiDuDwZU5DYUNQ9pg5nPWuddOFAkscqvSM6c6PmM4n8omtQYk0hOsROTTJNL
V+T5FAOkcZHEvJZuOCPTvLNMGUUdZ4d/IWXZ3kT4O2ldO+rI9hSBxPGjAsQSqjn7
VfYXs3eJAgMBAAECggEAQp3hsQ7BlhPNPk323m+Dxv5OGnUUteVkaLd/6wsrXGt9
MpfFkAMgcgHshdA/c98vcr6O0Tj+Py+BSmIUzdEUXXyWTGxUAFl558G2E81hZQN1
Z/UpvYKFlBS9DtzJP7wnbjsPFKokdPX6i1jTn/C2G7bglVVFDRoCPDYvw7zF6GeA
OnQc/EYL1+TiZEQDIwhrsyHH9D8doOsxmZA+kRj/oeVIZu7odspQYfwHktIrRCxs
c7x/sdDa2Qm/gxW1NJ/19KYJG1MZv6/6qzpnKvw7mdN3gJU62I+DB81mSaDupfNw
lnEGP8DX627x5EnKy18stbsItguJZwVktNjgNo0rEQKBgQD/2MED4ebhWavi1TvV
vwLKF21ZuBCQJVxXOWRfVGX4oOziMqoklnW37wBWdCkX4fYisQ8sBHFOqNsPc1NR
WWvWrLu+6N+8cg5EvLNC+q8zRNjCpCEizwT38m7uamuUxqgpc9MalV8M3xq20m5n
PeDwk4vKJfA+bxSUUDYUI1QUnwKBgQDwgHv2Dd17ypGFhYdb80+KLQVrJee1aw/X
aPvDVosqO9AyDiq+JQeuzLO5TzftC6PPhz2MB+jaomoi+IGWome5MtjAkeZ3R+R3
x1dr2pqdqb5WFsmhit8fJiHEVN01kb40PlvtVd+RrK2BDjfLSuZZBfX6F14vdim/
rqdkz0Ia1wKBgBOT65k3dSpzaTLPbGe72SPLzSNbcXEGWt2V17dvxunSrq3UgK6S
EOoFUPpMo0Rfly0qbWXJ5T3GsBSrl4mXFSh1SVyfh1dtRug9pF4Qvs1mjEvAsYRv
YQr0M0btP9Q/q2iYo2PaYE6k1+97hNVDp+3g7IaIhqzQZTvAM5Mw7OMzAoGAbWxn
+imQzhP6Zd+9GG75j4qwXnHenMJbcMzJT7T+mHaiYUPk2qKKflOQqg2LCoUzQObt
b9rhbShcVhDvFRRLUQ37ZJJ9Y2QIZR8DfYT2uClU+mJf1uoSXl/BGUzrYMYw3iBJ
PxDFKciBIKjRZeNsLrDxm5oqNjnzAM18R/eswf0CgYA25uaqB9hbOXczmxJckfsT
3Mnx6XL0engPimkV1h0CD5cOj7ACNSwYkigJg7IX4oqJcwsKgPhARUG/Zs0A1Oyb
QxnI6r1jtCsKqOKaSsrpyFLU2koMM3ISDCINqbxzbzG89/3hhFPvRDcPpS8Cv/5r
cmN67293tv6yNbZ3PURW0w==
-----END PRIVATE KEY-----`;

var CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }
  try {
    const formData = await request.json();
    await sendContactEmail(formData);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Worker error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
}

async function sendContactEmail(formData) {
  const accessToken = await getGmailAccessToken();
  const emailHtml = buildEmailHtml(formData);
  const subject = "New Contact Form Submission - IServe Facilities";
  const messageParts = [
    `From: "${FROM_NAME}" <${IMPERSONATE_USER}>`,
    `To: ${TO_EMAIL}`,
    `Reply-To: ${formData.email || IMPERSONATE_USER}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    emailHtml
  ];
  const rawMessage = messageParts.join("\r\n");
  const encodedMessage = base64urlEncodeString(rawMessage);
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: encodedMessage })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API error ${res.status}: ${errText}`);
  }
}

async function getGmailAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    sub: IMPERSONATE_USER,
    scope: GMAIL_SCOPE,
    aud: TOKEN_URI,
    iat: now,
    exp: now + 3600
  };
  const privateKey = await importPrivateKey(PRIVATE_KEY_PEM);
  const jwt = await createJWT(privateKey, payload);
  const tokenRes = await fetch(TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });
  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Token fetch failed ${tokenRes.status}: ${errText}`);
  }
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function importPrivateKey(pem) {
  const pemBody = pem.replace("-----BEGIN PRIVATE KEY-----", "").replace("-----END PRIVATE KEY-----", "").replace(/\s/g, "");
  const binaryDer = atob(pemBody);
  const bytes = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    bytes[i] = binaryDer.charCodeAt(i);
  }
  return crypto.subtle.importKey("pkcs8", bytes.buffer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

async function createJWT(privateKey, payload) {
  const header = { alg: "RS256", typ: "JWT" };
  const encHeader = base64urlEncodeString(JSON.stringify(header));
  const encPayload = base64urlEncodeString(JSON.stringify(payload));
  const signingInput = `${encHeader}.${encPayload}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(signingInput));
  const encSignature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${signingInput}.${encSignature}`;
}

function base64urlEncodeString(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildEmailHtml(f) {
  const fields = [
    ["Name", f.name],
    ["Phone", f.phone],
    ["Email", f.email],
    ["City", f.city],
    ["Service Needed", f.service_needed]
  ].filter(([, v]) => v);
  const rows = fields.map(([label, value]) => `
  <tr>
    <td style="padding:12px 16px;font-weight:600;color:#1e3a8a;background:#f0f4ff;width:160px;border-bottom:1px solid #dce6ff;vertical-align:top;">${label}</td>
    <td style="padding:12px 16px;color:#374151;background:#ffffff;border-bottom:1px solid #dce6ff;">${escapeHtml(value)}</td>
  </tr>`).join("");
  const messageRow = f.message ? `
  <tr>
    <td colspan="2" style="padding:20px 24px;background:#f9fafb;border-top:2px solid #4068DF;">
      <div style="font-weight:700;color:#1e3a8a;margin-bottom:10px;font-size:14px;text-transform:uppercase;letter-spacing:0.5px;">Message</div>
      <div style="color:#374151;white-space:pre-wrap;line-height:1.7;font-size:15px;">${escapeHtml(f.message)}</div>
    </td>
  </tr>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Contact Form Submission</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
        <tr><td style="background:#1e3a8a;padding:32px;text-align:center;">
          <div style="color:#ffffff;font-size:26px;font-weight:700;letter-spacing:1px;">IServe Facilities</div>
          <div style="color:#93c5fd;font-size:13px;margin-top:6px;letter-spacing:0.5px;">COMMERCIAL CLEANING &amp; FACILITY SERVICES</div>
        </td></tr>
        <tr><td style="background:#4068DF;padding:14px 32px;">
          <div style="color:#ffffff;font-size:15px;font-weight:600;">New Contact Form Submission</div>
        </td></tr>
        <tr><td style="padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            ${rows}
            ${messageRow}
          </table>
        </td></tr>
        <tr><td style="background:#f0f4ff;padding:24px 32px;text-align:center;">
          <a href="mailto:${escapeHtml(f.email || "")}" style="display:inline-block;background:#4068DF;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-weight:600;font-size:15px;">
            Reply to ${escapeHtml(f.name || "Sender")}
          </a>
        </td></tr>
        <tr><td style="background:#1e3a8a;padding:18px 32px;text-align:center;">
          <div style="color:#93c5fd;font-size:12px;">This message was submitted via the IServe Facilities website contact form.</div>
          <div style="color:#64748b;font-size:11px;margin-top:4px;">iserve-facilities.pages.dev</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
