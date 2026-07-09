import React, { useState, useEffect } from "react";
import { Shield, Eye, Lock, UserCheck, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("collection");

  const sections = [
    { id: "collection", title: "Information Collection", icon: Eye },
    { id: "usage", title: "How We Use Data", icon: FileText },
    { id: "sharing", title: "Information Sharing", icon: UserCheck },
    { id: "security", title: "Data Security", icon: Lock },
    { id: "rights", title: "Your Rights", icon: Shield },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((section) =>
        document.getElementById(section.id),
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
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Your privacy is important to us. Learn how we collect, use, and
            protect your information.
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
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm font-bold transition-colors flex items-center gap-2 ${
                        activeSection === section.id
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}>
                      <IconComponent size={16} />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="prose prose-sm md:prose max-w-none">
              {/* Introduction */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <p className="text-gray-600 font-medium leading-relaxed">
                  At plusway.in, we are committed to protecting your privacy and
                  ensuring the security of your personal information. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website or make
                  a purchase from us.
                </p>
              </div>

              {/* Information Collection */}
              <section id="collection" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-black text-secondary uppercase mb-4 flex items-center gap-3">
                  <Eye className="w-7 h-7 text-primary" />
                  Information We Collect
                </h2>
                <div className="space-y-4 text-gray-600 font-medium">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Personal Information
                    </h3>
                    <p className="mb-2">
                      We collect information that you provide directly to us,
                      including:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>
                        Name and contact information (email, phone number)
                      </li>
                      <li>Shipping and billing addresses</li>
                      <li>Payment information (processed securely)</li>
                      <li>Order history and preferences</li>
                      <li>Account credentials</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Automatically Collected Information
                    </h3>
                    <p className="mb-2">
                      When you visit our website, we automatically collect:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>IP address and browser information</li>
                      <li>Device identifiers and characteristics</li>
                      <li>Pages viewed and time spent on pages</li>
                      <li>Referring website addresses</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Data */}
              <section id="usage" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-black text-secondary uppercase mb-4 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-primary" />
                  How We Use Your Information
                </h2>
                <div className="space-y-3 text-gray-600 font-medium">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Process and fulfill your orders</li>
                    <li>Communicate with you about your orders and account</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>
                      Send promotional emails and marketing communications (with
                      your consent)
                    </li>
                    <li>Improve our website and services</li>
                    <li>Prevent fraud and enhance security</li>
                    <li>Comply with legal obligations</li>
                    <li>Personalize your shopping experience</li>
                  </ul>
                </div>
              </section>

              {/* Information Sharing */}
              <section id="sharing" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-black text-secondary uppercase mb-4 flex items-center gap-3">
                  <UserCheck className="w-7 h-7 text-primary" />
                  Information Sharing
                </h2>
                <div className="space-y-3 text-gray-600 font-medium">
                  <p>
                    We do not sell your personal information. We may share your
                    information with:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Service Providers:</strong> Third-party companies
                      that help us operate our business (payment processors,
                      shipping companies, etc.)
                    </li>
                    <li>
                      <strong>Business Partners:</strong> Trusted partners who
                      assist in delivering our services
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect our rights
                    </li>
                    <li>
                      <strong>Business Transfers:</strong> In connection with a
                      merger, acquisition, or sale of assets
                    </li>
                  </ul>
                </div>
              </section>

              {/* Data Security */}
              <section id="security" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-black text-secondary uppercase mb-4 flex items-center gap-3">
                  <Lock className="w-7 h-7 text-primary" />
                  Data Security
                </h2>
                <div className="space-y-3 text-gray-600 font-medium">
                  <p>
                    We implement appropriate technical and organizational
                    measures to protect your personal information, including:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>SSL/TLS encryption for data transmission</li>
                    <li>Secure servers and databases</li>
                    <li>Regular security audits and updates</li>
                    <li>Access controls and authentication</li>
                    <li>Employee training on data protection</li>
                  </ul>
                  <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                    <strong>Note:</strong> While we strive to protect your
                    information, no method of transmission over the internet is
                    100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* Your Rights */}
              <section id="rights" className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-black text-secondary uppercase mb-4 flex items-center gap-3">
                  <Shield className="w-7 h-7 text-primary" />
                  Your Privacy Rights
                </h2>
                <div className="space-y-3 text-gray-600 font-medium">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Object to processing of your information</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Request data portability</li>
                    <li>Withdraw consent at any time</li>
                  </ul>
                  <p className="mt-4">
                    To exercise these rights, please contact us at{" "}
                    <a
                      href="mailto:privacy@plusway.in"
                      className="text-primary font-bold hover:underline">
                      privacy@plusway.in
                    </a>
                  </p>
                </div>
              </section>

              {/* Cookies */}
              <section className="mb-10">
                <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                  Cookies Policy
                </h2>
                <div className="space-y-3 text-gray-600 font-medium">
                  <p>
                    We use cookies and similar tracking technologies to improve
                    your browsing experience. You can control cookies through
                    your browser settings. Note that disabling cookies may
                    affect website functionality.
                  </p>
                </div>
              </section>

              {/* Contact */}
              <section className="bg-gray-50 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-black text-secondary uppercase mb-3">
                  Questions About This Policy?
                </h3>
                <p className="text-gray-600 font-medium mb-3">
                  If you have any questions or concerns about our privacy
                  practices, please contact us:
                </p>
                <div className="text-sm space-y-1 text-gray-700 font-medium">
                  <p>Email: privacy@plusway.in</p>
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

export default PrivacyPolicy;
