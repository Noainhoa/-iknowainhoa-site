/**
 * Future private booking-confirmation payload.
 * Not persisted or exposed publicly yet — schema only.
 */
export type ParkingPaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "refunded"
  | "failed";

export type ParkingBookingStatus =
  | "enquiry"
  | "awaiting_payment"
  | "confirmed"
  | "cancelled"
  | "completed";

export type ParkingBookingConfirmation = {
  bookingReference: string;
  customerName: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  vehicleModel: string;
  registrationNumber: string;
  totalPrice: number;
  currency: string;
  termsVersion: string;
  termsAccepted: boolean;
  termsAcceptedAt: string | null;
  paymentStatus: ParkingPaymentStatus;
  bookingStatus: ParkingBookingStatus;
};
