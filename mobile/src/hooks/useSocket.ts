import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, deliveryActions, charterActions, notificationsActions } from '../store';

const SOCKET_URL = __DEV__ ? 'http://localhost:5000' : 'https://api.parkandlaunch.ae';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !accessToken) return;
    if (socketInstance?.connected) { socketRef.current = socketInstance; return; }

    socketInstance = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    // ---- Global notification handler ----
    socketInstance.on('notification', (notif) => {
      dispatch(notificationsActions.prependNotification(notif));
    });

    // ---- Delivery updates ----
    socketInstance.on('delivery_status', (data) => {
      dispatch(deliveryActions.updateDeliveryStatus(data));
    });

    socketInstance.on('location_update', (data) => {
      dispatch(deliveryActions.updateDriverLocation({ lat: data.lat, lng: data.lng }));
    });

    // ---- Charter updates ----
    socketInstance.on('charter_location_update', (data) => {
      dispatch(charterActions.updateCharterLocation(data));
    });

    socketInstance.on('new_booking_request', (data) => {
      dispatch(notificationsActions.prependNotification({
        type: 'new_booking',
        title: 'New Charter Request',
        message: `${data.userName} wants to book a ${data.type} on ${new Date(data.date).toDateString()}`,
        data,
        isRead: false,
        createdAt: new Date().toISOString(),
      }));
    });

    socketInstance.on('booking_response', (data) => {
      dispatch(notificationsActions.prependNotification({
        type: 'booking_response',
        title: data.status === 'confirmed' ? '✓ Booking Confirmed' : 'Booking Declined',
        message: data.message,
        data,
        isRead: false,
        createdAt: new Date().toISOString(),
      }));
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }, [accessToken, isAuthenticated]);

  const disconnect = useCallback(() => {
    if (socketInstance?.connected) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  }, []);

  const joinDeliveryRoom = useCallback((deliveryId: string) => {
    socketRef.current?.emit('join_delivery', deliveryId);
  }, []);

  const leaveDeliveryRoom = useCallback((deliveryId: string) => {
    socketRef.current?.emit('leave_delivery', deliveryId);
  }, []);

  const joinCharterRoom = useCallback((charterId: string) => {
    socketRef.current?.emit('join_charter', charterId);
  }, []);

  const joinCameraFeed = useCallback((bookingId: string, cameraId: string) => {
    socketRef.current?.emit('join_camera_feed', { bookingId, cameraId });
  }, []);

  const sendDriverLocation = useCallback((deliveryId: string, lat: number, lng: number, speed?: number, heading?: number) => {
    socketRef.current?.emit('driver_location', { deliveryId, lat, lng, speed, heading });
  }, []);

  useEffect(() => {
    if (isAuthenticated) connect();
    else disconnect();
    return () => { /* Don't disconnect on unmount — maintain persistent connection */ };
  }, [isAuthenticated, connect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect,
    joinDeliveryRoom,
    leaveDeliveryRoom,
    joinCharterRoom,
    joinCameraFeed,
    sendDriverLocation,
  };
};

export default useSocket;
