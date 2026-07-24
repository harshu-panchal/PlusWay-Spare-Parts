import React, { useState, useEffect } from "react";
import {
  Scale,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Wrench,
  Lock,
  Phone,
  Mail,
  Search,
  ChevronRight,
  Printer,
  Sparkles,
} from "lucide-react";

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState("acceptance");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedField, setCopiedField] = useState(null);

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms", icon: Scale },
    { id: "account", title: "2. User Registration & Eligibility", icon: CheckCircle2 },
    { id: "products", title: "3. Spare Parts & Compatibility", icon: Wrench },
    { id: "purchases", title: "4. Pricing & Payment Terms", icon: FileText },
    { id: "shipping", title: "5. Shipping & Delivery Terms", icon: Truck },
    { id: "returns", title: "6. Returns & Unboxing Video Policy", icon: RotateCcw },
    { id: "testing", title: "7. Mandatory Part Testing Protocol", icon: ShieldCheck },
    { id: "warranty", title: "8. Warranty & Disclaimer", icon: AlertTriangle },
    { id: "intellectual", title: "9. Intellectual Property Rights", icon: Lock },
    { id: "prohibited", title: "10. Prohibited Platform Conduct", icon: AlertTriangle },
    { id: "liability", title: "11. Limitation of Liability", icon: Scale },
    { id: "jurisdiction", title: "12. Governing Law & Jurisdiction", icon: Scale },
    { id: "contact", title: "13. Official Support Contacts", icon: Phone },
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
      {/* Hero Header */}
      <div className="bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-slate-900 to-blue-600/20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Legally Binding Agreement
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white uppercase">
                Terms & Conditions
              </h1>
              <p className="text-slate-300 mt-3 text-base md:text-lg max-w-3xl leading-relaxed">
                Welcome to PlusWay Spare Parts. Please read these terms carefully before accessing our website, purchasing mobile/laptop spare parts, or using our technical support.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg border border-slate-700 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Printer size={16} /> Print Terms
              </button>
            </div>
          </div>

          {/* Quick Metrics / Highlights Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-800/80">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Applicability</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle2 size={16} /> Publicly Accessible
              </span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Jurisdiction</span>
              <span className="text-sm font-bold text-orange-400 flex items-center gap-1.5 mt-1">
                <Scale size={16} /> New Delhi, India
              </span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Customer Support</span>
              <span className="text-sm font-bold text-white mt-1">+91 9870162128</span>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="block text-xs font-semibold text-slate-400 uppercase">Official Email</span>
              <span className="text-sm font-bold text-white truncate mt-1">plusway9@gmail.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-4 gap-8">

          {/* Sidebar Sticky Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-24">
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 font-medium"
                />
              </div>

              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-2">
                Terms Navigation
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
            </div>
          </div>

          {/* Main Terms Body */}
          <div className="md:col-span-3 space-y-8">

            {/* Crucial Notice Banner */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5 shadow-xs flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1 font-medium">
                <p className="font-bold text-sm text-amber-950 uppercase">Mandatory Technician Notice for Spare Parts:</p>
                <p>
                  All mobile displays (LCDs/OLEDs), batteries, flex cables, and outer glass parts MUST be tested thoroughly <strong>BEFORE removing protective films, warranty stamps, or applying adhesive/glue</strong>. Removing protective films voids return eligibility.
                </p>
              </div>
            </div>

            {/* Container for Terms Sections */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 space-y-10">

              {/* Section 1 */}
              <section id="acceptance" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Scale size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                      1. Acceptance of Terms
                    </h2>
                    <span className="text-xs text-slate-500 font-semibold">Last Updated: February 2026</span>
                  </div>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    These Terms and Conditions constitute a legally binding agreement between you ("User", "Technician", "Customer") and <strong>PlusWay Spare Parts</strong> (operating via <code>plusway.in</code>).
                  </p>
                  <p>
                    By browsing our site, registering an account, or placing an order, you confirm that you have read, understood, and agreed to be bound by these terms. If you do not agree, please discontinue website usage immediately.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section id="account" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <CheckCircle2 size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    2. User Registration & Eligibility
                  </h2>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    To place wholesale or retail orders, you must create an account providing accurate contact details.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 font-medium">
                    <li>You must be at least 18 years of age or accessing under the supervision of a legal guardian.</li>
                    <li>You are responsible for keeping your phone number (+91), OTP credentials, and password confidential.</li>
                    <li>PlusWay reserves the right to suspend accounts engaged in fake orders or fraudulent payment activities.</li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section id="products" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Wrench size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    3. Spare Parts Compatibility & Specifications
                  </h2>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    We provide high-grade replacement spare parts (displays, touch screens, batteries, charging ICs, flex cables, back panels, repair toolkits) compatible with popular smartphone and tablet brands.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                    <strong>Technical Note:</strong> Unless explicitly identified as original OEM parts, products are premium aftermarket replacements tested to match standard factory performance specs. Users must verify exact smartphone model numbers prior to placing orders.
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="purchases" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FileText size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    4. Pricing & Payment Terms
                  </h2>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    All product prices are quoted in Indian Rupees (INR) and include GST unless stated otherwise.
                  </p>
                  <p>We support secure electronic payment methods including:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 font-medium">
                    <li>Unified Payments Interface (UPI - GPay, PhonePe, Paytm, BHIM)</li>
                    <li>Credit Cards & Debit Cards (Visa, Mastercard, RuPay)</li>
                    <li>Net Banking from major Indian banks</li>
                    <li>Wallet payments & pre-approved credit balances</li>
                  </ul>
                  <p className="text-xs text-slate-500">
                    Orders are confirmed upon successful authorization by the payment gateway. We reserve the right to cancel orders resulting from inadvertent pricing errors.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="shipping" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Truck size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    5. Shipping & Delivery Policy
                  </h2>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    We ship nationwide across India using insured express courier networks (BlueDart, Delhivery, Express Parcel Services).
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-xs font-semibold">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Dispatch Timelines:</strong> In-stock orders are processed within 24-48 hours on business days.
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <strong>Estimated Transit Time:</strong> Metro cities: 2-4 business days | Rest of India: 4-7 business days.
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section id="returns" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <RotateCcw size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    6. Returns & Mandatory Unboxing Video Clause
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-slate-600">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-xs text-red-900 font-semibold space-y-1">
                    <p className="font-bold text-sm">Mandatory Requirement for Transit Claims:</p>
                    <p>
                      To claim a replacement for items damaged during transit or missing parts, customers MUST record an <strong>uncut 360-degree unboxing video</strong> from opening the sealed courier box to inspecting the product.
                    </p>
                  </div>
                  <p className="text-xs">
                    Return requests must be submitted within the eligible window specified for the product category. Contact support via phone <strong>+91 9870162128</strong> or email <strong>plusway9@gmail.com</strong>.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section id="testing" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <ShieldCheck size={22} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    7. Mandatory Part Testing Protocol
                  </h2>
                </div>

                <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p className="font-semibold text-slate-900">Before permanent installation or gluing:</p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-700 font-medium">
                    <li>Connect the replacement display or part externally to the motherboard.</li>
                    <li>Power on the device and test touch responsiveness, display brightness, color accuracy, and proximity sensors.</li>
                    <li>Keep protective lamination films, warranty seals, and corner tags completely intact during dry testing.</li>
                  </ol>
                  <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    ⚠️ WARRANTY VOID CLAUSE: If protective films or warranty stamps are removed, or if adhesive/glue/solder is applied to the part, NO RETURN OR REPLACEMENT WILL BE ENTERTAINED.
                  </p>
                </div>
              </section>

              {/* Section 8 & 9 */}
              <section id="warranty" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">8. Warranty & Disclaimer</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Warranty covers manufacturing defects verified during pre-installation dry testing. We are not liable for damage caused by improper technician handling, liquid exposure, over-tightened screws, or cracked flex cables during installation.
                </p>
              </section>

              <section id="intellectual" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">9. Intellectual Property</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  All logos, brand names, product photographs, and text content on <code>plusway.in</code> are the intellectual property of PlusWay Spare Parts. Brand names (Apple, Samsung, Xiaomi, Realme, Vivo, Oppo, OnePlus) mentioned on product pages are strictly for compatibility identification.
                </p>
              </section>

              {/* Section 10 & 11 */}
              <section id="prohibited" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">10. Prohibited Conduct</h3>
                <p className="text-sm text-slate-600">
                  Users agree not to scrape data, flood servers with malicious requests, submit false chargebacks, or attempt unauthorized database access.
                </p>
              </section>

              <section id="liability" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">11. Limitation of Liability</h3>
                <p className="text-sm text-slate-600">
                  To the maximum extent permitted under Indian law, PlusWay Spare Parts' maximum financial liability shall not exceed the invoice price paid for the specific item giving rise to the claim.
                </p>
              </section>

              <section id="jurisdiction" className="scroll-mt-28 border-b border-slate-100 pb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">12. Governing Law & Dispute Resolution</h3>
                <p className="text-sm text-slate-600">
                  These Terms are governed by the laws of India. Any legal disputes or claims arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
                </p>
              </section>

              {/* Section 13: Contact */}
              <section id="contact" className="scroll-mt-28 bg-slate-900 text-white rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Phone className="w-8 h-8 text-orange-400" />
                  <div>
                    <h2 className="text-xl font-black uppercase text-white">13. Official Support Contacts</h2>
                    <p className="text-xs text-slate-400">For legal notices, order help, and returns</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-800 text-sm">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Customer Phone Support</p>
                    <p className="text-lg font-extrabold text-orange-400">+91 9870162128</p>
                    <p className="text-xs text-slate-300">Mon-Sat (9:00 AM - 7:00 PM IST)</p>
                    <button
                      onClick={() => copyToClipboard("9870162128", "phone")}
                      className="text-xs text-slate-400 hover:text-white underline mt-1 block"
                    >
                      {copiedField === "phone" ? "Copied phone number!" : "Copy Phone Number"}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Official Legal & Help Email</p>
                    <p className="text-lg font-extrabold text-orange-400">plusway9@gmail.com</p>
                    <p className="text-xs text-slate-300">Dedicated Customer Support Desk</p>
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

export default TermsConditions;
