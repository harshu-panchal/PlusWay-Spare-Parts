import axios from 'axios';
import * as cheerio from 'cheerio';

const URL = 'https://www.maxbhi.com/searchmodel.html?brand_id=7557&ptid=0';

async function findModel() {
    try {
        console.log(`Fetching Acer models from ${URL}...`);
        const { data } = await axios.get(URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        console.log("Parsing models...");
        const models = [];
        $('a').each((i, el) => {
            const text = $(el).text().trim() || $(el).attr('title') || $(el).find('img').attr('alt');
            const url = $(el).attr('href');
            if (url && text) {
                models.push({ name: text, url });
            }
        });

        // Search for S162E4
        const target = "One 10".toLowerCase();
        const matches = models.filter(m => m.name.toLowerCase().includes(target));

        if (matches.length > 0) {
            console.log(`Found ${matches.length} matches for "${target}":`);
            matches.forEach(m => console.log(`MATCH: ${m.name} | URL: ${m.url}`));
        } else {
            console.log(`No matches found for "${target}".`);
            // Check for "Acerone"
            const aceroneMatches = models.filter(m => m.name.toLowerCase().includes("acerone"));
            if (aceroneMatches.length > 0) {
                console.log(`Found ${aceroneMatches.length} matches for "Acerone":`);
                aceroneMatches.forEach(m => console.log(`MATCH: ${m.name} | URL: ${m.url}`));
            } else {
                console.log("No matches for 'Acerone' either.");
                console.log("First 10 items found:");
                models.slice(0, 10).forEach(m => console.log(m.name, m.url));
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

findModel();
