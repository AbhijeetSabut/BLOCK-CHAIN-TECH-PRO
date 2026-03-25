export const generateAccessCode = () =>
  Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");

export const normalizeAccessCode = (value = "") =>
  String(value).replace(/\D/g, "").slice(0, 16);

export const formatAccessCode = (value = "") =>
  normalizeAccessCode(value).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
