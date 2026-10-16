export function partnerBackdrop(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 36;
  return `hsl(${hue + 10} 18% ${38 + (hash % 12)}%)`;
}
