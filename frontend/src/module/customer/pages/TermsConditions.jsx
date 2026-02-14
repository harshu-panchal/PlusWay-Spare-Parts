import React, { useState, useEffect } from "react";
import { FileText, Scale, AlertCircle } from "lucide-react";

const TermsConditions = () => {
    const [activeSection, setActiveSection] = useState("acceptance");

    const sections = [
        { id: "acceptance", title: "Acceptance of Terms" },
        { id: "account", title: "Account Registration" },
        { id: "purchases", title: "Purchases & Payment" },
        { id: "shipping", title: "Shipping & Delivery" },
        { id: "returns", title: "Returns & Refunds" },
        { id: "warranty", title: "Warranties" },
        { id: "liability", title: "Limitation of Liability" },
        { id: "intellectual", title: "Intellectual Property" },
        { id: "prohibited", title: "Prohibited Uses" },
        { id: "termination", title: "Termination" },
        { id: "changes", title: "Changes to Terms" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = sections.map((section) =>
                document.getElementById(section.id)
            );
            const scrollPosition = window.scrollY + 200;

            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const element = sectionElements[i];
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveSection(sections[i].id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Scale className="w-12 h-12" />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Terms & Conditions
                        </h1>
                    </div>
                    <p className="text-lg text-white/90 max-w-2xl">
                        Please read these terms carefully before using our services
                    </p>
                    <p className="text-sm text-white/70 mt-2">
                        Last Updated: February 2026
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
                            <h3 className="text-sm font-black text-secondary uppercase mb-4 px-2">
                                Quick Navigation
                            </h3>
                            <nav className="space-y-1">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded text-xs font-bold transition-colors ${activeSection === section.id
                                                ? "bg-primary text-white"
                                                : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {section.title}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6 md:p-8">
                        <div className="prose prose-sm max-w-none">
                            {/* Introduction */}
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-800 font-medium">
                                        By accessing and using plusway.com, you accept and agree to
                                        be bound by the terms and provision of this agreement. If
                                        you do not agree to these terms, please do not use our
                                        services.
                                    </p>
                                </div>
                            </div>

                            {/* Sections */}
                            <section id="acceptance" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    1. Acceptance of Terms
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        These Terms and Conditions constitute a legally binding
                                        agreement between you and PlusWay.com (operated by Elcotek).
                                        By accessing our website and purchasing products, you agree
                                        to comply with these terms.
                                    </p>
                                    <p>
                                        We reserve the right to modify these terms at any time. Your
                                        continued use of the website following any changes indicates
                                        your acceptance of the new terms.
                                    </p>
                                </div>
                            </section>

                            <section id="account" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    2. Account Registration
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>To make purchases, you must create an account with:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Accurate and complete information</li>
                                        <li>A valid email address</li>
                                        <li>A secure password</li>
                                    </ul>
                                    <p>
                                        You are responsible for maintaining the confidentiality of
                                        your account credentials and for all activities that occur
                                        under your account.
                                    </p>
                                </div>
                            </section>

                            <section id="purchases" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    3. Purchases & Payment
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>All prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated.</p>
                                    <p>We accept the following payment methods:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Credit/Debit Cards (Visa, Mastercard)</li>
                                        <li>UPI (Unified Payments Interface)</li>
                                        <li>Net Banking</li>
                                        <li>Digital Wallets</li>
                                    </ul>
                                    <p>
                                        Payment must be received before order processing. We reserve
                                        the right to refuse or cancel any order for any reason.
                                    </p>
                                </div>
                            </section>

                            <section id="shipping" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    4. Shipping & Delivery
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        We ship to addresses across India. Delivery times vary based
                                        on location and product availability. Estimated delivery
                                        times are provided at checkout but are not guaranteed.
                                    </p>
                                    <p>
                                        Risk of loss and title for items pass to you upon delivery
                                        to the carrier. We are not responsible for delays caused by
                                        the shipping carrier or force majeure events.
                                    </p>
                                </div>
                            </section>

                            <section id="returns" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    5. Returns & Refunds
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        Items may be returned within 30 days of delivery if they are
                                        unused, in original packaging, and in resalable condition.
                                        Please refer to our{" "}
                                        <a href="/refund-policy" className="text-primary font-bold hover:underline">
                                            Refund Policy
                                        </a>{" "}
                                        for complete details.
                                    </p>
                                    <p>
                                        Refunds will be processed within 5-7 business days of
                                        receiving the returned item.
                                    </p>
                                </div>
                            </section>

                            <section id="warranty" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    6. Warranties
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        Products are covered by manufacturer warranties as specified
                                        in product descriptions. Please refer to our{" "}
                                        <a href="/warranty" className="text-primary font-bold hover:underline">
                                            Warranty Policy
                                        </a>{" "}
                                        for details on coverage and claims.
                                    </p>
                                    <p>
                                        We guarantee that all products are genuine and sourced from
                                        authorized distributors.
                                    </p>
                                </div>
                            </section>

                            <section id="liability" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    7. Limitation of Liability
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        To the maximum extent permitted by law, PlusWay.com shall
                                        not be liable for any indirect, incidental, special, or
                                        consequential damages arising from your use of our products
                                        or services.
                                    </p>
                                    <p>
                                        Our total liability shall not exceed the amount paid by you
                                        for the product giving rise to the claim.
                                    </p>
                                </div>
                            </section>

                            <section id="intellectual" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    8. Intellectual Property
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        All content on this website, including text, graphics, logos,
                                        images, and software, is the property of PlusWay.com or its
                                        content suppliers and is protected by copyright and
                                        intellectual property laws.
                                    </p>
                                    <p>
                                        You may not reproduce, distribute, or create derivative works
                                        without our express written permission.
                                    </p>
                                </div>
                            </section>

                            <section id="prohibited" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    9. Prohibited Uses
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>You agree not to:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>Use the website for any unlawful purpose</li>
                                        <li>Attempt to gain unauthorized access to any systems</li>
                                        <li>Transmit viruses or malicious code</li>
                                        <li>Harass, abuse, or harm other users</li>
                                        <li>Engage in fraudulent activities</li>
                                        <li>Scrape or harvest data without permission</li>
                                    </ul>
                                </div>
                            </section>

                            <section id="termination" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    10. Termination
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        We reserve the right to terminate or suspend your account and
                                        access to our services immediately, without prior notice, for
                                        any breach of these Terms and Conditions.
                                    </p>
                                    <p>
                                        Upon termination, your right to use the website will cease
                                        immediately.
                                    </p>
                                </div>
                            </section>

                            <section id="changes" className="mb-8 scroll-mt-24">
                                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                                    11. Changes to Terms
                                </h2>
                                <div className="space-y-3 text-gray-600 font-medium text-sm">
                                    <p>
                                        We may revise these Terms and Conditions at any time by
                                        updating this page. You should check this page periodically
                                        to review the current terms.
                                    </p>
                                    <p>
                                        Your continued use of the website after changes are posted
                                        constitutes your acceptance of the modified terms.
                                    </p>
                                </div>
                            </section>

                            {/* Contact */}
                            <section className="bg-gray-50 rounded-lg p-6 mt-8">
                                <h3 className="text-lg font-black text-secondary uppercase mb-3">
                                    Questions About These Terms?
                                </h3>
                                <p className="text-gray-600 font-medium text-sm mb-3">
                                    If you have any questions about these Terms and Conditions,
                                    please contact us:
                                </p>
                                <div className="text-sm space-y-1 text-gray-700 font-medium">
                                    <p>Email: legal@plusway.com</p>
                                    <p>Phone: +91 9599197756</p>
                                    <p>Address: New Delhi, India</p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;
