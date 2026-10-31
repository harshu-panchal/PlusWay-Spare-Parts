import asyncHandler from "../../../middleware/asyncHandler.js";
import Customer from "../../../models/Customer.js";
import Order from "../../../models/Order.js";
import ExcelJS from "exceljs";

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildCustomerFilter = ({ search = "", status } = {}) => {
    const filter = {};

    if (search) {
        const escapedSearch = escapeRegex(search);
        filter.$or = [
            { name: { $regex: escapedSearch, $options: "i" } },
            { email: { $regex: escapedSearch, $options: "i" } },
            { mobile: { $regex: escapedSearch, $options: "i" } }
        ];
    }

    if (status && status !== "All") {
        filter.status = status;
    }

    return filter;
};

// @desc    Get all customers with stats
// @route   GET /api/admin/customers
// @access  Private/Admin
export const getCustomers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 20;
    const page = Number(req.query.pageNumber) || 1;
    const search = req.query.search || "";
    const status = req.query.status;

    const filter = buildCustomerFilter({ search, status });

    const count = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
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

// @desc    Export all customers matching the current admin filters to Excel
// @route   GET /api/admin/customers/export
// @access  Private/Admin
export const exportCustomers = asyncHandler(async (req, res) => {
    const filter = buildCustomerFilter({
        search: req.query.search || "",
        status: req.query.status,
    });

    const customers = await Customer.find(filter)
        .select("name mobile email createdAt")
        .sort({ createdAt: -1 })
        .lean();

    const customerIds = customers.map((customer) => customer._id);
    const customerStats = customerIds.length
        ? await Order.aggregate([
            { $match: { customer: { $in: customerIds }, isPaid: true } },
            {
                $group: {
                    _id: "$customer",
                    totalSpent: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 },
                },
            },
        ])
        : [];

    const statsMap = new Map(
        customerStats.map((stat) => [String(stat._id), stat]),
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PlusWay Admin";
    workbook.lastModifiedBy = "PlusWay Admin";
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet("Customers", {
        views: [{ state: "frozen", ySplit: 1 }],
    });

    worksheet.columns = [
        { header: "Name", key: "name", width: 30 },
        { header: "Phone Number", key: "phone", width: 20 },
        { header: "Email", key: "email", width: 34 },
        { header: "Joined Date", key: "joinedDate", width: 16 },
        { header: "Total Orders", key: "totalOrders", width: 15 },
        { header: "Total Spend (INR)", key: "totalSpent", width: 20 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4F46E5" },
        };
        cell.font = {
            name: "Arial",
            size: 10,
            bold: true,
            color: { argb: "FFFFFFFF" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
            right: { style: "thin", color: { argb: "FFFFFFFF" } },
        };
    });

    customers.forEach((customer) => {
        const stats = statsMap.get(String(customer._id)) || {
            totalOrders: 0,
            totalSpent: 0,
        };
        const row = worksheet.addRow({
            name: customer.name || "",
            phone: customer.mobile || "",
            email: customer.email || "",
            joinedDate: customer.createdAt || null,
            totalOrders: stats.totalOrders || 0,
            totalSpent: stats.totalSpent || 0,
        });
        row.height = 22;
        row.eachCell({ includeEmpty: true }, (cell) => {
            cell.font = { name: "Arial", size: 10, color: { argb: "FF1F2937" } };
            cell.alignment = { vertical: "middle" };
            cell.border = {
                bottom: { style: "hair", color: { argb: "FFE5E7EB" } },
            };
        });
        row.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
        row.getCell(6).alignment = { horizontal: "right", vertical: "middle" };
    });

    worksheet.getColumn("phone").numFmt = "@";
    worksheet.getColumn("joinedDate").numFmt = "dd/mm/yyyy";
    worksheet.getColumn("totalOrders").numFmt = "#,##0";
    worksheet.getColumn("totalSpent").numFmt = '"₹"#,##0.00';
    worksheet.autoFilter = {
        from: "A1",
        to: `F${Math.max(1, worksheet.rowCount)}`,
    };

    const dateParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const datePart = (type) => dateParts.find((part) => part.type === type)?.value;
    const fileDate = `${datePart("year")}-${datePart("month")}-${datePart("day")}`;

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=plusway_customers_${fileDate}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
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
