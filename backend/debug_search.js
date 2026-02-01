import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL1 = 'https://www.maxbhi.com/index.php?dispatch=products.search&q=T4-129L';
const URL2 = 'https://www.maxbhi.com/index.php?dispatch=products.search&q=Acerone';

async function client(url) {
    try {
        console.log(`Fetching ${url}...`);
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const links = [];
        $('.product-title').each((i, el) => {
            links.push($(el).attr('href'));
        });
        $('.ty-product-list__item-name a').each((i, el) => { // Alternative selector
            links.push($(el).attr('href'));
        });

        // Generic link finder in product cards
        $('.product-card a').each((i, el) => { // If my previous selector was correct
            links.push($(el).attr('href'));
        });

        // Specific to CS-Cart search results
        $('.ty-column4 .ty-grid-list__item-name a').each((i, el) => {
            links.push($(el).attr('href'));
        });

        const uniqueLinks = [...new Set(links)];
        console.log(`Found ${uniqueLinks.length} products.`);
        uniqueLinks.forEach(l => console.log(l));

        fs.writeFileSync('debug_search.html', data);
        console.log("Saved debug_search.html");

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function run() {
    console.log("--- Searching specific ---");
    await client(URL1);
    console.log("\n--- Searching generic ---");
    await client(URL2);
}

run();
