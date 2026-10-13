// Specialization labels are persisted as strings; keep existing saved values intact.
export const TRAINER_SPECIALIZATIONS = [
  "Weight Loss", "Muscle Building", "Strength Training", "Strength & Conditioning",
  "Functional Training", "HIIT", "Cardio Training", "Endurance Training",
  "Body Transformation", "Fat Loss", "Mobility", "Flexibility", "Yoga",
  "Pilates", "CrossFit", "Sports Conditioning", "Athletic Performance",
  "Injury Prevention", "Rehabilitation", "Posture Correction",
  "Senior Fitness", "Prenatal Fitness", "Postnatal Fitness",
  "Nutrition Coaching", "Boxing", "Martial Arts", "Calisthenics",
  "Powerlifting", "Bodybuilding", "General Fitness",
];

export const NUTRITIONIST_SPECIALIZATIONS = [
  "Weight Management", "Weight Loss Nutrition", "Weight Gain Nutrition",
  "Sports Nutrition", "Performance Nutrition", "Muscle Gain Nutrition",
  "Clinical Nutrition", "Therapeutic Diet Planning", "Diabetes Nutrition",
  "PCOS / PCOD Nutrition", "Thyroid Nutrition", "Heart Health Nutrition",
  "Gut Health", "Digestive Health", "Women's Health Nutrition",
  "Prenatal Nutrition", "Postnatal Nutrition", "Pediatric Nutrition",
  "Senior Nutrition", "Vegetarian Nutrition", "Vegan Nutrition",
  "Meal Planning", "Balanced Diet Planning", "Lifestyle Nutrition",
  "Nutrition Education", "Food Allergies & Intolerances",
  "Mindful Eating", "Healthy Habit Coaching", "General Nutrition",
];

export const SPORTS_COACH_SPECIALIZATIONS = [
  "Football Coaching", "Cricket Coaching", "Badminton Coaching",
  "Tennis Coaching", "Basketball Coaching", "Volleyball Coaching",
  "Swimming Coaching", "Athletics Coaching", "Running Coaching",
  "Cycling Coaching", "Boxing Coaching", "Martial Arts Coaching",
  "Karate Coaching", "Taekwondo Coaching", "Wrestling Coaching",
  "Table Tennis Coaching", "Hockey Coaching", "Gymnastics Coaching",
  "Skating Coaching", "Yoga Coaching", "CrossFit Coaching",
  "Strength & Conditioning", "Sports Conditioning",
  "Athletic Performance", "Speed & Agility Training",
  "Endurance Training", "Youth Sports Coaching",
  "Beginner Sports Training", "Competitive Sports Training",
  "Injury Prevention", "Mobility", "Flexibility",
];

export function getProfessionalSpecializationGroups(kind, role = "") {
  if (kind === "nutritionist") return [{ label: "Nutrition & Dietetics", options: NUTRITIONIST_SPECIALIZATIONS }];
  if (kind === "trainer" && /coach/i.test(role)) return [
    { label: "Sports & Coaching", options: SPORTS_COACH_SPECIALIZATIONS },
    { label: "Fitness & Conditioning", options: TRAINER_SPECIALIZATIONS },
  ];
  return [
    { label: "Fitness & Personal Training", options: TRAINER_SPECIALIZATIONS },
    { label: "Sports & Coaching", options: SPORTS_COACH_SPECIALIZATIONS },
  ];
}
