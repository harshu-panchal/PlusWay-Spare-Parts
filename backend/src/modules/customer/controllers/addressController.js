import Customer from "../../../models/Customer.js";

// @desc    Get all addresses for logged-in customer
// @route   GET /api/customer/addresses
// @access  Private
export const getAddresses = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);
        if (customer) {
            res.json(customer.addresses || []);
        } else {
            res.status(404).json({ message: "Customer not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new address
// @route   POST /api/customer/addresses
// @access  Private
export const addAddress = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const { type, name, mobile, street, city, state, pincode, isDefault } = req.body;

        // If this is set as default, unset all other defaults
        if (isDefault) {
            customer.addresses.forEach(addr => addr.isDefault = false);
        }

        // If this is the first address, make it default
        const makeDefault = customer.addresses.length === 0 || isDefault;

        customer.addresses.push({
            type,
            name,
            mobile,
            street,
            city,
            state,
            pincode,
            isDefault: makeDefault,
        });

        await customer.save();
        res.status(201).json(customer.addresses);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/customer/addresses/:id
// @access  Private
export const updateAddress = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const address = customer.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const { type, name, mobile, street, city, state, pincode, isDefault } = req.body;

        // If setting as default, unset all other defaults
        if (isDefault && !address.isDefault) {
            customer.addresses.forEach(addr => addr.isDefault = false);
        }

        address.type = type || address.type;
        address.name = name || address.name;
        address.mobile = mobile || address.mobile;
        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.pincode = pincode || address.pincode;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await customer.save();
        res.json(customer.addresses);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/customer/addresses/:id
// @access  Private
export const deleteAddress = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const address = customer.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const wasDefault = address.isDefault;
        address.deleteOne();

        // If deleted address was default and there are other addresses, make first one default
        if (wasDefault && customer.addresses.length > 0) {
            customer.addresses[0].isDefault = true;
        }

        await customer.save();
        res.json({ message: "Address removed", addresses: customer.addresses });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Set address as default
// @route   PUT /api/customer/addresses/:id/default
// @access  Private
export const setDefaultAddress = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id);

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const address = customer.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        // Unset all defaults
        customer.addresses.forEach(addr => addr.isDefault = false);

        // Set this one as default
        address.isDefault = true;

        await customer.save();
        res.json(customer.addresses);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
