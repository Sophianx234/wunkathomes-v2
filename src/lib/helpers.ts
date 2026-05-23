export function formatLeaseTerm(leaseTerm: string | null | undefined): string {
  if (!leaseTerm) return '';
  
  const words = leaseTerm.split('_');
  const firstWord = words[0];
  
  // Drop the number only if it's exactly 1
  const filtered = (!isNaN(Number(firstWord)) && Number(firstWord) === 1)
    ? words.slice(1)
    : words;
  
  const readable = filtered
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
    
  return `/ ${readable}`;
}