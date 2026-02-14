import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { API_ENDPOINTS } from "../../../config/api";
import { CheckCircle2, Clock, Truck, Package, ChevronRight, MapPin, Phone, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import LazyImage from '../../../components/LazyImage';
import { useCart } from '../context/CartContext';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [clientId, setClientId] = useState("");
    const { fetchCart } = useCart();

    const getToken = () => {
        const userInfo = localStorage.getItem("userInfo");
        return userInfo ? JSON.parse(userInfo).token : null;
    };

    const getConfig = () => ({
        headers: { Authorization: `Bearer ${getToken()}` },
    });

    useEffect(() => {
        const fetchClientId = async () => {
            try {
                const { data } = await axios.get(API_ENDPOINTS.PAYPAL_CONFIG, getConfig());
                setClientId(data);
                setSdkReady(true);
            } catch (err) {
                console.error("Error fetching PayPal Config:", err);
            }
        };

        fetchClientId();
    }, []);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    API_ENDPOINTS.ORDER_DETAIL(id),
                    getConfig()
                );
                setOrder(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const successPaymentHandler = async (paymentResult) => {
        try {
            const { data } = await axios.put(
                API_ENDPOINTS.ORDER_PAY(id),
                paymentResult,
                getConfig()
            );
            setOrder(data);
            fetchCart(); // Update cart count
            alert("Payment Successful!");
        } catch (err) {
            alert(err.response?.data?.message || "Payment failed");
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpay();
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        try {
            const { data: orderData } = await axios.post(
                API_ENDPOINTS.RAZORPAY_CREATE_ORDER(order._id),
                {},
                getConfig()
            );

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Plusway Spare Parts",
                description: "Order Payment",
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        };
                        const { data } = await axios.post(
                            API_ENDPOINTS.RAZORPAY_VERIFY(order._id),
                            verifyData,
                            getConfig()
                        );
                        setOrder(data);
                        fetchCart(); // Update cart count
                        alert("Payment Successful!");
                    } catch (err) {
                        alert(err.response?.data?.message || "Payment verification failed");
                    }
                },
                prefill: {
                    name: order.customer?.name,
                    email: order.customer?.email,
                    contact: order.customer?.mobile
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Error creating Razorpay order");
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4]">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f4f4f4] text-red-500 font-bold">
                {error}
            </div>
        );

    return (
        <div className="min-h-screen bg-[#f4f4f4] pb-12">
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-xl font-black text-secondary tracking-tight">ORDER DETAILS</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID: {order._id}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Statuses */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-6 rounded-2xl border ${order.isPaid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <h3 className={`font-black uppercase tracking-tight mb-1 flex items-center gap-2 ${order.isPaid ? 'text-green-700' : 'text-red-700'}`}>
                                    {order.isPaid ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    {order.isPaid ? "Paid" : "Not Paid"}
                                </h3>
                                {order.isPaid && <p className="text-xs font-bold opacity-70">Paid at: {new Date(order.paidAt).toLocaleString()}</p>}
                            </div>
                            <div className={`p-6 rounded-2xl border ${order.isDelivered ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                                <h3 className={`font-black uppercase tracking-tight mb-1 flex items-center gap-2 ${order.isDelivered ? 'text-green-700' : 'text-orange-700'}`}>
                                    {order.isDelivered ? <CheckCircle2 size={18} /> : <Truck size={18} />}
                                    {order.isDelivered ? "Delivered" : "Processing"}
                                </h3>
                                {order.isDelivered && <p className="text-xs font-bold opacity-70">Delivered at: {new Date(order.deliveredAt).toLocaleString()}</p>}
                            </div>
                        </div>

                        {/* Blocks */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h2 className="text-sm font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={16} /> Shipping Address
                            </h2>
                            <p className="text-sm text-gray-600 font-bold">
                                {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                                {order.shippingAddress.pincode}, {order.shippingAddress.country}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                            <h2 className="text-sm font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                                <CreditCard size={16} /> Payment Method
                            </h2>
                            <p className="text-sm text-gray-600 font-bold uppercase">
                                {order.paymentMethod}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100">
                            <h2 className="text-sm font-black text-secondary uppercase tracking-widest mb-4">
                                Order Items
                            </h2>
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div className="w-16 h-16 bg-gray-50 rounded-lg p-2">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Link
                                                to={`/product/${item.product}`}
                                                className="font-bold text-secondary hover:text-primary transition-colors text-sm"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-xs text-gray-400 font-bold">
                                                {item.qty} x ₹{item.price.toLocaleString()} = ₹
                                                {(item.qty * item.price).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-4">
                            <h3 className="text-sm font-black text-secondary mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">
                                Order Summary
                            </h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                    <span>Items</span>
                                    <span>₹{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                    <span>Shipping</span>
                                    <span>₹{order.shippingPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                    <span>Tax</span>
                                    <span>₹{order.taxPrice.toLocaleString()}</span>
                                </div>
                                <hr className="border-gray-50" />
                                <div className="flex justify-between text-lg font-black text-secondary uppercase">
                                    <span>Total</span>
                                    <span>₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            {!order.isPaid && (
                                <div className="w-full space-y-4">
                                    {order.paymentMethod === 'cod' ? (
                                        <div className="bg-gray-100 p-4 rounded text-center text-xs font-bold text-gray-500 uppercase">
                                            Cash on Delivery Order
                                        </div>
                                    ) : (
                                        <>
                                            {/* PayPal Button */}
                                            {sdkReady && clientId ? (
                                                <PayPalScriptProvider options={{ "client-id": clientId, currency: "USD" }}>
                                                    <PayPalButtons
                                                        style={{ layout: "vertical" }}
                                                        createOrder={(data, actions) => {
                                                            const usdAmount = (order.totalPrice * 0.0106).toFixed(2);
                                                            return actions.order.create({
                                                                purchase_units: [{
                                                                    amount: {
                                                                        currency_code: "USD",
                                                                        value: usdAmount
                                                                    }
                                                                }]
                                                            })
                                                        }}
                                                        onApprove={(data, actions) => {
                                                            return actions.order.capture().then((details) => {
                                                                successPaymentHandler(details);
                                                            });
                                                        }}
                                                    />
                                                </PayPalScriptProvider>
                                            ) : (
                                                <div className="text-center text-xs text-gray-400">Loading PayPal...</div>
                                            )}

                                            {/* Razorpay Button */}
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-200"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-white px-2 text-gray-400 font-bold">Or pay with</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleRazorpayPayment}
                                                className="w-full bg-[#3399cc] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#2b88b7] transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <CreditCard size={20} />
                                                Pay with Razorpay
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
