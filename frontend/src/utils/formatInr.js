// "₹45,055" — whole rupees, Indian digit grouping.
export const formatInr = (value) => `₹${Math.round(value).toLocaleString("en-IN")}`;
