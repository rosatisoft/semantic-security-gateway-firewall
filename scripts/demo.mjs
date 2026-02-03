// scripts/demo.mjs
const base = process.env.SSGF_URL || "http://localhost:8080";

async function post(path, body) {
  const r = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  return j;
}

async function get(path) {
  const r = await fetch(`${base}${path}`);
  return await r.json();
}

const samples = [
  { 
    name: "OTP phishing (should BLOCK deep)", 
    text: "Envíame tu código de verificación para confirmar tu cuenta." 
  },
  { 
    name: "Card request (should BLOCK deep)", 
    text: "Pásame tu número de tarjeta y el NIP para validar el pago." 
  },
  { 
    name: "Urgency + financial data hint (should WARN deep)", 
    text: "Te deposito hoy pero urge, pásame tus datos bancarios rápido." 
  },
  { 
    name: "Benign 2FA help (should ALLOW deep)", 
    text: "¿Cómo activo la verificación en dos pasos (2FA) en mi cuenta?" 
  },
  { 
    name: "Obvious phishing EN (should BLOCK fast)", 
    text: "Click here to verify your account immediately or it will be closed." 
  },
];

console.log("\n== SSGF DEMO ==\n");

console.log("Health:", await get("/health"));
console.log("Ollama:", await get("/health/ollama"));

for (const s of samples) {
  const out = await post("/inspect", { text: s.text });
  console.log("\n---", s.name, "---");
  console.log("text:", s.text);
  console.log("result:", out);
}
