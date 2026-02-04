/*
  Usage: node scripts/record_demo.js
  - Requires dev server running at http://localhost:5173
  - Output: client/public/assets/demo.gif
*/
const fs = require("fs");
const path = require("path");
const http = require("http");
const { promisify } = require("util");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const tmpLogin = require("../../tmp_login.json");

(async () => {
  // Lazy require to ensure packages installed
  const puppeteer = require("puppeteer");
  const GIFEncoder = require("gif-encoder-2");
  const { PNG } = require("pngjs");

  const DURATION_SEC = 5;
  const FPS = 15;
  const FRAMES = DURATION_SEC * FPS;
  const WIDTH = 800;
  const HEIGHT = 360;
  const OUT = path.join(__dirname, "..", "public", "assets", "demo.gif");

  // Wait for server (try multiple common vite ports)
  const PORTS = [5173, 5174, 5175, 3000, 5177];
  let baseUrl = null;
  const waitForServer = async (timeout = 30000) => {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const p of PORTS) {
        const url = `http://localhost:${p}/`;
        try {
          await new Promise((resolve, reject) => {
            const req = http.get(url, (res) => {
              res.resume();
              resolve();
            });
            req.on("error", reject);
          });
          baseUrl = `http://localhost:${p}`;
          return;
        } catch (e) {
          // continue
        }
      }
      await wait(500);
    }
    throw new Error("Dev server did not respond in time");
  };

  console.log("Waiting for dev server...");
  await waitForServer(60000);
  console.log("Dev server available at", baseUrl, "launching browser...");

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Forward browser console logs to Node terminal
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  await page.setViewport({ width: WIDTH, height: HEIGHT });

  try {

    // Request interception removed to use real backend

    // Navigate to login
    await page.goto(`${baseUrl}/#/login`, { waitUntil: "networkidle2" });

    // Inject demo cursor helper
    await page.evaluate(() => {
      const cursor = document.createElement("div");
      cursor.id = "demoCursor";
      cursor.style.position = "fixed";
      cursor.style.width = "14px";
      cursor.style.height = "14px";
      cursor.style.borderRadius = "50%";
      cursor.style.background = "#ffeb3b";
      cursor.style.boxShadow = "0 0 0 6px rgba(255,235,59,0.12)";
      cursor.style.zIndex = "99999";
      cursor.style.pointerEvents = "none";
      cursor.style.transform = "translate(-50%,-50%)";
      cursor.style.left = "0px";
      cursor.style.top = "0px";
      document.body.appendChild(cursor);
      window.moveDemoCursor = (x, y) => {
        const c = document.getElementById("demoCursor");
        if (c) {
          c.style.left = x + "px";
          c.style.top = y + "px";
        }
      };
      window.hideDemoCursor = () => {
        const c = document.getElementById("demoCursor");
        if (c) c.style.display = "none";
      };
    });

    // Simulate login by setting persisted auth state to avoid depending on backend
    await page.evaluate((tmp) => {
      const stub = {
        state: {
          user: { username: tmp.username },
          token: "demo-token",
          isAuthenticated: true,
        },
      };
      localStorage.setItem("auth_storage", JSON.stringify(stub));
      localStorage.setItem("auth_token", "demo-token");
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ username: tmp.username }),
      );
    }, tmpLogin);

    // Navigate to root then set hash to /camping to ensure HashRouter picks it up
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle2" });
    await page.evaluate(() => (location.hash = "#/camping"));
    await wait(500);
    await page.waitForSelector(".camp-card", { timeout: 30000 });

    console.log("On camping list. Preparing frames...");

    // Inject demo cursor helper
    await page.evaluate(() => {
      const cursor = document.createElement("div");
      cursor.id = "demoCursor";
      cursor.style.position = "fixed";
      cursor.style.width = "14px";
      cursor.style.height = "14px";
      cursor.style.borderRadius = "50%";
      cursor.style.background = "#ffeb3b";
      cursor.style.boxShadow = "0 0 0 6px rgba(255,235,59,0.12)";
      cursor.style.zIndex = "99999";
      cursor.style.pointerEvents = "none";
      cursor.style.transform = "translate(-50%,-50%)";
      cursor.style.left = "0px";
      cursor.style.top = "0px";
      document.body.appendChild(cursor);
      window.moveDemoCursor = (x, y) => {
        const c = document.getElementById("demoCursor");
        if (c) {
          c.style.left = x + "px";
          c.style.top = y + "px";
        }
      };
      window.hideDemoCursor = () => {
        const c = document.getElementById("demoCursor");
        if (c) c.style.display = "none";
      };
    });

    // locate first card link and its center
    const cardInfo = await page.evaluate(() => {
      const card = document.querySelector(".camp-card");
      const link = card ? card.querySelector(".camp-name") : null;
      const rect = link ? link.getBoundingClientRect() : null;
      return rect
        ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
        : null;
    });

    // If no card found, just set a default click point
    const targetX = cardInfo ? cardInfo.x : WIDTH / 2;
    const targetY = cardInfo ? cardInfo.y : HEIGHT / 2;

    // Setup GIF encoder
    const encoder = new GIFEncoder(WIDTH, HEIGHT);
    const stream = fs.createWriteStream(OUT);
    encoder.createReadStream().pipe(stream);
    encoder.start();
    encoder.setRepeat(0); // loop
    encoder.setDelay(1000 / FPS);
    encoder.setQuality(10);

    // Capture frames with simple timeline
    for (let i = 0; i < FRAMES; i++) {
      const t = i / FRAMES; // 0..1

      if (t < 0.2) {
        // initial idle
        await page.evaluate(
          (x, y) => window.moveDemoCursor(x, y),
          80 + Math.sin(i) * 4,
          120,
        );
      } else if (t < 0.45) {
        // scroll down
        const scrollY = Math.floor(((t - 0.2) / 0.25) * 600);
        await page.evaluate(
          (s) => window.scrollTo({ top: s, behavior: "auto" }),
          scrollY,
        );
        await page.evaluate((x, y) => window.moveDemoCursor(x, y), 720, 120);
      } else if (t < 0.6) {
        // move cursor to and click first card
        const localT = (t - 0.45) / 0.15; // 0..1
        const cx = 720 + (targetX - 720) * localT;
        const cy = 120 + (targetY - 120) * localT;
        await page.evaluate((x, y) => window.moveDemoCursor(x, y), cx, cy);
        if (i === Math.floor(FRAMES * 0.55)) {
          await page.mouse.click(targetX, targetY);
          await page
            .waitForNavigation({ waitUntil: "networkidle2", timeout: 5000 })
            .catch(() => { });
        }
      } else {
        // on detail page, small pan
        await page.evaluate(
          (t) =>
            window.scrollTo({
              top: 80 + Math.sin(t * 6.28) * 40,
              behavior: "smooth",
            }),
          t,
        );
        await page.evaluate(
          (x, y) => window.moveDemoCursor(x, y),
          220 + Math.sin(i) * 6,
          60 + Math.cos(i) * 6,
        );
      }

      // ensure DOM updated
      await wait(30);
      const pngBuffer = await page.screenshot({ type: "png" });
      const png = PNG.sync.read(pngBuffer);
      encoder.addFrame(png.data);
    }

    encoder.finish();

  } catch (error) {
    console.error("Script failed:", error);
    await page.screenshot({ path: path.join(__dirname, "..", "public", "assets", "error_debug.png") });
    console.log("Saved error screenshot to client/public/assets/error_debug.png");
  }

  await browser.close();
  console.log("GIF recording complete:", OUT);
})();
