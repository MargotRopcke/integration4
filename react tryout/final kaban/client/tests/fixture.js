import { testdata } from "./testdata";
import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(
      new RegExp(`:3000/lanes\\?_embed=cards`),
      async (route) => {
        const lanes = testdata.lanes;
        const lanesWithCards = lanes.map((lane) => {
          const cards = testdata.cards.filter(
            (card) => card.laneId === lane.id
          );
          return { ...lane, cards };
        });

        await route.fulfill({ json: lanesWithCards });
      }
    );

    testdata.cards.forEach(async (card) => {
      await page.route(new RegExp(`:3000/cards/${card.id}`), async (route) => {
        await route.fulfill({ json: card });
      });
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from "@playwright/test";
