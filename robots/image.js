const state = require("./state.js");
const google = require("googleapis").google;
const customSearch = google.customsearch("v1");
const googleSearchCredentials = require("../credentials/google-images.json");
const imageDownloader = require("image-downloader");
const path = require("path");

async function robot() {
  const content = state.load();
  // await fetchImagesOfAllSentences(content);
  await downloadAllImages(content);
  // state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImagesLinks(query);
      sentence.googleSearchQuery = query;
    }
  }

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      searchType: "image",
      num: 2,
    });
    const imagesUrl = response.data.items.map((item) => item.link);

    return imagesUrl;
  }

  async function downloadAllImages(content) {
    content.downloadedImages = [];
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const images = content.sentences[sentenceIndex].images;

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex];
        console.log(imageUrl);

        try {
          if (content.downloadedImages.includes(imageUrl)) {
            throw "imagem já foi baixada";
          }
          await downLoadAndSave(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);
          console.log(
            `> [${sentenceIndex}][${imageIndex}] Baixou a imagem com sucesso: ${imageUrl}`
          );
          break;
        } catch (error) {
          console.log(`> Erro ao baixar (${imageUrl}): ${error}`);
        }
      }
    }
  }

  async function downLoadAndSave(url, filename) {
    return imageDownloader.image({
      url,
      dest: path.resolve(__dirname, "..", "files", filename),
    });
  }
}
module.exports = robot;
