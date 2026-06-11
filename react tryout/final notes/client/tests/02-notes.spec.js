import { expect, test } from "./fixture";
import { newNote, testdata } from "./testdata";

test.describe("Notes nav", () => {
  test("should be able to see notes when selecting folder", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    for (
      let folderIndex = 0;
      folderIndex < testdata.folders.length;
      folderIndex++
    ) {
      // Click on the first folder
      await page
        .getByTestId("folder-list")
        .getByRole("listitem")
        .nth(folderIndex)
        .click();

      // Verify the first folder is selected
      await expect(
        page.getByTestId("note-list").getByRole("listitem")
      ).toHaveCount(
        testdata.notes.filter(
          (note) => note.folderId === testdata.folders[folderIndex].id
        ).length
      );

      await expect(
        page
          .getByTestId("note-list")
          .getByRole("listitem")
          .first()
          .locator("a div")
          .first()
      ).toHaveText(
        `📝${
          testdata.notes.filter(
            (note) => note.folderId === testdata.folders[folderIndex].id
          )[0].title
        }`
      );
    }
  });

  test("should highlight the active note when selecting it", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the first folder
    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    // Click on the first note
    await page.getByTestId("note-list").getByRole("listitem").first().click();

    // Verify the first folder is selected
    await expect(
      page
        .getByTestId("note-list")
        .getByRole("listitem")
        .first()
        .getByRole("link")
    ).toHaveClass(/active/);
  });

  test("should update the url when selecting a note", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    // Click on the first folder
    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    // Click on the first note
    await page.getByTestId("note-list").getByRole("listitem").first().click();

    const firstNote = testdata.notes.filter(
      (note) => note.folderId === testdata.folders[0].id
    )[0];
    const regex = new RegExp(`${firstNote.folderId}/${firstNote.id}`);
    await expect(page).toHaveURL(regex);
  });

  test("should display an empty state when no notes are present in a folder", async ({
    page,
  }) => {
    await page.route(/:3000\/folders(\?.*)?$/, async (route) => {
      route.fulfill({
        json: [{ id: "99", name: "Empty folder" }],
      });
    });

    const regex = new RegExp(`:3000/notes\\?folderId=99`);
    await page.route(regex, async (route) => {
      const json = [];
      await route.fulfill({ json });
    });

    // Navigate to the home page
    await page.goto("/");

    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

    await expect(page.getByTestId("empty-notes")).toBeTruthy();
  });

  test("should display an empty state when no note is selected", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    await expect(
      page.getByRole("heading", { name: "No Note Selected" })
    ).toBeVisible();
  });
});

test.describe("Note creation", () => {
  test("should be able to create a new note", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the first folder
    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    // Click on the new note button
    await page
      .locator("div")
      .filter({ hasText: /^Notes\+ New$/ })
      .getByRole("button")
      .click();

    // Type the new note name
    await page.getByPlaceholder("Note title").fill(newNote.title);

    page.route(/:3000\/notes(\?.*)?$/, async (route) => {
      route.fulfill({
        json: [
          ...testdata.notes.filter(
            (note) => note.folderId === testdata.folders[0].id
          ),
        ],
      });
    });

    const regex = new RegExp(`3000/notes\\?folderId=${testdata.folders[0].id}`);
    page.route(regex, async (route) => {
      route.fulfill({
        json: [
          ...testdata.notes.filter(
            (note) => note.folderId === testdata.folders[0].id
          ),
          { id: newNote.id, title: newNote.title, content: "" },
        ],
      });
    });

    // Press Enter to create the note
    await page.keyboard.press("Enter");

    // Verify the new folder is created
    await expect(
      page
        .getByTestId("note-list")
        .getByRole("listitem")
        .last()
        .locator("a div")
        .first()
    ).toHaveText(`📝${newNote.title}`);
  });

  test("should be able to cancel creation of new folder", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the first folder
    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    // Click on the new note button
    await page
      .locator("div")
      .filter({ hasText: /^Notes\+ New$/ })
      .getByRole("button")
      .click();

    // Type the new folder name
    await page.getByPlaceholder("Note title").fill(newNote.title);

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(
      page
        .locator("div")
        .filter({ hasText: /^Notes\+ New$/ })
        .getByRole("button")
    ).toBeVisible();

    await expect(
      page.getByTestId("note-list").getByRole("listitem").last()
    ).not.toHaveText(newNote.title);
  });
});

test.describe("Notes", () => {
  test("should show the note content when selecting a note", async ({
    page,
  }) => {
    // Navigate to the home page
    await page.goto("/");

    // Click on the first folder
    await page.getByTestId("folder-list").getByRole("listitem").first().click();

    // Click on the first note
    await page.getByTestId("note-list").getByRole("listitem").first().click();

    const firstNote = testdata.notes[0];

    await expect(
      page.getByRole("heading", { name: firstNote.title })
    ).toBeVisible();

    await expect(
      page.getByRole("textbox", { name: "Start writing..." })
    ).toHaveText(firstNote.content);
  });

  test("should be able to navigate to a note", async ({ page }) => {
    // Navigate to the home page
    await page.goto(`/${testdata.notes[0].folderId}/${testdata.notes[0].id}`);

    const firstNote = testdata.notes[0];

    await expect(
      page.getByRole("heading", { name: firstNote.title })
    ).toBeVisible();

    await expect(
      page.getByRole("textbox", { name: "Start writing..." })
    ).toHaveText(firstNote.content);
  });

  test("should be able to edit a note", async ({ page }) => {
    // Navigate to the home page
    await page.goto(`/${testdata.notes[0].folderId}/${testdata.notes[0].id}`);

    const updateText = "This is a new content";

    const regexFolder = new RegExp(
      `:3000/notes\\?folderId=${testdata.notes[0].folderId}`
    );

    await page.route(regexFolder, async (route) => {
      const json = testdata.notes.map((note) => {
        if (note.id === testdata.notes[0].id) {
          return { ...note, content: updateText };
        }
        return note;
      });
      await route.fulfill({ json });
    });

    const regexNote = new RegExp(`3000/notes/${testdata.notes[0].id}`);
    page.route(regexNote, async (route) => {
      const note = testdata.notes.find(
        (note) => note.id === testdata.notes[0].id
      );
      const json = { ...note, content: updateText };
      await route.fulfill({ json });
    });

    // Type in the editor
    await page
      .getByRole("textbox", { name: "Start writing..." })
      .fill(updateText);

    await page.getByRole("heading", { name: "Notes" }).click();

    await expect(
      page.getByRole("textbox", { name: "Start writing..." })
    ).toHaveText(updateText);

    await page.getByTestId("note-list").getByRole("listitem").nth(1).click();
    await page.getByTestId("note-list").getByRole("listitem").first().click();

    await expect(
      page.getByRole("textbox", { name: "Start writing..." })
    ).toHaveText(updateText);
  });
});
