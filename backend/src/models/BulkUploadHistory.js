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
      enum: ["Products", "Models"],
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
  },
  {
    timestamps: true,
  }
);

const BulkUploadHistory = mongoose.model("BulkUploadHistory", bulkUploadHistorySchema);

export default BulkUploadHistory;
