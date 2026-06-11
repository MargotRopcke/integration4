import { expect, test } from "./fixture";
import { newCard, testdata } from "./testdata";

test.describe("Navigation", () => {
  test("Should be able to see the details of a card", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    // Click on the first card
    await page.getByRole("list").first().getByRole("listitem").first().click();

    await expect(page.getByTestId("drawer")).toBeVisible();

    await expect(
      page
        .getByTestId("drawer")
        .getByRole("heading", { name: testdata.cards[0].title })
    ).toBeVisible();
    await expect(
      page.getByTestId("drawer").getByText(testdata.cards[0].description)
    ).toBeVisible();
  });

  test("should be able to navigate to the card details page", async ({
    page,
  }) => {
    await page.goto(`/${testdata.cards[0].id}`);
    await expect(page.getByTestId("drawer")).toBeVisible();

    await expect(
      page
        .getByTestId("drawer")
        .getByRole("heading", { name: testdata.cards[0].title })
    ).toBeVisible();
  });

  test("should be able to navigate to the card's edit page", async ({
    page,
  }) => {
    await page.goto(`/${testdata.cards[0].id}/edit`);
    await expect(page.getByTestId("drawer")).toBeVisible();

    await expect(
      page.getByTestId("drawer").getByRole("heading", { name: "Edit card" })
    ).toBeVisible();
    await expect(
      page.getByTestId("drawer").getByRole("textbox", { name: "Title" })
    ).toHaveValue(testdata.cards[0].title);
  });

  test("should be able to navigate back to the board", async ({ page }) => {
    await page.goto(`/${testdata.cards[0].id}`);
    await expect(page.getByTestId("drawer")).toBeVisible();

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    await page.getByRole("link", { name: "×" }).click();

    await expect(page.getByTestId("drawer")).not.toBeVisible();
    await expect(page.locator("h1")).toContainText("Kanban Board");
  });
});

