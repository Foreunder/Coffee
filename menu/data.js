// Foreunder Coffee House menu data.
// Claude keeps this file current. Status values: "bar" (espresso, on hand), "press" (French press only), "out" (finished).
window.FOREUNDER = {
  siteUrl: "https://foreunder.github.io/Coffee/menu/",
  // Orders are relayed through ntfy.sh on this topic. Anyone who knows the topic name can read it,
  // so it is long and random. Install the ntfy app and subscribe to it for phone alerts.
  ntfyTopic: "foreunder-bar-q7m4x2k9vz",
  // Phone ordering, order screen and TV queue. Off: guests browse, Jamey serves the room.
  ordering: false,
  minutesPerDrink: 4,
  // Seasonal section heading. Swap the drinks marked section: "seasonal" when the season changes.
  season: { name: "Fall", sub: "Here for the season. Ask Jamey which one he's pouring." },
  decafNote: "No decaf right now. Ask Jamey and he'll sort you out.",

  beans: [
    {
      id: "rockbrook", score: 3, scoreNote: "The house espresso. Balanced and the one I reach for most.",
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
      recipe: "18 g in · 36 g out · about 28 s", dialNote: "Grind 13 to confirm on the GaggiMate (grind 14 ran 24 s on 10/10)."
    },
    {
      id: "malabar", score: 3, scoreNote: "Heavy, nutty and outstanding in a mocha.",
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
      recipe: "18 g in · 36 g out · about 27 s", dialNote: "Grind 7 on a warm machine; 7.5 if it runs fast."
    },
    {
      id: "colombia", score: 4, scoreNote: "Friendly and sweet; better in the press than as espresso.",
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
      recipe: "30 g · Timemore C3S 25 clicks · 450 g water · 4 min steep"
    },
    {
      id: "stories-espresso", score: 4, scoreNote: "A good chocolatey starter blend.",
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

  // uses: "espresso" drinks can use any on-hand espresso bean; "press" uses French press beans; "none" has no coffee.
  drinks: [
    { id: "espresso", name: "Espresso", photo: "photos/espresso.jpg", uses: "espresso", milk: false, iced: false, line: "Double shot · 2 oz", note: "Straight up, the purest way to taste the bean.", mine: true, cup: "Demitasse, preheated", how: ["Dose 18 g, pull to 36 g out (1:2) in about 26–30 s.", "Serve right away. Use the dial-in for whichever coffee is in the hopper (below)."] },
    { id: "macchiato", name: "Macchiato", uses: "espresso", milk: true, iced: false, line: "Double shot · spoon of foam", note: "Espresso marked with a spoonful of milk foam. Strong, short, a touch softer.", mine: false, cup: "Demitasse", how: ["Pull the double into a warm demitasse.", "Steam a small splash of whole milk with plenty of air.", "Spoon 1–2 teaspoons of the foam onto the center of the shot. No poured milk."] },
    { id: "americano", name: "Americano", uses: "espresso", milk: false, iced: true, line: "Double shot · hot water", note: "Long and clean, about 5 oz.", mine: true, cup: "6 oz cup", how: ["Pull the double.", "Add about 100 g (3.5 oz) hot water from GaggiMate water mode (80 °C). Water in the cup first keeps more crema."] },
    { id: "groundscrew", name: "The Grounds Crew", uses: "espresso", milk: false, iced: false, line: "Double shot · hot water · steamed cream cap", note: "The daily work drink. A long Americano finished with a rich cap of steamed cream. About 10 oz.", mine: true, cup: "12 oz cup", how: ["Pour about 6 oz hot water into the cup.", "Pull the double straight into the water.", "Steam about 3 oz full-fat heavy cream in the 12 oz pitcher (measure by volume) with a cappuccino-style stretch for a cap.", "Pour the cream last so it sits as a rich cap.", "Good use for beans past their espresso peak."] },
    { id: "cortado", name: "Cortado", uses: "espresso", milk: true, iced: false, line: "Double shot · equal milk", note: "Small and strong, softened with a little steamed milk.", mine: false, cup: "4–5 oz glass", how: ["Pull the double into the glass.", "Steam about 2 oz whole milk with very little foam (barely stretch).", "Pour in an equal amount to the espresso. Small and strong."] },
    { id: "cappuccino", name: "Cappuccino", uses: "espresso", milk: true, iced: false, line: "Double shot · airy foam", note: "Thick cap of foam over a strong double, about 6 oz.", mine: true, cup: "6 oz cup", how: ["Pull the double.", "Steam about 3 oz cold whole milk to about 150 °F. Stretch longer than a flat white for airy foam.", "Swirl, then pour so a thick cap of foam sits on top."] },
    { id: "flatwhite", name: "Flat White", photo: "photos/flatwhite.jpg", uses: "espresso", milk: true, iced: false, line: "Double shot · silky milk", note: "The house favorite. Velvety, about 6 oz.", mine: true, cup: "6 oz cup", how: ["Pull the double.", "Steam 3.5–4 oz whole milk (or half & half) with the single-hole tip. Short stretch: silky microfoam, minimal foam, 140–150 °F.", "Swirl until glossy and pour low for latte art."] },
    { id: "latte", name: "Latte", uses: "espresso", milk: true, iced: true, line: "Double shot · steamed milk", note: "Milder and milkier, about 10 oz.", mine: true, cup: "10–12 oz cup", how: ["Pull the double.", "Steam about 6 oz whole milk to 140–150 °F with a light stretch (about 4 oz if using half & half).", "Pour for latte art.", "Kayla's: oat milk, latte art pour."] },
    { id: "mocha", name: "Mocha", uses: "espresso", milk: true, iced: false, chocolate: true, line: "Double shot · dark chocolate · milk", note: "Real dark chocolate melted in, no sugar added.", mine: true, cup: "8 oz cup", how: ["Put about 1 oz dark chocolate in the cup: Lindt 78% or Ghirardelli 60%.", "Pull the double straight onto the chocolate and stir until it melts.", "Steam half & half and pour to about 6 oz total. No sugar.", "Malabar is the best bean for it."] },
    { id: "press", name: "French Press", uses: "press", milk: false, iced: false, line: "Full immersion · serves two", note: "Full-bodied and slow. Takes about 6 minutes.", mine: true, cup: "Bodum Chambord 17 oz", how: ["30 g Colombia on the Timemore C3S at 25 clicks (grind in two loads; it holds about 25 g).", "Preheat the Bodum Chambord (17 oz) and dump the water. Grounds in, set it on the S3 scale and tare.", "Water just off the boil. Bloom: pour 60 g fast, wait 30 s without pouring.", "Pour to 450 g total. Lid on, plunger up, steep 4:00.", "Press slowly over about 20 s and pour it all out right away.", "Grind test still open: 28 clicks (coarser) vs 22 (finer). Change only the grind."] },
    { id: "backnine", name: "Back Nine Pumpkin Latte", section: "seasonal", uses: "espresso", milk: true, iced: false, line: "Double shot · real pumpkin · warm spice · steamed milk", note: "Fall on the back nine. Real pumpkin, a touch of maple and warm spice under silky milk.", mine: false, cup: "10–12 oz cup", how: ["In the cup: 1 tbsp pumpkin purée, 1–2 tsp maple syrup, a pinch of pumpkin pie spice.", "Pull the double straight onto it and stir until smooth.", "Steam about 6 oz whole milk to 140–150 °F with a light stretch.", "Pour, then dust the top with a little cinnamon.", "Buy: canned pumpkin purée (not pie filling), pumpkin pie spice, maple syrup."] },
    { id: "tablet", name: "Tablet Latte", section: "seasonal", uses: "espresso", milk: true, iced: false, line: "Double shot · condensed milk · brown sugar · steamed milk", note: "Inspired by Scottish tablet, the crumbly butter-sugar fudge. Rich, caramel-sweet and very Scottish.", mine: false, cup: "8–10 oz cup", how: ["In the cup: 2 tsp sweetened condensed milk, 1 tsp brown sugar, a tiny pinch of salt.", "Pull the double straight onto it and stir until dissolved.", "Steam about 5 oz whole milk to 140–150 °F.", "Pour, and finish with a few flakes of salt or a crumble of tablet if you have it.", "Uses the same condensed milk can as the Café Bombón."] },
    { id: "affogato", name: "Affogato", section: "dessert", uses: "espresso", milk: false, iced: false, line: "Double shot · vanilla ice cream", note: "A hot double shot poured over a scoop of vanilla ice cream.", mine: false, cup: "Volarium glass bowl", how: ["One or two scoops of vanilla ice cream in a glass bowl.", "Pull the double into a shot glass.", "Pour it over the ice cream at the table. Serve with a spoon."] },
    { id: "conpanna", name: "Espresso con Panna", section: "dessert", uses: "espresso", milk: false, iced: false, line: "Double shot · whipped cream", note: "A double shot crowned with a spoonful of fresh whipped cream.", mine: false, cup: "Demitasse", how: ["Whip about 2 oz cold heavy cream in the Aeroccino on the cold setting (spring whisk). Run twice if loose.", "Pull the double into a demitasse.", "Spoon a heaping dollop on top and serve right away."] },
    { id: "bombon", name: "Café Bombón", section: "dessert", uses: "espresso", milk: false, iced: false, line: "Double shot · sweetened condensed milk", note: "Spanish-style. Espresso layered over condensed milk in clear glass. Stir before sipping.", mine: false, cup: "Small clear glass", how: ["Pour about 1 oz sweetened condensed milk into the glass.", "Pull the double slowly over the back of a spoon so it layers on top.", "Serve with a spoon. Stir before sipping."] },
    { id: "hotchoc", name: "Hot Chocolate", section: "dessert", uses: "none", milk: true, iced: false, chocolate: true, line: "Dark chocolate · steamed milk", note: "No coffee. Real dark chocolate, rich, not sweet.", mine: false, cup: "8 oz cup", how: ["About 1 oz dark chocolate in the cup.", "Melt it with a splash of steamed milk and stir smooth.", "Steam 6–7 oz whole milk or half & half and pour. No sugar."] }
  ],

  milks: ["Half & half", "Whole milk", "Oat milk"],
  chocolates: ["70% dark", "78% extra dark"]
};
