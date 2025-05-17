import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconCirclePlusFilled, IconUpload } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadLogFile } from "@/services/file";
import { toast } from "sonner";

export default function AddLogFileDialog() {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const results = await Promise.all(acceptedFiles.map((file) => uploadLogFile(file)));

      const allSuccessful = results.every((result) => result.success);

      if (allSuccessful) {
        toast.success("Files uploaded successfully");
      } else {
        const failedCount = results.filter((result) => !result.success).length;
        toast.error(`${failedCount} file(s) failed to upload`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".log", ".txt"],
    },
    multiple: true,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear">
          <IconCirclePlusFilled />
          <span>Add Log File</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-8xl w-full">
        <DialogHeader>
          <DialogTitle>Add Log File</DialogTitle>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-gray-300 hover:border-primary/50"
            }
            ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
          <input {...getInputProps()} />
          <IconUpload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag and drop log files here, or click to select files"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Supported formats: .log, .txt</p>
          {isUploading && <p className="mt-2 text-sm text-primary">Uploading files...</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
