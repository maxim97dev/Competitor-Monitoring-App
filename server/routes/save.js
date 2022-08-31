const express = require("express"),
    router = express.Router(),
    puppeteer = require("puppeteer"),
    fs = require("file-system"),
    path = require("path"),
    shortId = require("shortid"),
    config = require("config");

const { statusAuth } = require("../middleware/auth");

const { Buffer } = require("buffer"),
    CronJob = require("cron").CronJob,
    PNG = require('pngjs').PNG,
    pixelmatch = require('pixelmatch'),
    sharp = require('sharp'),
    DiffMatchPatch = require('diff-match-patch');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.get("/api/pagedata", statusAuth, async (req, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1 });
  await page.goto(req.query.url, {
    waitUntil: "networkidle0",
    timeout: 10000,
  });

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1920, height: bodyHeight });

  const data = await page.evaluate(() => {
    return JSON.stringify(document.getElementsByTagName("body")[0].innerText);
  });

  let date = Date.now();

  let taskId = shortId.generate();

  const newPath = path.join(
    __dirname,
    `../database/${req.user.id}/userdata/${taskId}/${date}`
  );

  const pathThumbnail = path.join(
    __dirname,
    `../database/${req.user.id}/userdata/${taskId}`
  );

  try {
    if (!fs.existsSync(newPath)) {
      const path = newPath;

      fs.mkdirSync(path);
      fs.writeFileSync(`${path}/text.txt`, data, function (err) {
        if (err) return console.log(err);
      });

      await page.screenshot({
        path: `${path}/screenshot.png`,
        fullPage: true,
      });

      await page.setViewport({ width: 1366, height: 768 });
      await page.screenshot({
        path: `${pathThumbnail}/thumbnail.jpg`,
      });

      res.status(200).json({
        image: `http://localhost:3000/static/images/${req.user.id}/userdata/${taskId}/${date}/screenshot.png`,
        text: `http://localhost:3000/static/images/${req.user.id}/userdata/${taskId}/${date}/text.txt`,
        id: taskId,
        thumbnail: `http://localhost:3000/static/images/${req.user.id}/userdata/${taskId}/thumbnail.jpg`,
        datetime: `${date}`,
        folder: `${date}`,
        length: fs.readFileSync(`${path}/text.txt`, "utf8").length,
      });
      await browser.close();
    }
  } catch (err) {
    await browser.close();
    res.sendStatus(500);
  }
});

router.get('/api/preview', statusAuth, async (req, res) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--ignore-certificate-errors'
    ],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 768 });

  try {
    const response = await page.goto(req.query.url, {
      waitUntil: "networkidle0",
    });

    const data = await page.screenshot();
    const title = await page.title();
    const pageUrl = await page.url();
    const status = response.status();
    const image = Buffer.from(data).toString("base64");

    await browser.close();

    res.status(200).json({
      image: image,
      title: title,
      page: pageUrl,
      status: status,
    });
  } catch (err) {
    await browser.close();
    res.json({
      status: 'error',
    });
  }
});

router.get("/api/cron", async (req, res) => {
  const allFiles = getAllUserFolder();

  for (let i = 0; i < allFiles.length; i++) {
    let userIdFolder = getTasksFromDB(allFiles[i]),
        updateTasks =  await cronPuppetter(userIdFolder);

    setTasksToDB(updateTasks, allFiles[i]);
  }

  res.sendStatus(200);
});

