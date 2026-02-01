import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_URL = 'https://www.maxbhi.com/searchproducttype.html?model_id=20100112&ptid=0';

async function debugModel() {
    try {
        console.log(`Fetching ${MODEL_URL}...`);
        const { data } = await axios.get(MODEL_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        fs.writeFileSync('debug_t4_model.html', data);
        console.log('Saved debug_t4_model.html');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

debugModel();
