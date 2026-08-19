import React, { useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, Send, Clock, MessageSquare } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(API_ENDPOINTS.CREATE_FORM_SUBMISSION, {
        formType: "Contact",
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      alert("Thank you for contacting us! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to submit contact form", error);
      alert(
        error.response?.data?.message ||
          "Failed to send your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "plusway9@gmail.com",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+91 9870162128",
      description: "Mon-Sat: 9:00 AM - 7:00 PM",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "New Delhi, India",
      description: "Visit our office",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl">
            We're here to help! Get in touch with our team
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-black text-secondary uppercase mb-2">
                  {info.title}
                </h3>
                <p className="text-base font-bold text-gray-800 mb-1">
                  {info.details}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Contact Form and Info */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h2 className="text-2xl md:text-3xl font-black text-secondary uppercase">
                Send a Message
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                    placeholder="+91 XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                    placeholder="How can we help?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium resize-none"
                  placeholder="Tell us more about your inquiry..."></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-black py-3 rounded uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Business Hours & Additional Info */}
          <div className="space-y-6">
            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-black text-secondary uppercase">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday:</span>
                  <span className="text-gray-800 font-bold">
                    9:00 AM - 7:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday:</span>
                  <span className="text-gray-800 font-bold">
                    10:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday:</span>
                  <span className="text-gray-800 font-bold">Closed</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6">
              <h3 className="text-lg font-black text-secondary uppercase mb-4">
                Need Quick Help?
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href="/support"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Visit our Help Center
                </a>
                <a
                  href="/track-order"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Track Your Order
                </a>
                <a
                  href="/replacement-requests"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Request Replacement
                </a>
                <a
                  href="/warranty"
                  className="block text-gray-700 hover:text-primary transition-colors font-bold">
                  → Warranty Information
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
