import { expect, test } from "./fixture";

test.describe("General", () => {
  test("should display the home page", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Verify the page title is visible
    await expect(page.locator("h1")).toContainText("Kanban Board");
  });
});
