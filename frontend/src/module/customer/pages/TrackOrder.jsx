import React, { useState } from "react";
import { Search, Package, MapPin, Clock, CheckCircle } from "lucide-react";

const TrackOrder = () => {
    const [trackingInput, setTrackingInput] = useState("");
    const [trackingData, setTrackingData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleTrack = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Mock tracking data - In production, this would come from an API
            if (trackingInput.trim()) {
                setTrackingData({
                    orderId: trackingInput.toUpperCase(),
                    status: "In Transit",
                    estimatedDelivery: "Feb 16, 2026",
                    currentLocation: "Delhi Distribution Center",
                    timeline: [
                        {
                            status: "Order Placed",
                            date: "Feb 12, 2026 10:30 AM",
                            completed: true,
                        },
                        {
                            status: "Order Confirmed",
                            date: "Feb 12, 2026 11:00 AM",
                            completed: true,
                        },
                        {
                            status: "Shipped",
                            date: "Feb 13, 2026 02:15 PM",
                            completed: true,
                        },
                        {
                            status: "In Transit",
                            date: "Feb 14, 2026 09:00 AM",
                            completed: true,
                        },
                        {
                            status: "Out for Delivery",
                            date: "Pending",
                            completed: false,
                        },
                        {
                            status: "Delivered",
                            date: "Pending",
                            completed: false,
                        },
                    ],
                });
            } else {
                setError("Please enter an Order ID or Email");
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-secondary to-primary text-white py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Package className="w-12 h-12" />
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                            Track Your Order
                        </h1>
                    </div>
                    <p className="text-lg text-white/90 max-w-2xl">
                        Check the status of your order in real-time
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Tracking Form */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-12">
                    <h2 className="text-2xl font-black text-secondary uppercase mb-6">
                        Enter Tracking Details
                    </h2>

                    <form onSubmit={handleTrack} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                Order ID or Email Address
                            </label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={trackingInput}
                                    onChange={(e) => setTrackingInput(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded focus:outline-none focus:border-primary transition-colors font-medium"
                                    placeholder="Enter Order ID or Email"
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm font-medium mt-2">{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white font-black py-3 rounded uppercase tracking-widest text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Tracking..." : "Track Order"}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 font-medium mt-4">
                        You can find your Order ID in the order confirmation email or in your
                        account's order history.
                    </p>
                </div>

                {/* Tracking Results */}
                {trackingData && (
                    <div className="space-y-6">
                        {/* Order Status Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-secondary uppercase mb-2">
                                        Order #{trackingData.orderId}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-black uppercase">
                                            {trackingData.status}
                                        </span>
                                    </div>
                                </div>
                                <Package className="w-12 h-12 text-primary" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                                            Current Location
                                        </p>
                                        <p className="text-gray-800 font-bold">
                                            {trackingData.currentLocation}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                                            Estimated Delivery
                                        </p>
                                        <p className="text-gray-800 font-bold">
                                            {trackingData.estimatedDelivery}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking Timeline */}
                        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                            <h3 className="text-xl font-black text-secondary uppercase mb-6">
                                Order Timeline
                            </h3>

                            <div className="space-y-6">
                                {trackingData.timeline.map((event, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${event.completed
                                                        ? "bg-primary text-white"
                                                        : "bg-gray-200 text-gray-400"
                                                    }`}
                                            >
                                                {event.completed ? (
                                                    <CheckCircle size={20} />
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full border-2 border-current"></div>
                                                )}
                                            </div>
                                            {index < trackingData.timeline.length - 1 && (
                                                <div
                                                    className={`w-0.5 h-12 ${event.completed ? "bg-primary" : "bg-gray-200"
                                                        }`}
                                                ></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <h4
                                                className={`text-base font-black uppercase ${event.completed ? "text-secondary" : "text-gray-400"
                                                    }`}
                                            >
                                                {event.status}
                                            </h4>
                                            <p
                                                className={`text-sm font-medium ${event.completed ? "text-gray-600" : "text-gray-400"
                                                    }`}
                                            >
                                                {event.date}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action  Buttons */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <a
                                href="/profile/orders"
                                className="block text-center bg-white border-2 border-secondary text-secondary font-black py-3 rounded uppercase text-sm hover:bg-gray-50 transition-colors"
                            >
                                View All Orders
                            </a>
                            <a
                                href="/contact"
                                className="block text-center bg-primary text-white font-black py-3 rounded uppercase text-sm hover:bg-orange-600 transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                )}

                {/* Help Section */}
                {!trackingData && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-black text-secondary uppercase mb-4">
                                Need Help?
                            </h3>
                            <p className="text-sm text-gray-600 font-medium mb-4">
                                If you're having trouble tracking your order or have any
                                questions, our support team is here to help.
                            </p>
                            <a
                                href="/contact"
                                className="block text-center bg-primary text-white font-black py-2 rounded uppercase text-xs hover:bg-orange-600 transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6">
                            <h3 className="text-lg font-black text-secondary uppercase mb-4">
                                Quick Links
                            </h3>
                            <div className="space-y-2 text-sm">
                                <a
                                    href="/profile/orders"
                                    className="block text-gray-700 hover:text-primary transition-colors font-bold"
                                >
                                    → My Orders
                                </a>
                                <a
                                    href="/refund-policy"
                                    className="block text-gray-700 hover:text-primary transition-colors font-bold"
                                >
                                    → Return Policy
                                </a>
                                <a
                                    href="/support"
                                    className="block text-gray-700 hover:text-primary transition-colors font-bold"
                                >
                                    → Help Center
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
