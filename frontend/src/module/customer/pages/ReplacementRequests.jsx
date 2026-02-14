import React, { useState } from "react";
import { RotateCcw, Upload, Camera, Send, AlertCircle } from "lucide-react";

const ReplacementRequests = () => {
    const [formData, setFormData] = useState({
        orderId: "",
        productName: "",
        reason: "",
        description: "",
        imageUrl: "",
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

        // Simulate form submission
        setTimeout(() => {
            alert(
                "Replacement request submitted successfully! Our team will review it and contact you within 24 hours."
            );
            setFormData({
                orderId: "",
                productName: "",
                reason: "",
                description: "",
                imageUrl: "",
            });
            setIsSubmitting(false);
        }, 1000);

        // TODO: Implement actual API call
    };

    const replacementReasons = [
        "Defective product",
        "Wrong item delivered",
        "Damaged during shipping",
        "Missing parts or accessories",
        "Not as described",
        "Other",
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <RotateCcw className="w-12 h-12" />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Replacement Requests
                        </h1>
                    </div>
                    <p className="text-lg text-white/90 max-w-2xl">
                        Request a replacement for defective or damaged products
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Information Banner */}
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl p-6 mb-8">
                    <div className="flex gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-base font-black text-blue-800 uppercase mb-2">
                                Before You Submit
                            </h3>
                            <ul className="space-y-1 text-sm text-blue-700 font-medium">
                                <li>• Replacements are available within 30 days of delivery</li>
                                <li>• Photos of the defect or damage are required</li>
                                <li>• Keep the original packaging if possible</li>
                                <li>• We'll review your request within 24 hours</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Replacement Request Form */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Send className="w-8 h-8 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-black text-secondary uppercase">
                            Submit Replacement Request
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Order Information */}
                        <div>
                            <h3 className="text-lg font-black text-secondary uppercase mb-4 pb-2 border-b">
                                Order Information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Order ID *
                                    </label>
                                    <input
                                        type="text"
                                        name="orderId"
                                        value={formData.orderId}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                        placeholder="e.g., ORD123456"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 font-medium">
                                        Found in your order confirmation email
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="productName"
                                        value={formData.productName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                        placeholder="Enter product name"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Issue Details */}
                        <div>
                            <h3 className="text-lg font-black text-secondary uppercase mb-4 pb-2 border-b">
                                Issue Details
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Reason for Replacement *
                                    </label>
                                    <select
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                    >
                                        <option value="">Select a reason</option>
                                        {replacementReasons.map((reason, index) => (
                                            <option key={index} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Detailed Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium resize-none"
                                        placeholder="Please describe the issue in detail..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                        Photo/Video Evidence *
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center">
                                                <Camera className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-700 mb-1">
                                                    Upload photos showing the defect or damage
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    Provide a link to your photos (Google Drive, Dropbox, etc.)
                                                </p>
                                            </div>
                                            <input
                                                type="url"
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleChange}
                                                required
                                                className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-white font-black py-3 rounded uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    "Submitting..."
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Replacement Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Process Information */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-black text-secondary uppercase mb-4">
                            What Happens Next?
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600 font-medium">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                    1
                                </div>
                                <p>We'll review your request within 24 hours</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                    2
                                </div>
                                <p>If approved, we'll arrange product pickup</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                    3
                                </div>
                                <p>Replacement will be shipped immediately</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                    4
                                </div>
                                <p>Receive your replacement within 3-5 days</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6">
                        <h3 className="text-lg font-black text-secondary uppercase mb-4">
                            Need Help?
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mb-4">
                            If you have questions about the replacement process, our support
                            team is here to assist you.
                        </p>
                        <div className="space-y-2 text-sm">
                            <a
                                href="/contact"
                                className="block text-gray-700 hover:text-primary transition-colors font-bold"
                            >
                                → Contact Support
                            </a>
                            <a
                                href="/refund-policy"
                                className="block text-gray-700 hover:text-primary transition-colors font-bold"
                            >
                                → Refund Policy
                            </a>
                            <a
                                href="/warranty"
                                className="block text-gray-700 hover:text-primary transition-colors font-bold"
                            >
                                → Warranty Information
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplacementRequests;
