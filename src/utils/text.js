/** Lower-cases `text` and strips accents so "Résumé" matches "resume". */
export const normalizeText = (text) =>
  String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
