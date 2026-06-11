import { testdata } from "./testdata";
import { test as base } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/:3000\/folders(\?.*)?$/, async (route) => {
      const json = testdata.folders;
      await route.fulfill({ json });
    });

    testdata.notes.forEach(async (note) => {
      const regex = new RegExp(`:3000/notes/${note.id}`);
      await page.route(regex, async (route) => {
        await route.fulfill({ json: note });
      });
    });

    testdata.folders.forEach(async (folder) => {
      const regex = new RegExp(`:3000/notes\\?folderId=${folder.id}`);
      await page.route(regex, async (route) => {
        const json = testdata.notes.filter(
          (note) => note.folderId === folder.id
        );
        await route.fulfill({ json });
      });
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);
  },
});

export { expect } from "@playwright/test";
