import { useWatch, Control, UseFormSetValue } from "react-hook-form";

export default function DocumentUpload({
  control,
  setValue,
}: {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
}) {
  const documents = useWatch({
    control,
    name: "documents"
  });

  const docsArray: File[] = documents ? Array.from(documents) : [];

  const removeDocument = (indexToRemove: number) => {
    const newFiles = docsArray.filter((_, idx) => idx !== indexToRemove);
    const dataTransfer = new DataTransfer();
    newFiles.forEach((file) => dataTransfer.items.add(file));
    setValue("documents", dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Documents</h3>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            const files = e.target.files;
            if (files) {
              setValue("documents", files);
            }
          }}
          id="loan-file-upload"
          className="hidden"
        />
        <label htmlFor="loan-file-upload" className="cursor-pointer flex flex-col items-center">
          {/* Upload Icon */}
          <span className="text-sm text-gray-600">Click to upload documents</span>
          <span className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</span>
        </label>
      </div>

      {docsArray.length > 0 && (
        <div className="space-y-2">
          {docsArray.map((file, index) => (
            <div key={file.name + index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                {/* File Icon */}
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeDocument(index)}
                className="text-red-500 hover:text-red-700"
              >
                {/* X Icon */}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
