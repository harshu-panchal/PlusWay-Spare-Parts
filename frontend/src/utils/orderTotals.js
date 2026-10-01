// Shipping, tax and total for an order, from the shop's shipping settings.
// Must match the server (customer orderController.addOrderItems), which
// recomputes these when the order is placed.
export const computeOrderTotals = (itemsTotal, shippingConfig = {}) => {
  const standardShippingFee = shippingConfig.standardShippingFee ?? 0;
  const freeShippingThreshold = shippingConfig.freeShippingThreshold ?? 0;
  const taxPercentage = shippingConfig.taxPercentage ?? 0;

  const shippingPrice =
    freeShippingThreshold > 0 && itemsTotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const taxPrice = Math.round(itemsTotal * (taxPercentage / 100) * 100) / 100;

  return {
    shippingPrice,
    taxPrice,
    taxPercentage,
    orderTotal: itemsTotal + shippingPrice + taxPrice,
  };
};
