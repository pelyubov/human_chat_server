export function pinCodeGen(): string {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .padStart(6, '0');
}
