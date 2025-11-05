import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/lib/db';
import { serviceCategories } from '@/drizzle/schema';

const categories = [
  { name: 'Albañilería', slug: 'albanileria', icon: '🧱' },
  { name: 'Plomería', slug: 'plomeria', icon: '🚰' },
  { name: 'Electricidad', slug: 'electricidad', icon: '⚡' },
  { name: 'Pintura', slug: 'pintura', icon: '🎨' },
  { name: 'Carpintería', slug: 'carpinteria', icon: '🪚' },
  { name: 'Limpieza', slug: 'limpieza', icon: '🧹' },
  { name: 'Jardinería', slug: 'jardineria', icon: '🌱' },
  { name: 'Cerrajería', slug: 'cerrajeria', icon: '🔐' },
  { name: 'Refrigeración', slug: 'refrigeracion', icon: '❄️' },
  { name: 'Techado', slug: 'techado', icon: '🏠' },
];

async function seed() {
  console.log('🌱 Sembrando categorías...');
  
  for (const category of categories) {
    await db.insert(serviceCategories).values(category).onConflictDoNothing();
    console.log(`✓ ${category.name}`);
  }
  
  console.log('✅ Categorías sembradas exitosamente');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Error sembrando categorías:', error);
  process.exit(1);
});