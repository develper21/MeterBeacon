import { Router } from 'express';
import {
  getGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  checkGeofence,
  findContainingGeofences,
  calculateDistanceToPoint,
} from '../controllers/geofence.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createGeofenceSchema, updateGeofenceSchema } from '../validators/geofence.validator';

const router = Router();

router.use(authenticate);

router.get('/', getGeofences);
router.post('/', authorize('ADMIN', 'MANAGER'), validateRequest(createGeofenceSchema), createGeofence);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validateRequest(updateGeofenceSchema), updateGeofence);
router.delete('/:id', authorize('ADMIN'), deleteGeofence);
router.get('/:id/check', checkGeofence);
router.get('/containing', findContainingGeofences);
router.get('/distance', calculateDistanceToPoint);

export default router;
