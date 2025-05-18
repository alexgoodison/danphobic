import axios from "axios";

const NEXT_PUBLIC_API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function uploadLogFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(NEXT_PUBLIC_API_ENDPOINT + "/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      message: "File uploaded successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.detail || error.message || "Failed to upload file",
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}
