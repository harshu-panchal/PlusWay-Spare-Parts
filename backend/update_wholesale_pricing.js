import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

function extractFieldFromSpecs(specs, matcher) {
  if (!Array.isArray(specs)) return null;
  for (const spec of specs) {
    const key = (spec.key || '').toString().toLowerCase();
    const value = (spec.value || '').toString();
    if (!key || !value) continue;
    if (matcher(key)) return value;
  }
  return null;
}

async function updateProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    const cursor = Product.find({}).cursor();
    let updated = 0;

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      let changed = false;

      // 1. Wholesale price and minimum quantity
      if (doc.price && doc.price > 0 && (!doc.wholesalePrice || doc.wholesalePrice === 0)) {
        doc.wholesaleMinQty = doc.wholesaleMinQty || 10;
        doc.wholesalePrice = doc.price * 0.8;
        changed = true;
      }

      const details = doc.details || {};
      const specs = Array.isArray(details.specs) ? details.specs : [];

      // 2. In-the-box summary from specs
      if (!details.inTheBox || details.inTheBox.trim() === '') {
        const inTheBox = extractFieldFromSpecs(specs, (key) =>
          key.includes('sales package') || key.includes('in the box')
        );
        if (inTheBox) {
          details.inTheBox = inTheBox;
          changed = true;
        }
      }

      // 3. Warranty info from specs
      if (!details.warranty || !details.warranty.summary) {
        const warrantySummary = extractFieldFromSpecs(specs, (key) =>
          key.includes('warranty summary') || key === 'warranty'
        );
        const warrantyTnc = extractFieldFromSpecs(specs, (key) =>
          key.includes('warranty t&c') || key.includes('warranty terms')
        );

        if (warrantySummary || warrantyTnc) {
          details.warranty = details.warranty || {};
          details.warranty.summary = warrantySummary || warrantyTnc;

          if (!details.warranty.policy && warrantySummary) {
            const lower = warrantySummary.toLowerCase();
            if (lower.includes('replacement')) {
              details.warranty.policy = 'Replacement';
            } else if (lower.includes('refund')) {
              details.warranty.policy = 'Refund';
            }
          }

          if (!details.warranty.period && warrantySummary) {
            const match = warrantySummary.match(/(\d+)[^\d]*day/i);
            if (match) {
              details.warranty.period = `${match[1]} Days`;
            }
          }

          changed = true;
        }
      }

      if (changed) {
        doc.details = details;
        await doc.save();
        updated += 1;
        if (updated % 50 === 0) {
          console.log(`Updated ${updated} products so far...`);
        }
      }
    }

    console.log(`Product details / wholesale updated for ${updated} products.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to update products:', err);
    process.exit(1);
  }
}

updateProducts();

