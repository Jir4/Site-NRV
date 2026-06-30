export function obfuscatePhone(phone: string): string {
  const CIPHER: Record<string, string> = {
    "0": "m",
    "1": "n",
    "2": "p",
    "3": "q",
    "4": "r",
    "5": "s",
    "6": "t",
    "7": "u",
    "8": "v",
    "9": "w",
    ".": "x",
    " ": "y",
  };
  return phone.split("").map((c) => CIPHER[c] ?? c).join("");
}

const DECIPHER: Record<string, string> = {
  m: "0", n: "1", p: "2", q: "3", r: "4",
  s: "5", t: "6", u: "7", v: "8", w: "9",
  x: ".", y: " ",
};

export function revealPhones(): void {
  document.querySelectorAll("[data-phone]").forEach((el) => {
    const raw = el.getAttribute("data-phone");
    if (!raw) return;
    const decoded = [...raw].map((c) => DECIPHER[c] ?? c).join("");
    const digits = decoded.replace(/[^\d]/g, "");
    const displayMode = el.getAttribute("data-phone-display") ?? "text";

    if (displayMode !== "none") {
      el.textContent = decoded;
    }

    if (el instanceof HTMLAnchorElement) {
      el.href = `tel:${digits}`;
    }
  });
}
