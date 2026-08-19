import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  HelpCircle,
  Search,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  RotateCcw,
  Shield,
  Wrench,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(0); // Open first FAQ by default
  const [copiedField, setCopiedField] = useState(null);

  // Form State
  const [ticketForm, setTicketForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    category: "Order Issue",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = [
    { id: "all", label: "All Topics" },
    { id: "orders", label: "Orders & Delivery" },
    { id: "returns", label: "Returns & Replacements" },
    { id: "parts", label: "Part Testing & Compatibility" },
    { id: "payments", label: "Payments & Invoices" },
    { id: "warranty", label: "Warranty Claims" },
  ];

  const faqs = [
    {
      category: "orders",
      question: "How do I track my spare part order status?",
      answer:
        "You can track your order in real-time by visiting the 'Track Order' page on our website and entering your Order ID or registered 10-digit mobile number. You also receive live tracking links via SMS and email as soon as your package is dispatched.",
    },
    {
      category: "orders",
      question: "What are the standard delivery timelines across India?",
      answer:
        "In-stock spare parts are dispatched within 24-48 hours. Metro cities generally receive packages within 2 to 4 business days. Regional and Tier-2/3 cities receive delivery in 4 to 7 business days via express air & surface courier partners.",
    },
    {
      category: "parts",
      question: "What is the mandatory testing protocol before installing a mobile display or part?",
      answer:
        "Before applying glue, double-sided tape, or removing warranty stamps/protective films: 1) Connect the display or flex cable externally to the motherboard board. 2) Turn on the phone and thoroughly test touch sensitivity, screen brightness, and proximity sensor functions. 3) Only if everything works 100% perfectly should you proceed with final installation. Removing protective films or applying glue VOIDS return eligibility.",
    },
    {
      category: "returns",
      question: "What should I do if I receive a damaged part or wrong item?",
      answer:
        "Do not panic! Record an uncut unboxing video when opening your package. If you discover physical damage or a mismatched item, submit a replacement request within 48 hours via our website portal or email us directly at plusway9@gmail.com with your Order ID and unboxing video.",
    },
    {
      category: "returns",
      question: "Why is an unboxing video mandatory for transit damage claims?",
      answer:
        "Unboxing videos help us immediately verify courier mishandling claims with our logistics insurance partners. A continuous, uncut video showing parcel seals being opened ensures 100% instant approval for your replacement.",
    },
    {
      category: "payments",
      question: "What payment methods are supported on PlusWay Spare Parts?",
      answer:
        "We support all major payment modes: UPI (Google Pay, PhonePe, Paytm, BHIM), Debit & Credit Cards (Visa, Mastercard, RuPay), Net Banking across 50+ Indian banks, and approved wallet balances.",
    },
    {
      category: "payments",
      question: "Can I get a GST Input Tax Credit invoice for my purchase?",
      answer:
        "Yes! During checkout or account creation, enter your 15-digit GSTIN and company/shop name. Your downloadable tax invoice will include full GST details for input tax credit claims.",
    },
    {
      category: "warranty",
      question: "How long is the warranty on spare parts and what does it cover?",
      answer:
        "Most items carry manufacturer warranties ranging from 1 to 6 months against functional manufacturing defects. Warranty covers dead displays or non-responsive touch layers prior to installation (with stamps intact). It excludes user-induced physical cracks, bent flex cables, water damage, or soldering burn marks.",
    },
    {
      category: "warranty",
      question: "How do I claim a warranty replacement?",
      answer:
        "Contact our technical support helpline at +91 9870162128 or email plusway9@gmail.com with your Order ID, high-resolution clear photos/videos of the defect, and intact warranty stamps.",
    },
    {
      category: "parts",
      question: "Are your mobile spare parts genuine?",
      answer:
        "We supply premium quality tested replacement spare parts sourced directly from trusted manufacturing facilities. Products undergo multi-stage quality assurance tests before listing.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFormChange = (e) => {
    setTicketForm({
      ...ticketForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(API_ENDPOINTS.CREATE_FORM_SUBMISSION, {
        formType: "Support",
        name: ticketForm.name,
        email: ticketForm.email,
        phone: ticketForm.phone,
        subject: ticketForm.category,
        message: ticketForm.message,
        meta: {
          orderId: ticketForm.orderId,
          category: ticketForm.category,
        },
      });
      setSubmitSuccess(true);
      setTicketForm({
        name: "",
        email: "",
        phone: "",
        orderId: "",
        category: "Order Issue",
        message: "",
      });
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (error) {
      console.error("Failed to submit support ticket", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit your ticket. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-slate-900 to-blue-600/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-3.5 h-3.5" /> 24/7 Customer Support & Help Hub
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
              PlusWay Support Center
            </h1>
            <p className="text-slate-300 mt-3 text-base md:text-lg leading-relaxed">
              Have questions about spare part compatibility, order tracking, returns, or testing protocols? Our team is here to assist you!
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs, keywords (e.g. tracking, display testing, return, warranty)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm md:text-base shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        
        {/* Direct Contact Cards Row */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                Direct Contact Channels
              </h2>
              <p className="text-xs text-slate-500 font-medium">Publicly accessible support channels for fast responses</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Phone Support Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4">
                  <Phone size={24} />
                </div>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Helpline Number</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1 mb-2">+91 9870162128</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Direct phone assistance for urgent order queries, part verification, and support.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Clock size={14} className="text-slate-400" /> Mon - Sat: 9:00 AM - 7:00 PM IST
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <a
                  href="tel:9870162128"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Call Now
                </a>
                <button
                  onClick={() => copyToClipboard("9870162128", "phone")}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {copiedField === "phone" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Email Support Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Mail size={24} />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Email Assistance</span>
                <h3 className="text-xl font-black text-slate-900 mt-1 mb-2 truncate">plusway9@gmail.com</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Send us unboxing videos, GST invoice requests, or detailed technical inquiries.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <CheckCircle2 size={14} className="text-emerald-500" /> Response within 24 hours
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                <a
                  href="mailto:plusway9@gmail.com"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-center py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Send Email
                </a>
                <button
                  onClick={() => copyToClipboard("plusway9@gmail.com", "email")}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {copiedField === "email" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* WhatsApp / Quick Chat Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                  <MessageCircle size={24} />
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Instant Chat</span>
                <h3 className="text-xl font-black text-slate-900 mt-1 mb-2">WhatsApp Support</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Quick photo verification for display models, part numbers, and stock status.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Sparkles size={14} className="text-emerald-500" /> Fast Technician Response
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href="https://wa.me/919870162128"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  <MessageCircle size={15} /> Open WhatsApp Chat
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/track-order"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <Truck className="w-6 h-6 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-slate-900 text-sm uppercase">Track Order</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium">Live courier tracking status</p>
          </Link>

          <Link
            to="/replacement-requests"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <RotateCcw className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-slate-900 text-sm uppercase">Replacements</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium">Submit defect or transit claims</p>
          </Link>

          <Link
            to="/warranty"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <Shield className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-slate-900 text-sm uppercase">Warranty Terms</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium">Coverage details & policies</p>
          </Link>

          <Link
            to="/how-to-manuals"
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-orange-500 hover:shadow-md transition-all group"
          >
            <Wrench className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-black text-slate-900 text-sm uppercase">Testing Guide</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium">Step-by-step display testing</p>
          </Link>
        </div>

        {/* Interactive FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-slate-500 font-medium">Find instant answers to popular spare part inquiries</p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-slate-800 text-sm md:text-base hover:bg-slate-50 transition-colors"
                  >
                    <span className="pr-4 flex items-center gap-2">
                      <HelpCircle size={18} className="text-orange-500 shrink-0" />
                      {faq.question}
                    </span>
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-orange-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <div className="p-4 pt-0 bg-slate-50/80 border-t border-slate-100 text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-bold text-sm">
                No matching answers found for "{searchQuery}".
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with another keyword or send a direct support ticket below!
              </p>
            </div>
          )}
        </div>

        {/* Support Ticket / Inquiry Submission Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <MessageSquare size={22} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                Submit a Support Ticket
              </h2>
              <p className="text-xs text-slate-500 font-medium">Need custom assistance? Fill out the form below and our team will get back to you.</p>
            </div>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-3 font-semibold text-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Support Ticket Received!</p>
                <p className="text-xs text-emerald-700">Thank you! Our support team will respond to your inquiry via phone (+91 9870162128) or email (plusway9@gmail.com) shortly.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleTicketSubmit} className="space-y-5">
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={ticketForm.name}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={ticketForm.email}
                  onChange={handleFormChange}
                  required
                  placeholder="plusway9@gmail.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={ticketForm.phone}
                  onChange={handleFormChange}
                  required
                  placeholder="9870162128"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  name="orderId"
                  value={ticketForm.orderId}
                  onChange={handleFormChange}
                  placeholder="e.g. PW-109823"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Inquiry Category *
                </label>
                <select
                  name="category"
                  value={ticketForm.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="Order Issue">Order Status & Delivery</option>
                  <option value="Part Compatibility">Part Model / Testing Question</option>
                  <option value="Return / Damaged">Replacement or Return Request</option>
                  <option value="Warranty Claim">Warranty Claim</option>
                  <option value="Wholesale Inquiry">Bulk / Wholesale Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Detailed Inquiry Message *
              </label>
              <textarea
                name="message"
                value={ticketForm.message}
                onChange={handleFormChange}
                required
                rows="4"
                placeholder="Describe your issue or spare part question in detail..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-3.5 rounded-xl uppercase text-xs tracking-wider transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Submitting Ticket..."
              ) : (
                <>
                  <Send size={16} /> Submit Support Ticket
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Support;
