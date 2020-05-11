const state = require("./state.js");
const google = require("googleapis").google;
const customSearch = google.customsearch("v1");
const googleSearchCredentials = require("../credentials/google-images.json");
const imageDownloader = require("image-downloader");
const path = require("path");
const gm = require("gm").subClass({ imageMagick: true });

async function robot() {
  const content = state.load();
  // await fetchImagesOfAllSentences(content);
  // await downloadAllImages(content);
  // state.save(content);
  // await createAllSentencesImages(content);
  // await convertAllImages(content);
  await createYoutubeThumbnail();

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

async function convertAllImages(content) {
  for (
    let sentenceIndex = 0;
    sentenceIndex < content.sentences.length;
    sentenceIndex++
  ) {
    try {
      await convertImage(sentenceIndex);
    } catch (error) {
      console.log(error);
    }
  }
}

async function convertImage(sentenceIndex) {
  return new Promise((resolve, reject) => {
    const inputFile = path.resolve(
      __dirname,
      "..",
      "files",
      `${sentenceIndex}-original.png[0]`
    );
    const outputFile = path.resolve(
      __dirname,
      "..",
      "files",
      `${sentenceIndex}-converted.png`
    );

    const width = 1920;
    const height = 1080;

    gm()
      .in(inputFile)
      .out("(")
      .out("-clone")
      .out("0")
      .out("-background", "white")
      .out("-blur", "0x9")
      .out("-resize", `${width}x${height}^`)
      .out(")")
      .out("(")
      .out("-clone")
      .out("0")
      .out("-background", "white")
      .out("-resize", `${width}x${height}`)
      .out(")")
      .out("-delete", "0")
      .out("-gravity", "center")
      .out("-compose", "over")
      .out("-composite")
      .out("-extent", `${width}x${height}`)
      .write(outputFile, (error) => {
        if (error) {
          return reject(error);
        }

        console.log(`> [video-robot] Image converted: ${outputFile}`);
        resolve();
      });
  });
}
async function createAllSentencesImages(content) {
  for (
    let sentenceIndex = 0;
    sentenceIndex < content.sentences.length;
    sentenceIndex++
  ) {
    await createSentenceImage(
      sentenceIndex,
      content.sentences[sentenceIndex].text
    );
  }
}

async function createSentenceImage(sentenceIndex, sentenceText) {
  return new Promise((resolve, reject) => {
    const outputFile = path.resolve(
      __dirname,
      "..",
      "files",
      `${sentenceIndex}-sentence.png`
    );

    const templateSettings = {
      0: {
        size: "1920x400",
        gravity: "center",
      },
      1: {
        size: "1920x1080",
        gravity: "center",
      },
      2: {
        size: "800x1080",
        gravity: "west",
      },
      3: {
        size: "1920x400",
        gravity: "center",
      },
      4: {
        size: "1920x1080",
        gravity: "center",
      },
      5: {
        size: "800x1080",
        gravity: "west",
      },
      6: {
        size: "1920x400",
        gravity: "center",
      },
    };

    gm()
      .out("-size", templateSettings[sentenceIndex].size)
      .out("-gravity", templateSettings[sentenceIndex].gravity)
      .out("-background", "transparent")
      .out("-fill", "white")
      .out("-kerning", "-1")
      .out(`caption:${sentenceText}`)
      .write(outputFile, (error) => {
        if (error) {
          return reject(error);
        }

        console.log(`> [video-robot] Sentence created: ${outputFile}`);
        resolve();
      });
  });
}

async function createYoutubeThumbnail() {
  return new Promise((resolve, reject) => {
    gm()
      .in(path.resolve(__dirname, "..", "files", "0-converted.png"))
      .write(
        path.resolve(__dirname, "..", "files", "youtube-thumbnail.jpg"),
        (error) => {
          if (error) reject(error);
          console.log("> Creating Youtube Thumbnail");
          resolve();
        }
      );
  });
}

module.exports = robot;
