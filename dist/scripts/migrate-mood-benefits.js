import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const { Pool } = pg;
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
}
// Nutritional benefits data from frontend
const NUTRITIONAL_BENEFITS = {
    'beef': {
        nutrients: ['Iron', 'B-Vitamins (B12)', 'Zinc', 'Protein', 'Tyrosine'],
        moodBenefits: {
            angry: 'Beef is rich in iron and B-vitamins which support oxygen transport to the brain, helping reduce irritability. Tyrosine aids dopamine production, promoting emotional regulation and calmness.',
            tired: 'High in iron and vitamin B12, beef combats fatigue by supporting red blood cell production and cellular energy. Protein provides sustained energy without crashes.',
            depressed: 'Contains vitamin B12 and folate which are essential for neurotransmitter synthesis. Tyrosine helps produce dopamine, the mood-regulating neurotransmitter.',
            stressed: 'Rich in B-vitamins that support adrenal function and help your body cope with stress. Zinc helps regulate cortisol levels.',
            energetic: 'Protein and iron provide sustained energy and support muscle function. B-vitamins convert food into cellular energy efficiently.'
        }
    },
    'chicken': {
        nutrients: ['Tryptophan', 'B-Vitamins', 'Protein', 'Selenium'],
        moodBenefits: {
            sad: 'Chicken is rich in tryptophan, the amino acid your body uses to produce serotonin - the "happiness hormone." This can naturally boost your mood.',
            depressed: 'Contains high levels of tryptophan which converts to serotonin in the brain. B-vitamins support neurotransmitter production for better mood regulation.',
            anxious: 'Tryptophan helps produce serotonin, which has calming effects. Selenium supports thyroid function, helping regulate anxiety levels.',
            tired: 'Lean protein provides sustained energy without digestive heaviness. B-vitamins support cellular energy production.'
        }
    },
    'fish': {
        nutrients: ['Omega-3 (EPA/DHA)', 'Vitamin D', 'Protein', 'B-Vitamins'],
        moodBenefits: {
            depressed: 'Fish contains omega-3 fatty acids (EPA and DHA) which clinical studies show can significantly reduce depressive symptoms. Vitamin D supports mood regulation.',
            sad: 'Omega-3 fatty acids help produce serotonin and reduce brain inflammation. Studies show 1-2g of EPA daily can improve mood as effectively as some medications.',
            stressed: 'EPA and DHA from fish lower cortisol levels and reduce inflammatory stress responses. Omega-3s have proven anti-anxiety effects.',
            anxious: 'Omega-3 fatty acids reduce nervous system inflammation and have been shown in trials to decrease anxiety symptoms by up to 20%.',
            angry: 'Omega-3 fatty acids reduce inflammatory responses in the brain linked to irritability and aggression. Helps promote emotional balance.'
        }
    },
    'coffee': {
        nutrients: ['Caffeine', 'Antioxidants', 'Magnesium'],
        moodBenefits: {
            tired: 'Caffeine blocks adenosine receptors in the brain, reducing fatigue and increasing alertness. Provides quick energy boost within 15-30 minutes.',
            energetic: 'Moderate caffeine enhances dopamine signaling, improving focus and sustained energy. Antioxidants support cellular health.',
            happy: 'Caffeine stimulates dopamine release, enhancing feelings of pleasure and well-being. The ritual itself can be mood-boosting.',
            depressed: 'Moderate caffeine consumption has been linked to reduced depression risk. Stimulates neurotransmitters that improve mood.'
        }
    },
    'chocolate': {
        nutrients: ['Flavonoids', 'Magnesium', 'Tryptophan', 'Theobromine'],
        moodBenefits: {
            sad: 'Dark chocolate compounds trigger endorphin release in the brain - your natural "feel-good" chemicals. Tryptophan helps produce serotonin.',
            depressed: 'Contains phenylethylamine which promotes feelings of happiness. Magnesium helps regulate neurotransmitters involved in mood.',
            stressed: 'Magnesium in chocolate helps relax muscles and calm the nervous system. Flavonoids reduce stress hormones.',
            happy: 'Chocolate triggers endorphin and serotonin release. The pleasure response is both psychological and neurochemical.',
            anxious: 'Magnesium has calming effects on the nervous system. Theobromine provides gentle mood elevation without jitters.'
        }
    },
    'smoothie': {
        nutrients: ['Vitamin C', 'Antioxidants', 'Fiber', 'Natural Sugars'],
        moodBenefits: {
            stressed: 'High vitamin C content helps regulate cortisol (stress hormone) levels. Antioxidants combat stress-related cellular damage.',
            sad: 'Berries contain anthocyanins that cross the blood-brain barrier and have mood-boosting effects. Natural sugars provide quick energy lift.',
            tired: 'Natural fruit sugars provide immediate energy. Vitamin C supports cellular energy production and fights fatigue.',
            anxious: 'Vitamin C supports adrenal gland function, helping manage anxiety. Antioxidants reduce oxidative stress in the brain.',
            happy: 'Vitamin-rich smoothies support overall brain health. The cold, refreshing nature has psychological mood-boosting effects.'
        }
    },
    'matcha': {
        nutrients: ['L-Theanine', 'Caffeine', 'Antioxidants', 'EGCG'],
        moodBenefits: {
            anxious: 'L-theanine promotes alpha brain waves associated with relaxed alertness. Provides calm focus without jitters, unlike coffee alone.',
            stressed: 'L-theanine increases GABA, serotonin, and dopamine levels naturally. Creates calm, focused state perfect for stress relief.',
            relaxed: 'The amino acid L-theanine induces relaxation without drowsiness. Works synergistically with caffeine for balanced calm energy.',
            tired: 'Gentle caffeine provides energy while L-theanine prevents the crash. Antioxidants support cellular energy production.',
            energetic: 'Balanced caffeine and L-theanine provide sustained, focused energy. EGCG supports metabolic function.'
        }
    },
    'cheese': {
        nutrients: ['Calcium', 'Protein', 'Tyrosine', 'Tryptophan'],
        moodBenefits: {
            happy: 'Cheese contains tyrosine which helps produce dopamine, the neurotransmitter associated with pleasure and reward.',
            sad: 'Protein and tryptophan in cheese support serotonin production. The comfort food effect has real neurochemical basis.',
            stressed: 'Calcium has natural calming effects on the nervous system. Protein provides steady energy to cope with stress.',
            anxious: 'Calcium helps regulate neurotransmitter function. Protein stabilizes blood sugar, reducing anxiety spikes.'
        }
    },
    'fries': {
        nutrients: ['Complex Carbohydrates', 'Potassium', 'Vitamin B6'],
        moodBenefits: {
            stressed: 'Complex carbs increase serotonin production, which has calming effects. Potassium helps regulate blood pressure during stress.',
            sad: 'Carbohydrates trigger serotonin release in the brain. The comfort food effect is both psychological and biochemical.',
            angry: 'Carbohydrates help stabilize blood sugar, which can reduce irritability. Promotes calming neurotransmitter production.',
            happy: 'Complex carbs provide steady energy and support serotonin production, maintaining your positive mood.'
        }
    },
    'lumpia': {
        nutrients: ['Protein', 'B-Vitamins', 'Iron', 'Vegetables'],
        moodBenefits: {
            energetic: 'Balanced protein and carbs provide sustained energy. B-vitamins support energy metabolism.',
            happy: 'Satisfying comfort food with nostalgic associations. Balanced nutrition supports stable mood.',
            tired: 'Protein and iron combat fatigue. Carbohydrates provide quick energy boost.'
        }
    },
    'pancit': {
        nutrients: ['Complex Carbs', 'B-Vitamins', 'Iron', 'Protein'],
        moodBenefits: {
            stressed: 'Complex carbohydrates promote serotonin production. Comfort food with mood-stabilizing properties.',
            energetic: 'Carbs provide energy for activity. B-vitamins support cellular energy production.',
            happy: 'Traditional comfort food with positive associations. Balanced nutrition supports stable mood.',
            sad: 'Carbohydrates boost serotonin levels naturally. The warmth and comfort have therapeutic effects.'
        }
    },
    'sisig': {
        nutrients: ['Protein', 'Iron', 'B-Vitamins', 'Zinc'],
        moodBenefits: {
            tired: 'High protein and iron content combat fatigue effectively. B-vitamins support energy production.',
            energetic: 'Protein provides sustained energy. Iron supports oxygen transport for peak performance.',
            angry: 'Protein stabilizes blood sugar, reducing irritability. Iron and B-vitamins support brain function and emotional regulation.'
        }
    },
    'caramel': {
        nutrients: ['Natural Sugars', 'Calcium (from milk)', 'Protein'],
        moodBenefits: {
            happy: 'Sweet flavors trigger dopamine release in the brain\'s reward centers. Creates feelings of pleasure and satisfaction.',
            sad: 'Sugar provides quick mood lift by increasing serotonin temporarily. The indulgent taste has psychological comfort.',
            tired: 'Natural sugars provide immediate energy boost. Milk protein adds sustaining power.',
            excited: 'Sweet treats enhance dopamine release, amplifying feelings of excitement and joy.'
        }
    },
    'milk': {
        nutrients: ['Calcium', 'Vitamin D', 'Tryptophan', 'Protein'],
        moodBenefits: {
            anxious: 'Calcium has natural calming properties. Tryptophan promotes serotonin production for reduced anxiety.',
            stressed: 'Warm milk has been used for centuries to promote relaxation. Calcium helps regulate stress responses.',
            relaxed: 'Tryptophan and calcium work together to promote calm. Protein provides steady, non-jittery energy.',
            sad: 'Vitamin D in fortified milk supports mood regulation. Tryptophan helps produce mood-boosting serotonin.'
        }
    },
    'bbq': {
        nutrients: ['Protein', 'B-Vitamins', 'Iron', 'Zinc'],
        moodBenefits: {
            happy: 'Grilled meat provides satisfying protein. B-vitamins support neurotransmitter production for maintaining positive mood.',
            energetic: 'High-quality protein and iron support sustained energy and muscle function.',
            excited: 'Protein and B-vitamins support dopamine production, enhancing feelings of excitement.',
            tired: 'Iron combats fatigue. Protein provides long-lasting energy without crashes.'
        }
    },
    'rice': {
        nutrients: ['Complex Carbohydrates', 'B-Vitamins', 'Magnesium'],
        moodBenefits: {
            stressed: 'Complex carbs increase serotonin, the calming neurotransmitter. Provides comfort and stability.',
            sad: 'Carbohydrates boost serotonin production naturally. Comfort food effect backed by science.',
            anxious: 'Complex carbs promote steady blood sugar, reducing anxiety. Magnesium has calming effects.',
            happy: 'Sustained energy from complex carbs helps maintain stable, positive mood throughout the day.'
        }
    },
    'nachos': {
        nutrients: ['Calcium', 'Protein', 'Complex Carbs'],
        moodBenefits: {
            happy: 'Cheese and carbs boost mood neurotransmitters. Satisfying comfort food with positive associations.',
            excited: 'Cheese contains tyrosine for dopamine production. The crunch and flavors amplify excitement.',
            stressed: 'Carbohydrates promote serotonin production for calm. Calcium has natural relaxing effects.'
        }
    },
    'pork': {
        nutrients: ['Protein', 'B-Vitamins', 'Selenium', 'Zinc'],
        moodBenefits: {
            tired: 'High-quality protein and B-vitamins combat fatigue. Selenium supports thyroid function for energy.',
            energetic: 'Protein provides sustained energy. B-vitamins convert food to cellular energy efficiently.',
            happy: 'Protein supports stable mood. B-vitamins aid neurotransmitter production.',
            stressed: 'B-vitamins support stress response. Protein stabilizes blood sugar and mood.'
        }
    },
    'hungarian': {
        nutrients: ['Protein', 'Paprika Antioxidants', 'B-Vitamins'],
        moodBenefits: {
            tired: 'Rich protein combats fatigue. Paprika contains antioxidants that support energy metabolism.',
            energetic: 'High protein provides sustained energy for activity.',
            happy: 'Savory, satisfying flavors with mood-supporting protein and B-vitamins.'
        }
    }
};
async function migrateData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });
    try {
        console.log('🔄 Starting mood benefits migration...\n');
        // Get all menu items
        const menuItems = await prisma.menu_items.findMany();
        console.log(`Found ${menuItems.length} menu items\n`);
        let updated = 0;
        let skipped = 0;
        for (const item of menuItems) {
            const lowerName = item.name.toLowerCase();
            let foundMatch = false;
            let moodBenefits = {};
            let nutrients = [];
            // Match against ingredient keywords
            for (const [ingredient, data] of Object.entries(NUTRITIONAL_BENEFITS)) {
                if (lowerName.includes(ingredient)) {
                    foundMatch = true;
                    // Merge mood benefits
                    moodBenefits = { ...moodBenefits, ...data.moodBenefits };
                    // Merge nutrients
                    nutrients = [...new Set([...nutrients, ...data.nutrients])];
                    console.log(`  ✓ Matched "${item.name}" with "${ingredient}"`);
                }
            }
            if (foundMatch) {
                const moodBenefitsJson = JSON.stringify(moodBenefits);
                const nutrientsJson = JSON.stringify(nutrients.join(', '));
                await prisma.menu_items.update({
                    where: { id: item.id },
                    data: {
                        moodBenefits: moodBenefitsJson,
                        nutrients: nutrientsJson,
                        updatedAt: new Date()
                    }
                });
                updated++;
                console.log(`    → Updated moodBenefits for "${item.name}"`);
                console.log(`    → Moods: ${Object.keys(moodBenefits).join(', ')}`);
                console.log(`    → Nutrients: ${nutrients.join(', ')}\n`);
            }
            else {
                skipped++;
                console.log(`  ⊘ No match found for "${item.name}"\n`);
            }
        }
        console.log('\n✅ Migration completed!');
        console.log(`   Updated: ${updated} items`);
        console.log(`   Skipped: ${skipped} items`);
        console.log('\n💡 Items can now be managed via admin panel!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
        await pool.end();
    }
}
migrateData();
