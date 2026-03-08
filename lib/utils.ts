export function generateRegistrationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "YC-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
