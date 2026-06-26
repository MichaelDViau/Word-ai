/**
 * Ambient declarations for modules without bundled browser-entry types.
 */

declare module "mammoth/mammoth.browser" {
  interface ConvertOptions {
    arrayBuffer: ArrayBuffer;
  }
  interface ConvertResult {
    value: string;
    messages: unknown[];
  }
  export function convertToHtml(
    input: ConvertOptions,
  ): Promise<ConvertResult>;
  export function extractRawText(
    input: ConvertOptions,
  ): Promise<ConvertResult>;
}
