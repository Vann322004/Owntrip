import express from 'express';
import { rearrangeItinerary, autoGenerateTrip } from '../controllers/ai.controller';

const router = express.Router();

router.post('/rearrange', rearrangeItinerary);
router.post('/auto-generate', autoGenerateTrip);

module.exports = router;
