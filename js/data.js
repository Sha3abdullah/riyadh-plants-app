/*
 * Plant data, grouped by city.
 *
 * To add a plant: add an object to a city's `plants` array. The `id` must be
 * unique and match the photo file name in /images (images/<id>.jpg) and its
 * entry in js/credits.js.
 *
 * To add a city: add a new key to CITIES with a `name`, `nameAr`, `plants`,
 * and optionally `spots` (places on the map) and `lookalikes`.
 *
 * origin:  "native" | "introduced"
 * where:   any of "desert", "streets", "gardens", "farms"
 * say:     pronunciation guide for the scientific name (stressed syllable in capitals)
 * range:   native range; countries use world-atlas names (see js/world.js), "@X" = REGIONS.X
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
        fact: "A single palm can give over 100 kg of dates a year, and Saudi Arabia grows more than 300 date varieties.",
        factAr: "النخلة الواحدة قد تعطي أكثر من 100 كيلو من التمر في السنة، وفي المملكة أكثر من 300 صنف من التمور.",
        say: "FEE-niks dak-ti-LIF-er-uh",
        range: { en: "Arabia, the Gulf & North Africa", ar: "جزيرة العرب والخليج وشمال أفريقيا", countries: ["@ARABIA", "Iraq", "Iran", "@NAFRICA", "@LEVANT"] }
      },
      {
        id: "sidr",
        en: "Sidr",
        ar: "سدر",
        sci: "Ziziphus spina-christi",
        origin: "native",
        where: ["desert", "gardens", "farms"],
        fact: "Bees make the famous, expensive Sidr honey from its flowers, and its crushed leaves were traditionally used to wash hair.",
        factAr: "يصنع النحل من زهره عسل السدر الشهير والغالي، وكانت أوراقه المطحونة تُستخدم قديماً لغسل الشعر.",
        say: "ZIZ-i-fus SPY-nuh KRIS-tee",
        range: { en: "Arabia, the Levant & northern Africa", ar: "جزيرة العرب والشام وشمال أفريقيا", countries: ["@ARABIA", "@LEVANT", "Iraq", "Iran", "Egypt", "Sudan", "Chad", "Niger", "Mali", "Mauritania", "Eritrea", "Ethiopia", "Djibouti", "Somalia", "Somaliland", "Kenya"] }
      },
      {
        id: "samur",
        en: "Samur Acacia",
        ar: "سمر",
        sci: "Vachellia tortilis",
        origin: "native",
        where: ["desert"],
        fact: "Its flat, umbrella-shaped crown makes it the classic desert tree. Camels eat its leaves despite the long thorns.",
        factAr: "تاجه المسطّح الذي يشبه المظلة يجعله رمز شجر الصحراء، والإبل تأكل أوراقه رغم أشواكه الطويلة.",
        say: "vuh-CHEL-ee-uh TOR-ti-lis",
        range: { en: "Africa & Arabia", ar: "أفريقيا وجزيرة العرب", countries: ["@ARABIA", "@LEVANT", "Egypt", "Sudan", "@EAFRICA", "@SAFRICA", "Senegal", "Mali", "Niger", "Chad", "Mauritania", "Algeria", "Morocco"] }
      },
      {
        id: "talh",
        en: "Talh Acacia",
        ar: "طلح",
        sci: "Vachellia gerrardii",
        origin: "native",
        where: ["desert"],
        fact: "A key shade tree of Najd's wadis and rawdahs, like Rawdat Khuraim. Look for its rough grey bark and paired white thorns.",
        factAr: "من أهم أشجار الظل في أودية نجد ورياضها مثل روضة خريم. تعرّف عليه من لحائه الرمادي الخشن وأشواكه البيضاء المزدوجة.",
        say: "vuh-CHEL-ee-uh jer-RAR-dee-eye",
        range: { en: "East & southern Africa, Arabia & the Levant", ar: "شرق وجنوب أفريقيا وجزيرة العرب والشام", countries: ["Saudi Arabia", "Yemen", "Oman", "Iraq", "@LEVANT", "Egypt", "@EAFRICA", "@SAFRICA"] }
      },
      {
        id: "arak",
        en: "Arak / Miswak",
        ar: "أراك",
        sci: "Salvadora persica",
        origin: "native",
        where: ["desert", "gardens"],
        fact: "Its twigs are the miswak, a natural toothbrush used for centuries. They contain antibacterial compounds and fluoride.",
        factAr: "أغصانه هي المسواك، فرشاة أسنان طبيعية استُخدمت لقرون، وفيها مواد مضادة للبكتيريا وفلورايد.",
        say: "sal-vuh-DOR-uh PER-si-kuh",
        range: { en: "Africa, Arabia & South Asia", ar: "أفريقيا وجزيرة العرب وجنوب آسيا", countries: ["@ARABIA", "Iraq", "Iran", "Pakistan", "India", "Egypt", "Sudan", "@EAFRICA", "Chad", "Niger", "Mali", "Mauritania", "Senegal", "Angola", "Namibia"] }
      },
      {
        id: "ghada",
        en: "Ghada",
        ar: "غضا",
        sci: "Haloxylon persicum",
        origin: "native",
        where: ["desert"],
        fact: "It grows on sand dunes and holds them in place. Its wood burns long and hot, so it was Arabia's favourite firewood, and Arabic poetry praises its embers.",
        factAr: "ينمو على الكثبان الرملية ويثبّتها. خشبه يشتعل طويلاً وبحرارة عالية، لذلك كان أفضل حطب في الجزيرة العربية، وتغنّى الشعراء بجمر الغضا.",
        say: "huh-LOK-si-lon PER-si-kum",
        range: { en: "Arabia, Iran & Central Asia", ar: "جزيرة العرب وإيران وآسيا الوسطى", countries: ["@ARABIA", "Iraq", "Iran", "Jordan", "Syria", "Israel", "Egypt", "@CASIA"] }
      },
      {
        id: "rimth",
        en: "Rimth",
        ar: "رمث",
        sci: "Haloxylon salicornicum",
        origin: "native",
        where: ["desert"],
        fact: "Camels love its salty, jointed green stems, which makes it one of the most important grazing shrubs of the Najd desert.",
        factAr: "تحب الإبل سيقانه الخضراء المالحة المفصّلة، لذلك يُعد من أهم نباتات المرعى في صحراء نجد.",
        say: "huh-LOK-si-lon sal-i-KOR-ni-kum",
        range: { en: "Arabia to Pakistan & northwest India", ar: "من جزيرة العرب إلى باكستان وشمال غرب الهند", countries: ["@ARABIA", "Iraq", "Iran", "Afghanistan", "Pakistan", "India", "Jordan", "Syria", "Egypt", "Libya"] }
      },
      {
        id: "arfaj",
        en: "Arfaj",
        ar: "عرفج",
        sci: "Rhanterium epapposum",
        origin: "native",
        where: ["desert"],
        fact: "It looks dead and grey in the dry season, then turns green with yellow flowers a few days after rain. It's Kuwait's national flower.",
        factAr: "يبدو يابساً ورمادياً في موسم الجفاف، ثم يخضرّ وتظهر أزهاره الصفراء بعد المطر بأيام. وهو الزهرة الوطنية للكويت.",
        say: "ran-TEER-ee-um ee-pap-POH-sum",
        range: { en: "Northeast Arabia & Iraq", ar: "شمال شرق جزيرة العرب والعراق", countries: ["Saudi Arabia", "Kuwait", "Qatar", "United Arab Emirates", "Iraq", "Iran"] }
      },
      {
        id: "athel",
        en: "Athel Tamarisk",
        ar: "أثل",
        sci: "Tamarix aphylla",
        origin: "native",
        where: ["farms", "desert", "streets"],
        fact: "Its needle-like leaves push out salt, so it survives salty soil. It was planted as a windbreak around farms, and its wood was used in old Najdi houses.",
        factAr: "أوراقه الإبرية تُخرج الملح، لذلك يعيش في التربة المالحة. كان يُزرع مصدّاً للرياح حول المزارع، واستُخدم خشبه في بيوت نجد القديمة.",
        say: "TAM-uh-riks uh-FIL-uh",
        range: { en: "North & East Africa to India", ar: "من شمال وشرق أفريقيا إلى الهند", countries: ["@ARABIA", "Iraq", "Iran", "Afghanistan", "Pakistan", "India", "@LEVANT", "@NAFRICA", "Sudan", "Chad", "Niger", "Mali", "Mauritania", "Ethiopia", "Eritrea", "Somalia", "Kenya"] }
      },
      {
        id: "harmal",
        en: "Harmal (Rhazya)",
        ar: "حرمل",
        sci: "Rhazya stricta",
        origin: "native",
        where: ["desert"],
        fact: "It's very bitter and toxic, so grazing animals leave it alone. That's why it forms thick green patches on heavily grazed land.",
        factAr: "طعمه مرّ جداً وهو سام، فتتجنبه المواشي. لهذا تراه يكوّن بقعاً خضراء كثيفة في الأراضي التي رعتها الماشية بكثرة.",
        say: "RAZ-ee-uh STRIK-tuh",
        range: { en: "Arabia to Pakistan & India", ar: "من جزيرة العرب إلى باكستان والهند", countries: ["@ARABIA", "Iraq", "Iran", "Afghanistan", "Pakistan", "India"] }
      },

      // ---------- Introduced (streets, parks, homes) ----------
      {
        id: "conocarpus",
        en: "Conocarpus",
        ar: "كونوكاربس",
        sci: "Conocarpus lancifolius",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "It grows fast and stays green, so Gulf cities planted it everywhere. Its aggressive roots damage pipes and foundations, so authorities now discourage planting it.",
        factAr: "ينمو بسرعة ويبقى أخضر، فزُرع بكثرة في مدن الخليج. لكن جذوره العدوانية تضر الأنابيب والأساسات، لذلك صارت الجهات المختصة لا تشجع على زراعته.",
        say: "koh-noh-KAR-pus lan-si-FOH-lee-us",
        range: { en: "Somalia & Yemen", ar: "الصومال واليمن", countries: ["Somalia", "Somaliland", "Djibouti", "Yemen"] }
      },
      {
        id: "neem",
        en: "Neem",
        ar: "نيم",
        sci: "Azadirachta indica",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "In India it's called \"the village pharmacy\". Huge neem plantations shade pilgrims at Arafat near Makkah.",
        factAr: "يسمونه في الهند \"صيدلية القرية\". وتظلّل مزارع النيم الكبيرة الحجاج في عرفات قرب مكة.",
        say: "uh-zad-i-RAK-tuh IN-di-kuh",
        range: { en: "Indian subcontinent & Myanmar", ar: "شبه القارة الهندية وميانمار", countries: ["India", "Pakistan", "Bangladesh", "Nepal", "Sri Lanka", "Myanmar"] }
      },
      {
        id: "washingtonia",
        en: "Washingtonia Palm",
        ar: "واشنطونيا",
        sci: "Washingtonia robusta",
        origin: "introduced",
        where: ["streets"],
        fact: "This tall, skinny fan palm from Mexico can reach 30 m. Unless the old fronds are trimmed, they hang down in a brown \"skirt\".",
        factAr: "نخلة مروحية طويلة ونحيلة أصلها من المكسيك، وقد يصل طولها إلى 30 متراً. إذا لم تُقصّ سعفاتها القديمة تتدلى حول الجذع مثل \"تنورة\" بنية.",
        say: "wosh-ing-TOH-nee-uh roh-BUS-tuh",
        range: { en: "Northwest Mexico", ar: "شمال غرب المكسيك", countries: ["Mexico"] }
      },
      {
        id: "ficus",
        en: "Ficus",
        ar: "فيكس",
        sci: "Ficus microcarpa",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "Locally sold as \"Ficus nitida\". Its shiny leaves take hard pruning well, so it's clipped into the thick green walls and balls you see along Riyadh villas.",
        factAr: "يُباع محلياً باسم \"فيكس نتدا\". أوراقه اللامعة تتحمل القص الشديد، لذلك تُشكّل منه الأسوار الخضراء الكثيفة والكرات التي تراها حول فلل الرياض.",
        say: "FY-kus my-kroh-KAR-puh",
        range: { en: "South & Southeast Asia to Australia", ar: "جنوب وجنوب شرق آسيا حتى أستراليا", countries: ["India", "Sri Lanka", "Bangladesh", "Myanmar", "Thailand", "Laos", "Cambodia", "Vietnam", "China", "Taiwan", "Japan", "Malaysia", "Indonesia", "Philippines", "Papua New Guinea", "Australia"] }
      },
      {
        id: "mesquite",
        en: "Mesquite",
        ar: "برسوبس",
        sci: "Prosopis juliflora",
        origin: "introduced",
        where: ["streets", "desert"],
        fact: "It was brought in to fight desertification, but it spread aggressively. Livestock eat its sweet pods and spread the seeds even further.",
        factAr: "جُلب لمكافحة التصحر لكنه انتشر بشكل كبير. تأكل المواشي قرونه الحلوة وتنشر بذوره أكثر.",
        say: "proh-SOH-pis joo-li-FLOR-uh",
        range: { en: "Mexico, Central & northern South America", ar: "المكسيك وأمريكا الوسطى وشمال أمريكا الجنوبية", countries: ["@CAMERICA", "Colombia", "Venezuela", "Ecuador", "Peru", "Cuba", "Haiti", "Dominican Rep.", "Jamaica"] }
      },
      {
        id: "parkinsonia",
        en: "Parkinsonia",
        ar: "باركنسونيا",
        sci: "Parkinsonia aculeata",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "Its green bark photosynthesises, so the tree can drop its tiny leaves in a drought and keep making food.",
        factAr: "لحاؤه الأخضر يقوم بالبناء الضوئي، فتستطيع الشجرة إسقاط أوراقها الصغيرة وقت الجفاف وتستمر في صنع غذائها.",
        say: "par-kin-SOH-nee-uh uh-kew-lee-AY-tuh",
        range: { en: "Southwest USA to Argentina", ar: "من جنوب غرب أمريكا إلى الأرجنتين", countries: ["United States of America", "@CAMERICA", "@NSAMERICA", "Bolivia", "Paraguay", "Argentina"] }
      },
      {
        id: "bougainvillea",
        en: "Bougainvillea",
        ar: "جهنمية",
        sci: "Bougainvillea glabra",
        origin: "introduced",
        where: ["gardens", "streets"],
        fact: "The bright pink \"petals\" are really bracts, a kind of papery leaf. The true flowers are the tiny white tubes in the middle.",
        factAr: "\"البتلات\" الوردية الزاهية هي في الحقيقة قنابات، أوراق رقيقة ملوّنة. أما الأزهار الحقيقية فهي الأنابيب البيضاء الصغيرة في الوسط.",
        say: "boo-gin-VIL-ee-uh GLAY-bruh",
        range: { en: "Brazil", ar: "البرازيل", countries: ["Brazil"] }
      },
      {
        id: "oleander",
        en: "Oleander",
        ar: "دفلة",
        sci: "Nerium oleander",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "It's beautiful and very drought-tolerant, but every part is highly poisonous, even the smoke from burning it.",
        factAr: "جميلة وتتحمل الجفاف كثيراً، لكن كل أجزائها شديدة السمية، حتى الدخان الناتج عن حرقها.",
        say: "NEER-ee-um oh-lee-AN-der",
        range: { en: "Mediterranean to South Asia", ar: "من البحر المتوسط إلى جنوب آسيا", countries: ["Morocco", "Algeria", "Tunisia", "Libya", "Spain", "Portugal", "France", "Italy", "Greece", "Albania", "Croatia", "Montenegro", "Turkey", "Cyprus", "N. Cyprus", "@LEVANT", "Iraq", "Iran", "Afghanistan", "Pakistan", "India", "Saudi Arabia", "Yemen", "Oman"] }
      },
      {
        id: "jasmine",
        en: "Jasmine",
        ar: "ياسمين",
        sci: "Jasminum sambac",
        origin: "introduced",
        where: ["gardens"],
        fact: "Arabian jasmine smells strongest in the evening. Its flowers are strung into garlands for Gulf weddings.",
        factAr: "رائحة الياسمين العربي أقوى ما تكون في المساء، وتُنظم أزهاره في عقود لأعراس الخليج.",
        say: "JAZ-mi-num SAM-bak",
        range: { en: "Eastern Himalayas (India, Bhutan)", ar: "شرق الهيمالايا (الهند وبوتان)", countries: ["India", "Bhutan", "Bangladesh"] }
      },
      {
        id: "hibiscus",
        en: "Hibiscus",
        ar: "كركديه / هبسكس",
        sci: "Hibiscus rosa-sinensis",
        origin: "introduced",
        where: ["gardens"],
        fact: "Each big flower lasts only about a day. Karkadeh tea is made from a close cousin, Hibiscus sabdariffa.",
        factAr: "كل زهرة كبيرة تعيش يوماً واحداً تقريباً. أما شاي الكركديه فيُصنع من نبات قريب منه اسمه Hibiscus sabdariffa.",
        say: "hy-BIS-kus ROH-zuh si-NEN-sis",
        range: { en: "Probably southern China (an old garden hybrid)", ar: "غالباً جنوب الصين (هجين زراعي قديم)", countries: ["China", "Vietnam"] }
      },
      {
        id: "lantana",
        en: "Lantana",
        ar: "لانتانا",
        sci: "Lantana camara",
        origin: "introduced",
        where: ["gardens", "streets"],
        fact: "The flower clusters change colour as they age, so one cluster can be yellow, orange and pink at once. Butterflies love it.",
        factAr: "تتغير ألوان عناقيد أزهارها مع العمر، فقد يكون العنقود الواحد أصفر وبرتقالياً ووردياً معاً. والفراشات تحبها.",
        say: "lan-TAH-nuh kuh-MAR-uh",
        range: { en: "Central & South America", ar: "أمريكا الوسطى والجنوبية", countries: ["@CAMERICA", "@NSAMERICA", "Brazil", "Bolivia", "Paraguay", "Cuba", "Haiti", "Dominican Rep.", "Jamaica", "Puerto Rico"] }
      },
      {
        id: "texas-sage",
        en: "Texas Sage",
        ar: "ليكوفيلم",
        sci: "Leucophyllum frutescens",
        origin: "introduced",
        where: ["streets", "gardens"],
        fact: "It's nicknamed the \"barometer bush\" because it covers itself in purple flowers just after rain or a humid spell.",
        factAr: "يُلقّب بـ\"شجيرة البارومتر\" لأنه يكتسي بالأزهار البنفسجية بعد المطر أو الجو الرطب مباشرة.",
        say: "loo-koh-FIL-um froo-TES-enz",
        range: { en: "Texas (USA) & northern Mexico", ar: "تكساس (أمريكا) وشمال المكسيك", countries: ["United States of America", "Mexico"] }
      },
      {
        id: "desert-rose",
        en: "Desert Rose",
        ar: "وردة الصحراء",
        sci: "Adenium obesum",
        origin: "introduced",
        where: ["gardens"],
        fact: "It stores water in its fat, swollen trunk. Its milky sap is toxic and was once used as arrow poison.",
        factAr: "تخزّن الماء في جذعها المنتفخ. عصارتها البيضاء سامة، واستُخدمت قديماً سُمّاً للسهام.",
        say: "uh-DEE-nee-um oh-BEE-sum",
        range: { en: "Africa south of the Sahara & southwest Arabia", ar: "أفريقيا جنوب الصحراء وجنوب غرب جزيرة العرب", countries: ["Saudi Arabia", "Yemen", "Oman", "Sudan", "S. Sudan", "Eritrea", "Ethiopia", "Somalia", "Somaliland", "Djibouti", "Kenya", "Uganda", "Tanzania", "Mali", "Niger", "Chad", "Nigeria", "Senegal", "Mauritania"] }
      },
      {
        id: "aloe-vera",
        en: "Aloe Vera",
        ar: "صبار الألوفيرا",
        sci: "Aloe vera",
        origin: "introduced",
        where: ["gardens"],
        fact: "The cooling gel inside its leaves soothes burns. Botanists think the plant first came from the Arabian Peninsula.",
        factAr: "الهلام البارد داخل أوراقها يلطّف الحروق، ويعتقد علماء النبات أن أصلها من شبه الجزيرة العربية.",
        say: "AL-oh VEER-uh",
        range: { en: "Arabian Peninsula (probably)", ar: "شبه الجزيرة العربية (على الأرجح)", countries: ["Oman", "Yemen", "Saudi Arabia"] }
      },
      {
        id: "moringa",
        en: "Moringa",
        ar: "مورينجا",
        sci: "Moringa oleifera",
        origin: "introduced",
        where: ["gardens", "farms"],
        fact: "It's called the \"miracle tree\": its leaves are packed with vitamins, and its crushed seeds can help clean muddy water.",
        factAr: "تُسمى \"الشجرة المعجزة\": أوراقها غنية بالفيتامينات، وبذورها المطحونة تساعد على تنقية الماء العكر.",
        say: "mor-ING-guh oh-lee-IF-er-uh",
        range: { en: "Foothills of the Himalayas (India)", ar: "سفوح الهيمالايا (الهند)", countries: ["India", "Pakistan", "Nepal", "Bangladesh"] }
      },
      {
        id: "olive",
        en: "Olive",
        ar: "زيتون",
        sci: "Olea europaea",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "Olive trees can live for over 1,000 years. The Al-Jouf region in northern Saudi Arabia has millions of them.",
        factAr: "قد تعيش شجرة الزيتون أكثر من 1000 سنة، وفي منطقة الجوف شمال المملكة ملايين منها.",
        say: "OH-lee-uh yoo-roh-PEE-uh",
        range: { en: "Mediterranean", ar: "حوض البحر المتوسط", countries: ["Spain", "Portugal", "France", "Italy", "Greece", "Albania", "Croatia", "Montenegro", "Bosnia and Herz.", "Cyprus", "N. Cyprus", "Turkey", "@LEVANT", "Morocco", "Algeria", "Tunisia", "Libya", "Egypt"] }
      },
      {
        id: "pomegranate",
        en: "Pomegranate",
        ar: "رمان",
        sci: "Punica granatum",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "It's mentioned in the Qur'an, and a single fruit can hold more than 600 juicy seeds.",
        factAr: "ورد ذكره في القرآن الكريم، وقد تحتوي الرمانة الواحدة على أكثر من 600 حبة.",
        say: "PEW-ni-kuh gruh-NAY-tum",
        range: { en: "Iran to northern India", ar: "من إيران إلى شمال الهند", countries: ["Iran", "Afghanistan", "Turkmenistan", "Pakistan", "India", "Iraq", "Armenia", "Azerbaijan", "Georgia"] }
      },
      {
        id: "fig",
        en: "Fig",
        ar: "تين",
        sci: "Ficus carica",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "A fig isn't really a fruit. It's a cluster of tiny flowers turned inside-out, hidden inside a green pouch.",
        factAr: "التينة ليست ثمرة بالمعنى المعروف، بل عنقود من أزهار صغيرة مقلوبة إلى الداخل داخل كيس أخضر.",
        say: "FY-kus KAR-i-kuh",
        range: { en: "Middle East & western Asia", ar: "الشرق الأوسط وغرب آسيا", countries: ["Turkey", "@LEVANT", "Iraq", "Iran", "Afghanistan", "Armenia", "Azerbaijan", "Georgia", "Greece", "Cyprus"] }
      },
      {
        id: "lemon",
        en: "Lemon",
        ar: "ليمون",
        sci: "Citrus limon",
        origin: "introduced",
        where: ["farms", "gardens"],
        fact: "A lemon tree can flower and fruit at the same time, and it keeps producing lemons almost all year round.",
        factAr: "شجرة الليمون تزهر وتثمر في الوقت نفسه، وتعطي الليمون تقريباً طوال السنة.",
        say: "SIT-rus LY-mon",
        range: { en: "Northeast India, Myanmar & China (an ancient hybrid)", ar: "شمال شرق الهند وميانمار والصين (هجين قديم)", countries: ["India", "Myanmar", "China"] }
      },
      {
        id: "mint",
        en: "Mint",
        ar: "نعناع",
        sci: "Mentha spicata",
        origin: "introduced",
        where: ["gardens", "farms"],
        fact: "Mint tea is part of Saudi hospitality. Mint spreads fast through underground runners, so grow it in a pot.",
        factAr: "شاي النعناع جزء من الضيافة السعودية. ينتشر النعناع بسرعة عبر سيقان تحت التربة، لذلك ازرعه في أصيص.",
        say: "MEN-thuh spy-KAY-tuh",
        range: { en: "Europe & western Asia", ar: "أوروبا وغرب آسيا", countries: ["Spain", "Portugal", "France", "Italy", "Greece", "Germany", "Austria", "Switzerland", "Hungary", "Romania", "Bulgaria", "Serbia", "Croatia", "Poland", "Czechia", "Slovakia", "Ukraine", "Turkey", "@LEVANT", "Iraq", "Iran", "Georgia", "Armenia", "Azerbaijan"] }
      }
    ],

    // Places around Riyadh where each plant is commonly seen.
    // Pins mark an area, not an exact tree. [lat, lng]
    spots: [
      { id: "wadi-hanifa", en: "Wadi Hanifa", ar: "وادي حنيفة", at: [24.648, 46.61],
        plants: ["date-palm", "athel", "sidr", "talh", "samur", "arak"] },
      { id: "diriyah", en: "Diriyah (At-Turaif & Al-Bujairi)", ar: "الدرعية (الطريف والبجيري)", at: [24.734, 46.574],
        plants: ["date-palm", "athel", "lemon", "pomegranate", "fig"] },
      { id: "salam-park", en: "Al-Salam Park", ar: "منتزه السلام", at: [24.6237, 46.7069],
        plants: ["date-palm", "washingtonia", "ficus", "neem", "bougainvillea", "oleander", "lantana"] },
      { id: "king-abdullah-park", en: "King Abdullah Park (Al-Malaz)", ar: "حديقة الملك عبدالله (الملز)", at: [24.6655, 46.7345],
        plants: ["washingtonia", "ficus", "conocarpus", "bougainvillea", "hibiscus", "texas-sage"] },
      { id: "king-fahd-road", en: "King Fahd Road & Olaya", ar: "طريق الملك فهد والعليا", at: [24.7115, 46.6745],
        plants: ["washingtonia", "date-palm", "conocarpus", "ficus", "texas-sage", "parkinsonia", "lantana"] },
      { id: "home-gardens", en: "Home gardens (all over the city)", ar: "حدائق البيوت (في كل الأحياء)", at: [24.775, 46.72],
        plants: ["jasmine", "hibiscus", "desert-rose", "aloe-vera", "mint", "moringa", "bougainvillea", "lemon"] },
      { id: "thumamah", en: "Al-Thumamah National Park", ar: "منتزه الثمامة الوطني", at: [25.2, 46.62],
        plants: ["talh", "samur", "sidr", "ghada", "rimth", "harmal", "arfaj", "mesquite"] },
      { id: "rawdat-khuraim", en: "Rawdat Khuraim", ar: "روضة خريم", at: [25.385, 47.275],
        plants: ["talh", "sidr", "arfaj", "rimth", "harmal"] },
      { id: "red-sands", en: "Red sand dunes (off the Makkah Road)", ar: "الرمال الحمراء (طريق مكة)", at: [24.49, 46.2],
        plants: ["ghada", "arfaj", "harmal", "rimth"] },
      { id: "al-hair", en: "Al-Ha'ir farms (south Riyadh)", ar: "مزارع الحائر (جنوب الرياض)", at: [24.4, 46.83],
        plants: ["date-palm", "lemon", "pomegranate", "fig", "olive", "mint", "moringa", "athel"] }
    ],

    // Plants that are easy to mix up, with a tip for telling them apart.
    lookalikes: [
      { a: "samur", b: "talh",
        en: "Samur has a flat, umbrella-shaped top and small curly pods. Talh has a rounder, untidy crown, rough dark bark and straight grey pods.",
        ar: "السمر تاجه مسطّح مثل المظلة وقرونه صغيرة ملتفة. أما الطلح فتاجه أكثر استدارة وغير مرتب، ولحاؤه داكن خشن، وقرونه مستقيمة رمادية." },
      { a: "ghada", b: "rimth",
        en: "Ghada is a tall, tree-like shrub (2–5 m) on sand dunes, with thin drooping twigs. Rimth is a low, rounded bush on gravel plains, with short jointed stems.",
        ar: "الغضا شجيرة طويلة تشبه الشجرة (2 إلى 5 أمتار) تنمو على الكثبان الرملية، وأغصانها رفيعة متدلية. أما الرمث فشجيرة قصيرة مستديرة في السهول الحصوية، وسيقانه قصيرة مفصّلة." },
      { a: "date-palm", b: "washingtonia",
        en: "Date palm leaves are feather-shaped and its trunk is rough with old leaf bases. Washingtonia has fan-shaped leaves and a very tall, thin trunk, often with a brown \"skirt\".",
        ar: "سعف النخلة ريشي الشكل وجذعها خشن فيه بقايا الكرب. أما الواشنطونيا فأوراقها على شكل مروحة وجذعها طويل جداً ونحيل، وغالباً عليه \"تنورة\" بنية." },
      { a: "conocarpus", b: "ficus",
        en: "Conocarpus leaves are narrow, pointed and dull, with round button-like fruit. Ficus leaves are shiny and oval, and a broken leaf oozes white sap.",
        ar: "أوراق الكونوكاربس ضيقة ومدببة وغير لامعة، وثماره كروية صغيرة تشبه الأزرار. أما أوراق الفيكس فلامعة وبيضاوية، وإذا قطعت ورقة يخرج منها حليب أبيض." },
      { a: "oleander", b: "desert-rose",
        en: "Oleander is a tall shrub with long, narrow leaves all along its stems. Desert rose is small, with a fat swollen trunk and glossy leaves only at the branch tips.",
        ar: "الدفلة شجيرة طويلة أوراقها طويلة وضيقة على طول السيقان. أما وردة الصحراء فصغيرة، جذعها منتفخ، وأوراقها اللامعة في أطراف الأغصان فقط." },
      { a: "mesquite", b: "parkinsonia",
        en: "Parkinsonia has green bark and long, thin ribbon-like leaves, with yellow flowers marked red. Mesquite has dark bark, feathery leaves, yellow flower spikes and long bean pods.",
        ar: "الباركنسونيا لحاؤها أخضر وأوراقها طويلة رفيعة مثل الشرائط، وأزهارها صفراء فيها بقعة حمراء. أما البرسوبس فلحاؤه داكن وأوراقه ريشية، وأزهاره سنابل صفراء، وقرونه طويلة." },
      { a: "athel", b: "ghada",
        en: "Both look grey-green and needly. Athel is a real tree with tiny scale leaves and pinkish flower spikes, often planted around farms. Ghada is a shrub that grows wild on sand dunes.",
        ar: "الاثنان لونهما أخضر رمادي ويبدوان إبريين. الأثل شجرة حقيقية أوراقها حراشف صغيرة وأزهاره سنابل وردية، ويُزرع غالباً حول المزارع. أما الغضا فشجيرة برية تنمو على الكثبان الرملية." }
    ]
  }
};

// Shortcuts used in each plant's native range. "@NAME" expands to these countries.
window.REGIONS = {
  ARABIA: ["Saudi Arabia", "Yemen", "Oman", "United Arab Emirates", "Qatar", "Kuwait"],
  LEVANT: ["Jordan", "Israel", "Palestine", "Lebanon", "Syria"],
  NAFRICA: ["Egypt", "Libya", "Tunisia", "Algeria", "Morocco", "W. Sahara"],
  EAFRICA: ["Sudan", "S. Sudan", "Eritrea", "Ethiopia", "Djibouti", "Somalia", "Somaliland", "Kenya", "Uganda", "Tanzania"],
  SAFRICA: ["Mozambique", "Malawi", "Zambia", "Zimbabwe", "Botswana", "Namibia", "South Africa", "eSwatini", "Lesotho", "Angola"],
  CASIA: ["Kazakhstan", "Uzbekistan", "Turkmenistan", "Tajikistan", "Kyrgyzstan", "Afghanistan"],
  CAMERICA: ["Mexico", "Guatemala", "Belize", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panama"],
  NSAMERICA: ["Colombia", "Venezuela", "Ecuador", "Peru", "Guyana", "Suriname"]
};
