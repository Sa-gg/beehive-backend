import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL! 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mood benefits mapping based on nutritional data
const MOOD_BENEFITS = {
  // Beef items
  beef: JSON.stringify({
    angry: 'Rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability',
    tired: 'High in iron and vitamin B12, combats fatigue by supporting red blood cell production',
    depressed: 'Contains vitamin B12 and folate essential for neurotransmitter synthesis',
    stressed: 'Rich in B-vitamins that support adrenal function and help cope with stress'
  }),
  // Chicken items
  chicken: JSON.stringify({
    sad: 'Rich in tryptophan, which produces serotonin - the happiness hormone',
    depressed: 'High levels of tryptophan convert to serotonin in the brain',
    anxious: 'Tryptophan helps produce serotonin, which has calming effects',
    tired: 'Lean protein provides sustained energy without digestive heaviness'
  }),
  // Fish items
  fish: JSON.stringify({
    depressed: 'Contains omega-3 fatty acids (EPA and DHA) which reduce depressive symptoms',
    sad: 'Omega-3 fatty acids help produce serotonin and reduce brain inflammation',
    stressed: 'EPA and DHA lower cortisol levels and reduce inflammatory stress responses',
    anxious: 'Omega-3 fatty acids reduce nervous system inflammation'
  }),
  // Coffee drinks
  coffee: JSON.stringify({
    tired: 'Caffeine blocks adenosine receptors, reducing fatigue and increasing alertness',
    energetic: 'Moderate caffeine enhances dopamine signaling, improving focus',
    happy: 'Caffeine stimulates dopamine release, enhancing feelings of pleasure'
  }),
  // Chocolate drinks
  chocolate: JSON.stringify({
    sad: 'Triggers endorphin release - your natural feel-good chemicals',
    depressed: 'Contains phenylethylamine which promotes feelings of happiness',
    stressed: 'Magnesium helps relax muscles and calm the nervous system',
    happy: 'Triggers endorphin and serotonin release'
  }),
  // Smoothies
  smoothie: JSON.stringify({
    stressed: 'High vitamin C regulates cortisol (stress hormone) levels',
    sad: 'Berries contain anthocyanins that have mood-boosting effects',
    tired: 'Natural fruit sugars provide immediate energy',
    anxious: 'Vitamin C supports adrenal gland function, helping manage anxiety'
  }),
  // Matcha drinks
  matcha: JSON.stringify({
    anxious: 'L-theanine promotes relaxed alertness without jitters',
    stressed: 'L-theanine increases GABA, serotonin, and dopamine levels naturally',
    relaxed: 'Induces relaxation without drowsiness',
    tired: 'Gentle caffeine with L-theanine prevents energy crashes'
  })
};

