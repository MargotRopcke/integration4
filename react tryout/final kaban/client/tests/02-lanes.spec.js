import { expect, test } from "./fixture";
import { newLane, testdata } from "./testdata";

test.describe("Actions", () => {
  test("Schould be able to create a lane", async ({ page }) => {
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    await page.getByRole("button", { name: "+ Add Lane" }).click();
    await page
      .getByRole("textbox", { name: "Enter lane name" })
      .fill(newLane.title);

    await page.route(
      new RegExp(`:3000/lanes\\?_embed=cards`),
      async (route) => {
        const lanes = testdata.lanes;
        lanes.push(newLane);
        const lanesWithCards = lanes.map((lane) => {
          const cards = testdata.cards.filter(
            (card) => card.laneId === lane.id
          );
          return { ...lane, cards };
        });

        await route.fulfill({ json: lanesWithCards });
      }
    );

    await page.route(new RegExp(`:3000/lanes$`), async (route, req) => {
      if (req.method() !== "POST") {
        return route.continue();
      }
      await route.fulfill({ json: newLane });
    });

    await page.getByRole("button", { name: "Add Lane" }).click();

    await expect(page.getByText(newLane.title)).toBeVisible();
  });

  test("Should be able to cancel creating a lane", async ({ page }) => {
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    await page.getByRole("button", { name: "+ Add Lane" }).click();
    await page
      .getByRole("textbox", { name: "Enter lane name" })
      .fill(newLane.title);
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(
      page.getByRole("textbox", { name: "Enter lane name" })
    ).not.toBeVisible();
    await expect(page.getByText(newLane.title)).not.toBeVisible();
  });
});
