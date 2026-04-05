export const linking = {
  prefixes: ['parkandlaunch://', 'https://parkandlaunch.ae'],
  config: {
    screens: {
      Main: {
        screens: {
          ParkingTab: { screens: { BookingDetail: 'booking/:id', CameraFeed: 'camera/:bookingId' } },
          HomeTab: { screens: { TrackDelivery: 'delivery/:id' } }
        }
      }
    }
  }
};
