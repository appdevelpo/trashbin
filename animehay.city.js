// ==MiruExtension==
// @name         AnimeHay
// @version      v0.0.1
// @author       appdevelpo
// @lang         ??
// @license      MIT
// @icon         ""
// @package      animehay.city
// @type         bangumi
// @webSite      https://animehay.city
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
    async req(url) {
        const cookie_string = await (this.getSetting("cookie"));
        const headers = {
            "Host": "animehay.city",
            // "Accept-Encoding": "gzip, deflate, br",
            // "Connection": "keep-alive",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
            // "Upgrade-Insecure-Requests": "1",
            // "See-Fetch-User": "?1",
            // "Sec-Fetch-Site": "same-origin",
            // "Sec-Fetch-Mode": "navigate",
            // "Sec-Fetch-Dest": "document",
            // "See-Ch-Ua-Platform": '"Windows"',
            "See-Ch-Ua": '"Chromium";v="89", "Google Chrome";v="89", ";Not A Brand";v="99"',
            "Sec-Ch-Ua-Mobile": "?0",
            // "Cache-Control": "no-cache",
            "Referer": "https://animehay.city/phim-moi-cap-nhap/trang-2.html",
            "Cookie": "cf_chl_rc_m=6; cf_chl_2=ad41647434d0f09; cf_clearance=uF0At7TR476cs79NbNDQV1FFqFKcMYnjOTZMkt3uTzo-1705073005-0-2-5c8073ba.b606b119.b812c5a-250.0.0",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            // "Pragma": "no-cache",

        }
        if (cookie_string != "") {
            headers.Cookie = cookie_string
        }
        console.log(headers);
        const res = this.request(url, {
            // method: "POST",
            headers: headers
        });
        console.log(res);
        return res
    }
    async load() {
        await this.registerSetting({
            title: "Cookie",
            key: "cookie",
            type: "input",
            description: "如果嘗試webwiew無法正常使用,請在此輸入cookie",
            defaultValue: "",
        })
    }
    async search(kw, page) {
        try {
            const url = `/vod/search/${kw}----------${page}---.html`
            const res = await this.req(url);
            // console.log(res);
            const bangumi = [];
            const item_list = res.match(/<div class="module-card-item module-item">[\s\S]+?<div class="module-card-item-footer">[\s\S]+?<\/div>/g);
            // console.log(res);
            item_list.forEach((element) => {
                const title = element.match(/<strong>(.+?)<\/strong>/)[1];
                const cover = element.match(/data-original="(.+?)"/)[1];
                const url = element.match(/href="(.+?)"/)[1];
                bangumi.push({
                    title,
                    url: url,
                    cover,
                });

            })
            return bangumi;


        } catch (e) {
            console.log(e);
            const bangumi = [{
                title: "cloudfare",
                url: "/label/new.html",
                cover: null
            }];
            return bangumi;
        }
    }
    async latest(page) {
        try {
            const res = await this.req(`/phim-moi-cap-nhap/trang-${page}.html`)
            // console.log(res);
            const selector = await this.querySelectorAll(res, ".movie-item");
            // console.log(selector.length);
            const mangas = [];
            for (const element of selector) {
                const html = element.content;
                const url = await this.getAttributeText(html, "a", "href");
                const cover = await this.getAttributeText(html, "img", "src");
                const title = await this.getAttributeText(html, "a", "title");
                console.log(cover);
                mangas.push({
                    title,
                    url,
                    cover,
                })

            }
            return mangas;


        } catch (e) {
            console.log(e);
            const bangumi = [{
                title: "cloudfare",
                url: "/label/new.html",
                cover: null
            }];
            return bangumi;
        }

    }

    async detail(url) {
        try {
            const res = await this.req(url);
            console.log(res);
            const eps_area = res.match(/选择播放源[\s\S]+?<i class="icon-play"><\/i>/);
            const eplist_title = res.match(/<span>\w+<\/span><small>\d+<\/small><\/div>/g);
            const eplists = res.match(/module-play-list-content  module-play-list-base[\s\S]+?<\/div>/g);
            // console.log(eplist_title);
            // console.log(eplists);
            const episode = [];
            const desc = res.match(/<p>(.+?)<\/p>/)[1];
            const cover = res.match(/data-original="(.+?)"/)[1];
            const title = res.match(/<h1>(.+?)<\/h1>/)[1]
            eplists.forEach((element, index) => {
                const title = eplist_title[index].match(/>(\w+)</)[1];


                const eplist = element.match(/<a.+?<\/a>/g);
                const urls = eplist.map(index => {
                    return {
                        name: index.match(/<span>(.+?)<\/span>/)[1],
                        url: index.match(/href="(.+?)"/)[1]
                    }
                })
                // console.log(urls);
                episode.push({
                    title,
                    urls
                })
            })
            // console.log(episode);
            console.log({
                title: title || "Unknown Title",
                cover: cover || "",
                desc: desc || "No description available.",
                episodes: episode
            });
            return {
                title: title || "Unknown Title",
                cover: cover || "",
                desc: desc || "No description available.",
                episodes: episode
            };

        } catch (e) {
            // console.log(e.match(/403/));
            // if (e.match(403)){
            //     return {
            //     title: "Cloudflare",
            //     cover: "",
            //     desc: "Please use webview to enter the website then close the window.\r\n請用webview進入網站後再關閉視窗",
            //     episodes: []
            // };
            // }
            return {
                title: "Cloudflare",
                cover: "",
                desc: "Please use webview to enter the website then close the window.\r\n請用webview進入網站後再關閉視窗(目前webview可能沒用，必須手動輸入cookie)",
                episodes: []
            };

        }
    }

    async watch(url) {
        const res = await this.request(url);
        const video_url = res.match(/https:.+?\.m3u8/)[0].replace(/\//g, "");
        return {
            type: "hls",
            url: video_url || null,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36",
            }
        };
    }
}

