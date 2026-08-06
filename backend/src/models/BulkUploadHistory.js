import mongoose from "mongoose";

const bulkUploadHistorySchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    uploadType: {
      type: String,
      enum: ["Products", "Models", "ProductsUpdate"],
      required: true,
    },
    totalRows: {
      type: Number,
      required: true,
    },
    successCount: {
      type: Number,
      required: true,
    },
    errorCount: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    // Per-row failure details captured at upload time. Capped on the
    // controller side to keep history documents bounded for huge files.
    errors: {
      type: [
        {
          _id: false,
          row: Number,
          name: String, // product/model name or SKU (best available identifier)
          field: String, // optional column hint, when known
          error: String, // human-readable failure reason
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

const BulkUploadHistory = mongoose.model("BulkUploadHistory", bulkUploadHistorySchema);

export default BulkUploadHistory;