function getAllUserFolder() {
  const allUsers = fs
    .readdirSync("./database/", { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return allUsers;
}

function getTasksFromDB(user) {
  return JSON.parse(fs.readFileSync(`./database/${user}${config.get("database.tasks")}`, "utf8"));
}

function setTasksToDB(tasksData, user) {
  fs.writeFileSync(`./database/${user}${config.get('database.tasks')}`, JSON.stringify(tasksData));
}

async function cronPuppetter(tasksAll) {
  let urls = tasksAll;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
    const page = await browser.newPage();
  
    await page.setViewport({ width: 1920, height: 1 });
    await page.goto(urls[i].title, {
      waitUntil: "networkidle0",
      timeout: 10000,
    });
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewport({ width: 1920, height: bodyHeight });

    const data = await page.evaluate(() => {
      return JSON.stringify(document.getElementsByTagName("body")[0].innerText);
    });

    let date = Date.now();   
        
    let taskIdPath = urls[i].image;
    taskIdPath = taskIdPath.match(/(http:\/\/localhost:3000\/static\/images\/)(.*)(\/.*\/screenshot\.png.*)/)[2];

    const newPath = path.join(
        __dirname,
        `../database/${taskIdPath}/${date}`
    );

    try {
      if (!fs.existsSync(newPath)) {
        const path = newPath;
  
        fs.mkdirSync(path);
        fs.writeFileSync(`${path}/text.txt`, data, function (err) {
          if (err) return console.log(err);
        });
  
        await page.screenshot({
          path: `${path}/screenshot.png`,
          fullPage: true,
        });

        let length = fs.readFileSync(`${path}/text.txt`, "utf8").length;

        let result = {
          "num": urls[i].scan[urls[i].scan.length - 1].num + 1,
          "time": `${date}`,
          "image": `http://localhost:3000/static/images/${taskIdPath}/${date}/screenshot.png`,
          "text": `http://localhost:3000/static/images/${taskIdPath}/${date}/text.txt`,
          "length": length
          
        }        

        urls[i].scan.push(result);

      }
      await browser.close();      
    } catch (err) {
      await browser.close();
  
      console.error(err);
    }
  }

  return urls;

}

router.get("/api/cronpage", async (req, res) => {
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1920, height: 1 });
  await page.goto(req.query.url, {
    waitUntil: "networkidle0",
    timeout: 10000,
  });

  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewport({ width: 1920, height: bodyHeight });

  const data = await page.evaluate(() => {
    return JSON.stringify(document.getElementsByTagName("body")[0].innerText);
  });

  let date = Date.now();

  let taskId = shortId.generate();

  const newPath = path.join(
    __dirname,
    `../database/${req.user.id}/userdata/${taskId}/${date}${time}`
  );

  const pathThumbnail = path.join(
    __dirname,
    `../database/${req.user.id}/userdata/${taskId}`
  );

  try {
    if (!fs.existsSync(newPath)) {
      const path = newPath;

      fs.mkdirSync(path);
      fs.writeFileSync(`${path}/text.txt`, data, function (err) {
        if (err) return console.log(err);
      });

      await page.screenshot({
        path: `${path}/screenshot.png`,
        fullPage: true,
      });

      await page.setViewport({ width: 1366, height: 768 });

      await page.screenshot({
        path: `${pathThumbnail}/thumbnail.jpg`,
      });

      res.status(200).json({
        image: `http://localhost:3000/static/images/${req.user.id}/userdata/${taskId}/${date}/screenshot.png`,
        id: taskId,
        thumbnail: `http://localhost:3000/static/images/${req.user.id}/userdata/${taskId}/thumbnail.jpg`,
        datetime: `${date}`,
        folder: `${date}`,
      });
      await browser.close();
    }
  } catch (err) {
    await browser.close();
    res.sendStatus(500);
    console.error(err);
  }
});

let job = new CronJob(
  '*/30 * * * *',
  async function () {
    const response = await fetch('http://localhost:3000/api/cron');
    const body = await response.text();
    
    console.log(body);    
  },
  null,
  true,
  'Europe/Moscow'
);

router.post('/api/pixelmatch', async (req, res) => {
  const pathUser = req.body.image1.match(/(http:\/\/localhost:3000\/static\/images\/)(.*)(\/.*\/screenshot\.png.*)/)[2];

  const imageArray = {
    image1: req.body.image1.match(/(http:\/\/localhost:3000\/static\/images\/)(.*)/)[2],
    image2: req.body.image2.match(/(http:\/\/localhost:3000\/static\/images\/)(.*)/)[2],
  }

  const img1 = PNG.sync.read(fs.readFileSync(path.join(
    __dirname,
    `../database/${imageArray.image1}`
  )));

  const img2 = PNG.sync.read(fs.readFileSync(path.join(
    __dirname,
    `../database/${imageArray.image2}`
  )));

  const {width, height} = img1;
  const diff = new PNG({width, height});



  pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: true,
    diffColorAlt: [0, 95, 117],
    diffMask: true
  });

  fs.writeFileSync((path.join(
    __dirname,
    `../database/${pathUser}/layer.png`
  )), PNG.sync.write(diff));

  await sharp(path.join(__dirname, `../database/${imageArray.image1}`))
  .composite([{input: (path.join(__dirname, `../database/${pathUser}/layer.png`))}])
  .toFile((path.join(__dirname, `../database/${pathUser}/diff.png`)));
  
  res.status(200).json({
    image1: req.body.image1,
    image2: `http://localhost:3000/static/images/${pathUser}/diff.png?v=${shortId.generate()}`
  });
})

router.post("/api/textdiff", statusAuth, (req, res) => {

  const textPrev = req.body.text1.match(/(http:\/\/localhost:3000\/static\/images\/)(.*)(\/text\.txt.*)/)[2];
  const textNext = req.body.text2.match(/(http:\/\/localhost:3000\/static\/images\/)(.*)(\/text\.txt.*)/)[2];

  const text1 = fs.readFileSync(path.join(
    __dirname,
    `../database/${textPrev}/text.txt`
  ), "utf8");

  const text2 = fs.readFileSync(path.join(
    __dirname,
    `../database/${textNext}/text.txt`
  ), "utf8");


  const dmp = new DiffMatchPatch();
  const diff = dmp.diff_main(text1.replace(/\\n/gm," "), text2.replace(/\\n/gm," "));

  dmp.diff_cleanupSemantic(diff);

  const text = dmp.diff_prettyHtml(diff);

  res.status(200).json({text});
}) 


module.exports = router;