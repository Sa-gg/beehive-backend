/**
 * Beehive Database Seed Script
 * 
 * This seed script contains the actual production data from the database backup.
 * Use this to seed a fresh database with the correct initial data.
 * 
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL! 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================
// SEED DATA - From Production Backup
// ============================================

const CATEGORIES = [
  { id: "cat-pizza-57991e57", name: "PIZZA", displayName: "Pizza", description: null, sortOrder: 0, isActive: true },
  { id: "cat-appetizer-9df02c98", name: "APPETIZERS", displayName: "Appetizers", description: null, sortOrder: 1, isActive: true },
  { id: "cat-hot_drinks-a131a103", name: "HOT_DRINKS", displayName: "Hot Drinks", description: null, sortOrder: 2, isActive: true },
  { id: "cat-cold_drinks-1835add3", name: "COLD_DRINKS", displayName: "Cold Drinks", description: null, sortOrder: 3, isActive: true },
  { id: "cat-smoothie-73b7077d", name: "SMOOTHIE", displayName: "Smoothie", description: null, sortOrder: 4, isActive: true },
  { id: "cat-platter-54ff7feb", name: "PLATTER", displayName: "Platter", description: null, sortOrder: 5, isActive: true },
  { id: "cat-savers-c1764908", name: "SAVERS", displayName: "Savers", description: null, sortOrder: 6, isActive: true },
  { id: "cat-value_meal-a865e467", name: "VALUE_MEAL", displayName: "Value Meal", description: null, sortOrder: 7, isActive: true },
];

const MENU_ITEMS = [
  // Pizza
  { id: "menu-bacon-pepperoni-1766851877797", name: "Bacon Pepperoni", price: 299, cost: 120, categoryId: "cat-pizza-57991e57", image: "/uploads/menu-images/menu-1766852005566-154382689.jpg", description: "Classic bacon and pepperoni pizza with mozzarella", available: true, featured: true, prepTime: 15, nutrients: "Protein, B-Vitamins, Iron", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-beef-wagon-1766851877968", name: "Beef Wagon", price: 329, cost: 140, categoryId: "cat-pizza-57991e57", image: "/uploads/menu-images/menu-1766851993288-607860813.jpg", description: "Loaded beef pizza with special sauce", available: true, featured: false, prepTime: 15, nutrients: "Protein, B-Vitamins, Iron, Zinc", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-creamy-spinach-1766851877973", name: "Creamy Spinach", price: 279, cost: 100, categoryId: "cat-pizza-57991e57", image: "/uploads/menu-images/menu-1766852026867-351417631.jpg", description: "Healthy spinach pizza with creamy sauce", available: true, featured: false, prepTime: 15, nutrients: "Iron, Folate, Vitamin K", moodBenefits: JSON.stringify({ stressed: "Spinach contains magnesium which calms the nervous system", anxious: "Folate supports neurotransmitter production" }) },
  { id: "menu-ham--cheese-hawaiian-1766851877979", name: "Ham & Cheese Hawaiian", price: 289, cost: 110, categoryId: "cat-pizza-57991e57", image: "/uploads/menu-images/menu-1766852015783-747501375.jpg", description: "Hawaiian style with ham and pineapple", available: true, featured: true, prepTime: 15, nutrients: "Protein, Calcium", moodBenefits: JSON.stringify({ happy: "Cheese contains tyrosine which helps produce dopamine" }) },
  
  // Appetizers
  { id: "menu-beef-burger-1766851877984", name: "Beef Burger", price: 129, cost: 55, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852132036-802167840.jpg", description: "Juicy beef burger with special sauce", available: true, featured: true, prepTime: 10, nutrients: "Protein, Iron, B-Vitamins", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-chicken-burger-1766851877992", name: "Chicken Burger", price: 119, cost: 50, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852284582-834727442.jpg", description: "Crispy chicken burger", available: true, featured: false, prepTime: 10, nutrients: "Protein, Tryptophan, B-Vitamins", moodBenefits: JSON.stringify({ sad: "Rich in tryptophan, which produces serotonin - the happiness hormone", depressed: "High levels of tryptophan convert to serotonin in the brain", anxious: "Tryptophan helps produce serotonin, which has calming effects", tired: "Lean protein provides sustained energy without digestive heaviness" }) },
  { id: "menu-burger-w-fries-1766851877998", name: "Burger w/ Fries", price: 159, cost: 70, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852276946-518386886.jpg", description: "Burger combo with crispy fries", available: true, featured: false, prepTime: 12, nutrients: "Protein, Carbohydrates", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-cheesy-fries-1766851878006", name: "Cheesy Fries", price: 89, cost: 35, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852251763-116851433.jpg", description: "Crispy fries with melted cheese", available: true, featured: true, prepTime: 8, nutrients: "Calcium, Carbohydrates", moodBenefits: JSON.stringify({ happy: "Comfort food that triggers dopamine release" }) },
  { id: "menu-chili-fries-1766851878012", name: "Chili Fries", price: 99, cost: 40, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852227376-971871700.jpg", description: "Fries with spicy chili topping", available: true, featured: false, prepTime: 8, nutrients: "Carbohydrates, Capsaicin", moodBenefits: JSON.stringify({ energetic: "Capsaicin boosts metabolism and energy" }) },
  { id: "menu-meaty-chili-fries-1766851878023", name: "Meaty Chili Fries", price: 129, cost: 55, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852216316-225571214.jpg", description: "Loaded fries with meat and chili", available: true, featured: false, prepTime: 10, nutrients: "Protein, Carbohydrates", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-meaty-fries-1766851878032", name: "Meaty Fries", price: 119, cost: 50, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852195230-474373806.jpg", description: "Fries topped with seasoned meat", available: true, featured: false, prepTime: 10, nutrients: "Protein, Carbohydrates", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-nacho-fries-1766851878039", name: "Nacho Fries", price: 109, cost: 45, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852176240-243618144.png", description: "Fries with nacho cheese and toppings", available: true, featured: false, prepTime: 8, nutrients: "Calcium, Protein", moodBenefits: JSON.stringify({ happy: "Cheese triggers pleasure centers in the brain" }) },
  { id: "menu-nachos-1766851878045", name: "Nachos", price: 99, cost: 40, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852071118-816259039.jpg", description: "Classic nachos with cheese and salsa", available: true, featured: false, prepTime: 8, nutrients: "Calcium, Protein, Fiber", moodBenefits: JSON.stringify({ happy: "Cheese and protein boost mood neurotransmitters" }) },
  { id: "menu-lumpia-shanghai-1766851878051", name: "Lumpia Shanghai", price: 79, cost: 30, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852050460-570732409.jpg", description: "Crispy Filipino spring rolls", available: true, featured: true, prepTime: 10, nutrients: "Protein, Carbohydrates", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-pancit-canton-chili-mansi-1766851878056", name: "Pancit Canton Chili Mansi", price: 89, cost: 35, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852163960-625131715.jpg", description: "Stir-fried noodles with chili calamansi", available: true, featured: false, prepTime: 10, nutrients: "Carbohydrates, Protein", moodBenefits: JSON.stringify({ energetic: "Quick energy from carbohydrates" }) },
  { id: "menu-pancit-canton-extra-hot-1766851878062", name: "Pancit Canton Extra Hot", price: 99, cost: 40, categoryId: "cat-appetizer-9df02c98", image: "/uploads/menu-images/menu-1766852139252-523212027.jpg", description: "Extra spicy stir-fried noodles", available: true, featured: false, prepTime: 10, nutrients: "Carbohydrates, Protein", moodBenefits: JSON.stringify({ energetic: "Spicy foods boost endorphins" }) },
  
  // Hot Drinks
  { id: "menu-hot-coffee-1766851878068", name: "Hot Coffee", price: 59, cost: 15, categoryId: "cat-hot_drinks-a131a103", image: "/uploads/menu-images/menu-1766852348051-423945729.png", description: "Freshly brewed hot coffee", available: true, featured: true, prepTime: 3, nutrients: "Caffeine, Antioxidants", moodBenefits: JSON.stringify({ tired: "Caffeine blocks adenosine receptors, reducing fatigue and increasing alertness", energetic: "Moderate caffeine enhances dopamine signaling, improving focus", happy: "Caffeine stimulates dopamine release, enhancing feelings of pleasure" }) },
  { id: "menu-hot-coffee-with-milk-1766851878074", name: "Hot Coffee with Milk", price: 69, cost: 20, categoryId: "cat-hot_drinks-a131a103", image: "/uploads/menu-images/menu-1766852338099-536847558.png", description: "Hot coffee with creamy milk", available: true, featured: false, prepTime: 3, nutrients: "Caffeine, Calcium, Protein", moodBenefits: JSON.stringify({ tired: "Caffeine blocks adenosine receptors, reducing fatigue and increasing alertness", energetic: "Moderate caffeine enhances dopamine signaling, improving focus", happy: "Caffeine stimulates dopamine release, enhancing feelings of pleasure" }) },
  { id: "menu-hot-chocolate-1766851878082", name: "Hot Chocolate", price: 79, cost: 25, categoryId: "cat-hot_drinks-a131a103", image: "/uploads/menu-images/menu-1766852329287-427216755.png", description: "Rich and creamy hot chocolate", available: true, featured: true, prepTime: 3, nutrients: "Magnesium, Flavonoids, Tryptophan", moodBenefits: JSON.stringify({ sad: "Triggers endorphin release - your natural feel-good chemicals", depressed: "Contains phenylethylamine which promotes feelings of happiness", stressed: "Magnesium helps relax muscles and calm the nervous system", happy: "Triggers endorphin and serotonin release" }) },
  { id: "menu-hot-matcha-1766851878088", name: "Hot Matcha", price: 89, cost: 35, categoryId: "cat-hot_drinks-a131a103", image: "/uploads/menu-images/menu-1766852317580-362181551.png", description: "Premium hot matcha latte", available: true, featured: false, prepTime: 4, nutrients: "L-Theanine, Caffeine, Antioxidants", moodBenefits: JSON.stringify({ anxious: "L-theanine promotes relaxed alertness without jitters", stressed: "L-theanine increases GABA, serotonin, and dopamine levels naturally", relaxed: "Induces relaxation without drowsiness", tired: "Gentle caffeine with L-theanine prevents energy crashes" }) },
  
  // Cold Drinks
  { id: "menu-caramel-macchiato-1766851878096", name: "Caramel Macchiato", price: 99, cost: 40, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852563699-538029622.png", description: "Espresso with vanilla and caramel", available: true, featured: true, prepTime: 4, nutrients: "Caffeine, Calcium", moodBenefits: JSON.stringify({ tired: "Caffeine blocks adenosine receptors, reducing fatigue and increasing alertness", energetic: "Moderate caffeine enhances dopamine signaling, improving focus", happy: "Caffeine stimulates dopamine release, enhancing feelings of pleasure" }) },
  { id: "menu-caramel-matcha-1766851878102", name: "Caramel Matcha", price: 109, cost: 45, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852547363-145044657.png", description: "Iced matcha with caramel drizzle", available: true, featured: false, prepTime: 4, nutrients: "L-Theanine, Caffeine", moodBenefits: JSON.stringify({ anxious: "L-theanine promotes relaxed alertness without jitters", stressed: "L-theanine increases GABA, serotonin, and dopamine levels naturally", relaxed: "Induces relaxation without drowsiness", tired: "Gentle caffeine with L-theanine prevents energy crashes" }) },
  { id: "menu-dirty-matcha-latte-1766851878107", name: "Dirty Matcha Latte", price: 119, cost: 50, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852512943-228450094.png", description: "Matcha with espresso shot", available: true, featured: true, prepTime: 5, nutrients: "L-Theanine, Caffeine, Calcium", moodBenefits: JSON.stringify({ anxious: "L-theanine promotes relaxed alertness without jitters", stressed: "L-theanine increases GABA, serotonin, and dopamine levels naturally", relaxed: "Induces relaxation without drowsiness", tired: "Gentle caffeine with L-theanine prevents energy crashes" }) },
  { id: "menu-iced-americano-1766851878111", name: "Iced Americano", price: 79, cost: 25, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852461634-851780291.png", description: "Classic iced americano", available: true, featured: true, prepTime: 3, nutrients: "Caffeine, Antioxidants", moodBenefits: JSON.stringify({ tired: "Caffeine blocks adenosine receptors, reducing fatigue and increasing alertness", energetic: "Moderate caffeine enhances dopamine signaling, improving focus", happy: "Caffeine stimulates dopamine release, enhancing feelings of pleasure" }) },
  { id: "menu-iced-caramel-milk-1766851878116", name: "Iced Caramel Milk", price: 89, cost: 30, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852444878-660883318.png", description: "Caramel flavored iced milk", available: true, featured: false, prepTime: 3, nutrients: "Calcium, Protein", moodBenefits: JSON.stringify({ happy: "Dairy products support dopamine production" }) },
  { id: "menu-iced-chocolate-1766851878121", name: "Iced Chocolate", price: 89, cost: 30, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852427869-519975420.png", description: "Refreshing iced chocolate", available: true, featured: false, prepTime: 3, nutrients: "Magnesium, Flavonoids", moodBenefits: JSON.stringify({ sad: "Triggers endorphin release - your natural feel-good chemicals", depressed: "Contains phenylethylamine which promotes feelings of happiness", stressed: "Magnesium helps relax muscles and calm the nervous system", happy: "Triggers endorphin and serotonin release" }) },
  { id: "menu-iced-coffee-1766851878129", name: "Iced Coffee", price: 69, cost: 20, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852414251-232115963.png", description: "Classic iced coffee", available: true, featured: true, prepTime: 3, nutrients: "Caffeine, Antioxidants", moodBenefits: JSON.stringify({ tired: "Caffeine blocks adenosine receptors, reducing fatigue and increasing alertness", energetic: "Moderate caffeine enhances dopamine signaling, improving focus", happy: "Caffeine stimulates dopamine release, enhancing feelings of pleasure" }) },
  { id: "menu-iced-matcha-1766851878136", name: "Iced Matcha", price: 99, cost: 40, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852390420-276537305.png", description: "Refreshing iced matcha", available: true, featured: false, prepTime: 4, nutrients: "L-Theanine, Caffeine", moodBenefits: JSON.stringify({ anxious: "L-theanine promotes relaxed alertness without jitters", stressed: "L-theanine increases GABA, serotonin, and dopamine levels naturally", relaxed: "Induces relaxation without drowsiness", tired: "Gentle caffeine with L-theanine prevents energy crashes" }) },
  { id: "menu-salted-caramel-1766851878145", name: "Salted Caramel", price: 99, cost: 40, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852377251-681548137.png", description: "Salted caramel iced latte", available: true, featured: true, prepTime: 4, nutrients: "Calcium, Protein", moodBenefits: JSON.stringify({ happy: "Sweet and salty combo triggers pleasure response" }) },
  { id: "menu-spanish-latte-1766851878150", name: "Spanish Latte", price: 99, cost: 40, categoryId: "cat-cold_drinks-1835add3", image: "/uploads/menu-images/menu-1766852364740-898280382.png", description: "Sweet condensed milk latte", available: true, featured: true, prepTime: 4, nutrients: "Caffeine, Calcium", moodBenefits: JSON.stringify({ tired: "Caffeine blocks adenosine receptors, reducing fatigue and increasing alertness", energetic: "Moderate caffeine enhances dopamine signaling, improving focus", happy: "Caffeine stimulates dopamine release, enhancing feelings of pleasure" }) },
  
  // Smoothies
  { id: "menu-blueberry-smoothie-1766851878156", name: "Blueberry Smoothie", price: 129, cost: 55, categoryId: "cat-smoothie-73b7077d", image: "/uploads/menu-images/menu-1766852598948-184131780.png", description: "Fresh blueberry yogurt smoothie", available: true, featured: true, prepTime: 5, nutrients: "Vitamin C, Antioxidants, Fiber", moodBenefits: JSON.stringify({ stressed: "High vitamin C regulates cortisol (stress hormone) levels", sad: "Berries contain anthocyanins that have mood-boosting effects", tired: "Natural fruit sugars provide immediate energy", anxious: "Vitamin C supports adrenal gland function, helping manage anxiety" }) },
  { id: "menu-strawberry-smoothie-1766851878162", name: "Strawberry Smoothie", price: 129, cost: 55, categoryId: "cat-smoothie-73b7077d", image: "/uploads/menu-images/menu-1766852587208-913302573.png", description: "Fresh strawberry yogurt smoothie", available: true, featured: true, prepTime: 5, nutrients: "Vitamin C, Antioxidants, Fiber", moodBenefits: JSON.stringify({ stressed: "High vitamin C regulates cortisol (stress hormone) levels", sad: "Berries contain anthocyanins that have mood-boosting effects", tired: "Natural fruit sugars provide immediate energy", anxious: "Vitamin C supports adrenal gland function, helping manage anxiety" }) },
  
  // Platters
  { id: "menu-beef-tapa-1766851878166", name: "Beef Tapa", price: 189, cost: 113.4, categoryId: "cat-platter-54ff7feb", image: "/uploads/menu-images/menu-1766852620037-838142496.jpg", description: null, available: true, featured: true, prepTime: 10, nutrients: "Protein, Iron, B-Vitamins", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-boneless-bangus-1766851878172", name: "Boneless Bangus", price: 179, cost: 107.4, categoryId: "cat-platter-54ff7feb", image: "/uploads/menu-images/menu-1766852676255-437376042.webp", description: null, available: true, featured: false, prepTime: 10, nutrients: "Omega-3, Vitamin D, Protein", moodBenefits: JSON.stringify({ depressed: "Contains omega-3 fatty acids (EPA and DHA) which reduce depressive symptoms", sad: "Omega-3 fatty acids help produce serotonin and reduce brain inflammation", stressed: "EPA and DHA lower cortisol levels and reduce inflammatory stress responses", anxious: "Omega-3 fatty acids reduce nervous system inflammation" }) },
  { id: "menu-chicharon-bulaklak-1766851878176", name: "Chicharon Bulaklak", price: 199, cost: 119.4, categoryId: "cat-platter-54ff7feb", image: "/uploads/menu-images/menu-1766852660852-838975618.jpg", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Collagen", moodBenefits: JSON.stringify({ happy: "Crispy texture triggers satisfaction" }) },
  { id: "menu-hungarian-1766851878179", name: "Hungarian", price: 159, cost: 95.39, categoryId: "cat-platter-54ff7feb", image: "/uploads/menu-images/menu-1767858702652-67115268.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, B-Vitamins", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-hungarian-w-fries-1766851878184", name: "Hungarian w/ Fries", price: 189, cost: 113.4, categoryId: "cat-platter-54ff7feb", image: "/uploads/menu-images/menu-1766852640330-839909709.jpg", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Carbohydrates", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-pork-sisig-1766851878188", name: "Pork Sisig", price: 169, cost: 101.4, categoryId: "cat-platter-54ff7feb", image: "/uploads/menu-images/menu-1766852630116-311331834.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Iron, B-Vitamins", moodBenefits: JSON.stringify({ happy: "Savory flavors trigger dopamine release", energetic: "High protein supports sustained energy" }) },
  
  // Savers
  { id: "menu-beef-tapa-1766851878192", name: "Beef Tapa", price: 129, cost: 77.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852822466-716047972.jpg", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Iron, B-Vitamins", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-burger-steak-1766851878198", name: "Burger Steak", price: 119, cost: 71.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852714717-67078907.png", description: null, available: false, featured: true, prepTime: 10, nutrients: "Protein, Iron", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-cheesy-hungarian-1766851878201", name: "Cheesy Hungarian", price: 109, cost: 65.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852814096-862621458.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Calcium", moodBenefits: JSON.stringify({ happy: "Cheese triggers dopamine production" }) },
  { id: "menu-chicken-fillet-1766851878206", name: "Chicken Fillet", price: 119, cost: 71.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852781792-831983204.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Tryptophan", moodBenefits: JSON.stringify({ sad: "Rich in tryptophan, which produces serotonin - the happiness hormone", depressed: "High levels of tryptophan convert to serotonin in the brain", anxious: "Tryptophan helps produce serotonin, which has calming effects", tired: "Lean protein provides sustained energy without digestive heaviness" }) },
  { id: "menu-fish-fillet-1766851878208", name: "Fish Fillet", price: 119, cost: 71.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852772157-299507160.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Omega-3, Protein", moodBenefits: JSON.stringify({ depressed: "Contains omega-3 fatty acids (EPA and DHA) which reduce depressive symptoms", sad: "Omega-3 fatty acids help produce serotonin and reduce brain inflammation", stressed: "EPA and DHA lower cortisol levels and reduce inflammatory stress responses", anxious: "Omega-3 fatty acids reduce nervous system inflammation" }) },
  { id: "menu-fried-liempo-1766851878213", name: "Fried Liempo", price: 129, cost: 77.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852760501-428960926.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Fat", moodBenefits: JSON.stringify({ happy: "Satisfying texture and flavor", energetic: "High-energy meal" }) },
  { id: "menu-garlic-pepper-beef-1766851878218", name: "Garlic Pepper Beef", price: 139, cost: 83.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852748634-37717735.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Iron, B-Vitamins", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-grilled-liempo-1766851878221", name: "Grilled Liempo", price: 129, cost: 77.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852738627-413120308.jpg", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Fat", moodBenefits: JSON.stringify({ happy: "Grilled flavors boost satisfaction" }) },
  { id: "menu-pork-sisig-1766851878228", name: "Pork Sisig", price: 119, cost: 71.39, categoryId: "cat-savers-c1764908", image: "/uploads/menu-images/menu-1766852725779-166349093.jpg", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Iron", moodBenefits: JSON.stringify({ happy: "Savory comfort food", energetic: "High protein content" }) },
  
  // Value Meals
  { id: "menu-boneless-bangus-1766851878234", name: "Boneless Bangus", price: 159, cost: 95.39, categoryId: "cat-value_meal-a865e467", image: "/uploads/menu-images/menu-1766852896310-440117368.jpg", description: null, available: true, featured: false, prepTime: 10, nutrients: "Omega-3, Vitamin D, Protein", moodBenefits: JSON.stringify({ depressed: "Contains omega-3 fatty acids (EPA and DHA) which reduce depressive symptoms", sad: "Omega-3 fatty acids help produce serotonin and reduce brain inflammation", stressed: "EPA and DHA lower cortisol levels and reduce inflammatory stress responses", anxious: "Omega-3 fatty acids reduce nervous system inflammation" }) },
  { id: "menu-chicharon-bulaklak-1766851878241", name: "Chicharon Bulaklak", price: 179, cost: 107.4, categoryId: "cat-value_meal-a865e467", image: "/uploads/menu-images/menu-1766852880252-748210268.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Collagen", moodBenefits: JSON.stringify({ happy: "Crispy texture satisfaction" }) },
  { id: "menu-hungarian-1766851878247", name: "Hungarian", price: 149, cost: 89.39, categoryId: "cat-value_meal-a865e467", image: "/uploads/menu-images/menu-1766852869185-863638002.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, B-Vitamins", moodBenefits: JSON.stringify({ angry: "Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability", tired: "High in iron and vitamin B12, combats fatigue by supporting red blood cell production", depressed: "Contains vitamin B12 and folate essential for neurotransmitter synthesis", stressed: "Rich in B-vitamins that support adrenal function and help cope with stress" }) },
  { id: "menu-pork-bbq-grilled-1766851878253", name: "Pork BBQ Grilled", price: 169, cost: 101.4, categoryId: "cat-value_meal-a865e467", image: "/uploads/menu-images/menu-1767857383065-453613963.png", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Iron", moodBenefits: JSON.stringify({ happy: "Grilled BBQ satisfies comfort cravings" }) },
  { id: "menu-spare-ribs-1766851878259", name: "Spare Ribs", price: 189, cost: 113.4, categoryId: "cat-value_meal-a865e467", image: "/uploads/menu-images/menu-1766852844704-736307602.jpg", description: null, available: true, featured: false, prepTime: 10, nutrients: "Protein, Collagen", moodBenefits: JSON.stringify({ happy: "Tender, flavorful comfort food" }) },
];

const MOOD_SETTINGS = [
  { id: "mood-happy-1766853808033", mood: "HAPPY" as const, emoji: "😊", label: "Happy", color: "#f9c900", description: "Celebrate your joy!", supportMessage: "", scientificExplanation: "Maintain your positive mood with foods rich in omega-3 fatty acids and B-vitamins that support dopamine and serotonin production, the neurotransmitters responsible for happiness and well-being.", beneficialNutrients: "[\"Omega-3 (DHA/EPA)\",\"Vitamin B Complex\",\"Tryptophan\"]", preferredCategories: "[\"cat-pizza-57991e57\",\"cat-appetizer-9df02c98\",\"cat-smoothie-73b7077d\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-energetic-1766853808041", mood: "ENERGETIC" as const, emoji: "⚡", label: "Energetic", color: "#FF6B35", description: "Fuel your energy!", supportMessage: null, scientificExplanation: "Sustain your energy with balanced meals containing complex carbohydrates and moderate caffeine. B-vitamins help convert food into cellular energy, while iron supports oxygen transport for sustained vitality.", beneficialNutrients: "[\"'B-Vitamins'\",\"'Iron'\",\"'Complex Carbohydrates'\",\"'Moderate Caffeine'\"]", preferredCategories: "[\"cat-hot_drinks-a131a103\",\"cat-cold_drinks-1835add3\",\"cat-smoothie-73b7077d\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-relaxed-1766853808045", mood: "RELAXED" as const, emoji: "😌", label: "Relaxed", color: "#95E1D3", description: "Keep the good vibes", supportMessage: null, scientificExplanation: "Enhance relaxation with foods containing magnesium and L-theanine, which promote GABA production - a neurotransmitter that calms neural activity. Avoid excessive stimulants to maintain your peaceful state.", beneficialNutrients: "[\"'Magnesium'\",\"'L-Theanine'\",\"'Calcium'\",\"'Vitamin B6'\"]", preferredCategories: "[\"cat-smoothie-73b7077d\",\"cat-hot_drinks-a131a103\",\"cat-platter-54ff7feb\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-excited-1766853808048", mood: "EXCITED" as const, emoji: "🎉", label: "Excited", color: "#F38181", description: "Make it extra special!", supportMessage: null, scientificExplanation: "Celebrate with foods that support dopamine levels - the neurotransmitter of reward and pleasure. Balanced nutrition helps maintain your excitement without energy crashes.", beneficialNutrients: "[\"'Tyrosine'\",\"'Vitamin D'\",\"'Omega-3 Fatty Acids'\"]", preferredCategories: "[\"cat-pizza-57991e57\",\"cat-value_meal-a865e467\",\"cat-cold_drinks-1835add3\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-tired-1766853808051", mood: "TIRED" as const, emoji: "😴", label: "Tired", color: "#AA96DA", description: "Recharge yourself", supportMessage: "Take it easy, you deserve a break! ☕", scientificExplanation: "Combat fatigue with foods rich in iron, vitamin B12, and CoQ10 which support cellular energy production. Moderate caffeine from coffee can provide a temporary boost, while magnesium helps reduce muscle tiredness.", beneficialNutrients: "[\"'Iron'\",\"'Vitamin B12'\",\"'Magnesium'\",\"'CoQ10'\",\"'Moderate Caffeine'\"]", preferredCategories: "[\"cat-hot_drinks-a131a103\",\"cat-savers-c1764908\",\"cat-smoothie-73b7077d\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-stressed-1766853808054", mood: "STRESSED" as const, emoji: "😰", label: "Stressed", color: "#FCBAD3", description: "Take a breather", supportMessage: "Deep breaths! We're here to help you feel better. 💙", scientificExplanation: "Reduce stress with omega-3 fatty acids (EPA/DHA) which lower cortisol levels and reduce inflammation. Vitamin C helps regulate stress hormones, while complex carbohydrates stabilize blood sugar and mood. Avoid caffeine which can increase anxiety.", beneficialNutrients: "[\"'Omega-3 (EPA/DHA)'\",\"'Vitamin C'\",\"'Magnesium'\",\"'Complex Carbohydrates'\"]", preferredCategories: "[\"cat-smoothie-73b7077d\",\"cat-hot_drinks-a131a103\",\"cat-appetizer-9df02c98\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-anxious-1766853808057", mood: "ANXIOUS" as const, emoji: "😟", label: "Anxious", color: "#A8D8EA", description: "Find your calm", supportMessage: "You're stronger than you think. One step at a time. 🌟", scientificExplanation: "Calm anxiety with magnesium-rich foods that regulate neurotransmitters and reduce nervous system excitability. Omega-3 fatty acids have been shown to reduce anxiety symptoms in clinical trials. L-theanine from tea promotes relaxation without sedation.", beneficialNutrients: "[\"'Magnesium'\",\"'Omega-3 Fatty Acids'\",\"'L-Theanine'\",\"'Vitamin B Complex'\"]", preferredCategories: "[\"cat-hot_drinks-a131a103\",\"cat-savers-c1764908\",\"cat-appetizer-9df02c98\"]", excludeCategories: "[\"COLD_DRINKS\"]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-sad-1766853808060", mood: "SAD" as const, emoji: "😢", label: "Sad", color: "#A8DADC", description: "Let us brighten your day", supportMessage: "It's okay to feel this way. We're here for you! 🤗", scientificExplanation: "Boost mood with tryptophan-rich foods that help produce serotonin, the \"feel-good\" neurotransmitter. Dark chocolate contains compounds that release endorphins. Vitamin D and omega-3s have shown effectiveness in improving depressive symptoms in research studies.", beneficialNutrients: "[\"'Tryptophan'\",\"'Omega-3 (EPA/DHA)'\",\"'Vitamin D'\",\"'Folate'\",\"'Dark Chocolate Compounds'\"]", preferredCategories: "[\"cat-smoothie-73b7077d\",\"cat-pizza-57991e57\",\"cat-value_meal-a865e467\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-depressed-1766853808062", mood: "DEPRESSED" as const, emoji: "😔", label: "Down", color: "#B8B8D1", description: "We're here for you", supportMessage: "You matter. Take care of yourself, one meal at a time. 💛", scientificExplanation: "Clinical studies show EPA and DHA omega-3 fatty acids can significantly improve depressive symptoms. Folate and vitamin B12 support neurotransmitter synthesis. Regular meals with tryptophan help maintain serotonin levels. Consider seeking professional support alongside nutritional care.", beneficialNutrients: "[\"'Omega-3 (EPA/DHA)'\",\"'Folate'\",\"'Vitamin B12'\",\"'Tryptophan'\",\"'Vitamin D'\"]", preferredCategories: "[\"cat-smoothie-73b7077d\",\"cat-savers-c1764908\",\"cat-appetizer-9df02c98\"]", excludeCategories: "[]", preferredCategoryPoints: 10, isActive: true },
  { id: "mood-angry-1766853808065", mood: "ANGRY" as const, emoji: "😠", label: "Angry", color: "#E63946", description: "Cool down with us", supportMessage: "Take a moment for yourself. You've got this! 💪", scientificExplanation: "Cool down with foods rich in omega-3 fatty acids which reduce inflammatory responses linked to irritability. Magnesium helps regulate stress hormones, while vitamin C from fresh ingredients supports adrenal function. Cold, refreshing foods can have a calming psychological effect.", beneficialNutrients: "[\"'Omega-3 Fatty Acids'\",\"'Magnesium'\",\"'Vitamin C'\",\"'B-Vitamins'\"]", preferredCategories: "[\"cat-cold_drinks-1835add3\",\"cat-smoothie-73b7077d\",\"cat-appetizer-9df02c98\"]", excludeCategories: "[\"cat-hot_drinks-a131a103\"]", preferredCategoryPoints: 10, isActive: true },
];

const MOOD_FEEDBACK_CONFIG = {
  id: "default",
  baselineThreshold: 50,
  feedbackEnabled: false,
  autoEnableFeedback: true,
  orderRateWeight: 0.6,
  feedbackRateWeight: 0.4,
  moodBenefitsWeight: 20,
  preferredCategoryWeight: 10,
  featuredItemWeight: 5,
  priceRangeWeight: 5,
  historicalDataWeight: 15,
  timeOfDayWeight: 5,
  showMoodReflection: true,
  reflectionDelayMinutes: 1,
  afternoonCategories: "\"[]\"",
  afternoonEndHour: 18,
  eveningCategories: "\"[\\\"HOT_DRINKS\\\",\\\"PLATTER\\\"]\"",
  morningCategories: "\"[\\\"HOT_DRINKS\\\"]\"",
  morningEndHour: 12,
  morningStartHour: 6,
  explorationBonusWeight: 8,
  minimumOrdersThreshold: 10,
  excludedCategoryPenalty: 0,
  day0PositionShuffle: true,
  showRankingNumbers: false,
};

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedUsers() {
  console.log('\n🔐 Seeding default users...');
  
  const defaultPassword = await bcrypt.hash('password123', 10);

  const users = [
    { id: `user-admin-${Date.now()}`, email: 'admin@beehive.com', name: 'Admin User', role: 'ADMIN' as const, phone: '+1234567800' },
    { id: `user-manager-${Date.now() + 1}`, email: 'manager@beehive.com', name: 'Manager User', role: 'MANAGER' as const, phone: '+1234567890' },
    { id: `user-cashier-${Date.now() + 2}`, email: 'cashier@beehive.com', name: 'Cashier User', role: 'CASHIER' as const, phone: '+1234567891' },
    { id: `user-cook-${Date.now() + 3}`, email: 'cook@beehive.com', name: 'Cook User', role: 'COOK' as const, phone: '+1234567892' },
    { id: `user-customer-${Date.now() + 4}`, email: 'customer@beehive.com', name: 'Customer User', role: 'CUSTOMER' as const, phone: '+1234567893', cardNumber: `BH${Date.now().toString().slice(-8)}` },
  ];

  for (const user of users) {
    await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: defaultPassword,
        isActive: true,
        updatedAt: new Date()
      }
    });
    console.log(`   ✅ Created/updated ${user.role.toLowerCase()}: ${user.email}`);
  }
}

async function seedCategories() {
  console.log('\n📂 Seeding categories...');
  
  for (const category of CATEGORIES) {
    await prisma.categories.upsert({
      where: { id: category.id },
      update: { ...category, updatedAt: new Date() },
      create: { ...category, createdAt: new Date(), updatedAt: new Date() }
    });
  }
  console.log(`   ✅ Created/updated ${CATEGORIES.length} categories`);
}

async function seedMenuItems() {
  console.log('\n🍔 Seeding menu items...');
  
  for (const item of MENU_ITEMS) {
    await prisma.menu_items.upsert({
      where: { id: item.id },
      update: { ...item, updatedAt: new Date() },
      create: { ...item, createdAt: new Date(), updatedAt: new Date() }
    });
  }
  console.log(`   ✅ Created/updated ${MENU_ITEMS.length} menu items`);
}

async function seedMoodSettings() {
  console.log('\n😊 Seeding mood settings...');
  
  for (const setting of MOOD_SETTINGS) {
    await prisma.mood_settings.upsert({
      where: { id: setting.id },
      update: { ...setting, updatedAt: new Date() },
      create: { ...setting, createdAt: new Date(), updatedAt: new Date() }
    });
  }
  console.log(`   ✅ Created/updated ${MOOD_SETTINGS.length} mood settings`);
}

async function seedMoodFeedbackConfig() {
  console.log('\n⚙️ Seeding mood feedback config...');
  
  await prisma.mood_feedback_config.upsert({
    where: { id: MOOD_FEEDBACK_CONFIG.id },
    update: { ...MOOD_FEEDBACK_CONFIG, updatedAt: new Date() },
    create: { ...MOOD_FEEDBACK_CONFIG, createdAt: new Date(), updatedAt: new Date() }
  });
  console.log('   ✅ Created/updated mood feedback config');
}

async function seedMoodOrderStats() {
  console.log('\n📊 Seeding mood order stats...');
  
  const moods = ['HAPPY', 'ENERGETIC', 'RELAXED', 'EXCITED', 'TIRED', 'STRESSED', 'ANXIOUS', 'SAD', 'DEPRESSED', 'ANGRY'] as const;
  
  for (const mood of moods) {
    await prisma.mood_order_stats.upsert({
      where: { mood },
      update: {},
      create: {
        id: `mood-stats-${mood.toLowerCase()}-${Date.now()}`,
        mood,
        totalShown: 0,
        totalOrdered: 0,
        feedbackCount: 0,
        moodImproved: 0,
        moodSame: 0,
        moodWorse: 0,
        baselineReached: false,
        updatedAt: new Date()
      }
    });
  }
  console.log(`   ✅ Created/updated ${moods.length} mood order stats`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('🐝 Starting Beehive Database Seed...\n');
  console.log('=' .repeat(50));

  try {
    await seedUsers();
    await seedCategories();
    await seedMenuItems();
    await seedMoodSettings();
    await seedMoodFeedbackConfig();
    await seedMoodOrderStats();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('   Admin: admin@beehive.com / password123');
    console.log('   Manager: manager@beehive.com / password123');
    console.log('   Cashier: cashier@beehive.com / password123');
    console.log('   Cook: cook@beehive.com / password123');
    console.log('   Customer: customer@beehive.com / password123');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
