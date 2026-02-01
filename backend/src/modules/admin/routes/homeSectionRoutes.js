import express from 'express';
import {
    createHomeSection,
    getHomeSections,
    updateHomeSection,
    deleteHomeSection,
    getActiveHomeSections
} from '../controllers/homeSectionController.js';
import { protect, admin } from '../../../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.route('/')
    .post(protect, admin, createHomeSection)
    .get(protect, admin, getHomeSections);

router.route('/:id')
    .put(protect, admin, updateHomeSection)
    .delete(protect, admin, deleteHomeSection);

// Public route for customer (can be mounted separately if preferred, but exposing here for simplicity or creating a separate customer route file)
// Actually, let's keep customer route separate or handle in server.js mounting
// We'll export a separate router for customer if needed, or just allow public access to a specific path.
// For now, I'll add the public route here but it might be better mounted under /api/customer/home-sections via a separate file.
// Let's stick to Admin routes here to keep it clean.
// I will create a separate customer route file or just add it here and be careful with mounting.
// Wait, the standard is separate routes.
// Let's export ONLY admin routes here.
// And I'll create a customer route strictly for fetching.

export default router;
