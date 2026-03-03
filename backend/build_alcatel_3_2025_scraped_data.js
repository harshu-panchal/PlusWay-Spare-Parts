import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_URL =
  'https://www.maxbhi.com/search.html?search_performed=Y&pname=Y&pkeywords=Y&q=alcatel+3+2025&items_per_page=128';
const OUTPUT_DIR = path.resolve(__dirname, '../scraped_data/ALCATEL_3_2025');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\\-]+/g, '')
    .replace(/\\-\\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function downloadImage(url, destPath) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.promises.writeFile(destPath, response.data);
    console.log(`Saved image: ${destPath}`);
  } catch (err) {
    console.warn(`Failed to download image ${url}: ${err.message}`);
  }
}

async function fetchHtml(url) {
  const res = await axios.get(url);
  return res.data;
}

function extractDetailsFromProductPage(html) {
  const $ = cheerio.load(html);

  // 1) Description from "Product Details" section
  let description = '';
  $('h2, h3').each((_, el) => {
    const heading = $(el).text().trim().toLowerCase();
    if (heading.includes('product details')) {
      const parts = [];
      let node = $(el).next();
      while (node.length && !['H2', 'H3'].includes(node[0].tagName.toUpperCase())) {
        const text = node.text().trim();
        if (text) parts.push(text);
        node = node.next();
      }
      description = parts.join('\n\n');
    }
  });

  // 2) Structured specs from tables (IN THE BOX, COMPATIBILITY, AVAILABILITY, Warranty)
  const features = [];

  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    if (!rows.length) return;

    const firstRowText = rows.first().text().trim().toLowerCase();

    rows.each((i, row) => {
      const cells = $(row).find('td, th');
      if (cells.length < 2) return;

      const key = $(cells[0]).text().trim();
      const value = $(cells[1]).text().trim();
      if (!key || !value) return;

      if (firstRowText.includes('in the box')) {
        features.push({ key: `In The Box - ${key}`, value });
      } else if (firstRowText.includes('compatibility')) {
        features.push({ key: `Compatibility - ${key}`, value });
      } else if (firstRowText.includes('availability')) {
        features.push({ key: `Availability - ${key}`, value });
      } else if (firstRowText.includes('warranty')) {
        features.push({ key: `Warranty - ${key}`, value });
      }
    });
  });

  return { description, features };
}

async function buildScrapedData() {
  const html = await fetchHtml(SOURCE_URL);
  const $ = cheerio.load(html);

  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const products = [];

  $('.ty-grid-list__item').each((_, el) => {
    const container = $(el);
    const link = container.find('.product-title a, .ty-grid-list__item-name a').first();
    const img = container.find('img.cm-image').first();

    const title = (link.text() || '').trim();
    const href = link.attr('href') || '';
    const imgSrc = img.attr('src') || '';

    const priceNum = container.find('.ty-price_actual .ty-price-num').first();
    const mrpNum = container.find('.ty-list-price .ty-price-num').first();

    const priceText = (priceNum.text() || '').trim();
    const mrpText = (mrpNum.text() || '').trim();

    if (!title) return;

    products.push({
      title,
      href,
      imgSrc,
      mrpText,
      priceText,
    });
  });

  console.log(`Found ${products.length} products in Alcatel 3 2025 search results.`);

  let counter = 1;
  for (const product of products) {
    const folderName = `${String(counter).padStart(3, '0')}_${slugify(product.title)}`;
    const folderPath = path.join(OUTPUT_DIR, folderName);
    await fs.promises.mkdir(folderPath, { recursive: true });

    // Fetch product page for full details
    let extra = { description: '', features: [] };
    try {
      if (product.href) {
        const detailHtml = await fetchHtml(product.href.startsWith('http') ? product.href : `https://www.maxbhi.com/${product.href.replace(/^\//, '')}`);
        extra = extractDetailsFromProductPage(detailHtml);
      }
    } catch (e) {
      console.warn(`Failed to fetch details for ${product.title}: ${e.message}`);
    }

    const details = {
      title: product.title,
      description: extra.description,
      price: product.priceText || product.mrpText || '',
      features: [
        { key: 'Source URL', value: product.href },
        { key: 'MRP', value: product.mrpText },
        ...extra.features,
      ],
      image: product.imgSrc,
    };

    const detailsPath = path.join(folderPath, 'details.json');
    await fs.promises.writeFile(detailsPath, JSON.stringify(details, null, 2), 'utf8');
    console.log(`Wrote details.json for: ${product.title}`);

    if (product.imgSrc && product.imgSrc.startsWith('http')) {
      const imagePath = path.join(folderPath, 'image_1.jpg');
      await downloadImage(product.imgSrc, imagePath);
    }

    counter += 1;
  }

  console.log(`Alcatel 3 2025 scraped data prepared in: ${OUTPUT_DIR}`);
}

buildScrapedData().catch((err) => {
  console.error('Failed to build Alcatel 3 2025 scraped data:', err);
  process.exit(1);
});

