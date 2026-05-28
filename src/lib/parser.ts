import { PDFParse } from 'pdf-parse';
import { parseOffice } from 'officeparser';

export interface ParseResult {
  text: string;
  success: boolean;
  error?: string;
}

export async function parseResume(buffer: Buffer, fileName: string): Promise<ParseResult> {
  const extension = fileName.split('.').pop()?.toLowerCase();

  try {
    switch (extension) {
      case 'pdf':
        return await parsePDF(buffer);
      case 'doc':
      case 'docx':
        return await parseOfficeWrapper(buffer);
      default:
        return { text: '', success: false, error: `Unsupported file format: .${extension}` };
    }
  } catch (error) {
    console.error(`Error parsing ${fileName}:`, error);
    return {
      text: '',
      success: false,
      error: `Failed to parse ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = result.text?.trim();
    if (!text) {
      return { text: '', success: false, error: 'No text content found in PDF' };
    }
    return { text, success: true };
  } finally {
    await parser.destroy();
  }
}

async function parseOfficeWrapper(buffer: Buffer): Promise<ParseResult> {
  const ast = await parseOffice(buffer);
  const text = ast.toText();
  if (!text?.trim()) {
    return { text: '', success: false, error: 'No text content found in document' };
  }
  return { text: text.trim(), success: true };
}
