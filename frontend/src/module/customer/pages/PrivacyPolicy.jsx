import React, { useState, useEffect } from "react";
import {
  Shield,
  Eye,
  Lock,
  UserCheck,
  FileText,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  Clock,
  Database,
  Globe,
  HardDrive,
  Cookie,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
} from "lucide-react";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  const sections = [
    { id: "overview", title: "1. Overview & Data Fiduciary", icon: Shield },
    { id: "collection", title: "2. Information We Collect", icon: Eye },
    { id: "usage", title: "3. How We Use Data", icon: FileText },
    { id: "legal-basis", title: "4. Legal Basis & Consent", icon: CheckCircle2 },
    { id: "sharing", title: "5. Information Sharing", icon: UserCheck },
    { id: "cookies", title: "6. Cookies & Tracking", icon: Cookie },
    { id: "retention", title: "7. Storage & Security", icon: Lock },
    { id: "rights", title: "8. Your Privacy Rights", icon: Database },
    { id: "minors", title: "9. Protection of Minors", icon: HardDrive },
    { id: "updates", title: "10. Policy Updates", icon: Globe },
    { id: "contact", title: "11. Privacy Officer Contact", icon: Phone },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i].id);
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

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSections = sections.filter((sec) =>
    sec.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Banner / Hero */}
      <div className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-slate-900 to-blue-600/20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Public Legal Document
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                Privacy Policy
              </h1>
              <p className="text-slate-300 mt-3 text-base md:text-lg max-w-3xl leading-relaxed">
                PlusWay Spare Parts is dedicated to transparent data handling. Learn how we collect, safeguard, and process your personal information under the Indian Digital Personal Data Protection (DPDP) Act & international standards.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Compliance</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={16} /> DPDP Act 2023 Compliant
              </span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Data Security</span>
              <span className="text-sm font-bold text-orange-400 flex items-center gap-1.5 mt-1">
                <Lock size={16} /> 256-Bit SSL Encrypted
              </span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Support Email</span>
              <span className="text-sm font-bold text-white truncate mt-1">plusway9@gmail.com</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Helpline</span>
              <span className="text-sm font-bold text-white mt-1">+91 9870162128</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">
          
          {/* Sidebar Sticky Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-24">
              {/* Search Bar in Nav */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search policy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-2">
                Policy Table of Contents
              </h3>

              <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {filteredSections.map((section) => {
                  const IconComponent = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                        isActive
                          ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IconComponent size={15} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
                        <span className="truncate">{section.title}</span>
                      </div>
                      <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100 text-white" : "text-slate-400"}`} />
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-2xl">
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Need data access or erasure? Contact our Privacy Helpline directly.
                </p>
                <a
                  href="tel:9870162128"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <Phone size={13} /> +91 9870162128
                </a>
              </div>
            </div>
          </div>

          {/* Main Privacy Body */}
          <div className="md:col-span-3 space-y-8">
            
            {/* Direct Contact Highlight Card */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Public Contact Information
                </span>
                <h3 className="text-xl font-black mt-2">Questions Regarding Your Privacy?</h3>
                <p className="text-white/90 text-sm mt-1">
                  Our Data Grievance Cell processes all privacy requests within 48 working hours.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <a
                  href="tel:9870162128"
                  className="bg-white text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-all shadow"
                >
                  <Phone size={15} className="text-orange-600" /> Call 9870162128
                </a>
                <a
                  href="mailto:plusway9@gmail.com"
                  className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all border border-slate-700 shadow"
                >
                  <Mail size={15} className="text-orange-400" /> plusway9@gmail.com
                </a>
              </div>
            </div>

            {/* Content Card Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-10">
              
              {/* Section 1: Overview */}
              <section id="overview" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Shield size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                      1. Overview & Data Fiduciary Details
                    </h2>
                    <span className="text-xs text-slate-500 font-semibold">Effective Date: February 2026 | Publicly Accessible</span>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
                  <p>
                    Welcome to <strong>PlusWay Spare Parts</strong> (accessible via <code>plusway.in</code> and our customer applications). We act as the Data Fiduciary responsible for protecting your personal information when you browse our spare parts portal, register an account, or complete purchases.
                  </p>
                  <p>
                    This Privacy Policy outlines how your personal data is collected, processed, stored, and protected in compliance with the Information Technology Act 2000, IT Rules 2011, and the Digital Personal Data Protection (DPDP) Act of India.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-slate-700 text-xs space-y-2">
                    <p className="font-bold text-slate-900 uppercase">Entity Contact Summary:</p>
                    <p>• <strong>Brand Name:</strong> PlusWay Spare Parts</p>
                    <p>• <strong>Official Phone Helpline:</strong> +91 9870162128</p>
                    <p>• <strong>Official Email:</strong> plusway9@gmail.com</p>
                    <p>• <strong>Operating Location:</strong> Delhi NCR, India</p>
                  </div>
                </div>
              </section>

              {/* Section 2: Information We Collect */}
              <section id="collection" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Eye size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    2. Information We Collect
                  </h2>
                </div>

                <div className="space-y-6 text-sm text-slate-600">
                  <p>
                    To fulfill spare part orders, provide replacement verification, and send dispatch tracking alerts, we collect the following categories of information:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                        <UserCheck size={18} className="text-orange-500" /> Direct Customer Information
                      </h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 font-medium">
                        <li>Full Name & Business/Technician Name</li>
                        <li>Primary Contact Number (e.g. 10-digit mobile)</li>
                        <li>Email Address (for order receipts & invoice copies)</li>
                        <li>Complete Shipping & Billing Address with Postal Pincode</li>
                        <li>GST Identification Number (optional for tax invoices)</li>
                        <li>Order verification details (e.g., unboxing video uploads)</li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                        <Database size={18} className="text-blue-500" /> Automated Technical Data
                      </h3>
                      <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 font-medium">
                        <li>IP Address and approximate geographic location</li>
                        <li>Device hardware model, browser type & OS version</li>
                        <li>Mobile Push Notification Token (FCM registration token)</li>
                        <li>Session cookies, search keywords, and page visit duration</li>
                        <li>Referral URL and clickstream history within plusway.in</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: How We Use Data */}
              <section id="usage" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <FileText size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    3. How We Use Your Information
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>We process your data strictly for legitimate operational purposes:</p>

                  <div className="grid md:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="border border-slate-200 p-4 rounded-xl bg-white shadow-xs">
                      <span className="text-orange-600 font-bold block mb-1 text-sm">Order Fulfillment</span>
                      Dispatching mobile LCDs, batteries, outer glass, and tools to your specified shipping destination via courier partners.
                    </div>
                    <div className="border border-slate-200 p-4 rounded-xl bg-white shadow-xs">
                      <span className="text-orange-600 font-bold block mb-1 text-sm">Notifications & Tracking</span>
                      Sending automated SMS, WhatsApp, and push alerts regarding shipment tracking numbers, delivery updates, and OTP logins.
                    </div>
                    <div className="border border-slate-200 p-4 rounded-xl bg-white shadow-xs">
                      <span className="text-orange-600 font-bold block mb-1 text-sm">Customer Support</span>
                      Resolving replacement tickets, technical compatibility questions, and phone inquiries handled at <strong>+91 9870162128</strong>.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Legal Basis */}
              <section id="legal-basis" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    4. Legal Basis & User Consent
                  </h2>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    By registering on PlusWay Spare Parts or making a purchase, you grant us consent to collect and process your personal data in according to this agreement.
                  </p>
                  <p>
                    You retain the right to withdraw your consent at any time by writing to <strong>plusway9@gmail.com</strong>. Please note that withdrawing consent may prevent us from dispatching pending orders or providing order status updates.
                  </p>
                </div>
              </section>

              {/* Section 5: Information Sharing */}
              <section id="sharing" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <UserCheck size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    5. Information Sharing & Third Parties
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-600">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 text-xs font-semibold text-red-900 rounded-r-xl">
                    <strong>Zero Data Sale Guarantee:</strong> PlusWay Spare Parts NEVER sells, rents, or trades your personal information or contact list to external advertising agencies or spam aggregators.
                  </div>

                  <p>We share data exclusively with trusted service providers essential for platform operations:</p>
                  <ul className="list-disc pl-5 space-y-2 text-xs text-slate-700 font-medium">
                    <li><strong>Logistics Partners:</strong> Delivery services (e.g. BlueDart, Delhivery, India Post) receive your address and contact phone number (+91 9870162128 format) for delivery dispatch.</li>
                    <li><strong>Payment Gateways:</strong> Payment processors (e.g. UPI, NetBanking, Razorpay, Cashfree) handle transaction details directly under PCI-DSS compliance. We do NOT store complete credit/debit card numbers.</li>
                    <li><strong>SMS & Notification Gateways:</strong> Service providers delivering OTPs and tracking alerts via SMS or push notifications.</li>
                    <li><strong>Legal Requirements:</strong> Disclosures made when required by Indian judicial authorities, law enforcement agencies, or statutory obligations.</li>
                  </ul>
                </div>
              </section>

              {/* Section 6: Cookies */}
              <section id="cookies" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Cookie size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    6. Cookies & Web Beacons Policy
                  </h2>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    We use cookies and local storage tokens to recognize your logged-in account, maintain cart items, store language preferences, and analyze platform performance.
                  </p>
                  <p className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
                    You can manage or disable non-essential cookies via your browser settings. Disabling cookies may affect core shopping functionality such as retaining cart items between sessions.
                  </p>
                </div>
              </section>

              {/* Section 7: Security & Storage */}
              <section id="retention" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Lock size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    7. Data Storage & Security Measures
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    All personal data is stored on secure cloud servers protected by firewall controls and SSL/TLS encryption in transit.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs font-semibold text-slate-700">
                    <li>Data Retention: Account information is stored as long as your account remains active or as required by GST taxation laws.</li>
                    <li>Automated Backups: Encrypted backups are performed regularly to safeguard against data loss.</li>
                  </ul>
                </div>
              </section>

              {/* Section 8: Your Rights */}
              <section id="rights" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Database size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    8. Your Rights Under DPDP Act 2023
                  </h2>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p>As a customer in India, you enjoy the following privacy rights:</p>
                  <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium">
                      <strong>Right to Access Summary:</strong> Request a copy of the personal data held about you.
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium">
                      <strong>Right to Correction:</strong> Update outdated addresses, phone numbers, or email credentials.
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium">
                      <strong>Right to Erasure:</strong> Request permanent deletion of account data where statutory retention doesn't apply.
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-medium">
                      <strong>Grievance Redressal:</strong> Submit privacy concerns directly to our dedicated support team.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 9 & 10 */}
              <section id="minors" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">9. Protection of Minors</h3>
                <p className="text-sm text-slate-600">
                  Our services are not intended for individuals under 18 years of age without parental supervision. We do not knowingly collect personal data from minors.
                </p>
              </section>

              <section id="updates" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">10. Policy Updates</h3>
                <p className="text-sm text-slate-600">
                  We reserve the right to revise this Privacy Policy to reflect technical, operational, or legal changes. Material revisions will be posted publicly on this page with an updated timestamp.
                </p>
              </section>

              {/* Section 11: Contact */}
              <section id="contact" className="scroll-mt-28 bg-slate-900 text-white rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-8 h-8 text-orange-400" />
                  <div>
                    <h2 className="text-xl font-black uppercase text-white">11. Privacy Grievance Officer</h2>
                    <p className="text-xs text-slate-400">Directly contact our team for privacy inquiries</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-800 text-sm">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Customer Support Helpline</p>
                    <p className="text-lg font-extrabold text-orange-400">+91 9870162128</p>
                    <p className="text-xs text-slate-300">Available Mon-Sat (9:00 AM - 7:00 PM IST)</p>
                    <button
                      onClick={() => copyToClipboard("9870162128", "phone")}
                      className="text-xs text-slate-400 hover:text-white underline mt-1 block"
                    >
                      {copiedField === "phone" ? "Copied phone number!" : "Copy Phone Number"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Privacy Email Desk</p>
                    <p className="text-lg font-extrabold text-orange-400">plusway9@gmail.com</p>
                    <p className="text-xs text-slate-300">Response SLA within 24-48 working hours</p>
                    <button
                      onClick={() => copyToClipboard("plusway9@gmail.com", "email")}
                      className="text-xs text-slate-400 hover:text-white underline mt-1 block"
                    >
                      {copiedField === "email" ? "Copied email!" : "Copy Email Address"}
                    </button>
                  </div>
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
