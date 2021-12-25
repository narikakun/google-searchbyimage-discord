const request = require("request");
const cheerio = require('cheerio');

const photoSearch = async (imageUrl) => {
    return new Promise((async (resolve, reject) => {
        let { err, response, body} = await getRequest(`https://ipv4.google.com/searchbyimage?image_url=${encodeURIComponent(imageUrl)}`, "GET");
        if (err) return reject(err);
        try {
            let json = {statusCode: response.statusCode};
            if (response.statusCode !== 200) return resolve(json);
            require("fs").writeFileSync("index.html", body);
            const $ = cheerio.load(body);
            let results = [];
            $("div div a h3").each(function () {
                let parent = $(this).parent().parent();
                let href = parent.find("a").attr("href");
                if (href) {
                    results.push({
                        title: $(this).text(),
                        url: href
                    });
                }
            })
            json.keyword = $("div div div input").attr("value");
            json.results = results;
            json.image = `https:${$("div#topstuff div div div img").attr("src").split("=")[0]}=s800`;
            resolve(json);
        } catch (e) {
            console.error(e);
            reject(e);
        }
    }));
}

const getRequest = (url, method) => {
    return new Promise(((resolve) => {
        request(url, {
            method: method,
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36",
                "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7"
            }
        }, async (err, response, body) => {
            if (response.headers['location']) {
                let getRequestLocation = await getRequest(response.headers['location'], "GET");
                resolve(getRequestLocation);
            }
            resolve({err: err, response: response, body: body});
        });
    }));
}
module.exports = photoSearch;