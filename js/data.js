/*
 * Plant data, grouped by city.
 *
 * To add a plant: add an object to a city's `plants` array. The `id` must be
 * unique and match the photo file name in /images (images/<id>.jpg) and its
 * entry in js/credits.js.
 *
 * To add a city: add a new key to CITIES with a `name`, `nameAr` and `plants`.
 *
 * origin: "native" | "introduced"
 * where:  any of "desert", "streets", "gardens", "farms"
 */
window.CITIES = {
  riyadh: {
    name: "Riyadh",
    nameAr: "الرياض",
    plants: [
      // ---------- Native (wild in Najd) ----------
      {
        id: "date-palm",
        en: "Date Palm",
        ar: "نخلة التمر",
        sci: "Phoenix dactylifera",
        origin: "native",
        where: ["farms", "streets", "gardens"],
        fact: "A single palm can give over 100 kg of dates a year, and Saudi Arabia grows more than 300 date varieties."
      },
      {
        id: "sidr",
        en: "Sidr",
        ar: "سدر",
        sci: "Ziziphus spina-christi",
        origin: "native",
        where: ["desert", "gardens", "farms"],
        fact: "Bees make the famous, expensive Sidr honey from its flowers, and its crushed leaves were traditionally used to wash hair."
      },
      {
        id: "samur",
        en: "Samur Acacia",
        ar: "سمر",
        sci: "Vachellia tortilis",
        origin: "native",
        where: ["desert"],
        fact: "Its flat, umbrella-shaped crown makes it the classic desert tree. Camels eat its leaves despite the long thorns."
      },
      {
        id: "talh",
        en: "Talh Acacia",
        ar: "طلح",
        sci: "Vachellia gerrardii",
        origin: "native",
        where: ["desert"],
        fact: "A key shade tree of Najd's wadis and rawdahs, like Rawdat Khuraim. Look for its rough grey bark and paired white thorns."
      },
      {
        id: "arak",
        en: "Arak / Miswak",
        ar: "أراك",
        sci: "Salvadora persica",
        origin: "native",
        where: ["desert", "gardens"],
        fact: "Its twigs are the miswak, a natural toothbrush used for centuries. They contain antibacterial compounds and fluoride."
      },
      {
        id: "ghada",
        en: "Ghada",
        ar: "غضا",
        sci: "Haloxylon persicum",
        origin: "native",
        where: ["desert"],
        fact: "It grows on sand dunes and holds them in place. Its wood burns long and hot, so it was Arabia's favourite firewood, and Arabic poetry praises its embers."
      },
      {
        id: "rimth",
        en: "Rimth",
        ar: "رمث",
        sci: "Haloxylon salicornicum",
        origin: "native",
        where: ["desert"],
        fact: "Camels love its salty, jointed green stems, which makes it one of the most important grazing shrubs of the Najd desert."
      },
      {
        id: "arfaj",
        en: "Arfaj",
        ar: "عرفج",
        sci: "Rhanterium epapposum",
        origin: "native",
        where: ["desert"],
        fact: "It looks dead and grey in the dry season, then turns green with yellow flowers a few days after rain. It's Kuwait's national flower."
      },
      {
        id: "athel",
        en: "Athel Tamarisk",
        ar: "أثل",
        sci: "Tamarix aphylla",
        origin: "native",
        where: ["farms", "desert", "streets"],
        fact: "Its needle-like leaves push out salt, so it survives salty soil. It was planted as a windbreak around farms, and its wood was used in old Najdi houses."
      },
      {
        id: "harmal",
        en: "Harmal (Rhazya)",
        ar: "حرمل",
        sci: "Rhazya stricta",
        origin: "native",
        where: ["desert"],
        fact: "It's very bitter and toxic, so grazing animals leave it alone. That's why it forms thick green patches on heavily grazed land."
      },

      // ---------- Introduced (streets, parks, homes) ----------
      {
        id: "conocarpus",
        en: "Conocarpus",
        ar: "كونوكاربس",
        sci: "Conocarpus lancifolius",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "It grows fast and stays green, so Gulf cities planted it everywhere. Its aggressive roots damage pipes and foundations, so authorities now discourage planting it."
      },
      {
        id: "neem",
        en: "Neem",
        ar: "نيم",
        sci: "Azadirachta indica",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "In India it's called \"the village pharmacy\". Huge neem plantations shade pilgrims at Arafat near Makkah."
      },
      {
        id: "washingtonia",
        en: "Washingtonia Palm",
        ar: "واشنطونيا",
        sci: "Washingtonia robusta",
        origin: "introduced",
        where: ["streets"],
        fact: "This tall, skinny fan palm from Mexico can reach 30 m. Unless the old fronds are trimmed, they hang down in a brown \"skirt\"."
      },
      {
        id: "ficus",
        en: "Ficus",
        ar: "فيكس",
        sci: "Ficus microcarpa",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "Locally sold as \"Ficus nitida\". Its shiny leaves take hard pruning well, so it's clipped into the thick green walls and balls you see along Riyadh villas."
      },
      {
        id: "mesquite",
        en: "Mesquite",
        ar: "برسوبس",
        sci: "Prosopis juliflora",
        origin: "introduced",
        where: ["streets", "desert"],
        fact: "It was brought in to fight desertification, but it spread aggressively. Livestock eat its sweet pods and spread the seeds even further."
      },
      {
        id: "parkinsonia",
        en: "Parkinsonia",
        ar: "باركنسونيا",
        sci: "Parkinsonia aculeata",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "Its green bark photosynthesises, so the tree can drop its tiny leaves in a drought and keep making food."
      },
      {
        id: "bougainvillea",
        en: "Bougainvillea",
        ar: "جهنمية",
        sci: "Bougainvillea glabra",
        origin: "introduced",
        where: ["gardens", "streets"],
        fact: "The bright pink \"petals\" are really bracts, a kind of papery leaf. The true flowers are the tiny white tubes in the middle."
      },
      {
        id: "oleander",
        en: "Oleander",
        ar: "دفلة",
        sci: "Nerium oleander",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "It's beautiful and very drought-tolerant, but every part is highly poisonous, even the smoke from burning it."
      },
      {
        id: "jasmine",
        en: "Jasmine",
        ar: "ياسمين",
        sci: "Jasminum sambac",
        origin: "introduced",
        where: ["gardens"],
        fact: "Arabian jasmine smells strongest in the evening. Its flowers are strung into garlands for Gulf weddings."
      },
      {
        id: "hibiscus",
        en: "Hibiscus",
        ar: "كركديه / هبسكس",
        sci: "Hibiscus rosa-sinensis",
        origin: "introduced",
        where: ["gardens"],
        fact: "Each big flower lasts only about a day. Karkadeh tea is made from a close cousin, Hibiscus sabdariffa."
      },
      {
        id: "lantana",
        en: "Lantana",
        ar: "لانتانا",
        sci: "Lantana camara",
        origin: "introduced",
        where: ["gardens", "streets"],
        fact: "The flower clusters change colour as they age, so one cluster can be yellow, orange and pink at once. Butterflies love it."
      },
      {
        id: "texas-sage",
        en: "Texas Sage",
        ar: "ليكوفيلم",
        sci: "Leucophyllum frutescens",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "It's nicknamed the \"barometer bush\" because it covers itself in purple flowers just after rain or a humid spell."
      },
      {
        id: "desert-rose",
        en: "Desert Rose",
        ar: "وردة الصحراء",
        sci: "Adenium obesum",
        origin: "introduced",
        where: ["gardens"],
        fact: "It stores water in its fat, swollen trunk. Its milky sap is toxic and was once used as arrow poison."
      },
      {
        id: "aloe-vera",
        en: "Aloe Vera",
        ar: "صبار الألوفيرا",
        sci: "Aloe vera",
        origin: "introduced",
        where: ["gardens"],
        fact: "The cooling gel inside its leaves soothes burns. Botanists think the plant first came from the Arabian Peninsula."
      },
      {
        id: "moringa",
        en: "Moringa",
        ar: "مورينجا",
        sci: "Moringa oleifera",
        origin: "introduced",
        where: ["gardens", "farms"],
        fact: "It's called the \"miracle tree\": its leaves are packed with vitamins, and its crushed seeds can help clean muddy water."
      },
      {
        id: "olive",
        en: "Olive",
        ar: "زيتون",
        sci: "Olea europaea",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "Olive trees can live for over 1,000 years. The Al-Jouf region in northern Saudi Arabia has millions of them."
      },
      {
        id: "pomegranate",
        en: "Pomegranate",
        ar: "رمان",
        sci: "Punica granatum",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "It's mentioned in the Qur'an, and a single fruit can hold more than 600 juicy seeds."
      },
      {
        id: "fig",
        en: "Fig",
        ar: "تين",
        sci: "Ficus carica",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "A fig isn't really a fruit. It's a cluster of tiny flowers turned inside-out, hidden inside a green pouch."
      },
      {
        id: "lemon",
        en: "Lemon",
        ar: "ليمون",
        sci: "Citrus limon",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "A lemon tree can flower and fruit at the same time, and it keeps producing lemons almost all year round."
      },
      {
        id: "mint",
        en: "Mint",
        ar: "نعناع",
        sci: "Mentha spicata",
        origin: "introduced",
        where: ["gardens", "farms"],
        fact: "Mint tea is part of Saudi hospitality. Mint spreads fast through underground runners, so grow it in a pot."
      }
    ]
  }
};
