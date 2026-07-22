import HomeSection from '../../../models/HomeSection.js';

const DISPLAY_TYPE_MODEL = {
    brands: 'Brand',
    categories: 'Category',
    models: 'Model',
    products: 'Product',
};

const populateSection = async (section) => {
    const model = DISPLAY_TYPE_MODEL[section.displayType] || 'Category';

    if (section.displayType === 'models') {
        return section.populate({
            path: 'categories',
            model: 'Model',
            populate: { path: 'brand', select: 'name logo' },
        });
    }

    return section.populate({ path: 'categories', model });
};

// @route   POST /api/admin/home-sections
// @access  Private/Admin
export const createHomeSection = async (req, res) => {
    try {
        const { title, displayType, categories, order, isActive, productsPerRow, filterDeviceType } = req.body;
        const section = new HomeSection({
            title,
            displayType: displayType || 'categories',
            categories,
            order,
            isActive,
            productsPerRow: productsPerRow || 4,
            filterDeviceType: filterDeviceType || '',
        });
        const createdSection = await section.save();
        const populated = await populateSection(createdSection);
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/admin/home-sections
// @access  Private/Admin
export const getHomeSections = async (req, res) => {
    try {
        const sections = await HomeSection.find({}).sort({ order: 1 });
        const populatedSections = await Promise.all(
            sections.map((section) => populateSection(section)),
        );
        res.json(populatedSections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/customer/home-sections
// @access  Public
export const getActiveHomeSections = async (req, res) => {
    try {
        const sections = await HomeSection.find({ isActive: true }).sort({ order: 1 });
        const populatedSections = await Promise.all(
            sections.map((section) => populateSection(section)),
        );
        res.json(populatedSections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/admin/home-sections/:id
// @access  Private/Admin
export const updateHomeSection = async (req, res) => {
    try {
        const { title, displayType, categories, order, isActive, productsPerRow, filterDeviceType } = req.body;
        const section = await HomeSection.findById(req.params.id);

        if (section) {
            section.title = title;
            section.displayType = displayType || section.displayType || 'categories';
            section.categories = categories;
            section.order = order ?? section.order;
            section.isActive = isActive ?? section.isActive;
            section.productsPerRow = productsPerRow ?? section.productsPerRow;
            if (filterDeviceType !== undefined) {
                section.filterDeviceType = filterDeviceType;
            }

            const updatedSection = await section.save();
            const populated = await populateSection(updatedSection);
            res.json(populated);
        } else {
            res.status(404).json({ message: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   DELETE /api/admin/home-sections/:id
// @access  Private/Admin
export const deleteHomeSection = async (req, res) => {
    try {
        const section = await HomeSection.findById(req.params.id);
        if (section) {
            await section.deleteOne();
            res.json({ message: 'Section removed' });
        } else {
            res.status(404).json({ message: 'Section not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
