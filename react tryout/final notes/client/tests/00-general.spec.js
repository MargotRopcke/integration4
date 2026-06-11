import { expect, test } from "./fixture";

test.describe("General", () => {
  test("should display the notes page", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Verify the page title is visible
    await expect(page.locator("h1")).toContainText("NotePad");
  });

  test("should be able to switch between light and dark mode", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the dark mode button
    await page.getByRole("button", { name: "Toggle dark mode" }).click();

    // Verify the dark mode is enabled
    await expect(page.locator(".app")).toHaveClass(/app--dark/);

    // Click on the dark mode button
    await page.getByRole("button", { name: "Toggle dark mode" }).click();

    // Verify the light mode is enabled
    await expect(page.locator(".app")).not.toHaveClass(/app--dark/);
  });
});
