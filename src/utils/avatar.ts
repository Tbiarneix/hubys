export function getInitials(name: string): string {
  if (!name) return '';
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function getPastelColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Génère des composantes pastel en utilisant une base claire
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`; // Saturation à 70% et luminosité à 85% pour des couleurs pastel
}

export function generateAvatarUrl(name: string): string {
  const initials = getInitials(name);
  const color = getPastelColor(name);
  
  // Crée un SVG avec les initiales
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}" rx="50" ry="50"/>
      <text
        x="50"
        y="50"
        dy="0.35em"
        fill="#000000"
        font-family="Arial"
        font-size="40"
        text-anchor="middle"
        opacity="0.7"
      >${initials}</text>
    </svg>
  `;

  // Encode le SVG pour l'utiliser comme URL
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
