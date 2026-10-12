// Icon identifiers are supported by the customer frontend's iconRegistry.
export const FACILITY_GROUPS = [
  { label: "Training & Equipment", items: [
    ["Strength Equipment","FaDumbbell"],["Free Weights","Weight"],["Cardio Equipment","FaRunning"],["Treadmills","FaRunning"],["Exercise Bikes","Bike"],["Functional Training","Activity"],["HIIT Zone","Flame"],["CrossFit Area","Dumbbell"],["Boxing Area","Target"],["Yoga Studio","Flower2"],["Pilates Studio","PersonStanding"],["Stretching Area","Move"],["Group Classes","FaUsers"],["Personal Training","FaUserTie"],["Indoor Cycling","Bike"],["Sports Training","Trophy"],["Swimming Pool","Waves"],
  ]},
  { label: "Comfort & Amenities", items: [
    ["Changing Rooms","FaLock"],["Locker Rooms","FaLock"],["Shower Rooms","FaShower"],["Parking","FaCar"],["Wi-Fi","FaWifi"],["Air Conditioning","FaSnowflake"],["Drinking Water","FaTint"],["Nutrition Bar","FaAppleAlt"],["Cafe","Salad"],["Waiting Lounge","House"],["Rest Area","Moon"],["Steam Room","Droplets"],["Sauna","Flame"],["Towel Service","Droplets"],
  ]},
  { label: "Wellness & Services", items: [
    ["Body Analysis","FaHeartbeat"],["Fitness Assessment","HeartPulse"],["Nutrition Consultation","Salad"],["Physiotherapy","HandHeart"],["Recovery Zone","HeartPulse"],["Meditation Room","Flower2"],["Personal Coaching","UserRound"],["Certified Trainers","GraduationCap"],["First Aid","HeartPulse"],["Security","Shield"],["24/7 Access","FaClock"],["Outdoor Training","Sun"],["Accessibility","PersonStanding"],
  ]},
];
export const FACILITY_OPTIONS = FACILITY_GROUPS.flatMap((group) => group.items.map(([name, icon]) => ({ name, icon, group: group.label })));
export function facilityIconForName(name) {
  return FACILITY_OPTIONS.find((item) => item.name.toLowerCase() === String(name || "").toLowerCase())?.icon || "Grid";
}
