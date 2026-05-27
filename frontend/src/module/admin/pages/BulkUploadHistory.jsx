import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Download,
  AlertCircle,
  Loader,
  CheckCircle,
  XCircle,
  Calendar
} from "lucide-react";
import { API_BASE_URL } from "../../../config/api";

const BulkUploadHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
                      <div className="flex items-center gap-1.5 text-red-500 font-medium">
                        {record.errorCount > 0 && <XCircle size={16} />}
                        {record.errorCount}
                      </div>
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
    </div>
  );
};

export default BulkUploadHistory;
