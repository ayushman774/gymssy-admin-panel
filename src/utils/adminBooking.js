export const BOOKING_STATUS_OPTIONS=["requested","confirmed","rejected","cancelled","completed"];
export const BOOKING_TYPE_OPTIONS=["visit","trial","class","membership","session","consultation"];
export const BOOKING_TARGET_OPTIONS=["gym","trainer","nutritionist"];
export const BOOKING_STATUS_LABELS={requested:"Requested",confirmed:"Confirmed",rejected:"Rejected",cancelled:"Cancelled",completed:"Completed"};
export const BOOKING_TYPE_LABELS={visit:"Gym visit",trial:"Trial",class:"Class",membership:"Membership",session:"Session",consultation:"Consultation"};
export function formatAdminBookingDate(value,timezone){const date=new Date(value);if(!value||Number.isNaN(date.getTime()))return"—";const options={year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"};try{return new Intl.DateTimeFormat("en-IN",{...options,timeZone:timezone}).format(date);}catch{return new Intl.DateTimeFormat("en-IN",{...options,timeZone:"UTC"}).format(date);}}
export function localDateTimeToIso(value){if(!value)return"";const date=new Date(value);return Number.isNaN(date.getTime())?"":date.toISOString();}
