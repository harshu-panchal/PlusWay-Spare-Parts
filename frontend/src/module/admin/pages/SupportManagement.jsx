import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Search,
  MessageSquare,
  User,
  Clock,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  RotateCcw,
  LifeBuoy,
  Inbox,
  ExternalLink,
} from "lucide-react";

// formType -> display label / icon / accent color, used for tabs, badges and
// the type-specific "extra fields" block.
const FORM_TYPE_META = {
  Contact: { label: "Contact", icon: Inbox, color: "text-slate-600 bg-slate-50 border-slate-200" },
  Support: { label: "Support Ticket", icon: LifeBuoy, color: "text-orange-600 bg-orange-50 border-orange-200" },
  Career: { label: "Career Application", icon: Briefcase, color: "text-purple-600 bg-purple-50 border-purple-200" },
  Replacement: { label: "Replacement Request", icon: RotateCcw, color: "text-blue-600 bg-blue-50 border-blue-200" },
};

const TABS = ["All", "Contact", "Support", "Career", "Replacement"];

// Renders the form-specific extra fields stashed in `meta`, since each form
// type carries different data (Career -> resume link, Replacement -> order
// info, Support -> order/category).
const MetaFields = ({ formType, meta }) => {
  if (!meta || Object.keys(meta).length === 0) return null;

  const rows = [];
  if (formType === "Career") {
    if (meta.position) rows.push(["Position", meta.position]);
    if (meta.experience) rows.push(["Experience", meta.experience]);
    if (meta.resumeUrl) rows.push(["Resume", meta.resumeUrl, true]);
  } else if (formType === "Replacement") {
    if (meta.orderId) rows.push(["Order ID", meta.orderId]);
    if (meta.productName) rows.push(["Product", meta.productName]);
    if (meta.reason) rows.push(["Reason", meta.reason]);
    if (meta.imageUrl) rows.push(["Evidence", meta.imageUrl, true]);
  } else if (formType === "Support") {
    if (meta.orderId) rows.push(["Order ID", meta.orderId]);
    if (meta.category) rows.push(["Category", meta.category]);
  }

  if (rows.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
      {rows.map(([label, value, isLink]) => (
        <div key={label} className="text-xs">
          <span className="font-black text-gray-400 uppercase tracking-widest">
            {label}:{" "}
          </span>
          {isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline inline-flex items-center gap-1">
              View <ExternalLink size={11} />
            </a>
          ) : (
            <span className="font-bold text-gray-700">{value}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const SupportManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          formType: activeTab !== "All" ? activeTab : undefined,
        },
      };
      const { data } = await axios.get(API_ENDPOINTS.ADMIN_FORM_SUBMISSIONS, config);
      setSubmissions(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch form submissions", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDelete = async (submission) => {
    if (!window.confirm(`Delete this ${FORM_TYPE_META[submission.formType]?.label || "submission"} from ${submission.name}?`)) return;
    try {
      const token = localStorage.getItem("adminToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(API_ENDPOINTS.ADMIN_FORM_SUBMISSION_DETAIL(submission._id), config);
      fetchSubmissions();
    } catch (error) {
      console.error("Failed to delete submission", error);
      alert("Failed to delete.");
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    return (
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? submissions.length : submissions.filter((s) => s.formType === tab).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary uppercase italic tracking-tighter">
            Form <span className="text-primary italic">Submissions</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            All Contact, Support, Career and Replacement form submissions from the storefront, in one place.
          </p>
        </div>
      </div>

      {/* Form Type Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        {TABS.map((tab) => {
          const meta = FORM_TYPE_META[tab];
          const Icon = meta?.icon || MessageSquare;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-secondary text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}>
              <Icon size={14} />
              {meta?.label || tab}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab ? "bg-white/20" : "bg-gray-100"
                }`}>
                {tabCounts[tab] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name, email, subject..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 font-bold">Loading submissions...</div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400 font-bold">
          No submissions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSubmissions.map((submission) => {
            const typeMeta = FORM_TYPE_META[submission.formType] || {};
            const TypeIcon = typeMeta.icon || MessageSquare;
            return (
              <div
                key={submission._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/20 transition-all">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-4 flex-1 min-w-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${typeMeta.color || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        <TypeIcon size={12} />
                        {typeMeta.label || submission.formType}
                      </span>

                      <div>
                        <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-1">
                          {submission.subject || typeMeta.label || submission.formType}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {submission.message}
                        </p>
                      </div>

                      <MetaFields formType={submission.formType} meta={submission.meta} />

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 font-bold">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-primary" />
                          {submission.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-primary" />
                          {submission.email}
                        </div>
                        {submission.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-primary" />
                            {submission.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-primary" />
                          {new Date(submission.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(submission)}
                      className="p-2 border border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-600 transition-all shrink-0"
                      title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupportManagement;
