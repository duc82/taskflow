import { Editor } from "@tiptap/react";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Checks if a mark exists in the editor schema
 *
 * @param markName - The name of the mark to check
 * @param editor - The editor instance
 */
export const isMarkInSchema = (markName: string, editor: Editor | null) =>
  editor?.schema.spec.marks.get(markName) !== undefined;

/**
 * Checks if a node exists in the editor schema
 *
 * @param nodeName - The name of the node to check
 * @param editor - The editor instance
 */
export const isNodeInSchema = (nodeName: string, editor: Editor | null) =>
  editor?.schema.spec.nodes.get(nodeName) !== undefined;

/**
 * Handles image upload with progress tracking and abort capability
 */
export const handleImageUpload = async (
  _file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  if (abortSignal?.aborted) {
    throw new Error("Upload cancelled");
  }
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", _file);
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        onProgress?.({ progress: percentComplete });
      }
    });

    xhr.addEventListener("load", () => {
      onProgress?.({ progress: 100 });
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        console.log(data);
        if (data?.url) {
          resolve(data.url);
        } else {
          reject(new Error("Invalid response from server"));
        }
      } else {
        reject(new Error("Upload failed"));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload cancelled"));
    });

    const abortHandler = () => {
      xhr.abort(); // Cancel XHR when signal is aborted
    };

    abortSignal?.addEventListener("abort", abortHandler);

    xhr.addEventListener("loadend", () => {
      abortSignal?.removeEventListener("abort", abortHandler);
    });

    xhr.open("POST", `${process.env.NEXT_PUBLIC_API_URL}/upload/image`, true);
    xhr.send(formData);
  });

  // Uncomment to use actual file conversion:
  // return convertFileToBase64(file, abortSignal)
};

/**
 * Converts a File to base64 string
 */
export const convertFileToBase64 = (
  file: File,
  abortSignal?: AbortSignal
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const abortHandler = () => {
      reader.abort();
      reject(new Error("Upload cancelled"));
    };

    if (abortSignal) {
      abortSignal.addEventListener("abort", abortHandler);
    }

    reader.onloadend = () => {
      if (abortSignal) {
        abortSignal.removeEventListener("abort", abortHandler);
      }

      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert File to base64"));
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
