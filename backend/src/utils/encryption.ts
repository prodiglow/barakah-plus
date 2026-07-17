import crypto from "crypto";

const algorithm = "aes-256-cbc";
const ivLength = 16; 
const secretKey = process.env.CARD_SECRET_KEY || "12345678901234567890123456789012";

// ✅ Validate key length
if (secretKey.length !== 32) {
  throw new Error("CARD_SECRET_KEY must be exactly 32 characters long");
}

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "utf8"), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // return IV + encrypted text
  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Decrypts AES-256-CBC text produced by the encrypt() function.
 */
export const decrypt = (data: string): string => {
  const [ivHex, encryptedText] = data.split(":");

  // make sure IV is correctly extracted and 16 bytes long
  const iv = Buffer.from(ivHex, "hex");
  if (iv.length !== ivLength) {
    throw new Error("Invalid IV length in encrypted data");
  }

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "utf8"), iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
