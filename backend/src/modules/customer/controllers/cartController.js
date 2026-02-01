import asyncHandler from "../../../middleware/asyncHandler.js";
import Cart from "../../../models/Cart.js";
import Product from "../../../models/Product.js";

// @desc    Get current user's cart
// @route   GET /api/customer/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart) {
        // If no cart exists, return distinct empty structure or create one
        // Here we just return empty items
        return res.json({ items: [] });
    }

    res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/customer/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        // Check if product exists in cart
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        const currentQtyInCart = itemIndex > -1 ? cart.items[itemIndex].quantity : 0;
        const totalRequestedQty = currentQtyInCart + Number(quantity);

        if (totalRequestedQty > product.countInStock) {
            res.status(400);
            throw new Error(`Only ${product.countInStock} items in stock. You already have ${currentQtyInCart} in cart.`);
        }

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity = totalRequestedQty;
        } else {
            // Add new item
            cart.items.push({ product: productId, quantity: Number(quantity) });
        }
    } else {
        if (Number(quantity) > product.countInStock) {
            res.status(400);
            throw new Error(`Only ${product.countInStock} items in stock.`);
        }
        // Create new cart
        cart = new Cart({
            user: req.user._id,
            items: [{ product: productId, quantity: Number(quantity) }],
        });
    }

    await cart.save();
    // Populate to return full object immediately could be useful
    await cart.populate("items.product");

    res.status(201).json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/customer/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { itemId } = req.params; // Using productId actually makes more sense usually, but let's see. logic below assumes itemId is productId for simplicity or item _id? 
    // Standard is usually identifying the item in the array or the product. 
    // Let's assume params.itemId is the PRODUCT ID for ease of use from frontend, 
    // OR we can use the subdocument _id. 
    // Let's use ProductID for consistency with addToCart. 

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    // Finding index by Product ID (easier from frontend usually) or Subdoc ID
    // Let's assume the router sends the Product ID as the param for simplicity: PUT /cart/:productId
    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === itemId
    );

    if (itemIndex > -1) {
        if (quantity > 0) {
            const product = await Product.findById(itemId);
            if (product && quantity > product.countInStock) {
                res.status(400);
                throw new Error(`Only ${product.countInStock} items in stock`);
            }
            cart.items[itemIndex].quantity = Number(quantity);
        } else {
            // Remove if quantity 0 (optional logic, but usually explicit remove is better)
            cart.items.splice(itemIndex, 1);
        }
        await cart.save();
        await cart.populate("items.product");
        res.json(cart);
    } else {
        res.status(404);
        throw new Error("Item not found in cart");
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/customer/cart/:itemId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params; // Assuming Product ID

    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
        cart.items = cart.items.filter(
            (item) => item.product.toString() !== itemId
        );

        await cart.save();
        await cart.populate("items.product");
        res.json(cart);
    } else {
        res.status(404);
        throw new Error("Cart not found");
    }
});

export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    res.json({ message: 'Cart cleared' });
})
