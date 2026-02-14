import React, { useState } from "react";
import { BookOpen, Search, Download, Video, FileText, ChevronDown, ChevronUp } from "lucide-react";

const HowToManuals = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [openCategory, setOpenCategory] = useState(null);

    const manuals = [
        {
            category: "Getting Started",
            icon: BookOpen,
            guides: [
                {
                    title: "How to Create an Account",
                    description: "Step-by-step guide to register on PlusWay",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Find the Right Spare Part",
                    description: "Learn to navigate our catalog by brand and model",
                    type: "Video",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Place an Order",
                    description: "Complete guide to ordering products",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
            ],
        },
        {
            category: "Payment & Checkout",
            icon: FileText,
            guides: [
                {
                    title: "Payment Methods Guide",
                    description: "All accepted payment options explained",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Apply Discount Codes",
                    description: "Use promo codes and coupons",
                    type: "Video",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "Checkout Process Tutorial",
                    description: "Complete your purchase successfully",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
            ],
        },
        {
            category: "Orders & Shipping",
            icon: FileText,
            guides: [
                {
                    title: "How to Track Your Order",
                    description: "Real-time order tracking guide",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Cancel or Modify Orders",
                    description: "Make changes to your order",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "Understanding Shipping Options",
                    description: "Choose the right delivery method",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
            ],
        },
        {
            category: "Returns & Replacements",
            icon: FileText,
            guides: [
                {
                    title: "How to Request a Return",
                    description: "Step-by-step return process",
                    type: "Video",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Request a Replacement",
                    description: "Get defective products replaced",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Get a Refund",
                    description: "Understanding the refund process",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
            ],
        },
        {
            category: "Account Management",
            icon: FileText,
            guides: [
                {
                    title: "How to Update Profile Information",
                    description: "Manage your account details",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Manage Addresses",
                    description: "Add and edit shipping addresses",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
                {
                    title: "How to Reset Your Password",
                    description: "Recover access to your account",
                    type: "PDF",
                    videoUrl: "#",
                    pdfUrl: "#",
                },
            ],
        },
    ];

    const filteredManuals = manuals
        .map((category) => ({
            ...category,
            guides: category.guides.filter(
                (guide) =>
                    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        }))
        .filter((category) => category.guides.length > 0);

    const toggleCategory = (index) => {
        setOpenCategory(openCategory === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <BookOpen className="w-12 h-12" />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            How-To Manuals
                        </h1>
                    </div>
                    <p className="text-lg text-white/90 max-w-2xl">
                        User guides and tutorials to help you get the most out of PlusWay
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Search */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for a guide..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors font-medium shadow-md"
                        />
                    </div>
                </div>

                {/* Manuals by Category */}
                <div className="space-y-4">
                    {filteredManuals.map((category, categoryIndex) => {
                        const IconComponent = category.icon;
                        return (
                            <div
                                key={categoryIndex}
                                className="bg-white rounded-xl shadow-md overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleCategory(categoryIndex)}
                                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                                            <IconComponent className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-xl font-black text-secondary uppercase">
                                                {category.category}
                                            </h2>
                                            <p className="text-sm text-gray-500 font-medium">
                                                {category.guides.length} guide
                                                {category.guides.length !== 1 ? "s" : ""} available
                                            </p>
                                        </div>
                                    </div>
                                    {openCategory === categoryIndex ? (
                                        <ChevronUp className="w-6 h-6 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-400" />
                                    )}
                                </button>

                                {openCategory === categoryIndex && (
                                    <div className="px-6 pb-6 border-t bg-gray-50">
                                        <div className="grid md:grid-cols-2 gap-4 pt-6">
                                            {category.guides.map((guide, guideIndex) => (
                                                <div
                                                    key={guideIndex}
                                                    className="bg-white rounded-lg p-5 border-2 border-gray-100 hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h3 className="font-black text-secondary text-base flex-1 pr-3">
                                                            {guide.title}
                                                        </h3>
                                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-black uppercase flex-shrink-0">
                                                            {guide.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-medium mb-4">
                                                        {guide.description}
                                                    </p>
                                                    <div className="flex gap-2">
                                                        {guide.type === "Video" && (
                                                            <a
                                                                href={guide.videoUrl}
                                                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-3 rounded text-xs uppercase hover:bg-orange-600 transition-colors"
                                                            >
                                                                <Video size={14} />
                                                                Watch
                                                            </a>
                                                        )}
                                                        <a
                                                            href={guide.pdfUrl}
                                                            className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-3 rounded text-xs uppercase hover:bg-gray-800 transition-colors"
                                                        >
                                                            <Download size={14} />
                                                            Download PDF
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredManuals.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-md">
                        <p className="text-gray-500 font-medium">
                            No guides found for "{searchQuery}"
                        </p>
                    </div>
                )}

                {/* Help Section */}
                <div className="bg-gradient-to-r from-secondary to-primary text-white rounded-xl p-8 mt-12 text-center">
                    <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
                        Can't Find What You Need?
                    </h2>
                    <p className="text-white/90 mb-6">
                        Our support team is here to help you with any questions
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-white text-secondary px-8 py-3 rounded font-black uppercase text-sm tracking-widest hover:bg-gray-100 transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HowToManuals;
