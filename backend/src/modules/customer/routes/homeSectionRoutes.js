import express from 'express';
import { getActiveHomeSections } from '../../admin/controllers/homeSectionController.js'; // Reusing controller

const router = express.Router();

router.get('/', getActiveHomeSections);

export default router;
