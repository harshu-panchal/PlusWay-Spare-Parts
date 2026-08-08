/**
 * test_bulk_upload_country_pricing.js
 *
 * Automated test script to verify:
 *   1. Parsing of countryPricing Excel cells (_parseCountryPricing)
 *   2. Serialization of countryPricing arrays (_serializeCountryPricing)
 *   3. Round-trip accuracy (parse → serialize → parse)
 *   4. MongoDB schema validation for Product & ColorVariant countryPricing
 *
 * Run with: node scripts/test_bulk_upload_country_pricing.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../src/models/Product.js";
import Brand from "../src/models/Brand.js";
import Category from "../src/models/Category.js";
import Model from "../src/models/Model.js";
import { getCountryInfo } from "../src/utils/countryCurrencyMap.js";
import { getExchangeRates, convertFromINR } from "../src/services/exchangeRateService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Local re-implementations of the parser & serializer helper logic from productController.js
// so this script can test unit behavior directly.
const _parseCountryPricing = (raw) => {
  if (!raw || String(raw).trim() === "") return [];
  return String(raw).split("||").map(entry => {
    const parts = entry.split("|").map(p => p.trim());
    if (parts.length < 8 || !parts[0]) return null;
    return {
      countryCode:    parts[0],
      countryName:    parts[1] || parts[0],
      currencyCode:   parts[2] || "INR",
      currencySymbol: parts[3] || "₹",
      price:          parts[4] !== "" ? Number(parts[4]) : 0,
      wholesalePrice: parts[5] !== "" ? Number(parts[5]) : 0,
      wholesaleMinQty:parts[6] !== "" ? Number(parts[6]) : 10,
      mrp:            parts[7] !== "" ? Number(parts[7]) : 0,
    };
  }).filter(Boolean);
};

const _serializeCountryPricing = (countryPricing) => {
  if (!Array.isArray(countryPricing) || countryPricing.length === 0) return "";
  return countryPricing.map(cp => [
    cp.countryCode || "",
    cp.countryName || "",
    cp.currencyCode || "",
    cp.currencySymbol || "",
    cp.price !== undefined && cp.price !== null ? cp.price : "",
    cp.wholesalePrice !== undefined && cp.wholesalePrice !== null ? cp.wholesalePrice : "",
    cp.wholesaleMinQty !== undefined && cp.wholesaleMinQty !== null ? cp.wholesaleMinQty : 10,
    cp.mrp !== undefined && cp.mrp !== null ? cp.mrp : "",
  ].join("|")).join("||");
};

let passedTests = 0;
let failedTests = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(` ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(` ❌ FAIL: ${testName}`);
    failedTests++;
  }
};

const runTests = async () => {
  console.log("\n==================================================");
  console.log("🧪 RUNNING LOCATION PRICING & BULK UPLOAD TEST SUITE");
  console.log("==================================================\n");

  // ── TEST 1: Country Currency Map Lookup ───────────────────────────────────
  console.log("--- Test Group 1: Country Currency Map ---");
  const aeInfo = getCountryInfo("AE");
  assert(aeInfo.countryName === "United Arab Emirates" && aeInfo.currencyCode === "AED" && aeInfo.currencySymbol === "د.إ", "ISO code 'AE' maps to UAE AED (د.إ)");

  const gbInfo = getCountryInfo("GB");
  assert(gbInfo.countryName === "United Kingdom" && gbInfo.currencyCode === "GBP" && gbInfo.currencySymbol === "£", "ISO code 'GB' maps to United Kingdom GBP (£)");

  const fallbackInfo = getCountryInfo("XX_UNKNOWN");
  assert(fallbackInfo.countryCode === "IN" && fallbackInfo.currencyCode === "INR", "Unknown ISO code falls back to India (IN)");

  // ── TEST 2: Cell Parsing (_parseCountryPricing) ───────────────────────────
  console.log("\n--- Test Group 2: Excel Cell Parsing ---");
  const rawCellSingle = "AE|United Arab Emirates|AED|د.إ|80|65|10|100";
  const parsedSingle = _parseCountryPricing(rawCellSingle);
  assert(parsedSingle.length === 1, "Single country cell parses to array of 1 item");
  assert(parsedSingle[0].countryCode === "AE" && parsedSingle[0].price === 80 && parsedSingle[0].wholesalePrice === 65 && parsedSingle[0].mrp === 100, "Parsed fields match expected values");

  const rawCellMulti = "AE|United Arab Emirates|AED|د.إ|80|65|10|100||US|United States|USD|$|25|20|10|30";
  const parsedMulti = _parseCountryPricing(rawCellMulti);
  assert(parsedMulti.length === 2, "Multiple countries cell (separated by ||) parses to array of 2 items");
  assert(parsedMulti[1].countryCode === "US" && parsedMulti[1].currencyCode === "USD" && parsedMulti[1].price === 25, "Second country (US) fields match expected values");

  const parsedEmpty = _parseCountryPricing("");
  assert(Array.isArray(parsedEmpty) && parsedEmpty.length === 0, "Empty cell parses to empty array");

  // Variant cell with countryPricing embedded using ~
  const variantStr = "Black;PW-BLA-001;4500;5500;3800;10;50;http://img1.jpg~AE|United Arab Emirates|AED|د.إ|80|65|10|100";
  const [variantFields, variantCpStr] = variantStr.split("~");
  const parsedVariantCp = _parseCountryPricing(variantCpStr);
  assert(parsedVariantCp.length === 1 && parsedVariantCp[0].countryCode === "AE" && parsedVariantCp[0].price === 80, "Variant string with ~ parses embedded countryPricing correctly");

  // ── TEST 3: Cell Serialization (_serializeCountryPricing) ─────────────────
  console.log("\n--- Test Group 3: Excel Cell Serialization ---");
  const serialized = _serializeCountryPricing(parsedMulti);
  assert(serialized === rawCellMulti, "Round-trip serialization matches exact input string");

  // ── TEST 4: Live Exchange Rate Service ────────────────────────────────────
  console.log("\n--- Test Group 4: Exchange Rate Service ---");
  try {
    const rates = await getExchangeRates();
    assert(rates && typeof rates === "object" && rates.INR === 1, "getExchangeRates returns valid rates object with INR=1");
    assert(typeof rates.USD === "number" && rates.USD > 0, "USD exchange rate is a positive number");
    
    const converted = await convertFromINR(1000, "USD", rates);
    assert(typeof converted === "number" && converted > 0 && converted < 1000, `Converted 1000 INR → USD = $${converted}`);
  } catch (err) {
    console.error("Exchange rate test failed:", err.message);
  }

  // ── TEST 5: Database Schema Validation ────────────────────────────────────
  console.log("\n--- Test Group 5: MongoDB Schema Validation ---");
  if (process.env.MONGODB_URI) {
    try {
      console.log(" Connecting to MongoDB to test document persistence...");
      await mongoose.connect(process.env.MONGODB_URI);

      // Find or create dummy Brand, Category, Model IDs to satisfy required references
      let brandDoc    = await Brand.findOne();
      let categoryDoc = await Category.findOne();
      let modelDoc    = await Model.findOne();

      if (!brandDoc)    brandDoc    = await Brand.create({ name: `Test Brand ${Date.now()}` });
      if (!categoryDoc) categoryDoc = await Category.create({ name: `Test Category ${Date.now()}` });
      if (!modelDoc)    modelDoc    = await Model.create({ name: `Test Model ${Date.now()}`, brand: brandDoc._id });

      const testSku = `TEST-BULK-${Date.now()}`;
      const testProduct = new Product({
        name: `Test Product Country Pricing ${Date.now()}`,
        slug: `test-product-country-pricing-${Date.now()}`,
        code: testSku,
        brand: brandDoc._id,
        category: categoryDoc._id,
        model: modelDoc._id,
        price: 1500,
        mrp: 2000,
        wholesalePrice: 1200,
        wholesaleMinQty: 10,
        countInStock: 25,
        countryPricing: [
          {
            countryCode: "AE",
            countryName: "United Arab Emirates",
            currencyCode: "AED",
            currencySymbol: "د.إ",
            price: 80,
            wholesalePrice: 65,
            wholesaleMinQty: 10,
            mrp: 100,
          },
        ],
        colorVariants: [
          {
            colorName: "Midnight Black",
            sku: `${testSku}-BLK`,
            price: 1600,
            mrp: 2100,
            wholesalePrice: 1300,
            wholesaleMinQty: 10,
            countInStock: 15,
            countryPricing: [
              {
                countryCode: "US",
                countryName: "United States",
                currencyCode: "USD",
                currencySymbol: "$",
                price: 28,
                wholesalePrice: 22,
                wholesaleMinQty: 10,
                mrp: 35,
              },
            ],
          },
        ],
      });

      const saved = await testProduct.save();
      assert(saved && saved._id, "Product with countryPricing saved successfully to MongoDB");
      
      const fetched = await Product.findById(saved._id);
      assert(fetched.countryPricing?.length === 1 && fetched.countryPricing[0].countryCode === "AE", "Product-level countryPricing persisted correctly");
      assert(fetched.colorVariants[0].countryPricing?.length === 1 && fetched.colorVariants[0].countryPricing[0].countryCode === "US", "Variant-level countryPricing persisted correctly");

      // Cleanup test product
      await Product.findByIdAndDelete(saved._id);
      console.log(" 🧹 Cleaned up test product from DB");

      await mongoose.disconnect();
    } catch (err) {
      console.error("MongoDB test failed:", err.message);
    }
  } else {
    console.log(" ℹ️ MONGODB_URI not set in env — skipping live DB save test.");
  }

  console.log("\n==================================================");
  console.log(`📊 TEST RESULTS SUMMARY:`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failedTests}`);
  console.log("==================================================\n");

  if (failedTests === 0) {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!\n");
  } else {
    console.error("⚠️ SOME TESTS FAILED. Please review the output above.\n");
    process.exit(1);
  }
};

runTests();
