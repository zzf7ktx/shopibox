import puppeteer from "puppeteer";
import sharp from "sharp";

export const htmlToImage = async (htmlString: string) => {
  if (!htmlString) {
    return;
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(htmlString);
  const body = (await page.$("body")) ?? (await page.$("div"));

  if (!body) {
    await browser.close();
    return;
  }

  const buffer = await body.screenshot({ encoding: "binary" });

  await browser.close();

  return await sharp(buffer).toFormat("jpeg").toBuffer();
};
