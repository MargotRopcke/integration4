import { expect, test } from "./fixture";
import { newFolder, testdata } from "./testdata";

test.describe("Folders nav", () => {
  test("should display the folders in the first sidebar", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Verify the page title is visible
    await expect(
      page.getByTestId("folder-list").getByRole("listitem")
    ).toHaveCount(2);
  });

  test("should highlight the active folder when selecting it", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the first folder
    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    // Verify the first folder is selected
    await expect(
      page
        .getByTestId("folder-list")
        .getByRole("listitem")
        .first()
        .getByRole("link")
    ).toHaveClass(/active/);
  });

  test("should update the url when selecting a folder", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    // Click on the first folder
    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    const regex = new RegExp(`/${testdata.folders[0].id}`);
    await expect(page).toHaveURL(regex);
  });

  test("should be able to navigate to a folder", async ({ page }) => {
    const firstFolder = testdata.folders[0];

    await page.goto(`/${firstFolder.id}`);

    // Verify the first folder is selected
    await expect(
      page
        .getByTestId("folder-list")
        .getByRole("listitem")
        .first()
        .getByRole("link")
    ).toHaveClass(/active/);
  });

  test("should display an empty state when no folders are present", async ({
    page,
  }) => {
    await page.route(/:3000\/folders(\?.*)?$/, async (route) => {
      route.fulfill({
        json: [],
      });
    });

    // Navigate to the home page
    await page.goto("/");

    await expect(page.getByRole("link", { name: "NotePad" })).toBeVisible();

    await expect(page.getByTestId("empty-folders")).toBeTruthy();
  });

  test("should display an empty state when no folder is selected", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "No Folder Selected" })
    ).toBeVisible();
  });
});

test.describe("Folder creation", () => {
  test("should be able to create a new folder", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the new folder button
    await page
      .locator("div")
      .filter({ hasText: /^Folders\+ New$/ })
      .getByRole("button")
      .click();

    // Type the new folder name
    await page.getByPlaceholder("Folder name").fill(newFolder.name);

    page.route(/:3000\/folders(\?.*)?$/, async (route) => {
      route.fulfill({
        json: [...testdata.folders, { id: "f3", name: newFolder.name }],
      });
    });

    // Press Enter to create the folder
    await page.keyboard.press("Enter");

    // Verify the new folder is created
    await expect(
      page.getByTestId("folder-list").getByRole("listitem").last()
    ).toHaveText(`📁${newFolder.name}`);
  });

  test("should be able to cancel creation of new folder", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the new folder button
    await page
      .locator("div")
      .filter({ hasText: /^Folders\+ New$/ })
      .getByRole("button")
      .click();

    // Type the new folder name
    await page.getByPlaceholder("Folder name").fill(newFolder.name);

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(
      page
        .locator("div")
        .filter({ hasText: /^Folders\+ New$/ })
        .getByRole("button")
    ).toBeVisible();

    await expect(
      page.getByTestId("folder-list").getByRole("listitem").last()
    ).not.toHaveText(newFolder.name);
  });
});
