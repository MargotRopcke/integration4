// @ts-check
import { test, expect } from "@playwright/test";

const lastName = "Testman";

test("has title", async ({ page }) => {
  await page.goto("/");
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/React Router Contacts/);
});

test("has a docs link", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "the docs at reactrouter.com" })
  ).toBeVisible();
});

test("can create a contact", async ({ page }) => {
  const contactName = `Create-${test.info().workerIndex}`;
  await createContact(page, contactName);

  await page.getByRole("searchbox", { name: "Search contacts" }).click();
  await page
    .getByRole("searchbox", { name: "Search contacts" })
    .fill(contactName);
  // check if the contact is somewhere in the list
  await expect(page.locator("nav a")).toContainText([contactName]);

  await deleteContact(page, contactName);
});

test("can view a contact", async ({ page }) => {
  const contactName = `View-${test.info().workerIndex}`;
  await createContact(page, contactName);
  await page.getByRole("link", { name: `${contactName} ${lastName}` }).click();
  await expect(
    page.getByRole("heading", { name: `${contactName} ${lastName}` })
  ).toBeVisible();

  await deleteContact(page, contactName);
});

test("can delete a contact", async ({ page }) => {
  const contactName = `Delete-${test.info().workerIndex}`;
  await createContact(page, contactName);
  await expect(page.locator("nav a")).toContainText([
    `${contactName} ${lastName}`,
  ]);

  await deleteContact(page, contactName);
  await expect(page.locator("nav a")).not.toContainText([
    `${contactName} ${lastName}`,
  ]);
});

test("can edit a contact", async ({ page }) => {
  const contactName = `Edit-${test.info().workerIndex}`;
  await createContact(page, contactName);

  await page.getByRole("link", { name: `${contactName} ${lastName}` }).click();
  await page.getByRole("button", { name: "Edit" }).click();

  // Fill out the form
  await page.getByLabel("First Name").fill(`${contactName}-edited`);
  await page.getByLabel("Twitter").fill("@johndoe-edited");
  await page
    .getByRole("textbox", { name: "Avatar URL" })
    .fill("https://i.pravatar.cc/200?img=2");
  await page.getByLabel("Notes").fill("This is a note. - edited");

  // Submit the form
  await page.getByRole("button", { name: "Save" }).press("Enter");

  // (remix) redirect & playwright hack...
  await page
    .getByRole("heading", {
      name: `${contactName}-edited ${lastName}`,
    })
    .click();

  await page.getByRole("searchbox", { name: "Search contacts" }).click();
  await page
    .getByRole("searchbox", { name: "Search contacts" })
    .fill(`${contactName}-edited`);

  // check if the contact is somewhere in the list
  await expect(page.locator("nav a")).toContainText([`${contactName}-edited`]);

  await deleteContact(page, `${contactName}-edited`);
});

test("can (de)favorite a contact", async ({ page }) => {
  const contactName = `Favorite-${test.info().workerIndex}`;
  await createContact(page, contactName);
  await page.getByRole("link", { name: `${contactName} ${lastName}` }).first().click();
  await expect(
    page.getByRole("button", { name: "Add to favorites" })
  ).toHaveAttribute("value", "true");
  await page.getByRole("button", { name: "Add to favorites" }).click();
  await expect(
    page.getByRole("button", { name: "Remove from favorites" })
  ).toHaveAttribute("value", "false");
  await page.getByRole("button", { name: "Remove from favorites" }).click();
  await expect(
    page.getByRole("button", { name: "Add to favorites" })
  ).toHaveAttribute("value", "true");

  await deleteContact(page, contactName);
});

test("can search for a contact", async ({ page }) => {
  const contactName = `Search-${test.info().workerIndex}`;
  await createContact(page, contactName);
  await page.getByRole("searchbox", { name: "Search contacts" }).click();
  await page
    .getByRole("searchbox", { name: "Search contacts" })
    .fill(contactName);
  // check if the contact is somewhere in the list
  await expect(page.locator("nav a")).toContainText([contactName]);

  await deleteContact(page, contactName);
});

test("can do an url search", async ({ page }) => {
  const contactName = `URLSearch-${test.info().workerIndex}`;
  await createContact(page, contactName);
  await page.goto(`/?q=${contactName}`);
  // check if the contact is somewhere in the list
  await expect(page.locator("nav a")).toContainText([contactName]);
  await deleteContact(page, contactName);
});

test("can cancel editing a contact", async ({ page }) => {
  const contactName = `Cancel-${test.info().workerIndex}`;
  await createContact(page, contactName);
  await page.getByRole("link", { name: `${contactName} ${lastName}` }).click();
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: `${contactName} ${lastName}` })
  ).toBeVisible();
  await deleteContact(page, contactName);
});

const createContact = async (page, contactName) => {
  await page.goto("/");

  await page.getByRole("button", { name: `New` }).click();

  // Fill out the form
  await page.getByLabel("First Name").fill(contactName);
  await page.getByLabel("Last Name").fill(lastName);
  await page.getByLabel("Twitter").fill("@johndoe");
  await page
    .getByRole("textbox", { name: "Avatar URL" })
    .fill("https://i.pravatar.cc/200?img=1");
  await page.getByLabel("Notes").fill("This is a note.");

  // Submit the form
  await page.getByRole("button", { name: "Save" }).click();

  // (remix) redirect & playwright hack...
  await page
    .getByRole("heading", {
      name: `${contactName} ${lastName}`,
    })
    .click();
};

const deleteContact = async (page, contactName) => {
  await page.goto("/");

  await page.getByRole("link", { name: `${contactName} ${lastName}` }).first().click();
  page.once("dialog", (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.accept().catch(() => {});
  });
  await page.getByRole("button", { name: "Delete" }).click();

  // (remix) redirect & playwright hack...
  await page.getByRole("link", { name: "the docs at reactrouter.com" });
};
