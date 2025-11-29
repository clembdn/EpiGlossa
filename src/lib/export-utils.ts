import { jsPDF, type TextOptionsLight } from 'jspdf';

export interface ExportStats {
  userName: string;
  email: string;
  memberSince: string;
  totalXp: number;
  correctCount: number;
  successRate: number;
  currentStreak: number;
  longestStreak: number;
  categoryScores: Array<{
    category: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
  toeicTests: Array<{
    date: string;
    score: number;
    listening: number;
    reading: number;
  }>;
  lessonsCompleted: number;
  badgesUnlocked: number;
  totalBadges: number;
}

export type SharePlatform = 
  | 'whatsapp' 
  | 'instagram' 
  | 'twitter' 
  | 'facebook' 
  | 'telegram' 
  | 'linkedin' 
  | 'email' 
  | 'copy' 
  | 'download' 
  | 'native';

export interface ShareOption {
  id: SharePlatform;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

const DEFAULT_SHARE_URL = 'https://epiglossa.com';

const sanitizeForPdf = (value: string): string => {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getShareLandingUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_SHARE_URL;
};

/**
 * Available share platforms with their styling
 */
export const SHARE_PLATFORMS: ShareOption[] = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366', bgColor: '#dcfce7' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#E4405F', bgColor: '#fce7f3' },
  { id: 'twitter', name: 'X (Twitter)', icon: '🐦', color: '#1DA1F2', bgColor: '#dbeafe' },
  { id: 'facebook', name: 'Facebook', icon: '👍', color: '#1877F2', bgColor: '#dbeafe' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: '#0088CC', bgColor: '#e0f2fe' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', bgColor: '#dbeafe' },
  { id: 'email', name: 'Email', icon: '✉️', color: '#6B7280', bgColor: '#f3f4f6' },
  { id: 'copy', name: 'Copier le lien', icon: '📋', color: '#8B5CF6', bgColor: '#ede9fe' },
  { id: 'download', name: 'Télécharger', icon: '⬇️', color: '#10B981', bgColor: '#d1fae5' },
];

/**
 * Generate a CSV export of user progress data
 */
export function generateCSV(stats: ExportStats): string {
  const lines: string[] = [];

  // Header section
  lines.push('EpiGlossa - Export de progression');
  lines.push(`Date d'export,${new Date().toLocaleDateString('fr-FR')}`);
  lines.push('');

  // User info
  lines.push('=== Informations utilisateur ===');
  lines.push(`Nom,${stats.userName || 'Non renseigné'}`);
  lines.push(`Email,${stats.email}`);
  lines.push(`Membre depuis,${stats.memberSince}`);
  lines.push('');

  // Global stats
  lines.push('=== Statistiques globales ===');
  lines.push(`XP Total,${stats.totalXp}`);
  lines.push(`Questions réussies,${stats.correctCount}`);
  lines.push(`Taux de réussite,${stats.successRate}%`);
  lines.push(`Série actuelle,${stats.currentStreak} jours`);
  lines.push(`Record série,${stats.longestStreak} jours`);
  lines.push(`Badges débloqués,${stats.badgesUnlocked}/${stats.totalBadges}`);
  lines.push('');

  // Category breakdown
  if (stats.categoryScores.length > 0) {
    lines.push('=== Performance par catégorie ===');
    lines.push('Catégorie,Réussies,Total,Pourcentage');
    stats.categoryScores.forEach((cat) => {
      lines.push(`${cat.category},${cat.correct},${cat.total},${cat.percentage}%`);
    });
    lines.push('');
  }

  // TEPITECH tests
  if (stats.toeicTests.length > 0) {
  lines.push('=== Historique TEPITECH Blanc ===');
    lines.push('Date,Score Total,Listening,Reading');
    stats.toeicTests.forEach((test) => {
      lines.push(`${test.date},${test.score},${test.listening},${test.reading}`);
    });
  }

  return lines.join('\n');
}

/**
 * Trigger download of a CSV file
 */
export function downloadCSV(stats: ExportStats): void {
  const csv = generateCSV(stats);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `epiglossa-progression-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a PDF export of user progress data - Colorful version
 */
export function downloadPDF(stats: ExportStats): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 0;

  const ensureSpace = (needed = 20) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const safeText = (text: string | number): string =>
    sanitizeForPdf(typeof text === 'number' ? String(text) : text);

  const drawText = (
    text: string | number,
    x: number,
    yPos: number,
    options?: TextOptionsLight
  ) => {
    const value = safeText(text);
    if (value) {
      doc.text(value, x, yPos, options);
    }
  };

  // === COLORFUL HEADER BACKGROUND ===
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 55, 'F');
  doc.setFillColor(139, 92, 246);
  doc.ellipse(pageWidth - 20, 10, 40, 35, 'F');
  doc.setFillColor(217, 70, 239);
  doc.ellipse(30, 50, 25, 20, 'F');

  // Title
  y = 22;
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  drawText('EpiGlossa', pageWidth / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(224, 231, 255);
  drawText('Rapport de progression TEPITECH', pageWidth / 2, y, { align: 'center' });
  y += 8;
  doc.setFontSize(10);
  drawText(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, y, { align: 'center' });
  y = 65;

  // === USER INFO CARD ===
  ensureSpace(40);
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 4, 4, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 32, 4, 4, 'S');

  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81);
  drawText(`Nom : ${stats.userName || 'Apprenant'}`, margin + 7, y + 12);
  drawText(`Email : ${stats.email}`, margin + 7, y + 21);
  drawText(`Membre depuis : ${stats.memberSince}`, pageWidth / 2, y + 12);
  drawText(`Badges : ${stats.badgesUnlocked}/${stats.totalBadges}`, pageWidth / 2, y + 21);
  y += 44;

  // === MAIN STATS BOXES (colorful) ===
  const boxWidth = 42;
  const boxHeight = 32;
  const boxSpacing = 6;
  const startX = (pageWidth - (boxWidth * 4 + boxSpacing * 3)) / 2;
  const renderStatBox = (x: number, value: string | number, label: string, color: [number, number, number]) => {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, boxWidth, boxHeight, 4, 4, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    drawText(value, x + boxWidth / 2, y + 14, { align: 'center' });
    doc.setFontSize(8);
    drawText(label, x + boxWidth / 2, y + 24, { align: 'center' });
  };

  renderStatBox(startX, stats.totalXp, 'XP total', [59, 130, 246]);
  renderStatBox(startX + boxWidth + boxSpacing, `${stats.successRate}%`, 'Réussite', [34, 197, 94]);
  renderStatBox(startX + (boxWidth + boxSpacing) * 2, `${stats.currentStreak} j`, 'Série', [249, 115, 22]);
  renderStatBox(startX + (boxWidth + boxSpacing) * 3, stats.correctCount, 'Réponses justes', [168, 85, 247]);

  y += boxHeight + 12;

  // === SECONDARY STATS ROW ===
  const smallBoxWidth = 55;
  const smallBoxHeight = 22;
  const smallStartX = (pageWidth - (smallBoxWidth * 3 + boxSpacing * 2)) / 2;

  const renderMiniBox = (
    x: number,
    label: string,
    value: string,
    fill: [number, number, number],
    textColor: [number, number, number]
  ) => {
    doc.setFillColor(fill[0], fill[1], fill[2]);
    doc.roundedRect(x, y, smallBoxWidth, smallBoxHeight, 3, 3, 'F');
    doc.setFontSize(12);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    drawText(value, x + smallBoxWidth / 2, y + 10, { align: 'center' });
    doc.setFontSize(7);
    drawText(label, x + smallBoxWidth / 2, y + 17, { align: 'center' });
  };

  renderMiniBox(smallStartX, 'Record série', `${stats.longestStreak} j`, [254, 243, 199], [180, 83, 9]);
  renderMiniBox(
    smallStartX + smallBoxWidth + boxSpacing,
    'Leçons complétées',
    String(stats.lessonsCompleted),
    [220, 252, 231],
    [22, 163, 74]
  );
  renderMiniBox(
    smallStartX + (smallBoxWidth + boxSpacing) * 2,
  'TEPITECH blancs',
    String(stats.toeicTests.length),
    [224, 231, 255],
    [79, 70, 229]
  );

  y += smallBoxHeight + 15;

  // === CATEGORY SCORES SECTION ===
  if (stats.categoryScores.length > 0) {
    ensureSpace(30);
    doc.setFillColor(79, 70, 229);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    drawText('Performance par catégorie', margin + 7, y + 7);
    y += 16;

    const categoryColors: [number, number, number][] = [
      [59, 130, 246],
      [34, 197, 94],
      [249, 115, 22],
      [168, 85, 247],
      [236, 72, 153],
      [20, 184, 166],
      [245, 158, 11],
      [239, 68, 68],
    ];

    stats.categoryScores.forEach((cat, index) => {
      ensureSpace(15);
      const color = categoryColors[index % categoryColors.length];
      const roundedPercentage = Math.round(cat.percentage);

      doc.setFillColor(243, 244, 246);
      doc.roundedRect(margin + 5, y, 110, 8, 2, 2, 'F');

      const fillWidth = Math.max((roundedPercentage / 100) * 110, 4);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin + 5, y, Math.min(fillWidth, 110), 8, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      drawText(`${cat.category} (${cat.correct}/${cat.total})`, margin + 120, y + 6);

      doc.setFontSize(10);
      doc.setTextColor(color[0], color[1], color[2]);
      drawText(`${roundedPercentage}%`, pageWidth - margin - 5, y + 6, { align: 'right' });

      y += 12;
    });

    y += 5;
  }

  // === TEPITECH HISTORY SECTION ===
  if (stats.toeicTests.length > 0) {
    ensureSpace(30);
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 3, 3, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
  drawText('Historique TEPITECH blanc', margin + 7, y + 7);
    y += 16;

    doc.setFillColor(243, 244, 246);
    doc.rect(margin + 5, y, pageWidth - (margin + 5) * 2, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    drawText('Date', margin + 8, y + 5.5);
    drawText('Score', margin + 48, y + 5.5);
    drawText('Listening', margin + 83, y + 5.5);
    drawText('Reading', margin + 123, y + 5.5);
    drawText('Niveau', pageWidth - margin - 10, y + 5.5, { align: 'right' });
    y += 10;

    stats.toeicTests.slice(0, 6).forEach((test, index) => {
      ensureSpace(12);
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin + 5, y - 1, pageWidth - (margin + 5) * 2, 8, 'F');
      }

      let level = 'Débutant';
      let levelColor: [number, number, number] = [239, 68, 68];
      if (test.score >= 860) { level = 'Expert'; levelColor = [34, 197, 94]; }
      else if (test.score >= 730) { level = 'Avancé'; levelColor = [59, 130, 246]; }
      else if (test.score >= 470) { level = 'Intermédiaire'; levelColor = [249, 115, 22]; }

      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      drawText(test.date, margin + 8, y + 4);
      doc.setTextColor(79, 70, 229);
      drawText(String(test.score), margin + 48, y + 4);
      doc.setTextColor(55, 65, 81);
      drawText(String(test.listening), margin + 83, y + 4);
      drawText(String(test.reading), margin + 123, y + 4);
      doc.setTextColor(levelColor[0], levelColor[1], levelColor[2]);
      drawText(level, pageWidth - margin - 10, y + 4, { align: 'right' });
      y += 9;
    });

    if (stats.toeicTests.length > 1) {
      ensureSpace(20);
      const avgScore = Math.round(
        stats.toeicTests.reduce((sum, test) => sum + test.score, 0) / stats.toeicTests.length
      );
      doc.setFillColor(254, 249, 195);
      doc.roundedRect(margin + 5, y, pageWidth - (margin + 5) * 2, 12, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setTextColor(161, 98, 7);
      drawText(`Score moyen : ${avgScore} points`, pageWidth / 2, y + 8, { align: 'center' });
      y += 14;
    }
  }

  // === COLORFUL FOOTER ===
  doc.setFillColor(99, 102, 241);
  doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  drawText('EpiGlossa - Ton coach TEPITECH personnel', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.setFontSize(7);
  drawText('epiglossa.com', pageWidth / 2, pageHeight - 5, { align: 'center' });

  doc.save(`epiglossa-rapport-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Generate a stylized share card as a PNG image
 */
export async function generateShareImage(stats: ExportStats): Promise<Blob | null> {
  // Dynamically import html2canvas to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;

  // Create a temporary container for the share card
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 600px;
    padding: 40px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    border-radius: 24px;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  container.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 28px; font-weight: 800; color: #4f46e5; margin-bottom: 4px;">
          🎯 EpiGlossa
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          Ma progression TEPITECH
        </div>
      </div>
      
      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 24px;">
        <div style="text-align: center; background: linear-gradient(135deg, #dbeafe, #e0e7ff); padding: 16px 24px; border-radius: 16px;">
          <div style="font-size: 32px; font-weight: 700; color: #4f46e5;">${stats.totalXp}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">XP Total</div>
        </div>
        <div style="text-align: center; background: linear-gradient(135deg, #dcfce7, #d1fae5); padding: 16px 24px; border-radius: 16px;">
          <div style="font-size: 32px; font-weight: 700; color: #059669;">${stats.successRate}%</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Réussite</div>
        </div>
        <div style="text-align: center; background: linear-gradient(135deg, #ffedd5, #fef3c7); padding: 16px 24px; border-radius: 16px;">
          <div style="font-size: 32px; font-weight: 700; color: #ea580c;">🔥 ${stats.currentStreak}</div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Jours</div>
        </div>
      </div>
      
      <div style="text-align: center; padding-top: 16px; border-top: 2px dashed #e5e7eb;">
        <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 4px;">
          ${stats.userName || 'Apprenant motivé'}
        </div>
        <div style="font-size: 12px; color: #9ca3af;">
          ${stats.badgesUnlocked} badges débloqués • ${stats.correctCount} questions réussies
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 16px; color: white; font-size: 12px; opacity: 0.9;">
  Rejoint EpiGlossa et prépare ton TEPITECH ! 🚀
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error generating share image:', error);
    return null;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Download the share image
 */
export async function downloadShareImage(stats: ExportStats): Promise<boolean> {
  const blob = await generateShareImage(stats);
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `epiglossa-progression-${new Date().toISOString().split('T')[0]}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Build share text message
 */
function buildShareText(stats: ExportStats): string {
  return `🎯 Ma progression EpiGlossa!\n\n✨ ${stats.totalXp} XP\n📊 ${stats.successRate}% de réussite\n🔥 ${stats.currentStreak} jours de suite\n🏅 ${stats.badgesUnlocked} badges\n\nRejoins-moi sur EpiGlossa pour préparer ton TEPITECH! 🚀`;
}

/**
 * Copy image to clipboard
 */
async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Share to a specific platform
 */
export async function shareToPlatform(
  stats: ExportStats, 
  platform: SharePlatform
): Promise<{ success: boolean; message: string }> {
  const shareText = buildShareText(stats);
  const landingUrl = getShareLandingUrl();
  const fullShareText = `${shareText}\n\n${landingUrl}`;
  const encodedText = encodeURIComponent(fullShareText);
  const encodedUrl = encodeURIComponent(landingUrl);
  const blob = await generateShareImage(stats);

  switch (platform) {
    case 'whatsapp': {
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      return { success: true, message: 'WhatsApp ouvert ! Partage l\'image téléchargée.' };
    }

    case 'instagram': {
      // Instagram doesn't support direct sharing via URL, download image instead
      if (blob) await downloadShareImage(stats);
      return { 
        success: true, 
        message: 'Image téléchargée ! Ouvre Instagram et partage-la en story ou publication.' 
      };
    }

    case 'twitter': {
      window.open(`https://twitter.com/intent/tweet?text=${encodedText}`, '_blank');
      return { success: true, message: 'X (Twitter) ouvert !' };
    }

    case 'facebook': {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
      return { success: true, message: 'Facebook ouvert !' };
    }

    case 'telegram': {
      window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
      return { success: true, message: 'Telegram ouvert !' };
    }

    case 'linkedin': {
      const linkedInUrl = new URL('https://www.linkedin.com/feed/');
      linkedInUrl.searchParams.set('shareActive', 'true');
      // LinkedIn double-décodant systématiquement les paramètres, on encode deux fois pour préserver les caractères spéciaux
      linkedInUrl.searchParams.set('text', encodeURIComponent(fullShareText));
      window.open(linkedInUrl.toString(), '_blank');
      return { success: true, message: 'LinkedIn ouvert ! Le texte est prêt à être publié.' };
    }

    case 'email': {
      const subject = encodeURIComponent('Ma progression EpiGlossa 🎯');
      window.open(`mailto:?subject=${subject}&body=${encodedText}`, '_blank');
      return { success: true, message: 'Email ouvert !' };
    }

    case 'copy': {
      if (blob) {
        const copied = await copyImageToClipboard(blob);
        if (copied) {
          return { success: true, message: 'Image copiée dans le presse-papiers !' };
        }
      }
      // Fallback: copy text
      try {
        await navigator.clipboard.writeText(fullShareText);
        return { success: true, message: 'Texte copié dans le presse-papiers !' };
      } catch {
        return { success: false, message: 'Impossible de copier' };
      }
    }

    case 'download': {
      const success = await downloadShareImage(stats);
      return { 
        success, 
        message: success ? 'Image téléchargée !' : 'Erreur lors du téléchargement' 
      };
    }

    case 'native': {
      if (blob) {
        const file = new File([blob], 'epiglossa-progression.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Ma progression EpiGlossa',
              text: fullShareText,
              files: [file],
            });
            return { success: true, message: 'Partagé !' };
          } catch {
            // User cancelled
            return { success: false, message: 'Partage annulé' };
          }
        }
      }
      return { success: false, message: 'Partage natif non disponible' };
    }

    default:
      return { success: false, message: 'Plateforme non supportée' };
  }
}

/**
 * Check if native share is available (for mobile devices)
 */
export function isNativeShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && 
         typeof navigator.share === 'function' &&
         typeof navigator.canShare === 'function';
}
