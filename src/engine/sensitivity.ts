export type SensitivityHit = {
  hit: boolean;
  triggers: string[];
};

const TRIGGERS: Array<{ id: string; patterns: RegExp[] }> = [
  {
    id: "auth_code_request",
    patterns: [
      // Español (con o sin acentos)
      /\bc[oó]digo de verificaci[oó]n\b/i,
      /\bcodigo de verificacion\b/i,
      /\bcodigo\b.*\bverificacion\b/i,
      /\bconfirm(ar|acion)\b.*\bcuenta\b/i,

      // Inglés
      /\botp\b/i,
      /\b2fa\b/i,
      /\bverification code\b/i,
      /\bone[- ]time\b.*\bcode\b/i,
      /\bauthentication code\b/i
    ]
  },
  {
    id: "credential_request",
    patterns: [
      /\bcontrase[nñ]a\b/i,
      /\bcontrasena\b/i,
      /\bpassword\b/i,
      /\bpin\b/i,
      /\bnip\b/i,
      /\btok(en)?\b/i
    ]
  },
  {
    id: "payment_sensitive",
    patterns: [
      /\btarjeta\b/i,
      /\bcard number\b/i,
      /\bcuenta\b.*\bbanc(aria|o)\b/i,
      /\biban\b/i,
      /\bclabe\b/i
    ]
  }
];

function foldText(text: string) {
  // NFC para unificar acentos compuestos, y luego "fold" para quitar diacríticos
  const nfc = text.normalize("NFC");
  const folded = nfc
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return { nfc, folded };
}

export function detectSensitivity(text: string): SensitivityHit {
  const { nfc, folded } = foldText(text);

  const triggers: string[] = [];
  for (const t of TRIGGERS) {
    const hit =
      t.patterns.some((re) => re.test(nfc)) ||
      t.patterns.some((re) => re.test(folded));

    if (hit) triggers.push(t.id);
  }

  console.log("[SSGF] sensitivity triggers:", triggers);
  return { hit: triggers.length > 0, triggers };
}
