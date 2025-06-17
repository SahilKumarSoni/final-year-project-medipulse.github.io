import { Specialization } from "../models/specializationModel.js";

// Sample specialization data to insert
const specializationData = [
    { specialist: "General Practitioner", disease: "General health issues" },
    { specialist: "Cardiologists", disease: "Cardiovascular Disease" },
    { specialist: "Neurologists", disease: "Neurological Disorders" },
    { specialist: "Dermatologist", disease: "Skin Conditions" },
    { specialist: "Pediatricians", disease: "Childhood Diseases" },
    { specialist: "Surgeons", disease: "Surgical Conditions" },
    { specialist: "Gynecologists", disease: "Women's Health" },
    { specialist: "Orthopedic Doctors", disease: "Bone and Joint Disorders" },
    { specialist: "Oncologists", disease: "Cancer" },
    { specialist: "Allergists", disease: "Allergic Conditions" },
    { specialist: "Anesthesiologists", disease: "Anesthesia-related Issues" },
    { specialist: "Endocrinologists", disease: "Hormonal Disorders" },
    { specialist: "Gastroenterologists", disease: "Digestive Disorders" },
    { specialist: "Hematologists", disease: "Blood Disorders" },
    { specialist: "Infectious Disease Specialists", disease: "Infections" },
    { specialist: "Nephrologists", disease: "Kidney Disorders" },
    { specialist: "Ophthalmologists", disease: "Eye Conditions" },
    { specialist: "Otolaryngologists", disease: "Ear, Nose, and Throat Conditions" },
    { specialist: "Psychiatrists", disease: "Mental Health Disorders" },
    { specialist: "Rheumatologists", disease: "Autoimmune Diseases" },
    { specialist: "Urologists", disease: "Urinary Tract Disorders" },
    { specialist: "Plastic Surgeons", disease: "Cosmetic and Reconstructive Surgery" },
    { specialist: "Chiropractors", disease: "Spinal and Musculoskeletal Issues" },
    { specialist: "Vascular Surgeons", disease: "Blood Vessel Disorders" },
    { specialist: "Pulmonologists", disease: "Lung Disorders" },
    { specialist: "Radiologists", disease: "Diagnostic Imaging" },
    { specialist: "Pathologists", disease: "Disease Diagnosis" },
    { specialist: "Sports Medicine Specialists", disease: "Sports Injuries" },
    { specialist: "Sleep Specialists", disease: "Sleep Disorders" },
    { specialist: "Dentists", disease: "Oral Health Issues" },
    { specialist: "Prosthodontists", disease: "Teeth Replacement Issues" },
    { specialist: "Orthodontists", disease: "Dental Alignment Issues" },
    { specialist: "Oral Surgeons", disease: "Oral Surgery Conditions" },
    { specialist: "Speech-Language Pathologists", disease: "Speech and Language Disorders" },
    { specialist: "Dietitians/Nutritionists", disease: "Diet and Nutrition Issues" },
    { specialist: "Immunologists", disease: "Immune System Disorders" },
    { specialist: "Addiction Specialists", disease: "Substance Abuse" },
    { specialist: "Geriatricians", disease: "Age-related Diseases" },
    { specialist: "Palliative Care Specialists", disease: "Palliative Care for Chronic Conditions" },
    { specialist: "Hepatologists", disease: "Liver Disorders" },
    { specialist: "Toxicologists", disease: "Poisoning and Toxic Exposure" },
    { specialist: "Emergency Medicine Specialists", disease: "Acute Medical Conditions" },
    { specialist: "Family Medicine Doctors", disease: "Primary Care" },
    { specialist: "Occupational Medicine Specialists", disease: "Workplace-related Health Issues" },
    { specialist: "Laboratory Medicine Specialists", disease: "Lab Test Analysis" },
    { specialist: "Geneticists", disease: "Genetic Disorders" },
    { specialist: "Wound Care Specialists", disease: "Wound Healing Issues" },
    { specialist: "Sexual Health Specialists", disease: "Sexual Health Issues" },
    { specialist: "Occupational Therapists", disease: "Physical Rehabilitation" },
    { specialist: "Pain Management Specialists", disease: "Chronic Pain Conditions" },
    { specialist: "Diabetologists", disease: "Diabetes" },
    { specialist: "Hypertension Specialists (Hypertensiologists)", disease: "High Blood Pressure" },
    { specialist: "Endoscopic Surgeons", disease: "Endoscopic Surgery Conditions" },
    { specialist: "Gynaecological Oncologists", disease: "Gynaecological Cancers" },
    { specialist: "Clinical Pharmacologists", disease: "Medication-related Conditions" },
    { specialist: "Perinatologists", disease: "High-risk Pregnancies" },
    { specialist: "Thoracic Surgeons", disease: "Chest and Lung Conditions" },
    { specialist: "Podiatrists", disease: "Foot and Ankle Conditions" },
    { specialist: "Cardio-Thoracic Surgeons", disease: "Heart and Chest Surgery" },
    { specialist: "Bariatric Surgeons", disease: "Obesity-related Surgery" },
    { specialist: "Reproductive Endocrinologists", disease: "Infertility and Reproductive Issues" },
    { specialist: "Phlebologists (Venous Disease Specialists)", disease: "Vein Disorders" },
    { specialist: "Clinical Immunologists", disease: "Immune System Disorders" },
    { specialist: "Laser Surgeons", disease: "Laser Surgery" },
    { specialist: "Psychiatric Neurologists", disease: "Neurological Psychiatry Conditions" },
    { specialist: "Forensic Pathologists", disease: "Post-mortem Examinations" },
    { specialist: "Clinical Toxicologists", disease: "Toxicology" },
    { specialist: "Medico-Legal Experts", disease: "Medical Legal Issues" },
    { specialist: "Rheumatology Surgeons", disease: "Rheumatoid Arthritis and other Rheumatic Diseases" },
    { specialist: "Pain Psychologists", disease: "Psychological Aspects of Chronic Pain" },
    { specialist: "Sports Physiotherapists", disease: "Sports-related Injuries" },
    { specialist: "Pediatric Rheumatologists", disease: "Rheumatic Diseases in Children" },
    { specialist: "Neonatologists", disease: "Newborn Care" },
    { specialist: "Pulmonary Surgeons", disease: "Lung Surgery" },
    { specialist: "Neurophysiologists", disease: "Brain and Nerve Function Testing" },
  ];

// Controller function to insert data
export const insertSpecializations = async () => {
  try {
    // Check if any data already exists in the collection
    const existingData = await Specialization.find();

    if (existingData.length === 0) {
      // Insert the specialization data into MongoDB
      await Specialization.insertMany(specializationData);
      console.log("Specializations inserted successfully!");
    } else {
      console.log("Specializations already exist in the database.");
    }
  } catch (error) {
    console.error("Error inserting specializations:", error);
  }
};

