export {};

declare global {
  interface FilePreview extends File {
    preview: string;
  }
}
