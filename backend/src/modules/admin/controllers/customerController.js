import asyncHandler from "../../../middleware/asyncHandler.js";
import Customer from "../../../models/Customer.js";
import Order from "../../../models/Order.js";

// @desc    Get all customers with stats
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getCustomers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 20;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Customer.countDocuments({});
    const customers = await Customer.find({})
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    const customerIds = customers.map(c => c._id);

    // Get stats only for these customers
    const customerStats = await Order.aggregate([
        { $match: { customer: { $in: customerIds }, isPaid: true } },
        {
            $group: {
                _id: "$customer",
                totalSpent: { $sum: "$totalPrice" },
                totalOrders: { $sum: 1 }
            }
        }
    ]);

    // Map stats to customers
    const statsMap = {};
    customerStats.forEach(stat => {
        if (stat._id) {
            statsMap[stat._id.toString()] = stat;
        }
    });

    const customersWithStats = customers.map(cust => {
        const stat = statsMap[cust._id.toString()] || { totalSpent: 0, totalOrders: 0 };
        return {
            _id: cust._id,
            name: cust.name,
            email: cust.email,
            mobile: cust.mobile,
            joined: cust.createdAt,
            status: cust.status,
            orders: stat.totalOrders,
            totalSpent: stat.totalSpent
        };
    });

    res.json({ customers: customersWithStats, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Create a customer
// @route   POST /api/admin/customers
// @access  Private/Admin
export const createCustomer = asyncHandler(async (req, res) => {
    const { name, email, mobile, status, password } = req.body;

    const customerExists = await Customer.findOne({ $or: [{ email }, { mobile }] });

    if (customerExists) {
        res.status(400);
        throw new Error("Customer already exists");
    }

    const customer = await Customer.create({
        name,
        email,
        mobile,
        status,
        password: password || "123456", // Default password if created by admin
    });

    if (customer) {
        res.status(201).json({
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            mobile: customer.mobile,
            status: customer.status,
        });
    } else {
        res.status(400);
        throw new Error("Invalid customer data");
    }
});

// @desc    Update customer
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
export const updateCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
        customer.name = req.body.name || customer.name;
        customer.email = req.body.email || customer.email;
        customer.mobile = req.body.mobile || customer.mobile;
        customer.status = req.body.status || customer.status;

        const updatedCustomer = await customer.save();
        res.json({
            _id: updatedCustomer._id,
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            mobile: updatedCustomer.mobile,
            status: updatedCustomer.status,
        });
    } else {
        res.status(404);
        throw new Error("Customer not found");
    }
});

// @desc    Get customer by ID with detailed stats
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
export const getCustomerById = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id)
        .populate("addresses")
        .select("-password"); // Exclude password

    if (customer) {
        // Fetch orders for this customer
        const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });

        // Calculate stats
        const totalSpent = orders
            .filter(o => o.isPaid)
            .reduce((acc, o) => acc + o.totalPrice, 0);

        res.json({
            ...customer.toObject(),
            orders,
            totalSpent,
            totalOrders: orders.length
        });
    } else {
        res.status(404);
        throw new Error("Customer not found");
    }
});

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Private/Admin
export const deleteCustomer = asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (customer) {
        await Customer.deleteOne({ _id: customer._id });
        res.json({ message: "Customer removed" });
    } else {
        res.status(404);
        throw new Error("Customer not found");
    }
});