test.describe("Actions", () => {
  test("Schould be able to edit a card", async ({ page }) => {
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    await page.getByRole("list").first().getByRole("listitem").first().click();

    await expect(page.getByTestId("drawer")).toBeVisible();
    await expect(
      page.getByTestId("drawer").getByText("PriorityLow")
    ).toBeVisible();

    await page.getByRole("link", { name: "Edit Card" }).click();

    const newTitle = "New title";
    const newDescription = "New description";
    const newPriority = "High";

    await page.getByRole("textbox", { name: "Title" }).fill(newTitle);
    await page
      .getByRole("textbox", { name: "Description" })
      .fill(newDescription);
    await page.getByTestId("priority-dropdown-button").click();
    await page
      .getByRole("listbox")
      .getByRole("option", { name: newPriority })
      .click();

    // Create a deep copy of the testdata to avoid mutating the original
    const lanes = [...testdata.lanes];

    // Create a copy of the cards array
    const modifiedCards = [...testdata.cards];

    // Find the first card of the first lane
    const firstLaneFirstCard = modifiedCards.find(
      (card) => card.laneId === lanes[0].id
    );

    // Update the card with new values
    const cardIndex = modifiedCards.findIndex(
      (card) => card.id === firstLaneFirstCard.id
    );
    modifiedCards[cardIndex] = {
      ...modifiedCards[cardIndex],
      title: newTitle,
      description: newDescription,
      priority: newPriority.toLowerCase(),
    };

    await page.route(
      new RegExp(`:3000/lanes\\?_embed=cards`),
      async (route) => {
        // Create lanesWithCards using the modified cards array
        const lanesWithCards = lanes.map((lane) => {
          const cards = modifiedCards.filter((card) => card.laneId === lane.id);
          return { ...lane, cards };
        });
        await route.fulfill({ json: lanesWithCards });
      }
    );

    await page.route(
      new RegExp(`:3000/cards/${firstLaneFirstCard.id}`),
      async (route) => {
        await route.fulfill({
          json: {
            ...modifiedCards[cardIndex],
            title: newTitle,
            description: newDescription,
            priority: newPriority.toLowerCase(),
          },
        });
      }
    );

    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page.locator("h1")).toContainText("Kanban Board");

    await expect(
      page
        .getByRole("list")
        .first()
        .getByRole("listitem")
        .getByRole("heading", { name: newTitle })
    ).toBeVisible();
    await expect(
      page
        .getByRole("list")
        .first()
        .getByRole("listitem")
        .getByText(newDescription)
    ).toBeVisible();

    await expect(
      page.getByTestId("drawer").getByRole("heading", { name: newTitle })
    ).toBeVisible();

    await expect(
      page.getByTestId("drawer").getByText(newDescription)
    ).toBeVisible();

    await expect(
      page.getByTestId("drawer").getByText(`Priority${newPriority}`)
    ).toBeVisible();
  });

  test("should be able to cancel editing a card", async ({ page }) => {
    await page.goto(`/${testdata.cards[0].id}/edit`);
    await expect(page.getByTestId("drawer")).toBeVisible();

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    await expect(
      page.getByTestId("drawer").getByRole("heading", { name: "Edit Card" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(
      page.getByTestId("drawer").getByRole("heading", { name: "Edit Card" })
    ).not.toBeVisible();
  });

  test("Should be able to create a card", async ({ page }) => {
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    await page.getByRole("link", { name: "+ Add a card" }).first().click();

    await expect(page.getByTestId("drawer")).toBeVisible();
    await expect(page.getByRole("heading", { name: "New card" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create Card" })
    ).toBeVisible();

    await page.getByRole("textbox", { name: "Title" }).fill(newCard.title);
    await page
      .getByRole("textbox", { name: "Description" })
      .fill(newCard.description);
    await page.getByTestId("priority-dropdown-button").click();
    await page
      .getByRole("listbox")
      .getByRole("option", { name: newCard.priority.toLowerCase() })
      .click();

    await page.route(
      new RegExp(`:3000/lanes\\?_embed=cards`),
      async (route) => {
        const lanes = testdata.lanes;
        const lanesWithCards = lanes.map((lane, index) => {
          const cards = testdata.cards.filter(
            (card) => card.laneId === lane.id
          );
          if (index === 0) {
            cards.push({
              ...newCard,
            });
          }
          return { ...lane, cards };
        });

        await route.fulfill({ json: lanesWithCards });
      }
    );

    await page.route(new RegExp(`:3000/cards`), async (route) => {
      await route.fulfill({ json: newCard });
    });

    await page.route(new RegExp(`:3000/cards/${newCard.id}`), async (route) => {
      await route.fulfill({ json: newCard });
    });

    await page
      .getByTestId("drawer")
      .getByRole("button", { name: "Create Card" })
      .click();

    await expect(page.locator("h1")).toContainText("Kanban Board");

    await expect(
      page
        .getByRole("list")
        .first()
        .getByRole("listitem")
        .getByRole("heading", { name: newCard.title })
    ).toBeVisible();
    await expect(
      page
        .getByRole("list")
        .first()
        .getByRole("listitem")
        .getByText(newCard.description)
    ).toBeVisible();

    await expect(page.getByTestId("drawer")).not.toBeVisible();
  });

  test("Should be able to cancel creating a card", async ({ page }) => {
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    await page.getByRole("link", { name: "+ Add a card" }).first().click();

    await expect(page.getByTestId("drawer")).toBeVisible();

    await expect(page.getByRole("heading", { name: "New card" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByTestId("drawer")).not.toBeVisible();
  });

  test("should be able to drag a card to an other lane", async ({ page }) => {
    // Navigate to the home page
    await page.goto("/");

    page.on("load", () => {
      throw new Error("Cannot accept a page refresh");
    });

    const nCardsCol1 = testdata.cards.filter(
      (card) => card.laneId === testdata.lanes[0].id
    ).length;

    const nCardsCol2 = testdata.cards.filter(
      (card) => card.laneId === testdata.lanes[1].id
    ).length;

    console.log(`nCardsCol1: ${nCardsCol1}, nCardsCol2: ${nCardsCol2}`);

    await expect(
      page.getByRole("list").first().getByRole("listitem")
    ).toHaveCount(nCardsCol1);

    await expect(
      page.getByRole("list").nth(1).getByRole("listitem")
    ).toHaveCount(nCardsCol2);

    const regex = new RegExp(`:3000/lanes\\?_embed=cards`);
    await page.route(regex, async (route) => {
      // Create a deep copy of the testdata to avoid mutating the original
      const lanes = [...testdata.lanes];

      // Create a copy of the cards array
      const modifiedCards = [...testdata.cards];

      // Find the second card of the first lane
      const firstLaneCards = modifiedCards.filter(
        (card) => card.laneId === lanes[0].id
      );

      if (firstLaneCards.length >= 2) {
        // Get the second card
        const secondCard = firstLaneCards[1];

        // Change its laneId to the second lane's id
        const cardIndex = modifiedCards.findIndex(
          (card) => card.id === secondCard.id
        );
        modifiedCards[cardIndex] = {
          ...modifiedCards[cardIndex],
          laneId: lanes[1].id,
        };
      }

      // Create lanesWithCards using the modified cards array
      const lanesWithCards = lanes.map((lane) => {
        const cards = modifiedCards.filter((card) => card.laneId === lane.id);
        return { ...lane, cards };
      });

      await route.fulfill({ json: lanesWithCards });
    });

    await page
      .getByRole("list")
      .first()
      .getByRole("listitem")
      .last()
      .dragTo(page.getByRole("list").nth(1));

    await expect(
      page.getByRole("list").first().getByRole("listitem")
    ).toHaveCount(nCardsCol1 - 1);

    await expect(
      page.getByRole("list").nth(1).getByRole("listitem")
    ).toHaveCount(nCardsCol2 + 1);
  });
});
