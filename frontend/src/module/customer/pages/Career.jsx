import React, { useState } from "react";
import axios from "axios";
import { Briefcase, MapPin, Clock, Send } from "lucide-react";
import { API_ENDPOINTS } from "../../../config/api";

const Career = () => {
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicationForm, setApplicationForm] = useState({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        resumeUrl: "",
        coverLetter: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openPositions = [
        {
            id: 1,
            title: "Customer Support Executive",
            department: "Customer Service",
            location: "New Delhi, India",
            type: "Full-time",
            experience: "1-2 years",
            description:
                "Join our customer support team to help customers find the right spare parts and resolve their queries.",
            responsibilities: [
                "Handle customer inquiries via phone, email, and chat",
                "Assist customers in finding the right spare parts",
                "Process orders and track shipments",
                "Resolve customer complaints and issues",
            ],
            requirements: [
                "Excellent communication skills in English and Hindi",
                "Customer-oriented mindset",
                "Basic computer knowledge",
                "Ability to work in a fast-paced environment",
            ],
        },
        {
            id: 2,
            title: "Warehouse Manager",
            department: "Operations",
            location: "New Delhi, India",
            type: "Full-time",
            experience: "3-5 years",
            description:
                "Manage warehouse operations, inventory, and logistics for our spare parts distribution.",
            responsibilities: [
                "Oversee warehouse operations and staff",
                "Manage inventory levels and stock organization",
                "Coordinate with suppliers and delivery partners",
                "Ensure timely order fulfillment",
            ],
            requirements: [
                "Experience in warehouse management",
                "Knowledge of inventory management systems",
                "Leadership and team management skills",
                "Understanding of logistics and supply chain",
            ],
        },
        {
            id: 3,
            title: "Digital Marketing Specialist",
            department: "Marketing",
            location: "New Delhi, India / Remote",
            type: "Full-time",
            experience: "2-4 years",
            description:
                "Drive digital marketing initiatives to grow our online presence and customer acquisition.",
            responsibilities: [
                "Plan and execute digital marketing campaigns",
                "Manage social media channels",
                "SEO/SEM optimization",
                "Analyze campaign performance and ROI",
            ],
            requirements: [
                "Experience in digital marketing and SEO",
                "Knowledge of Google Ads, Facebook Ads",
                "Strong analytical skills",
                "Creative mindset",
            ],
        },
    ];

    const benefits = [
        "Competitive salary",
        "Health insurance",
        "Paid time off",
        "Career growth opportunities",
        "Training and development",
        "Friendly work environment",
    ];

    const handleApplicationChange = (e) => {
        setApplicationForm({
            ...applicationForm,
            [e.target.name]: e.target.value,
        });
    };

    const handlePositionSelect = (e) => {
        const job = openPositions.find((j) => String(j.id) === e.target.value);
        setApplicationForm({
            ...applicationForm,
            position: job ? job.title : "",
        });
    };

    const handleApplicationSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post(API_ENDPOINTS.CREATE_FORM_SUBMISSION, {
                formType: "Career",
                name: applicationForm.name,
                email: applicationForm.email,
                phone: applicationForm.phone,
                subject: `Job Application: ${applicationForm.position || "General"}`,
                message: applicationForm.coverLetter || "(No cover letter provided)",
                meta: {
                    position: applicationForm.position,
                    experience: applicationForm.experience,
                    resumeUrl: applicationForm.resumeUrl,
                },
            });
            alert("Application submitted successfully! Our HR team will review it and get in touch.");
            setApplicationForm({
                name: "",
                email: "",
                phone: "",
                position: "",
                experience: "",
                resumeUrl: "",
                coverLetter: "",
            });
        } catch (error) {
            console.error("Failed to submit job application", error);
            alert(
                error.response?.data?.message ||
                    "Failed to submit your application. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Briefcase className="w-12 h-12" />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Career with Us
                        </h1>
                    </div>
                    <p className="text-lg text-white/90 max-w-2xl">
                        Join our team and be part of India's leading spare parts platform
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Company Culture */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-12">
                    <h2 className="text-2xl md:text-3xl font-black text-secondary uppercase mb-6">
                        Why Work With Us?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-gray-600 font-medium mb-4">
                                At PlusWay, we believe our success is built on the talent and
                                dedication of our team. We're always looking for passionate
                                individuals who want to make a difference in the spare parts
                                industry.
                            </p>
                            <p className="text-gray-600 font-medium">
                                Join us to work with cutting-edge technology, supportive
                                colleagues, and endless opportunities for growth and learning.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-secondary uppercase mb-4">
                                Benefits & Perks
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 text-sm font-medium text-gray-700"
                                    >
                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Open Positions */}
                <div className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-black text-secondary uppercase mb-6">
                        Open Positions
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {openPositions.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedJob(job)}
                            >
                                <h3 className="text-lg font-black text-secondary uppercase mb-2">
                                    {job.title}
                                </h3>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <Briefcase size={16} className="text-primary" />
                                        {job.department}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <MapPin size={16} className="text-primary" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <Clock size={16} className="text-primary" />
                                        {job.type} • {job.experience}
                                    </div>
                                </div>
                                <button className="w-full bg-primary text-white font-black py-2 rounded text-sm uppercase tracking-wider hover:bg-orange-600 transition-colors">
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Form */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Send className="w-8 h-8 text-primary" />
                        <h2 className="text-2xl md:text-3xl font-black text-secondary uppercase">
                            Apply Now
                        </h2>
                    </div>

                    <form className="space-y-5" onSubmit={handleApplicationSubmit}>
                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={applicationForm.name}
                                    onChange={handleApplicationChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                    placeholder="Your full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={applicationForm.email}
                                    onChange={handleApplicationChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={applicationForm.phone}
                                    onChange={handleApplicationChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Position *
                                </label>
                                <select
                                    required
                                    onChange={handlePositionSelect}
                                    value={openPositions.find((j) => j.title === applicationForm.position)?.id ?? ""}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                >
                                    <option value="">Select a position</option>
                                    {openPositions.map((job) => (
                                        <option key={job.id} value={job.id}>
                                            {job.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                Years of Experience *
                            </label>
                            <input
                                type="text"
                                name="experience"
                                value={applicationForm.experience}
                                onChange={handleApplicationChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                placeholder="e.g. 2-3 years"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                Resume/CV * (Upload Link)
                            </label>
                            <input
                                type="url"
                                name="resumeUrl"
                                value={applicationForm.resumeUrl}
                                onChange={handleApplicationChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                            />
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                                Please provide a shareable link to your resume
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                Cover Letter
                            </label>
                            <textarea
                                name="coverLetter"
                                value={applicationForm.coverLetter}
                                onChange={handleApplicationChange}
                                rows="5"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium resize-none"
                                placeholder="Tell us why you'd be a great fit..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-primary text-white font-black py-3 rounded uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                            {isSubmitting ? "Submitting..." : "Submit Application"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Job Details Modal */}
            {selectedJob && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-black text-secondary uppercase mb-4">
                            {selectedJob.title}
                        </h2>
                        <div className="space-y-2 mb-6 pb-6 border-b">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <Briefcase size={16} className="text-primary" />
                                {selectedJob.department}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <MapPin size={16} className="text-primary" />
                                {selectedJob.location}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                <Clock size={16} className="text-primary" />
                                {selectedJob.type} • {selectedJob.experience}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-black text-secondary uppercase mb-3">
                                    About the Role
                                </h3>
                                <p className="text-gray-600 font-medium text-sm">
                                    {selectedJob.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-secondary uppercase mb-3">
                                    Responsibilities
                                </h3>
                                <ul className="space-y-2">
                                    {selectedJob.responsibilities.map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-gray-600 font-medium"
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-secondary uppercase mb-3">
                                    Requirements
                                </h3>
                                <ul className="space-y-2">
                                    {selectedJob.requirements.map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-gray-600 font-medium"
                                        >
                                            <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8 pt-6 border-t">
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="flex-1 bg-gray-200 text-secondary font-black py-3 rounded uppercase text-sm hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setApplicationForm({
                                        ...applicationForm,
                                        position: selectedJob.title,
                                    });
                                    setSelectedJob(null);
                                }}
                                className="flex-1 bg-primary text-white font-black py-3 rounded uppercase text-sm hover:bg-orange-600 transition-colors"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Career;
