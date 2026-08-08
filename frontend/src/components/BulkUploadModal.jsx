import React, { useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  X,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Loader,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

/**
 * BulkUploadModal — Reusable Excel bulk-upload modal
 *
 * Props:
 *  isOpen            boolean
 *  onClose           () => void
 *  onSuccess         () => void   — called after a successful upload to refresh the list
 *  uploadEndpoint    string       — API URL for POST (multipart/form-data, field: "file")
 *  templateEndpoint  string?      — Optional explicit GET URL for the backend-generated
 *                                   template. If provided, it is used as-is. Otherwise
 *                                   we fall back to uploadEndpoint.replace("/bulk-upload","/bulk-template").
 *                                   Required for flows that need server-side features
 *                                   like Excel data-validation dropdowns (client-side fallback
 *                                   cannot generate them).
 *  templateColumns   Array<{ header, key, example, example2 }>
 *  templateSheetName string       — e.g. "Products"
 *  templateFileName  string       — e.g. "plusway_products_bulk_template.xlsx"
 *  title             string
 *  description       string
 */
const BulkUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
  uploadEndpoint,
  templateEndpoint,
  templateColumns,
  templateSheetName,
  templateFileName,
  title,
  description,
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [showErrors, setShowErrors] = useState(true);
  const [showSuccesses, setShowSuccesses] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const handleClose = () => {
    setFile(null);
    setResults(null);
    setUploading(false);
    setIsDragging(false);
    onClose();
  };

  const resetFile = () => {
    setFile(null);
    setResults(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Template Download ──────────────────────────────────────────────────────

  const downloadTemplate = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
        responseType: "blob",
      };

      const resolvedTemplateEndpoint =
        templateEndpoint || uploadEndpoint.replace("/bulk-upload", "/bulk-template");
      const { data } = await axios.get(resolvedTemplateEndpoint, config);

      const blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, templateFileName);
    } catch (err) {
      console.error("Backend template download failed, falling back to client-side XLSX generation:", err);

      // FALLBACK TO CLIENT-SIDE GENERATION
      const keyHeaders = templateColumns.map((c) => c.key);
      const exampleRow = templateColumns.map((c) => c.example || "");

      const ws = XLSX.utils.aoa_to_sheet([keyHeaders, exampleRow]);
      ws["!cols"] = templateColumns.map(() => ({ wch: 28 }));

      // Build field reference table for the Instructions sheet
      const fieldRefHeader = ["Column Key (use in Excel)", "Field Label", "Required?", "Example Value"];
      const fieldRefRows = templateColumns.map((c) => [
        c.key,
        c.header.replace(" *", ""),
        c.header.includes("*") ? "YES ✅" : "optional",
        c.example || "",
      ]);

      const instructions = [
        ["INSTRUCTIONS FOR BULK UPLOAD"],
        [""],
        ["IMPORTANT: Do NOT change row 1 column headers in the data sheet."],
        ["IMPORTANT: Rows 2 & 3 contain sample data. You can overwrite or delete them before uploading."],
        [""],
        ["1. Column headers (row 1 in the data sheet) are the exact field names the backend reads. Do not rename them."],
        ["2. brand / category / model must EXACTLY match existing names in the admin system (case-insensitive)."],
        ["3. images: pipe-separated URLs -> url1|url2|url3"],
        ["4. specs: key:value pairs, pipe-separated -> Color:Black|RAM:8GB|Storage:256GB"],
        ["5. colors: comma-separated -> Black,White,Gold (optional, colorVariants preferred for multi-color products)"],
        [""],
        ["--- PRODUCTS WITHOUT COLOR VARIANTS ---"],
        ["6a. Fill the top-level columns: SKU, price, mrp, wholesalePrice, wholesaleMinQty, countInStock."],
        ["    Leave the colorVariants column EMPTY."],
        ["    SKU may be left blank — it will be auto-generated (e.g. PW-123456)."],
        [""],
        ["--- PRODUCTS WITH COLOR VARIANTS ---"],
        ["6b. Fill the colorVariants column. Each variant carries its own SKU, price, stock & images."],
        ["    Format per variant: colorName;sku;price;mrp;wholesalePrice;wholesaleMinQty;countInStock;img1,img2"],
        ["    Separate multiple variants with ||"],
        ["    Example: Black;PW-BLA-001;4500;5500;3800;10;50;http://img1.jpg||White;PW-WHI-002;4700;5500;3900;10;20;http://img2.jpg"],
        ["    Leave sku blank inside a variant to auto-generate: Black;;4500;5500;3800;10;50;http://img1.jpg"],
        ["    When colorVariants are provided, the top-level SKU/price/stock columns are IGNORED (variants take precedence)."],
        [""],
        ["7. highlights / descriptionPoints: pipe-separated -> Fast Charging|5G Ready"],
        ["8. countryPricing (Optional): countryCode|countryName|currencyCode|currencySymbol|price|wholesalePrice|wholesaleMinQty|mrp (joined by ||)"],
        ["   Example: AE|United Arab Emirates|AED|د.إ|80|65|10|100||US|United States|USD|$|25|20|10|30"],
        ["   If left blank, prices auto-convert from INR using live exchange rates."],
        ["9. Image URLs must already be uploaded to the server before bulk upload."],
        ["10. Max file size: 10 MB."],
        [""],
        ["--- FIELD REFERENCE (all columns and whether they are required) ---"],
        fieldRefHeader,
        ...fieldRefRows,
      ];

      const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
      wsInstr["!cols"] = [{ wch: 36 }, { wch: 28 }, { wch: 12 }, { wch: 45 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, templateSheetName);
      XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, templateFileName);
    }
  };

  // ─── File Selection ─────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setResults(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && /\.(xlsx?|csv)$/i.test(dropped.name)) {
      setFile(dropped);
      setResults(null);
    }
  };

  // ─── Upload ─────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const { data } = await axios.post(uploadEndpoint, formData, config);
      setResults(data);

      if (data.successCount > 0) {
        onSuccess();
      }
    } catch (error) {
      const errData = error.response?.data;
      setResults(
        errData || {
          message: "Upload failed. Please try again.",
          successCount: 0,
          errorCount: 1,
          total: 0,
          results: {
            success: [],
            errors: [{ row: "N/A", name: "N/A", error: error.message }],
          },
        }
      );
    } finally {
      setUploading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const successCount = results?.successCount ?? 0;
  const errorCount = results?.errorCount ?? 0;
  const totalCount = results?.total ?? 0;

  // Pull per-row warnings out of the success list (additive — older endpoints
  // simply don't return a `warnings` array on success rows, so this list is empty
  // and the UI section is hidden).
  const rowsWithWarnings = (results?.results?.success || []).filter(
    (s) => Array.isArray(s.warnings) && s.warnings.length > 0,
  );
  const warningCount = rowsWithWarnings.reduce(
    (acc, s) => acc + s.warnings.length,
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-blue-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable Body ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Step 1 — Download template */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-bold text-blue-900 text-sm">Download the Excel Template</p>
                  <p className="text-blue-700 text-xs mt-1 leading-relaxed">
                    The template includes a <strong>sample data row</strong> in Row 2 — you can overwrite or delete it.
                    Do <strong>not</strong> rename column headers. Check the "Instructions" sheet for field reference and examples.
                  </p>
                </div>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm font-bold shadow-sm shrink-0">
                <Download size={16} />
                Download Template
              </button>
            </div>
          </div>

          {/* Step 2 — Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">2</span>
              <p className="font-bold text-gray-700 text-sm">Upload the Filled Excel File</p>
            </div>

            {/* Drop zone */}
            {!results && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 scale-[1.01]"
                    : file
                    ? "border-emerald-400 bg-emerald-50 cursor-default"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
                }`}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-1">
                      <FileSpreadsheet className="text-emerald-600" size={28} />
                    </div>
                    <p className="font-bold text-emerald-700 text-base">{file.name}</p>
                    <p className="text-xs text-emerald-600">
                      {(file.size / 1024).toFixed(1)} KB · Ready to upload
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); resetFile(); }}
                      className="mt-2 text-xs text-gray-500 hover:text-red-500 underline transition-colors">
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mb-1">
                      <Upload className="text-gray-400" size={28} />
                    </div>
                    <p className="font-semibold text-gray-600">
                      {isDragging ? "Drop it here!" : "Drag & drop your Excel file here"}
                    </p>
                    <p className="text-xs text-gray-400">or <span className="text-blue-600 font-semibold">click to browse</span></p>
                    <p className="text-[11px] text-gray-400 mt-1">.xlsx, .xls, or .csv • Max 10 MB</p>
                  </div>
                )}
              </div>
            )}

            {/* Upload action button */}
            {file && !results && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-[0.99] transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed text-sm">
                {uploading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Processing rows, please wait...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Start Bulk Upload
                  </>
                )}
              </button>
            )}
          </div>

          {/* ── Results ──────────────────────────────────────────────── */}
          {results && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-black text-gray-700">{totalCount}</p>
                  <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wide">Total Rows</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${successCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-3xl font-black ${successCount > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                    {successCount}
                  </p>
                  <p className={`text-xs font-semibold mt-1 uppercase tracking-wide ${successCount > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                    ✅ Created
                  </p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${errorCount > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
                  <p className={`text-3xl font-black ${errorCount > 0 ? "text-red-600" : "text-gray-400"}`}>
                    {errorCount}
                  </p>
                  <p className={`text-xs font-semibold mt-1 uppercase tracking-wide ${errorCount > 0 ? "text-red-600" : "text-gray-400"}`}>
                    ❌ Failed
                  </p>
                </div>
              </div>

              {/* Summary message */}
              <div className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium ${
                errorCount === 0
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : successCount === 0
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}>
                <AlertCircle size={18} className="shrink-0" />
                {results.message}
              </div>

              {/* Successes */}
              {results.results?.success?.length > 0 && (
                <div className="border border-emerald-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowSuccesses(!showSuccesses)}
                    className="w-full px-5 py-3 bg-emerald-50 flex items-center justify-between text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                    <span className="flex items-center gap-2">
                      <CheckCircle size={16} />
                      Successfully Created ({results.results.success.length})
                    </span>
                    {showSuccesses ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showSuccesses && (
                    <div className="max-h-44 overflow-y-auto divide-y divide-emerald-50">
                      {results.results.success.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm bg-white">
                          <span className="text-gray-400 text-xs w-16 shrink-0">Row {s.row}</span>
                          <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                          <span className="text-gray-700 font-medium truncate">
                            {s.name}
                            {s.colorName ? (
                              <span className="text-gray-400 font-normal"> — {s.colorName}</span>
                            ) : null}
                          </span>
                          {s.type ? (
                            <span className="ml-auto text-[10px] uppercase tracking-wider font-bold text-emerald-600/70 shrink-0">
                              {s.type}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Errors */}
              {results.results?.errors?.length > 0 && (
                <div className="border border-red-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="w-full px-5 py-3 bg-red-50 flex items-center justify-between text-sm font-bold text-red-700 hover:bg-red-100 transition-colors">
                    <span className="flex items-center gap-2">
                      <XCircle size={16} />
                      Failed Rows ({results.results.errors.length})
                    </span>
                    {showErrors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showErrors && (
                    <div className="max-h-56 overflow-y-auto divide-y divide-red-50">
                      {results.results.errors.map((e, i) => (
                        <div key={i} className="px-5 py-3 bg-white">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-xs w-16 shrink-0">Row {e.row}</span>
                            <XCircle size={14} className="text-red-500 shrink-0" />
                            <span className="font-bold text-gray-800 text-sm truncate">{e.name}</span>
                          </div>
                          <p className="text-red-600 text-xs mt-1.5 ml-[4.5rem] leading-relaxed">{e.error}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Warnings (per-row, attached to successful rows) */}
              {rowsWithWarnings.length > 0 && (
                <div className="border border-amber-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowWarnings(!showWarnings)}
                    className="w-full px-5 py-3 bg-amber-50 flex items-center justify-between text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                    <span className="flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Warnings ({warningCount} across {rowsWithWarnings.length} row{rowsWithWarnings.length === 1 ? "" : "s"})
                    </span>
                    {showWarnings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showWarnings && (
                    <div className="max-h-56 overflow-y-auto divide-y divide-amber-50">
                      {rowsWithWarnings.map((s, i) => (
                        <div key={i} className="px-5 py-3 bg-white">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-xs w-16 shrink-0">Row {s.row}</span>
                            <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                            <span className="font-bold text-gray-800 text-sm truncate">
                              {s.name}
                              {s.colorName ? ` — ${s.colorName}` : ""}
                            </span>
                          </div>
                          <ul className="text-amber-700 text-xs mt-1.5 ml-[4.5rem] leading-relaxed list-disc list-inside space-y-0.5">
                            {s.warnings.map((w, wi) => (
                              <li key={wi}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upload another */}
              <button
                onClick={resetFile}
                className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-[0.99] transition-all text-sm font-semibold">
                ↑ Upload Another File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
