import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  MessageSquare,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Reply,
  ExternalLink,
  Phone,
  Mail,
  X,
  Send,
  Save,
} from "lucide-react";

const SupportManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        "http://localhost:5001/api/admin/tickets",
        config
      );

      const formattedTickets = data.map(ticket => ({
        id: ticket._id,
        // Fallback for ID display if backend _id is long, maybe use last 6 chars or keep full
        displayId: ticket._id.substring(ticket._id.length - 6).toUpperCase(),
        customer: ticket.user?.name || "Unknown User",
        email: ticket.user?.email || "No Email",
        phone: ticket.user?.mobile || "No Phone",
        subject: ticket.subject,
        message: ticket.message,
        status: ticket.status,
        priority: ticket.priority,
        date: new Date(ticket.createdAt).toLocaleString(),
        adminReply: ticket.adminReply,
      }));

      setInquiries(formattedTickets);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenReply = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setReplyMessage("");
    setIsModalOpen(true);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.put(
        `http://localhost:5001/api/admin/tickets/${selectedTicket.id}`,
        {
          status: newStatus,
          adminReply: replyMessage,
        },
        config
      );

      fetchTickets();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update ticket", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "open":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "resolved":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const filteredInquiries = inquiries.filter((t) => {
    const matchesSearch =
      t.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary uppercase italic tracking-tighter">
            Support <span className="text-primary italic">& Inquiries</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Manage customer support tickets and contact requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-black transition-all text-sm font-bold">
            <CheckCircle2 size={18} />
            <span>Mark All Resolved</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search tickets, customers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-bold text-gray-700"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredInquiries.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-primary/20 transition-all">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                      #{ticket.displayId}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.priority)}`}>
                      <AlertCircle size={12} />
                      {ticket.priority} Priority
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-secondary uppercase tracking-tight mb-1">
                      {ticket.subject}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {ticket.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-gray-500 font-bold">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-primary" />
                      {ticket.customer}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-primary" />
                      {ticket.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-primary" />
                      {ticket.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary" />
                      {ticket.date}
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => handleOpenReply(ticket)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-black transition-all text-xs font-black uppercase tracking-widest">
                    <Reply size={16} />
                    Reply
                  </button>
                  <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-secondary transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-black text-secondary uppercase tracking-tight">
                  Reply to Ticket{" "}
                  <span className="text-primary">#{selectedTicket.id}</span>
                </h3>
                <p className="text-xs text-gray-500 font-bold mt-1">
                  Customer: {selectedTicket.customer}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-full shadow-sm transition-colors border border-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Customer Message
                </p>
                <p className="text-secondary font-bold text-sm italic">
                  "{selectedTicket.message}"
                </p>
              </div>

              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-secondary uppercase tracking-widest">
                    Your Response
                  </label>
                  <textarea
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none h-40 text-sm font-medium"
                    placeholder="Type your response here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-secondary uppercase tracking-widest">
                      Update Status
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-white text-sm font-bold"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 border border-gray-200 text-secondary rounded-xl hover:bg-gray-50 transition-all font-black uppercase tracking-widest text-xs">
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Send size={18} />
                    Send Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;
