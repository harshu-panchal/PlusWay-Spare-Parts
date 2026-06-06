import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  Calendar,
  X,
  Search,
} from "lucide-react";
import { API_BASE_URL } from "../../../config/api";

// Heuristic: derive the column/field name from an error message when the
// controller didn't already record it. Covers the common shapes emitted by
// the bulk-create/update controllers ("Brand X not found", "Missing
// required fields: ...", "SKU X not found", etc.).
const deriveFieldFromError = (msg = "") => {
  const s = String(msg);
  let m;
  if ((m = s.match(/^Missing required fields?:\s*(.+)$/i))) return m[1].trim();
  if (/missing sku( or price)?/i.test(s))
    return /price/i.test(s) ? "sku / price" : "sku";
  if (/^variant SKU .* not found/i.test(s)) return "sku (variant)";
  if (/^SKU .* not found/i.test(s)) return "sku";
  if ((m = s.match(/^(Brand|Category|Model)\s+".*?"\s+not found/i)))
    return m[1].toLowerCase();
  if (/already exists/i.test(s) && /^Product/i.test(s)) return "name";
  if (/already exists/i.test(s) && /^Model/i.test(s)) return "name";
  if (/ambiguous/i.test(s)) return "sku";
  return "";
};

const BulkUploadHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorsModal, setErrorsModal] = useState(null); // record being inspected
  const [errorSearch, setErrorSearch] = useState("");

  const fetchHistory = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("adminInfo"))?.token}`,
        },
      };
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/bulk-upload-history`, config);
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = (filePath, fileName) => {
    // URL to access static files in uploads folder
    const url = `${API_BASE_URL}/uploads/${filePath}`;
    
    // Creating a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Upload History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and download previously uploaded Excel/CSV files.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">File Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Total Rows</th>
                <th className="px-6 py-4 font-semibold">Success</th>
                <th className="px-6 py-4 font-semibold">Failed</th>
                <th className="px-6 py-4 font-semibold">Uploaded By</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                    <p className="text-gray-500">Loading history...</p>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                    <p className="text-lg font-medium text-gray-900 mb-1">No upload history found</p>
                    <p>Bulk uploads will appear here once processed.</p>
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {new Date(record.createdAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText size={16} />
                        </div>
                        <span className="font-medium text-gray-800 truncate max-w-[200px]" title={record.fileName}>
                          {record.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        record.uploadType === 'Products' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {record.uploadType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {record.totalRows}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle size={16} />
                        {record.successCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {record.errorCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorsModal(record);
                            setErrorSearch("");
                          }}
                          title={
                            Array.isArray(record.errors) && record.errors.length
                              ? "View failure details"
                              : "No per-row details were saved for this upload"
                          }
                          className="inline-flex items-center gap-1.5 text-red-500 font-medium hover:text-red-700 hover:underline focus:outline-none"
                        >
                          <XCircle size={16} />
                          {record.errorCount}
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                          {record.errorCount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{record.uploadedBy?.name || "Admin"}</p>
                        <p className="text-xs text-gray-500">{record.uploadedBy?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownload(record.filePath, record.fileName)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm text-sm font-medium"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {errorsModal && (
        <ErrorsModal
          record={errorsModal}
          query={errorSearch}
          onQueryChange={setErrorSearch}
          onClose={() => setErrorsModal(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Per-upload error-detail modal. Lists each failed row with row #, name/SKU,
// derived field hint, and the raw error message. Includes a search box and a
// "copy as CSV" action for quick triage on big failed batches.
// ─────────────────────────────────────────────────────────────────────────────
const ErrorsModal = ({ record, query, onQueryChange, onClose }) => {
  // ESC closes; lock background scroll while open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const errors = Array.isArray(record?.errors) ? record.errors : [];

  const enriched = useMemo(
    () =>
      errors.map((e) => ({
        row: e.row ?? "—",
        name: e.name || "—",
        field: e.field || deriveFieldFromError(e.error) || "—",
        error: e.error || "Unknown error",
      })),
    [errors],
  );

  const filtered = useMemo(() => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter(
      (e) =>
        String(e.row).toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.field.toLowerCase().includes(q) ||
        e.error.toLowerCase().includes(q),
    );
  }, [enriched, query]);

  const copyAsCsv = () => {
    const header = ["Row", "Name / SKU", "Field", "Reason"];
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = filtered.map((e) =>
      [e.row, e.name, e.field, e.error].map(escape).join(","),
    );
    const csv = [header.map(escape).join(","), ...rows].join("\n");
    try {
      navigator.clipboard.writeText(csv);
    } catch {
      // Clipboard API may be unavailable; fall back to a no-op.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              Failure details
            </h2>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {record.fileName} · {record.errorCount} failed of{" "}
              {record.totalRows} rows
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/60">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search row, name, field, or reason"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>
          {errors.length > 0 && (
            <button
              type="button"
              onClick={copyAsCsv}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shrink-0"
            >
              Copy as CSV
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          {errors.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <AlertCircle
                size={28}
                className="mx-auto mb-3 text-gray-300"
              />
              <p className="text-sm font-medium text-gray-700">
                No per-row error details were saved for this upload.
              </p>
              <p className="text-xs mt-1">
                Uploads done before this feature was added only show the
                summary count. Re-upload the file to see detailed failures.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500 text-sm">
              No errors match "{query}".
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 font-semibold w-16">Row</th>
                  <th className="px-4 py-2.5 font-semibold w-1/4">
                    Name / SKU
                  </th>
                  <th className="px-4 py-2.5 font-semibold w-40">Field</th>
                  <th className="px-4 py-2.5 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((e, idx) => (
                  <tr key={idx} className="hover:bg-red-50/40">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700">
                      {e.row}
                    </td>
                    <td className="px-4 py-2.5 text-gray-800 break-all">
                      {e.name}
                    </td>
                    <td className="px-4 py-2.5">
                      {e.field !== "—" ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {e.field}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-red-600">{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            Showing {filtered.length} of {errors.length}
            {record.errorCount > errors.length && (
              <>
                {" "}
                · {record.errorCount - errors.length} additional failure
                {record.errorCount - errors.length === 1 ? "" : "s"} not stored
                (cap reached)
              </>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadHistory;
