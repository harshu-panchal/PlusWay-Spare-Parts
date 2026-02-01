import HomeSection from '../../../models/HomeSection.js';

// @route   POST /api/admin/home-sections
// @access  Private/Admin
export const createHomeSection = async (req, res) => {
    try {
        const { title, categories, order, isActive, productsPerRow } = req.body;
        const section = new HomeSection({
            title,
            categories,
            order,
            isActive,
            productsPerRow: productsPerRow || 4,
        });
        const createdSection = await section.save();
        res.status(201).json(createdSection);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/admin/home-sections
// @access  Private/Admin
export const getHomeSections = async (req, res) => {
    try {
        const sections = await HomeSection.find({}).populate('categories').sort({ order: 1 });
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/customer/home-sections
// @access  Public
export const getActiveHomeSections = async (req, res) => {
    try {
        const sections = await HomeSection.find({ isActive: true }).populate('categories').sort({ order: 1 });
        res.json(sections);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @route   PUT /api/admin/home-sections/:id
// @access  Private/Admin
export const updateHomeSection = async (req, res) => {
    try {
        const { title, categories, order, isActive, productsPerRow } = req.body;
        const section = await HomeSection.findById(req.params.id);

        if (section) {
            section.title = title;
            section.categories = categories;
            section.order = order ?? section.order;
            section.isActive = isActive ?? section.isActive;
            section.productsPerRow = productsPerRow ?? section.productsPerRow;

            const updatedSection = await section.save();
            res.json(updatedSection);
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
