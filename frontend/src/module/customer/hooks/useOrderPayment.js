import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

// PayPal is charged in USD; order totals are in INR.
const INR_TO_USD = 0.0106;
export const toPaypalUsdAmount = (inrTotal) => (inrTotal * INR_TO_USD).toFixed(2);

const getAuthConfig = () => {
    const userInfo = localStorage.getItem("userInfo");
    const token = userInfo ? JSON.parse(userInfo).token : null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

let razorpayLoadPromise = null;
const loadRazorpay = () => {
    if (!razorpayLoadPromise) {
        razorpayLoadPromise = new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => {
                razorpayLoadPromise = null; // allow a retry on the next click
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }
    return razorpayLoadPromise;
};

/**
 * Shared PayPal + Razorpay payment logic for an existing order. Used by
 * Checkout (pay right after the order is created) and OrderDetails
 * (complete payment for an order that was left unpaid).
 */
const useOrderPayment = () => {
    const [paypalClientId, setPaypalClientId] = useState("");
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        axios
            .get(API_ENDPOINTS.PAYPAL_CONFIG, getAuthConfig())
            .then(({ data }) => mounted.current && setPaypalClientId(data))
            .catch((err) => console.error("Error fetching PayPal Config:", err));

        // Preload the Razorpay SDK so the checkout opens immediately on
        // click; a long click-to-open gap makes Safari block the popup.
        loadRazorpay();

        return () => {
            mounted.current = false;
        };
    }, []);

    // Mark the order paid after PayPal captured the payment.
    const capturePaypal = async (orderId, details) => {
        const { data } = await axios.put(
            API_ENDPOINTS.ORDER_PAY(orderId),
            details,
            getAuthConfig()
        );
        return data;
    };

    // Open the Razorpay checkout for an order. `onSuccess` gets the updated
    // (paid) order; `onDismiss` runs if the customer closes the checkout.
    const startRazorpay = async (order, { onSuccess, onDismiss, onError }) => {
        const loaded = await loadRazorpay();
        if (!loaded) {
            onError?.("Razorpay failed to load. Please check your connection and try again.");
            return;
        }

        try {
            const { data: rzpOrder } = await axios.post(
                API_ENDPOINTS.RAZORPAY_CREATE_ORDER(order._id),
                {},
                getAuthConfig()
            );

            const checkout = new window.Razorpay({
                key: rzpOrder.key_id,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "Plusway Spare Parts",
                description: "Order Payment",
                order_id: rzpOrder.id,
                handler: async (response) => {
                    try {
                        const { data } = await axios.post(
                            API_ENDPOINTS.RAZORPAY_VERIFY(order._id),
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            getAuthConfig()
                        );
                        onSuccess?.(data);
                    } catch (err) {
                        onError?.(err.response?.data?.message || "Payment verification failed");
                    }
                },
                modal: { ondismiss: () => onDismiss?.() },
                prefill: {
                    name: order.customer?.name || order.shippingAddress?.name,
                    email: order.customer?.email,
                    contact: order.customer?.mobile || order.shippingAddress?.mobile,
                },
                theme: { color: "#3399cc" },
            });
            checkout.open();
        } catch (err) {
            console.error(err);
            onError?.(err.response?.data?.message || "Error creating Razorpay order");
        }
    };

    return { paypalClientId, capturePaypal, startRazorpay };
};

export default useOrderPayment;
