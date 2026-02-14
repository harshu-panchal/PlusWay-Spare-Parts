import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    HelpCircle,
    Search,
    MessageCircle,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const Support = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const faqs = [
        {
            question: "How do I track my order?",
            answer:
                "You can track your order by visiting the 'Track Order' page and entering your order ID or email address. You'll also receive tracking updates via email and SMS.",
        },
        {
            question: "What payment methods do you accept?",
            answer:
                "We accept Credit/Debit Cards (Visa, Mastercard), UPI, Net Banking, and Digital Wallets. All payments are processed securely.",
        },
        {
            question: "How long does shipping take?",
            answer:
                "Shipping typically takes 3-7 business days depending on your location. Express shipping options are available at checkout for faster delivery.",
        },
        {
            question: "Can I return a product?",
            answer:
                "Yes, products can be returned within 30 days of delivery if they are unused and in original packaging. Please refer to our Refund Policy for complete details.",
        },
        {
            question: "How do I find the right spare part for my vehicle?",
            answer:
                "Use our Brand Selection tool to browse by vehicle make and model. You can also search by part number or contact our support team for assistance.",
        },
        {
            question: "Are all products genuine?",
            answer:
                "Yes, we only sell 100% genuine spare parts sourced directly from authorized manufacturers and distributors.",
        },
        {
            question: "What if I receive a damaged or defective product?",
            answer:
                "Contact us immediately with photos of the damage. We'll arrange for a replacement or refund at no additional cost to you.",
        },
        {
            question: "How do I cancel my order?",
            answer:
                "Orders can be cancelled before they are shipped. Log in to your account, go to 'My Orders', and click 'Cancel Order'. If the order has already shipped, you'll need to wait for delivery and initiate a return.",
        },
        {
            question: "Do you offer installation services?",
            answer:
                "We provide installation guides and video tutorials. For professional installation, we can recommend trusted service centers in your area.",
        },
        {
            question: "How do I apply a warranty claim?",
            answer:
                "Contact our warranty support team with your order details and description of the issue. Refer to our Warranty Policy page for the complete claim process.",
        },
    ];

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const supportChannels = [
        {
            icon: Phone,
            title: "Phone Support",
            details: "+91 9599197756",
            description: "Mon-Sat: 9 AM - 7 PM",
        },
        {
            icon: Mail,
            title: "Email Support",
            details: "support@plusway.com",
            description: "Response within 24 hours",
        },
        {
            icon: MessageCircle,
            title: "Live Chat",
            details: "Chat with us",
            description: "Available during business hours",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <HelpCircle className="w-12 h-12" />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Support Center
                        </h1>
                    </div>
                    <p className="text-lg text-white/90 max-w-2xl">
                        How can we help you today?
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors font-medium text-lg shadow-md"
                        />
                    </div>
                </div>

                {/* Support Channels */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {supportChannels.map((channel, index) => {
                        const IconComponent = channel.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IconComponent className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-lg font-black text-secondary uppercase mb-2">
                                    {channel.title}
                                </h3>
                                <p className="text-base font-bold text-gray-800 mb-1">
                                    {channel.details}
                                </p>
                                <p className="text-sm text-gray-500 font-medium">
                                    {channel.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-black text-secondary uppercase mb-6">
                        Frequently Asked Questions
                    </h2>

                    {filteredFaqs.length > 0 ? (
                        <div className="space-y-4">
                            {filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="border-2 border-gray-200 rounded-lg overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <span className="font-bold text-gray-800 pr-4">
                                            {faq.question}
                                        </span>
                                        {openFaqIndex === index ? (
                                            <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>
                                    {openFaqIndex === index && (
                                        <div className="p-4 pt-0 bg-gray-50">
                                            <p className="text-gray-600 font-medium text-sm">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 font-medium">
                                No results found for "{searchQuery}". Try searching with
                                different keywords or{" "}
                                <Link to="/contact" className="text-primary font-bold hover:underline">
                                    contact our support team
                                </Link>
                                .
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid md:grid-cols-4 gap-6 mt-12">
                    <Link
                        to="/track-order"
                        className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-base font-black text-secondary uppercase mb-2">
                            Track Order
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                            Check your order status
                        </p>
                    </Link>
                    <Link
                        to="/replacement-requests"
                        className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-base font-black text-secondary uppercase mb-2">
                            Replacement
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                            Request product replacement
                        </p>
                    </Link>
                    <Link
                        to="/refund-policy"
                        className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-base font-black text-secondary uppercase mb-2">
                            Returns
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                            Learn about our return policy
                        </p>
                    </Link>
                    <Link
                        to="/warranty"
                        className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                    >
                        <h3 className="text-base font-black text-secondary uppercase mb-2">
                            Warranty
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                            Warranty information
                        </p>
                    </Link>
                </div>

                {/* Still Need Help */}
                <div className="bg-gradient-to-r from-secondary to-primary text-white rounded-xl p-8 mt-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
                        Still Need Help?
                    </h2>
                    <p className="text-white/90 mb-6">
                        Our support team is here to assist you
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block bg-white text-secondary px-8 py-3 rounded font-black uppercase text-sm tracking-widest hover:bg-gray-100 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Support;
