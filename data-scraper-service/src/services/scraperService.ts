const { Builder, By, until } = require("selenium-webdriver");

const delay = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));

export const scrapeLinkedInProfile = async (profileUrl: string) => {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    console.log("Logging into LinkedIn...");

    await driver.get("https://www.linkedin.com/login");
    await driver.executeScript(
      "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    );

    await driver
      .findElement(By.id("username"))
      .sendKeys("your-email@example.com");
    await driver.findElement(By.id("password")).sendKeys("your-password");
    await driver.findElement(By.css("[type='submit']")).click();

    await driver.wait(until.urlContains("feed"), 10000);
    console.log("Logged in successfully!");

    await delay(5000);
    console.log(`Navigating to profile: ${profileUrl}`);
    await driver.get(profileUrl);

    await driver.wait(
      until.elementLocated(By.css("h1.text-heading-xlarge")),
      10000
    );
    await delay(5000);

    const name = await driver
      .findElement(By.css("h1.text-heading-xlarge"))
      .getText();
    const headline = await driver
      .findElement(By.css("div.text-body-medium"))
      .getText();
    const location = await driver
      .findElement(By.css("span.text-body-small.inline"))
      .getText();

    let experiences = await driver.findElements(
      By.css("div.pvs-entity__summary-info")
    );
    let experienceList = [];
    for (let exp of experiences) {
      let text = await exp.getText();
      experienceList.push(text);
    }

    await delay(5000);
    let educations = await driver.findElements(By.css("span.t-bold"));
    let educationList = [];
    for (let edu of educations) {
      let text = await edu.getText();
      educationList.push(text);
    }

    console.log("\nProfile Data Extracted:");
    console.log(`Name: ${name}`);
    console.log(`Headline: ${headline}`);
    console.log(`Location: ${location}`);
    console.log(`Experience:`, experienceList);
    console.log(`Education:`, educationList);

    return { name, headline, location, experienceList, educationList };
  } catch (error) {
    console.error("Error scraping LinkedIn:", error);
    return null;
  } finally {
    await driver.quit();
  }
};
