import Order from "../../../models/Order.js";
import sendEmail from "../../../utils/sendEmail.js";
import generateInvoice from "../../../utils/generateInvoice.js";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 20;
  const page = Number(req.query.pageNumber) || 1;
  const search = req.query.search || "";
  const status = req.query.status;

  let filter = {};
  if (search) {
    const escapedSearch = escapeRegex(search);

    filter.$or = [
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            regex: escapedSearch,
            options: "i",
          },
        },
      },
    ];
  }
  if (status && status !== "All") {
    filter.status = status;
  }

  const count = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("customer", "id name")
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ orders, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "customer",
    "name email mobile",
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/admin/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "customer",
    "name email",
  );

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "Delivered";

    const updatedOrder = await order.save();

    // Send notification
    try {
      await sendEmail({
        email: order.customer.email,
        subject: `Your Plusway Order #${order._id} has been delivered!`,
        message: `<h1>Delivery Confirmation</h1><p>Hi ${order.customer.name}, your order has been delivered successfully. Thank you for shopping with us!</p>`,
      });
    } catch (err) {
      console.error("Email failed to send", err);
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Update order status (General status update)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "customer",
    "name email",
  );

  if (order) {
    const oldStatus = order.status;
    order.status = req.body.status || order.status;

    // If status is set to delivered, update the flag
    if (req.body.status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    // Send notification if status changed
    if (oldStatus !== updatedOrder.status) {
      try {
        await sendEmail({
          email: order.customer.email,
          subject: `Update on your Plusway Order #${order._id}`,
          message: `<h1>Order Status Update</h1><p>Hi ${order.customer.name}, your order status has been updated to: <b>${updatedOrder.status}</b></p>`,
        });
      } catch (err) {
        console.error("Email failed to send", err);
      }
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

// @desc    Generate and download invoice
// @route   GET /api/admin/orders/:id/invoice
// @access  Private/Admin
export const getOrderInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "customer",
    "name email mobile",
  );

  if (order) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf`,
    );
    generateInvoice(order, res);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};
