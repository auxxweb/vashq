import Job from '../models/Job.model.js';
import Business from '../models/Business.model.js';

/**
 * Generate unique token number for a job
 */
export const generateTokenNumber = async (businessId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Count jobs created today
  const todayJobsCount = await Job.countDocuments({
    businessId,
    createdAt: { $gte: today }
  });
  
  // Format: YYYYMMDD-XXX (e.g., 20241215-001)
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const sequence = String(todayJobsCount + 1).padStart(3, '0');
  
  return `${dateStr}-${sequence}`;
};

/**
 * Calculate estimated delivery time based on services
 */
export const calculateETA = (services) => {
  if (!services || services.length === 0) {
    const eta = new Date();
    eta.setMinutes(eta.getMinutes() + 60); // Default 1 hour
    return eta;
  }
  
  const totalMaxTime = services.reduce((sum, service) => {
    return sum + (service.maxTime || 0);
  }, 0);
  
  const eta = new Date();
  eta.setMinutes(eta.getMinutes() + totalMaxTime);
  return eta;
};

/**
 * Check if business can accept new job based on capacity
 */
export const canAcceptNewJob = async (businessId) => {
  const business = await Business.findById(businessId);
  
  if (!business) {
    return { canAccept: false, reason: 'Business not found' };
  }
  
  // Count active jobs (not completed, delivered, or cancelled)
  const activeJobsCount = await Job.countDocuments({
    businessId,
    status: { $nin: ['COMPLETED', 'DELIVERED', 'CANCELLED'] }
  });
  
  if (business.carHandlingCapacity === 'SINGLE') {
    if (activeJobsCount >= 1) {
      return { canAccept: false, reason: 'Another job is already in progress' };
    }
  } else {
    if (activeJobsCount >= business.maxConcurrentJobs) {
      return {
        canAccept: false,
        reason: `Maximum capacity of ${business.maxConcurrentJobs} jobs reached`
      };
    }
  }
  
  return { canAccept: true };
};

/**
 * Get next valid status in the workflow
 */
export const getNextStatus = (currentStatus) => {
  const statusFlow = {
    RECEIVED: 'IN_PROGRESS',
    IN_PROGRESS: 'WASHING',
    WASHING: 'DRYING',
    DRYING: 'COMPLETED',
    COMPLETED: 'DELIVERED',
    DELIVERED: null,
    CANCELLED: null
  };
  
  return statusFlow[currentStatus] || null;
};

/**
 * Check if status transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  // Can always cancel
  if (newStatus === 'CANCELLED') {
    return currentStatus !== 'DELIVERED' && currentStatus !== 'CANCELLED';
  }
  
  // Can't go backwards (except to cancel)
  const statusOrder = [
    'RECEIVED',
    'IN_PROGRESS',
    'WASHING',
    'DRYING',
    'COMPLETED',
    'DELIVERED'
  ];
  
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);
  
  if (currentIndex === -1 || newIndex === -1) {
    return false;
  }
  
  // Allow moving forward or staying in same status
  return newIndex >= currentIndex;
};
