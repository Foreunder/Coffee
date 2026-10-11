// Foreunder Coffee House menu data.
// Claude keeps this file current. Status values: "bar" (on the bar), "press" (French press only), "out" (finished).
window.FOREUNDER = {
  siteUrl: "https://foreunder.github.io/Coffee/menu/",
  // Orders are relayed through ntfy.sh on this topic. Anyone who knows the topic name can read it,
  // so it is long and random. Install the ntfy app and subscribe to it for phone alerts.
  ntfyTopic: "foreunder-bar-q7m4x2k9vz",
  minutesPerDrink: 4,
  decafNote: "No decaf right now. Ask Jamey and he'll sort you out.",

  beans: [
    {
      id: "rockbrook",
      status: "bar",
      name: "Rockbrook Espresso",
      roaster: "A Hill of Beans Coffee Roasters",
      roasterCity: "Omaha, NE",
      type: "Espresso blend",
      origin: "Blend",
      process: "Blended",
      roastLevel: "Medium-dark",
      roastDate: "2026-09-22",
      roastNote: "Roasted daily; purchase date used",
      opened: "2026-09-22",
      bestFor: ["Espresso", "Milk drinks"],
      expect: "A classic Northern Italian-style blend built for espresso and milk. Rich and rounded, low in acidity, and comfortable under a lot of milk.",
      take: "The house espresso. Balanced straight, neither sour nor bitter, and the one I reach for most.",
      scale: { body: 4, acidity: 1, roast: 4 },
      recipe: "18 g in · 36 g out · about 24–28 s"
    },
    {
      id: "malabar",
      status: "bar",
      name: "India Monsooned Malabar",
      roaster: "A Hill of Beans Coffee Roasters",
      roasterCity: "Omaha, NE",
      type: "Single origin",
      origin: "India · Chikmagalur",
      process: "Monsooned",
      roastLevel: "Medium",
      roastDate: "2026-09-22",
      roastNote: "Roasted daily; purchase date used",
      opened: "2026-09-22",
      bestFor: ["Espresso", "Mochas", "Milk drinks"],
      expect: "Green coffee left open to the monsoon winds on India's Malabar coast, which swells the beans and strips out acidity. Expect a heavy, syrupy body with earthy, spiced and nutty notes. FTCO certified.",
      take: "Thick and full of flavor, with real nuttiness. Outstanding in a mocha.",
      scale: { body: 5, acidity: 1, roast: 3 },
      recipe: "18 g in · 36 g out · about 28 s"
    },
    {
      id: "colombia",
      status: "press",
      name: "Colombia",
      roaster: "Stories Coffee Co.",
      roasterCity: "Omaha, NE",
      type: "Single origin",
      origin: "Colombia",
      process: null,
      roastLevel: "Medium",
      roastDate: "2026-08-12",
      opened: "2026-09-21",
      bestFor: ["French press"],
      roasterNotes: "Peanut butter, orange, cocoa, fresh pastry",
      expect: "A friendly, sweet Colombian. Past its espresso peak, so it now goes in the French press, where it still makes a round, cocoa-forward cup.",
      take: "My weekend French press coffee.",
      scale: { body: 3, acidity: 2, roast: 3 },
      recipe: "30 g to 450 g water · 4 min steep"
    },
    {
      id: "stories-espresso",
      status: "out",
      name: "Espresso Blend",
      roaster: "Stories Coffee Co.",
      roasterCity: "Omaha, NE",
      type: "Espresso blend",
      origin: "Blend",
      roastLevel: "Medium",
      roastDate: "2026-08-25",
      roasterNotes: "Bakers chocolate, nutty, caramel, peanut butter",
      take: "Finished Oct 10. A good chocolatey starter blend.",
      scale: { body: 3, acidity: 2, roast: 3 }
    }
  ],

  // uses: "espresso" drinks can use any bean on the bar; "press" uses French press beans; "none" has no coffee.
  drinks: [
    { id: "espresso", name: "Espresso", uses: "espresso", milk: false, iced: false, line: "Double shot · 2 oz", note: "Straight up, the purest way to taste the bean." },
    { id: "americano", name: "Americano", uses: "espresso", milk: false, iced: true, line: "Double shot · hot water", note: "Long and clean, about 6 oz." },
    { id: "fairway", name: "The Fairway", uses: "espresso", milk: false, iced: false, line: "Double shot · hot water · steamed cream cap", note: "The everyday go-to. A long Americano finished with a rich cap of steamed cream. About 10 oz." },
    { id: "cortado", name: "Cortado", uses: "espresso", milk: true, iced: false, line: "Double shot · equal milk", note: "Small and strong, softened with a little steamed milk." },
    { id: "cappuccino", name: "Cappuccino", uses: "espresso", milk: true, iced: false, line: "Double shot · airy foam", note: "Thick cap of foam over a strong double, about 6 oz." },
    { id: "flatwhite", name: "Flat White", uses: "espresso", milk: true, iced: false, line: "Double shot · silky milk", note: "The house favorite. Velvety, about 6 oz." },
    { id: "latte", name: "Latte", uses: "espresso", milk: true, iced: true, line: "Double shot · steamed milk", note: "Milder and milkier, about 10 oz." },
    { id: "mocha", name: "Mocha", uses: "espresso", milk: true, iced: false, chocolate: true, line: "Double shot · dark chocolate · milk", note: "Real dark chocolate melted in, no sugar added." },
    { id: "press", name: "French Press", uses: "press", milk: false, iced: false, line: "Full immersion · serves two", note: "Full-bodied and slow. Takes about 6 minutes." },
    { id: "hotchoc", tv: false, name: "Hot Chocolate", uses: "none", milk: true, iced: false, chocolate: true, line: "Dark chocolate · steamed milk", note: "No coffee. Rich, not sweet." }
  ],

  milks: ["Half & half", "Whole milk", "Oat milk"],
  chocolates: ["70% dark", "78% extra dark"]
};
