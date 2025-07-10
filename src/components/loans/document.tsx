import { useWatch, Control, UseFormSetValue } from "react-hook-form";
import { useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";

interface DocumentItem {
  name: string;
  file?: File;
  url: string;
  type?: string;
}

export default function DocumentUpload({
  control,
  setValue,
}: {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}) {
  const documents = useWatch({
    control,
    name: "documents",
  }) as DocumentItem[] | undefined;

  const [docsArray, setDocsArray] = useState<DocumentItem[]>(documents || []);

  useEffect(() => {
    if (documents) {
      setDocsArray(documents);
    }
  }, [documents]);

  const handleFilesChange = (files: FileList | null) => {
    if (!files) return;

    const newDocs: DocumentItem[] = Array.from(files).map((file) => ({
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      type: file.type
    }));

    const updatedDocs = [...docsArray, ...newDocs];
    setDocsArray(updatedDocs);
    setValue("documents", updatedDocs, { shouldValidate: true });
  };

  const removeDocument = (indexToRemove: number) => {
    const updatedDocs = docsArray.filter((_, idx) => idx !== indexToRemove);
    setDocsArray(updatedDocs);
    setValue("documents", updatedDocs, { shouldValidate: true });
  };

  useEffect(() => {
    return () => {
      docsArray.forEach((doc) => URL.revokeObjectURL(doc.url));
    };
  }, [docsArray]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Documents</h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => handleFilesChange(e.target.files)}
          id="loan-file-upload"
          className="hidden"
        />
        <label
          htmlFor="loan-file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <span className="text-sm text-gray-600">Click to upload documents</span>
          <span className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</span>
        </label>
      </div>

      {docsArray?.length > 0 && (
        <div className="space-y-2">
          {docsArray.map((doc, index) => {
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <DocumentThumbnail doc={doc} />
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )
          }
          )}
        </div>
      )}
    </div>
  );
}

function DocumentThumbnail({ doc }: { doc: DocumentItem }) {
  const [isImageError, setIsImageError] = useState(false);

  const isImage = doc.file?.type?.startsWith("image/") || doc.url?.match(/\.(png|jpe?g|gif|bmp|webp)$/i);

  const imageUrl = useMemo(() => {
    if (doc.file) {
      return URL.createObjectURL(doc.file);
    }
    return doc.url;
  }, [doc.file, doc.url]);

  useEffect(() => {
    return () => {
      if (doc.file) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl, doc.file]);

  return (
    <div className="flex items-center gap-3">
      {isImage && !isImageError ? (
        <img
          src={imageUrl}
          alt={doc.name}
          className="w-12 h-12 object-cover rounded border"
          onError={() => setIsImageError(true)}
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center rounded border-2 border-dashed border-gray-300 text-gray-400 text-xs">
          📄
        </div>
      )}

      <span className="text-sm text-gray-700 truncate max-w-[150px]">{doc.name}</span>
    </div>
  );
}

