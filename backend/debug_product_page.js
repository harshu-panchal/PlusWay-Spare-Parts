import axios from 'axios';
import fs from 'fs';

const PRODUCT_URL = 'https://www.maxbhi.com/lcd-with-touch-screen-for-acer-acerone-liquid-s162e4-blue-display-glass-combo-folder.html';

async function dumpProductPage() {
    try {
        console.log(`Fetching ${PRODUCT_URL}...`);
        const { data } = await axios.get(PRODUCT_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        fs.writeFileSync('debug_product.html', data);
        console.log('Dumped to debug_product.html');
    } catch (error) {
        console.error(error.message);
    }
}

dumpProductPage();
