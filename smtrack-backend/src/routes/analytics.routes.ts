import { Router } from 'express';
import { getSummary, getTrackerHistory, getGeofenceBreaches } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/tracker/:id/history', getTrackerHistory);
router.get('/geofence-breaches', getGeofenceBreaches);

export default router;
