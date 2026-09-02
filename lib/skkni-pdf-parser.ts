import { PDFParse } from "pdf-parse";
import { parseSkkniText, type ParsedSkkniDocument, type ExtractedUnit, type ExtractedElemen, type ExtractedKuk } from "./skkni-text-extractor";

export type { ParsedSkkniDocument, ExtractedUnit, ExtractedElemen, ExtractedKuk };

/**
 * Server-Side Node.js parser untuk file PDF SKKNI Kemnaker.
 */
export async function parseSkkniPdf(buffer: Uint8Array): Promise<ParsedSkkniDocument> {
  const parser = new PDFParse(buffer);
  const parseResult = await parser.getText();
  const rawText = parseResult.text || "";

  return parseSkkniText(rawText);
}
