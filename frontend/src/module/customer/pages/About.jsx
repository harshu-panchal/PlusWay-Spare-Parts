import React from "react";
import { Link } from "react-router-dom";
import { Award, Users, TrendingUp, Heart, Target, Shield } from "lucide-react";

const About = () => {
    const stats = [
        { icon: Users, label: "Happy Customers", value: "10,000+" },
        { icon: Award, label: "Products", value: "50,000+" },
        { icon: TrendingUp, label: "Years in Business", value: "20+" },
        { icon: Heart, label: "Customer Satisfaction", value: "98%" },
    ];

    const values = [
        {
            icon: Heart,
            title: "Customer First",
            description:
                "We prioritize our customers' needs and satisfaction above all else.",
        },
        {
            icon: Shield,
            title: "Quality & Trust",
            description:
                "We provide only genuine spare parts with verified quality assurance.",
        },
        {
            icon: TrendingUp,
            title: "Innovation",
            description:
                "Continuously improving our services to serve you better.",
        },
        {
            icon: Target,
            title: "Commitment",
            description:
                "Dedicated to providing the best spare parts at competitive prices.",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                        About PlusWay
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                        Your trusted partner for quality spare parts since 2004
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, index) => {
                        const IconComponent = stat.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                            >
                                <div className="flex justify-center mb-3">
                                    <IconComponent className="w-8 h-8 text-primary" />
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-secondary mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Our Story Section */}
            <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight mb-6">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                            <p>
                                Founded in 2004 by Elcotek, PlusWay has grown from a small spare
                                parts shop to one of the most trusted names in the industry.
                                Our journey began with a simple mission: to provide genuine,
                                quality spare parts to customers at fair prices.
                            </p>
                            <p>
                                Over the past two decades, we've built strong relationships with
                                manufacturers and suppliers worldwide, ensuring that our
                                customers always get authentic products. Today, we serve
                                thousands of satisfied customers across the country.
                            </p>
                            <p>
                                Our commitment to quality, customer service, and innovation has
                                made us a leader in the spare parts industry. We continue to
                                expand our inventory and improve our services to meet the
                                evolving needs of our customers.
                            </p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
                        <h3 className="text-2xl font-black text-secondary uppercase mb-6">
                            Why Choose Us?
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 font-medium">
                                    100% Genuine Products - All parts are sourced directly from
                                    authorized manufacturers
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 font-medium">
                                    Expert Support - Our knowledgeable team is here to help you
                                    find the right part
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 font-medium">
                                    Fast Delivery - Quick and reliable shipping to your doorstep
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 font-medium">
                                    Competitive Prices - Best value for genuine quality parts
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight mb-12 text-center">
                        Our Core Values
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {values.map((value, index) => {
                            const IconComponent = value.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/20"
                                >
                                    <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                        <IconComponent className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black text-secondary uppercase mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
                        Ready to Find Your Perfect Part?
                    </h2>
                    <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                        Browse our extensive catalog or contact our team for expert
                        assistance
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/brand-selection"
                            className="bg-white text-secondary px-8 py-3 rounded font-black uppercase text-sm tracking-widest hover:bg-gray-100 transition-colors"
                        >
                            Shop Now
                        </Link>
                        <Link
                            to="/contact"
                            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
