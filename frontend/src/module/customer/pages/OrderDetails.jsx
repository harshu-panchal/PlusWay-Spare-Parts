import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useLocation } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { API_ENDPOINTS } from "../../../config/api";
import { CheckCircle2, Clock, Truck, Package, ChevronRight, MapPin, Phone, Loader2, AlertCircle, CreditCard, Download } from 'lucide-react';
import LazyImage from '../../../components/LazyImage';
import useOrderPayment, { toPaypalUsdAmount } from '../hooks/useOrderPayment';

const PAYMENT_METHOD_LABELS = {
    paypal: "PayPal",
    razorpay: "Razorpay (Cards, UPI, NetBanking)",
    cod: "Cash on Delivery",
};

const OrderDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paying, setPaying] = useState(false);
    // Outcome passed from Checkout (justPaid / paymentCancelled / paymentError),
    // replaced by the outcome of a payment retried on this page.
    const [notice, setNotice] = useState(location.state || {});
    const { paypalClientId, capturePaypal, startRazorpay } = useOrderPayment();

    const getToken = () => {
        const userInfo = localStorage.getItem("userInfo");
        return userInfo ? JSON.parse(userInfo).token : null;
    };

    const getConfig = () => ({
        headers: { Authorization: `Bearer ${getToken()}` },
    });

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

    const handlePaid = (paidOrder) => {
        setOrder(paidOrder);
        setNotice({ justPaid: true });
    };

    const handleRazorpayPayment = async () => {
        if (paying) return;
        setPaying(true);
        await startRazorpay(order, {
            onSuccess: (paidOrder) => {
                setPaying(false);
                handlePaid(paidOrder);
            },
            onDismiss: () => setPaying(false),
            onError: (message) => {
                setPaying(false);
                setNotice({ paymentError: message });
            },
        });
    };

    const downloadInvoice = async () => {
        try {
            const { data } = await axios.get(API_ENDPOINTS.ORDER_INVOICE(id), {
                ...getConfig(),
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = `invoice-${id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Failed to download invoice");
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
                    <button
                        type="button"
                        onClick={downloadInvoice}
                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-xs font-black uppercase tracking-widest text-secondary hover:bg-gray-50">
                        <Download size={14} /> Download Invoice
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Payment outcome */}
                        {notice.justPaid && order.isPaid && (
                            <div className="p-6 rounded-2xl border bg-green-50 border-green-200 flex items-start gap-3">
                                <CheckCircle2 size={22} className="text-green-600 shrink-0" />
                                <div>
                                    <h3 className="font-black text-green-700 uppercase tracking-tight">Payment successful</h3>
                                    <p className="text-xs font-bold text-green-700/80">Thank you! Your order has been placed and is being processed.</p>
                                </div>
                            </div>
                        )}
                        {!order.isPaid && (notice.paymentCancelled || notice.paymentError) && (
                            <div className="p-6 rounded-2xl border bg-red-50 border-red-200 flex items-start gap-3">
                                <AlertCircle size={22} className="text-red-600 shrink-0" />
                                <div>
                                    <h3 className="font-black text-red-700 uppercase tracking-tight">
                                        {notice.paymentError ? "Payment failed" : "Payment not completed"}
                                    </h3>
                                    <p className="text-xs font-bold text-red-700/80">
                                        {notice.paymentError ? `${notice.paymentError}. ` : ""}
                                        Your order is saved. Complete the payment using the options in the order summary.
                                    </p>
                                </div>
                            </div>
                        )}

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
                            <p className="text-sm text-gray-600 font-bold">
                                {order.isPaid || order.paymentMethod === 'cod'
                                    ? PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod
                                    : "Awaiting payment"}
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
                                            {item.offer?.title && (
                                                <p className="text-[11px] font-bold text-red-600">
                                                    {item.offer.discountPercent}% off with {item.offer.title}
                                                    {item.originalPrice > item.price && (
                                                        <span className="text-gray-400 font-medium line-through ml-1">₹{item.originalPrice.toLocaleString()}</span>
                                                    )}
                                                </p>
                                            )}
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
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                                Complete your payment
                                            </p>
                                            {paypalClientId ? (
                                                <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "USD" }}>
                                                    <PayPalButtons
                                                        style={{ layout: "vertical" }}
                                                        disabled={paying}
                                                        createOrder={(data, actions) =>
                                                            actions.order.create({
                                                                purchase_units: [{
                                                                    amount: {
                                                                        currency_code: "USD",
                                                                        value: toPaypalUsdAmount(order.totalPrice)
                                                                    }
                                                                }]
                                                            })
                                                        }
                                                        onApprove={async (data, actions) => {
                                                            const details = await actions.order.capture();
                                                            try {
                                                                handlePaid(await capturePaypal(order._id, details));
                                                            } catch (err) {
                                                                setNotice({ paymentError: err.response?.data?.message || "Payment failed" });
                                                            }
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
                                                disabled={paying}
                                                className="w-full bg-[#3399cc] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#2b88b7] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {paying ? <Loader2 size={20} className="animate-spin" /> : <CreditCard size={20} />}
                                                {paying ? "Opening payment..." : "Pay with Razorpay"}
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
