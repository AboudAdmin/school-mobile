import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';

/** Escape user/API text before putting it into the generated HTML. */
export const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * Render an HTML document to a PDF and open the native share sheet (save to files, mail, WhatsApp…).
 * Replaces the web's jspdf + html2canvas screenshot approach with the platform's own print engine.
 */
export async function sharePdf(html: string, fileName: string, dialogTitle: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
  // The print engine's own output file sits outside the app's scoped storage (unreadable by the share targets),
  // so take the bytes as base64 and write the PDF into the app cache ourselves.
  const { base64 } = await Print.printToFileAsync({ html, base64: true });
  if (!base64) throw new Error('PDF generation failed');
  const pdf = new File(Paths.cache, `${fileName.replace(/[^\w.-]+/g, '_')}.pdf`);
  if (pdf.exists) pdf.delete();
  pdf.create();
  pdf.write(base64, { encoding: 'base64' });
  await Sharing.shareAsync(pdf.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle });
}
