import Banner from "../../../models/Banner.js";
import asyncHandler from "../../../middleware/asyncHandler.js";

// @desc    Get all active banners (for customer)
// @route   GET /api/customer/banners
// @access  Public
export const getActiveBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find({ isActive: true });
    res.json(banners);
});

// @desc    Get all banners (for admin)
// @route   GET /api/admin/banners
// @access  Private/Admin
export const getAllBanners = asyncHandler(async (req, res) => {
    const banners = await Banner.find({});
    res.json(banners);
});

// @desc    Create a banner
// @route   POST /api/admin/banners
// @access  Private/Admin
export const createBanner = asyncHandler(async (req, res) => {
    const { image, type, link, isActive } = req.body;

    const banner = new Banner({
        image,
        type,
        link,
        isActive,
    });

    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
});

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
export const updateBanner = asyncHandler(async (req, res) => {
    const { image, type, link, isActive } = req.body;

    const banner = await Banner.findById(req.params.id);

    if (banner) {
        banner.image = image || banner.image;
        banner.type = type || banner.type;
        banner.link = link !== undefined ? link : banner.link;
        banner.isActive = isActive !== undefined ? isActive : banner.isActive;

        const updatedBanner = await banner.save();
        res.json(updatedBanner);
    } else {
        res.status(404);
        throw new Error("Banner not found");
    }
});

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
export const deleteBanner = asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);

    if (banner) {
        await Banner.deleteOne({ _id: banner._id });
        res.json({ message: "Banner removed" });
    } else {
        res.status(404);
        throw new Error("Banner not found");
    }
});
