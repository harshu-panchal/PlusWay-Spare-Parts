import React, { useState, useEffect } from "react";
import { Search, Trash2, UserPlus } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import Pagination from "../../../components/Pagination";

const STATUS_OPTIONS = ["All", "New", "Contacted", "Closed"];

const statusColors = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Closed: "bg-green-100 text-green-700",
};

const LeadManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leads, setLeads] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    fetchLeads();
  }, [page, searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      let queryParams = `?pageNumber=${page}`;
      if (searchTerm) {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (statusFilter) {
        queryParams += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const { data } = await axios.get(
        `${API_ENDPOINTS.ADMIN_LEADS}${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLeads(data.leads);
      setPages(data.pages);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        API_ENDPOINTS.ADMIN_LEAD_DETAIL(leadId),
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(API_ENDPOINTS.ADMIN_LEAD_DETAIL(leadId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete lead");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UserPlus className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          </div>
          <p className="text-gray-500 text-sm">
            {total} total lead{total !== 1 ? "s" : ""} from enquiry form
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Phone
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Area
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  City
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Pincode
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  State
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Country
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Message
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Date
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {lead.phone}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {lead.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {lead.area || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {lead.city || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {lead.pincode || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {lead.state || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {lead.country || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {lead.message || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusUpdate(lead._id, e.target.value)
                        }
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[lead.status] || "bg-gray-100 text-gray-700"}`}>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete lead">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pages > 1 && (
        <div className="mt-6">
          <Pagination page={page} pages={pages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
