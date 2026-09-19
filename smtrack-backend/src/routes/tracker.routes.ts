import { Router } from 'express';
import { getTrackers, getTrackerById, createTracker, updateTracker, deleteTracker, updateLocation } from '../controllers/tracker.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createTrackerSchema, updateTrackerSchema, updateLocationSchema } from '../validators/tracker.validator';

const router = Router();

router.use(authenticate);

router.get('/', getTrackers);
router.post('/', validateRequest(createTrackerSchema), createTracker);
router.get('/:id', getTrackerById);
router.put('/:id', validateRequest(updateTrackerSchema), updateTracker);
router.delete('/:id', deleteTracker);
router.post('/:id/location', validateRequest(updateLocationSchema), updateLocation);

export default router;
