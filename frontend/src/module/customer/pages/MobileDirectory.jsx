import React from "react";
import { Smartphone, Download, Star, Zap, Shield, TrendingUp } from "lucide-react";

const MobileDirectory = () => {
    const features = [
        {
            icon: Zap,
            title: "Lightning Fast",
            description: "Browse and order in seconds",
        },
        {
            icon: Shield,
            title: "Secure Payments",
            description: "Protected transactions",
        },
        {
            icon: Star,
            title: "Exclusive Deals",
            description: "App-only discounts",
        },
        {
            icon: TrendingUp,
            title: "Track Orders",
            description: "Real-time updates",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <Smartphone className="w-12 h-12" />
                                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                                    Mobile App
                                </h1>
                            </div>
                            <p className="text-lg text-white/90 mb-8">
                                Download the PlusWay mobile app for the best shopping experience
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="#"
                                    className="bg-white text-secondary px-8 py-3 rounded font-black uppercase text-sm tracking-widest hover:bg-gray-100 transition-colors text-center"
                                >
                                    Download for Android
                                </a>
                                <a
                                    href="#"
                                    className="bg-transparent border-2 border-white text-white px-8 py-3 rounded font-black uppercase text-sm tracking-widest hover:bg-white/10 transition-colors text-center"
                                >
                                    Download for iOS
                                </a>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
                                <div className="bg-white w-48 h-48 mx-auto rounded-2xl flex items-center justify-center mb-6">
                                    <Smartphone className="w-24 h-24 text-primary" />
                                </div>
                                <p className="text-white/90 font-medium">
                                    Scan QR Code to Download
                                </p>
                                <p className="text-white/70 text-sm mt-2">
                                    Coming Soon to App Stores
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Features Grid */}
                <div className="mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-secondary uppercase text-center mb-12">
                        Why Download Our App?
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow"
                                >
                                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IconComponent className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-black text-secondary uppercase mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 font-medium">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* App Features */}
                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h3 className="text-2xl font-black text-secondary uppercase mb-6">
                            Key Features
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        Easy Product Search
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Find spare parts quickly by brand, model, or part number
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        One-Tap Ordering
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Checkout faster with saved addresses and payment methods
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        Push Notifications
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Get instant updates on orders, offers, and new arrivals
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        Offline Mode
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Browse products even without internet connection
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        Wishlist & Favorites
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Save products and get notified when they're on sale
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-8">
                        <h3 className="text-2xl font-black text-secondary uppercase mb-6">
                            Exclusive App Benefits
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        App-Only Discounts
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Get exclusive deals available only on the mobile app
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        Early Access to Sales
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Be the first to know about flash sales and new products
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        Loyalty Rewards
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Earn points with every purchase and redeem for discounts
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-black text-gray-800 mb-1">
                                        Free Shipping
                                    </h4>
                                    <p className="text-sm text-gray-600 font-medium">
                                        Get free shipping on first app order
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Download CTA */}
                <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-secondary uppercase mb-4">
                        Download Now
                    </h2>
                    <p className="text-gray-600 font-medium mb-8 max-w-2xl mx-auto">
                        Available soon on Android and iOS. Join our waiting list to be
                        notified when the app launches!
                    </p>
                    <form className="max-w-md mx-auto">
                        <div className="flex gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white font-black px-6 py-3 rounded uppercase text-sm hover:bg-orange-600 transition-colors flex items-center gap-2"
                            >
                                <Download size={18} />
                                Notify Me
                            </button>
                        </div>
                    </form>

                    {/* Placeholder for QR Code */}
                    <div className="mt-12 pt-8 border-t">
                        <p className="text-sm text-gray-500 font-medium mb-4">
                            Scan to download (Coming Soon)
                        </p>
                        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-20 h-20 text-gray-300" />
                        </div>
                    </div>
                </div>

                {/* System Requirements */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-gray-100 rounded-xl p-6">
                        <h3 className="text-lg font-black text-secondary uppercase mb-4">
                            Android Requirements
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 font-medium">
                            <li>• Android 6.0 or higher</li>
                            <li>• 50 MB free storage</li>
                            <li>• Internet connection required</li>
                        </ul>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-6">
                        <h3 className="text-lg font-black text-secondary uppercase mb-4">
                            iOS Requirements
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700 font-medium">
                            <li>• iOS 12.0 or higher</li>
                            <li>• 50 MB free storage</li>
                            <li>• Internet connection required</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileDirectory;
