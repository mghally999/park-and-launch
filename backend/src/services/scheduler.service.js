const cron = require('node-cron');
const logger = require('../utils/logger');

let jobsStarted = false;

const startScheduledJobs = () => {
  if (jobsStarted) return;
  jobsStarted = true;

  // ---- DAILY 8 AM: Check expiring bookings (7 days) ----
  cron.schedule('0 8 * * *', async () => {
    logger.info('⏰ Running: Expiring bookings check');
    try {
      const { ParkingBooking } = require('../models/ParkingModels');
      const { Notification } = require('../models/OtherModels');
      const { notifyUser } = require('./socket.service');
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      const expiringBookings = await ParkingBooking.find({
        status: 'active',
        endDate: { $gte: new Date(), $lte: sevenDaysFromNow },
      }).populate('user', '_id name preferences.notifications').populate('yard', 'name').lean();

      for (const booking of expiringBookings) {
        const daysLeft = Math.ceil((new Date(booking.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        const notif = await Notification.create({
          user: booking.user._id,
          type: 'booking_expiring',
          title: `Parking Expires in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''}`,
          message: `Your parking at ${booking.yard.name} expires on ${new Date(booking.endDate).toLocaleDateString('en-AE')}. Renew to secure your spot.`,
          data: { bookingId: booking._id, bookingRef: booking.bookingRef, daysLeft },
          priority: daysLeft <= 3 ? 'high' : 'normal',
          actionUrl: `/parking/bookings/${booking._id}`,
        });
        notifyUser(booking.user._id.toString(), 'notification', notif);
      }

      logger.info(`Sent ${expiringBookings.length} expiry notifications`);
    } catch (err) {
      logger.error(`Expiry notification job failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Dubai' });

  // ---- DAILY MIDNIGHT: Mark expired bookings ----
  cron.schedule('0 0 * * *', async () => {
    logger.info('⏰ Running: Mark expired bookings');
    try {
      const { ParkingBooking, ParkingYard } = require('../models/ParkingModels');
      const expiredBookings = await ParkingBooking.find({
        status: 'active',
        endDate: { $lt: new Date() },
        autoRenew: false,
      }).lean();

      for (const booking of expiredBookings) {
        await ParkingBooking.findByIdAndUpdate(booking._id, { status: 'expired' });
        await ParkingYard.findByIdAndUpdate(booking.yard, { $inc: { availableSpots: 1 } });
      }

      // Auto-renew bookings with autoRenew=true
      const toRenew = await ParkingBooking.find({
        status: 'active',
        endDate: { $lt: new Date() },
        autoRenew: true,
      }).populate('yard', 'pricing.ratePerFootPerMonth pricing.annualDiscountPercent').lean();

      for (const booking of toRenew) {
        const newEnd = new Date(booking.endDate);
        if (booking.planType === 'monthly') newEnd.setMonth(newEnd.getMonth() + 1);
        else if (booking.planType === 'annual') newEnd.setFullYear(newEnd.getFullYear() + 1);

        await ParkingBooking.findByIdAndUpdate(booking._id, {
          endDate: newEnd,
          nextRenewalDate: newEnd,
          status: 'active',
          $push: { notifications: { type: 'auto_renewed', sentAt: new Date(), message: 'Booking auto-renewed' } },
        });
      }

      logger.info(`Marked ${expiredBookings.length} expired, renewed ${toRenew.length} bookings`);
    } catch (err) {
      logger.error(`Expiry/renewal job failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Dubai' });

  // ---- MONTHLY: Notify boat owners of monthly milestone ----
  cron.schedule('0 9 1 * *', async () => {
    logger.info('⏰ Running: Monthly parking milestone notifications');
    try {
      const { ParkingBooking } = require('../models/ParkingModels');
      const { Notification } = require('../models/OtherModels');
      const { notifyUser } = require('./socket.service');

      const activeBookings = await ParkingBooking.find({ status: 'active' })
        .populate('boat', 'name').populate('yard', 'name area').lean();

      for (const booking of activeBookings) {
        const monthsParked = Math.floor((Date.now() - new Date(booking.startDate)) / (1000 * 60 * 60 * 24 * 30));
        if (monthsParked >= 1) {
          const notif = await Notification.create({
            user: booking.user,
            type: 'boat_parked_1month',
            title: `${booking.boat?.name} has been securely parked for ${monthsParked} month${monthsParked > 1 ? 's' : ''}`,
            message: `Your vessel has been safely stored at ${booking.yard?.name}, ${booking.yard?.area}. View live camera feed anytime.`,
            data: { bookingId: booking._id, monthsParked },
            actionUrl: `/parking/camera/${booking._id}`,
          });
          notifyUser(booking.user.toString(), 'notification', notif);
        }
      }
    } catch (err) {
      logger.error(`Monthly notification job failed: ${err.message}`);
    }
  }, { timezone: 'Asia/Dubai' });

  // ---- EVERY 30 MIN: Delivery scheduling (process MinHeap queue) ----
  cron.schedule('*/30 * * * *', async () => {
    try {
      const { deliveryQueue } = require('../utils/dataStructures');
      const Delivery = require('../models/Delivery');
      const now = Date.now();
      const processWindow = now + 35 * 60 * 1000; // Next 35 minutes

      while (!deliveryQueue.isEmpty() && deliveryQueue.peek().scheduledTime <= processWindow) {
        const item = deliveryQueue.pop();
        const delivery = await Delivery.findById(item.id).populate('user', '_id').lean();
        if (delivery && delivery.status === 'scheduled') {
          logger.info(`Processing delivery ${item.deliveryRef} scheduled for ${new Date(item.scheduledTime).toISOString()}`);
          // TODO: Auto-assign nearest available driver
        }
      }
    } catch (err) {
      logger.error(`Delivery queue processor error: ${err.message}`);
    }
  });

  logger.info('✅ Scheduled jobs started (Dubai timezone)');
};

module.exports = { startScheduledJobs };