const MENU_ITEMS = [
  // Pizza
  { name: 'Bacon Pepperoni', category: 'PIZZA', price: 299, image: '/src/assets/pizza/Bacon Pepperoni.jpg', nutrients: 'Protein, B-Vitamins, Iron', moodBenefits: MOOD_BENEFITS.beef, featured: true },
  { name: 'Beef Wagon', category: 'PIZZA', price: 329, image: '/src/assets/pizza/beef wagon.jpg', nutrients: 'Protein, B-Vitamins, Iron, Zinc', moodBenefits: MOOD_BENEFITS.beef, featured: true },
  { name: 'Creamy Spinach', category: 'PIZZA', price: 279, image: '/src/assets/pizza/Creamy Spinach.jpg', nutrients: 'Iron, Folate, Vitamin K', moodBenefits: JSON.stringify({ stressed: 'Spinach contains magnesium which calms the nervous system', anxious: 'Folate supports neurotransmitter production' }) },
  { name: 'Ham & Cheese Hawaiian', category: 'PIZZA', price: 289, image: '/src/assets/pizza/Ham & Cheese Hawaiian.jpg', nutrients: 'Protein, Calcium', moodBenefits: JSON.stringify({ happy: 'Cheese contains tyrosine which helps produce dopamine' }) },
  
  // Appetizers
  { name: 'Beef Burger', category: 'APPETIZER', price: 149, image: '/src/assets/appetizer/Beef Burger.jpg', nutrients: 'Protein, Iron, B-Vitamins', moodBenefits: MOOD_BENEFITS.beef, featured: true },
  { name: 'Chicken Burger', category: 'APPETIZER', price: 139, image: '/src/assets/appetizer/Chicken Burger.jpg', nutrients: 'Protein, Tryptophan, B-Vitamins', moodBenefits: MOOD_BENEFITS.chicken },
  { name: 'Burger w/ Fries', category: 'APPETIZER', price: 179, image: '/src/assets/appetizer/Burger w Fries.jpg', nutrients: 'Protein, Carbohydrates', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Cheesy Fries', category: 'APPETIZER', price: 99, image: '/src/assets/appetizer/Cheesy Fries.jpg', nutrients: 'Calcium, Carbohydrates', moodBenefits: JSON.stringify({ happy: 'Comfort food that triggers dopamine release' }) },
  { name: 'Chili Fries', category: 'APPETIZER', price: 109, image: '/src/assets/appetizer/chili fries.jpg', nutrients: 'Carbohydrates, Capsaicin', moodBenefits: JSON.stringify({ energetic: 'Capsaicin boosts metabolism and energy' }) },
  { name: 'Meaty Chili Fries', category: 'APPETIZER', price: 129, image: '/src/assets/appetizer/Meaty Chili Fries.jpg', nutrients: 'Protein, Carbohydrates', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Meaty Fries', category: 'APPETIZER', price: 119, image: '/src/assets/appetizer/meaty fries.jpg', nutrients: 'Protein, Carbohydrates', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Nacho Fries', category: 'APPETIZER', price: 139, image: '/src/assets/appetizer/Nacho Fries.png', nutrients: 'Calcium, Protein', moodBenefits: JSON.stringify({ happy: 'Cheese triggers pleasure centers in the brain' }) },
  { name: 'Nachos', category: 'APPETIZER', price: 159, image: '/src/assets/appetizer/Nachos.jpg', nutrients: 'Calcium, Protein, Fiber', moodBenefits: JSON.stringify({ happy: 'Cheese and protein boost mood neurotransmitters' }), featured: true },
  { name: 'Lumpia Shanghai', category: 'APPETIZER', price: 89, image: '/src/assets/appetizer/Lumpia Shanghai.jpg', nutrients: 'Protein, Carbohydrates', moodBenefits: MOOD_BENEFITS.beef, featured: true },
  { name: 'Pancit Canton Chili Mansi', category: 'APPETIZER', price: 39, image: '/src/assets/appetizer/Pancit Canton Chili Mansi.jpg', nutrients: 'Carbohydrates, Protein', moodBenefits: JSON.stringify({ energetic: 'Quick energy from carbohydrates' }) },
  { name: 'Pancit Canton Extra Hot', category: 'APPETIZER', price: 39, image: '/src/assets/appetizer/Pancit Canton Extra Hot.jpg', nutrients: 'Carbohydrates, Protein', moodBenefits: JSON.stringify({ energetic: 'Spicy foods boost endorphins' }) },
  
  // Hot Drinks
  { name: 'Hot Coffee', category: 'HOT_DRINKS', price: 79, image: '/src/assets/hot drinks/hot coffee.png', nutrients: 'Caffeine, Antioxidants', moodBenefits: MOOD_BENEFITS.coffee },
  { name: 'Hot Coffee with Milk', category: 'HOT_DRINKS', price: 89, image: '/src/assets/hot drinks/hot coffee with millk.png', nutrients: 'Caffeine, Calcium, Protein', moodBenefits: MOOD_BENEFITS.coffee },
  { name: 'Hot Chocolate', category: 'HOT_DRINKS', price: 99, image: '/src/assets/hot drinks/hot chocolate.png', nutrients: 'Magnesium, Flavonoids, Tryptophan', moodBenefits: MOOD_BENEFITS.chocolate },
  { name: 'Hot Matcha', category: 'HOT_DRINKS', price: 109, image: '/src/assets/hot drinks/hot matcha.png', nutrients: 'L-Theanine, Caffeine, Antioxidants', moodBenefits: MOOD_BENEFITS.matcha },
  
  // Cold Drinks
  { name: 'Caramel Macchiato', category: 'COLD_DRINKS', price: 119, image: '/src/assets/cold drinks/caramel machiato.png', nutrients: 'Caffeine, Calcium', moodBenefits: MOOD_BENEFITS.coffee },
  { name: 'Caramel Matcha', category: 'COLD_DRINKS', price: 129, image: '/src/assets/cold drinks/caramel matahca.png', nutrients: 'L-Theanine, Caffeine', moodBenefits: MOOD_BENEFITS.matcha },
  { name: 'Dirty Matcha Latte', category: 'COLD_DRINKS', price: 139, image: '/src/assets/cold drinks/dirty matcha latte.png', nutrients: 'L-Theanine, Caffeine, Calcium', moodBenefits: MOOD_BENEFITS.matcha },
  { name: 'Iced Americano', category: 'COLD_DRINKS', price: 99, image: '/src/assets/cold drinks/iced americano.png', nutrients: 'Caffeine, Antioxidants', moodBenefits: MOOD_BENEFITS.coffee },
  { name: 'Iced Caramel Milk', category: 'COLD_DRINKS', price: 109, image: '/src/assets/cold drinks/iced caramel milk.png', nutrients: 'Calcium, Protein', moodBenefits: JSON.stringify({ happy: 'Dairy products support dopamine production' }) },
  { name: 'Iced Chocolate', category: 'COLD_DRINKS', price: 109, image: '/src/assets/cold drinks/iced chocolate.png', nutrients: 'Magnesium, Flavonoids', moodBenefits: MOOD_BENEFITS.chocolate },
  { name: 'Iced Coffee', category: 'COLD_DRINKS', price: 89, image: '/src/assets/cold drinks/iced coffee.png', nutrients: 'Caffeine, Antioxidants', moodBenefits: MOOD_BENEFITS.coffee },
  { name: 'Iced Matcha', category: 'COLD_DRINKS', price: 119, image: '/src/assets/cold drinks/iceed matcha.png', nutrients: 'L-Theanine, Caffeine', moodBenefits: MOOD_BENEFITS.matcha },
  { name: 'Salted Caramel', category: 'COLD_DRINKS', price: 129, image: '/src/assets/cold drinks/salted caramel.png', nutrients: 'Calcium, Protein', moodBenefits: JSON.stringify({ happy: 'Sweet and salty combo triggers pleasure response' }) },
  { name: 'Spanish Latte', category: 'COLD_DRINKS', price: 119, image: '/src/assets/cold drinks/spanish latte.png', nutrients: 'Caffeine, Calcium', moodBenefits: MOOD_BENEFITS.coffee },
  
  // Smoothies
  { name: 'Blueberry Smoothie', category: 'SMOOTHIE', price: 149, image: '/src/assets/smoothie/blueberry.png', nutrients: 'Vitamin C, Antioxidants, Fiber', moodBenefits: MOOD_BENEFITS.smoothie },
  { name: 'Strawberry Smoothie', category: 'SMOOTHIE', price: 149, image: '/src/assets/smoothie/strawberry.png', nutrients: 'Vitamin C, Antioxidants, Fiber', moodBenefits: MOOD_BENEFITS.smoothie },
  
  // Platter
  { name: 'Beef Tapa', category: 'PLATTER', price: 189, image: '/src/assets/platter/beeftapa.jpg', nutrients: 'Protein, Iron, B-Vitamins', moodBenefits: MOOD_BENEFITS.beef, featured: true },
  { name: 'Boneless Bangus', category: 'PLATTER', price: 179, image: '/src/assets/platter/bonelessbangus.webp', nutrients: 'Omega-3, Vitamin D, Protein', moodBenefits: MOOD_BENEFITS.fish },
  { name: 'Chicharon Bulaklak', category: 'PLATTER', price: 199, image: '/src/assets/platter/chicharonbulaklak.jpg', nutrients: 'Protein, Collagen', moodBenefits: JSON.stringify({ happy: 'Crispy texture triggers satisfaction' }) },
  { name: 'Hungarian', category: 'PLATTER', price: 159, image: '/src/assets/platter/hungarian.jpg', nutrients: 'Protein, B-Vitamins', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Hungarian w/ Fries', category: 'PLATTER', price: 189, image: '/src/assets/platter/hungarianwfries.jpg', nutrients: 'Protein, Carbohydrates', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Pork Sisig', category: 'PLATTER', price: 169, image: '/src/assets/platter/porksisig.png', nutrients: 'Protein, Iron, B-Vitamins', moodBenefits: JSON.stringify({ happy: 'Savory flavors trigger dopamine release', energetic: 'High protein supports sustained energy' }) },
  
  // Savers
  { name: 'Beef Tapa', category: 'SAVERS', price: 129, image: '/src/assets/savers/beef tapa.jpg', nutrients: 'Protein, Iron, B-Vitamins', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Burger Steak', category: 'SAVERS', price: 119, image: '/src/assets/savers/burger steak.png', nutrients: 'Protein, Iron', moodBenefits: MOOD_BENEFITS.beef, featured: true },
  { name: 'Cheesy Hungarian', category: 'SAVERS', price: 109, image: '/src/assets/savers/cheesy hungarian.png', nutrients: 'Protein, Calcium', moodBenefits: JSON.stringify({ happy: 'Cheese triggers dopamine production' }) },
  { name: 'Chicken Fillet', category: 'SAVERS', price: 119, image: '/src/assets/savers/chicken fillet.png', nutrients: 'Protein, Tryptophan', moodBenefits: MOOD_BENEFITS.chicken },
  { name: 'Fish Fillet', category: 'SAVERS', price: 119, image: '/src/assets/savers/fishfillet.png', nutrients: 'Omega-3, Protein', moodBenefits: MOOD_BENEFITS.fish },
  { name: 'Fried Liempo', category: 'SAVERS', price: 129, image: '/src/assets/savers/fried liempo.png', nutrients: 'Protein, Fat', moodBenefits: JSON.stringify({ happy: 'Satisfying texture and flavor', energetic: 'High-energy meal' }) },
  { name: 'Garlic Pepper Beef', category: 'SAVERS', price: 139, image: '/src/assets/savers/garlic pepper beef.png', nutrients: 'Protein, Iron, B-Vitamins', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Grilled Liempo', category: 'SAVERS', price: 129, image: '/src/assets/savers/grilled liempo.jpg', nutrients: 'Protein, Fat', moodBenefits: JSON.stringify({ happy: 'Grilled flavors boost satisfaction' }) },
  { name: 'Pork Sisig', category: 'SAVERS', price: 119, image: '/src/assets/savers/pork sisig.jpg', nutrients: 'Protein, Iron', moodBenefits: JSON.stringify({ happy: 'Savory comfort food', energetic: 'High protein content' }) },
  
  // Value Meal
  { name: 'Boneless Bangus', category: 'VALUE_MEAL', price: 159, image: '/src/assets/value meal/Boneless Bangus.jpg', nutrients: 'Omega-3, Vitamin D, Protein', moodBenefits: MOOD_BENEFITS.fish },
  { name: 'Chicharon Bulaklak', category: 'VALUE_MEAL', price: 179, image: '/src/assets/value meal/chicharon bulaklak.png', nutrients: 'Protein, Collagen', moodBenefits: JSON.stringify({ happy: 'Crispy texture satisfaction' }) },
  { name: 'Hungarian', category: 'VALUE_MEAL', price: 149, image: '/src/assets/value meal/hungarian.png', nutrients: 'Protein, B-Vitamins', moodBenefits: MOOD_BENEFITS.beef },
  { name: 'Pork BBQ Grilled', category: 'VALUE_MEAL', price: 169, image: '/src/assets/value meal/Pork BBQ Grilled.jpg', nutrients: 'Protein, Iron', moodBenefits: JSON.stringify({ happy: 'Grilled BBQ satisfies comfort cravings' }) },
  { name: 'Spare Ribs', category: 'VALUE_MEAL', price: 189, image: '/src/assets/value meal/spareribs.jpg', nutrients: 'Protein, Collagen', moodBenefits: JSON.stringify({ happy: 'Tender, flavorful comfort food' }) },
];

async function main() {
  console.log('Start seeding menu items...');

  for (const item of MENU_ITEMS) {
    await prisma.menu_items.upsert({
      where: { 
        id: `menu-${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`
      },
      update: {},
      create: {
        id: `menu-${item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`,
        name: item.name,
        category: item.category as any,
        price: item.price,
        cost: item.price * 0.6, // Assume 40% margin
        image: item.image,
        nutrients: item.nutrients,
        moodBenefits: item.moodBenefits,
        available: true,
        featured: item.featured || false,
        prepTime: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`✅ Seeded: ${item.name}`);
  }

  console.log('\n✅ All menu items seeded successfully!');
  console.log(`Total items: ${MENU_ITEMS.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding menu items:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
