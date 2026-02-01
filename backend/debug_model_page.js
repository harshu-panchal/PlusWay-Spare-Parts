import axios from 'axios';
import fs from 'fs';

const MODEL_URL = 'https://www.maxbhi.com/searchproducttype.html?model_id=2802606&ptid=0';

async function dumpModelPage() {
    try {
        console.log(`Fetching ${MODEL_URL}...`);
        const { data } = await axios.get(MODEL_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        fs.writeFileSync('debug_model.html', data);
        console.log('Dumped to debug_model.html');
    } catch (error) {
        console.error(error.message);
    }
}

dumpModelPage();
