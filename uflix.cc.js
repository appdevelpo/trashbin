// ==MiruExtension==
// @name         uFlix
// @version      v0.0.1
// @author       appdevelpo
// @lang         en
// @license      MIT
// @icon         https://i.imgur.com/HDQu78h.png
// @package      uflix.cc
// @type         bangumi
// @webSite      https://uflix.cc
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async search(kw, page) {
    const res = await this.request(`/search?keyword=${kw}&page=${page}`);
    // console.log(res);
    const bsxList = res.match(/<div class="col-lg-2">[\s\S]+?<\/a>/g)
    const videos = [];
    bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/title="(.+?)"/)[1];
      const cover = "https://uflix.cc" + element.match(/src="(.+?)"/)[1];
      videos.push({
        title,
        url,
        cover,
      });
    });
    return videos;
  }

  async latest(page) {
    const res = await this.request(`/new`);
    const bsxList = res.match(/<div class="col-lg-2">[\s\S]+?<\/a>/g)
    const videos = [];
    bsxList.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const title = element.match(/<h3.+?>(.+?)<\/h3>/)[1];
      const cover = "https://uflix.cc" + element.match(/src="(.+?)"/)[1];
      videos.push({
        title,
        url,
        cover,
      });
    });
    return videos;
  }

  async detail(url) {
    const stream1_base = "https://embed.smashystream.com"
    const res = await this.request(url);
    const title = res.match(/<h1.+?>(.+?)<\/h1>/)[1];
    // console.log(res);
    console.log(title);
    const cover = "https://uflix.cc" + res.match(/data-src="(.+?)"/)[1];
    console.log(cover);
    const desc = res.match(/<p .+?text-muted.+?>([\S\s]+?)</)[1];
    console.log(desc);
    // const epRes = await this.request(`/api?m=release&id=${url}`)
    // console.log(title[1]);
    //   const reverse_data = epRes.data.reverse();
    const ep_list = res.match(/<div class="card-episode">[\s\S]+?<\/div>/g)
    // console.log(ep_list);
    const episodes = []
    if (ep_list == null) {
      const keyword = url.split('/')[2];
      const stream1_url = `/mPlayer?movieid=${keyword}&stream=stream1`
      const res_stream1 = await this.request(stream1_url);
      const imdb_id = res_stream1.match(/imdb:([\w\d]+)/)[1];
      const mirror_res = await this.request("", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.33",
          "Referer": "https://uflix.cc/",
          "Miru-Url": `https://embed.smashystream.com/playere.php?imdb=${imdb_id}`,
        }
      })
      const embed_links = mirror_res.match(/data-id="(https.+?)".+?</g)
      // const player_tag = embed_links.match(/segu|fizzzz1|dud_movie|supermovie|fx555|ems/g);
      // console.log(embed_links);
      for (const element of embed_links) {
        const player_tag = element.match(/\/([\w^.]+?)\.php/)[1]
        const embed_link = element.match(/"(.+?)"/)[1]
        // console.log(embed_link);
        // console.log(player_tag);
        await new Promise(resolve => setTimeout(resolve, 100));
        const embed_res = await this.request("", {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.33",
            "Referer": `https://embed.smashystream.com/playere.php?imdb=${imdb_id}`,
            "Miru-Url": embed_link,
          }
        });
        console.log(embed_res.match(/.m3u8|\.mp4/g));
        switch (player_tag) {
          case "fizzzz1":
            console.log("fizzzz1");
            const videos_fizzzz1 = embed_res.match(/\[.+?.m3u8/g);
            // console.log(videos)
            if (videos_fizzzz1 === null) {
              break;
            }
            const episode_element_fizzzz1 = {
              title: "stream_mirror1_fizzzz1",
              urls: videos_fizzzz1.map(element => {
                return {
                  name: element.match(/\[(.+?)\]/)[1],
                  url: element.match(/http.+?\.m3u8/)[0]
                }
              })
            }
            episodes.push(episode_element_fizzzz1);
          case "segu":
            console.log("segu");
            const videos_segu = embed_res.match(/\[.+?,/g)
            if (videos_segu === null) {
              break;
            }
            console.log(videos_segu);
            const episode_element_segu = {
              title: "stream_mirror1_segu",
              urls: videos_segu.map(element => {
                return {
                  name: element.match(/\[(.+?)\]/)[1],
                  url: element.match(/\](.+?),/)[1]
                }
              })
            }
            // console.log(episode_element);
            // episodes.push(episode_element_segu);
          case "dud_movie":
            console.log("dud_movie");
            const videos_dud = embed_res.match(/"https.+?\}/g)
            if (videos_dud === null) {
              break;
            }
            console.log(videos_dud);
            const episode_element_dud = {
              title: "stream_mirror1_dud(hindi)",
              urls: videos_dud.map(element => {
                return {
                  name: element.match(/"title":"(.+?)"/)[1],
                  url: element.match(/http.+?\.m3u8/)[0]
                }
              })
            }
            episodes.push(episode_element_dud);
          default:
            break
        }
      }
      console.log(episodes);
      return {
        title: title,
        cover: cover,
        desc: desc,
        episodes: episodes,
      }
    }
    // console.log(ep_list);
    ep_list.forEach((element) => {
      const url = element.match(/href="(.+?)"/)[1];
      const name = url.match(/S\d+E\d+/)[0];
      episodes.push({
        name,
        url,
      })
    })
    // console.log(episodes);
    return {
      title: title,
      cover: cover,
      desc: desc,
      episodes: [{
        title: "Directory",
        urls: episodes
      }]
    }
  }

  async watch(url) {
    return{
      type:"hls",
      url:url
    }
  }
}
