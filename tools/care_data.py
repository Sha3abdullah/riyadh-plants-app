# Care guide data -> js/care.js  (run: python3 tools/care_data.py)
# Fields: sun, water, salt, roots, growth, h (height), soil, ph, bloom (months in Riyadh), prop, tip (en, ar), warn (en, ar)
# sun: full | fullpart | part   water: low | med | high   salt: low | med | high
# roots: tap | deep | fibrous | spreading | shallow | invasive | runners | caudex | parasite
# soil: sandy | any | loam | drain   ph: alk (fine in alkaline soil) | neutral | acid (prefers acidic)
import json, os
Y="YEAR"
C = {}
def c(id, sun, water, salt, roots, growth, h, soil, ph, bloom, prop, tip_en, tip_ar, warn_en="", warn_ar="", types=None):
    C[id] = dict(sun=sun, water=water, salt=salt, roots=roots, growth=growth, h=h, soil=soil, ph=ph, bloom=bloom, prop=prop,
                 tip={"en": tip_en, "ar": tip_ar}, **({"warn": {"en": warn_en, "ar": warn_ar}} if warn_en else {}), **({"types": types} if types else {}))
R=lambda a,b: list(range(a,b+1))

c("date-palm","full","med","high","fibrous","slow","15–25 m","any","alk",[2,3,4],["sucker","tissue"],
 "Feed with a balanced fertilizer plus extra potassium in late winter and again when fruit sets; add well-rotted manure in winter. Hand-pollinate the female flowers in spring. Water deeply every 1–2 weeks in summer. Remove dead fronds and unwanted offshoots.",
 "سمّدها بسماد متوازن مع زيادة البوتاسيوم في آخر الشتاء وعند عقد الثمار، وأضف سماداً عضوياً متحللاً في الشتاء. لقّح الطلع يدوياً في الربيع. اسقها سقياً عميقاً كل أسبوع إلى أسبوعين في الصيف. أزل السعف اليابس والفسائل غير المرغوبة.",
 "Sharp spines at the base of the fronds.","أشواك حادة عند قاعدة السعف.")
c("sidr","full","low","high","tap","med","5–12 m","any","alk",[9,10,11],["seed","cutting"],
 "Very tough once established: water young trees deeply every 1–2 weeks in summer, older trees rarely. Needs little fertilizer; some compost in winter helps. Prune in winter to lift the canopy.",
 "قوي جداً بعد أن يثبت: اسقِ الشجرة الصغيرة سقياً عميقاً كل أسبوع إلى أسبوعين في الصيف، والكبيرة نادراً. لا يحتاج إلى سماد كثير، وقليل من السماد العضوي في الشتاء يفيده. قلّمه في الشتاء لرفع التاج.",
 "Hooked thorns — wear gloves when pruning.","أشواك معقوفة — البس قفازات عند التقليم.")
c("samur","full","low","high","tap","slow","4–10 m","sandy","alk",[3,4,5],["seed"],
 "Once established, one deep soak a month in summer is enough. No fertilizer needed — it fixes its own nitrogen. Soak seeds in hot water overnight before sowing. Its long taproot makes it hard to transplant, so plant it young in its final place.",
 "بعد أن يثبت يكفيه سقي عميق مرة في الشهر في الصيف. لا يحتاج إلى سماد لأنه يثبت النيتروجين بنفسه. انقع البذور في ماء ساخن ليلة قبل الزراعة. جذره الوتدي الطويل يصعّب نقله، فازرعه صغيراً في مكانه النهائي.",
 "Long, sharp thorns.","أشواك طويلة حادة.")
c("talh","full","low","high","tap","slow","5–12 m","any","alk",[4,5,6],["seed"],
 "Care is the same as samur: deep, rare watering and no fertilizer. Scarify or soak seeds in hot water before sowing. A native shade tree that needs very little once it has grown.",
 "العناية مثل السمر: سقي عميق ونادر ولا يحتاج إلى سماد. اخدش البذور أو انقعها في ماء ساخن قبل الزراعة. شجرة ظل محلية لا تحتاج إلا القليل بعد أن تكبر.",
 "Paired white thorns.","أشواك بيضاء مزدوجة.")
c("arak","fullpart","low","high","deep","slow","3–6 m","any","alk",[2,3,4],["seed","cutting"],
 "Handles salty soil and salty water well. Water deeply but rarely. Can be clipped into a dense hedge. Cut miswak sticks from young, straight shoots.",
 "يتحمل التربة المالحة والماء المالح جيداً. اسقه سقياً عميقاً لكن على فترات متباعدة. يمكن قصّه ليكون سياجاً كثيفاً. اقطع المساويك من الأغصان الصغيرة المستقيمة.")
c("ghada","full","low","med","deep","med","2–5 m","sandy","alk",[3,4],["seed"],
 "Needs deep, loose sand and very little water — it rots in heavy, wet soil. No fertilizer. Good for stabilising sand in desert gardens.",
 "يحتاج رملاً عميقاً مفككاً وماءً قليلاً جداً، ويتعفن في التربة الثقيلة الرطبة. لا يحتاج إلى سماد. مفيد لتثبيت الرمل في الحدائق الصحراوية.",
 "Cutting native trees and shrubs for firewood is banned in Saudi Arabia.","الاحتطاب وقطع الأشجار والشجيرات المحلية ممنوع في المملكة.")
c("rimth","full","low","high","deep","slow","0.5–1 m","any","alk",[10,11,12],["seed"],
 "A rangeland shrub: no fertilizer and very little water. Good for native desert gardens on gravel soil.",
 "شجيرة مراعٍ: لا تحتاج إلى سماد وتكفيها كمية قليلة جداً من الماء. مناسبة للحدائق الصحراوية المحلية في التربة الحصوية.")
c("arfaj","full","low","med","spreading","slow","0.5–1 m","sandy","alk",[2,3,4],["seed"],
 "Rain-fed shrub: water it only in the cool months, like winter rain, and leave it dry in summer when it goes grey and dormant.",
 "شجيرة تعتمد على المطر: اسقها في الأشهر الباردة فقط مثل مطر الشتاء، واتركها جافة في الصيف حين تصير رمادية وتسكن.")
c("athel","full","low","high","invasive","fast","6–15 m","any","alk",[5,6,7,8,9],["cutting"],
 "Grows easily from thick cuttings pushed into moist soil. An excellent windbreak for farms. Needs no fertilizer.",
 "يتكاثر بسهولة من العُقل السميكة المغروسة في تربة رطبة. مصدّ رياح ممتاز للمزارع. لا يحتاج إلى سماد.",
 "Deep, far-reaching roots — plant well away from buildings and pipes. Fallen leaves make the soil under it salty.","جذوره عميقة وممتدة — ازرعه بعيداً عن المباني والأنابيب. أوراقه المتساقطة تجعل التربة تحته مالحة.")
c("harmal","full","low","med","tap","med","0.5–1 m","any","alk",[2,3,4],["seed"],
 "Needs nothing — it thrives on neglect and grows on its own on grazed land. Not a garden plant.",
 "لا يحتاج إلى أي شيء، فهو ينمو وحده في الأراضي التي رعتها الماشية. ليس نبات حدائق.",
 "Poisonous — don't let children or animals eat it.","سام — لا تدع الأطفال أو الحيوانات تأكله.")
c("conocarpus","full","med","high","invasive","fast","5–15 m","any","alk",[3,4,5,9,10],["cutting"],
 "Grows very fast and takes heavy clipping into hedges. Needs regular water in summer. Many municipalities now recommend native trees instead.",
 "ينمو بسرعة كبيرة ويتحمل القص الشديد ليكون سياجاً. يحتاج إلى سقي منتظم في الصيف. كثير من البلديات صارت تنصح بالأشجار المحلية بدلاً منه.",
 "Aggressive roots break pipes, pools and foundations — keep it at least 10 m away from buildings.","جذوره العدوانية تكسر الأنابيب والمسابح والأساسات — ازرعه على بعد 10 أمتار على الأقل من المباني.")
c("neem","full","low","med","tap","fast","10–15 m","any","alk",[3,4,5],["seed"],
 "Drought-tolerant once established: water deeply every 1–2 weeks in summer. Dislikes waterlogging. A light feed of compost in spring is enough. Neem leaf or seed extract makes a natural pest spray.",
 "يتحمل الجفاف بعد أن يثبت: اسقه سقياً عميقاً كل أسبوع إلى أسبوعين في الصيف. لا يحب تجمع الماء. يكفيه قليل من السماد العضوي في الربيع. مستخلص أوراقه أو بذوره مبيد حشري طبيعي.",
 "Drops lots of leaves and fruit — messy near pools and cars.","يُسقط أوراقاً وثماراً كثيرة، ويسبب فوضى قرب المسابح والسيارات.")
c("washingtonia","full","med","med","fibrous","fast","20–30 m","any","alk",[4,5,6],["seed"],
 "Trim dead fronds every year. A palm fertilizer with magnesium and manganese keeps the leaves green. Roots are fibrous and not aggressive.",
 "قُصّ السعف اليابس كل سنة. سماد النخيل الذي فيه مغنيسيوم ومنغنيز يحافظ على خضرة الأوراق. جذوره ليفية وغير عدوانية.",
 "Dry fronds are a fire risk and have sharp teeth on the stalks.","السعف اليابس يسبب خطر الحريق، وعلى أعناقه أسنان حادة.")
c("ficus","fullpart","med","med","invasive","fast","3–15 m","any","alk",[],["cutting"],
 "Clip 3–4 times a year to keep a hedge shape. Feed with a nitrogen-rich fertilizer in spring for thick green leaves.",
 "قُصّه 3 أو 4 مرات في السنة ليحافظ على شكل السياج. سمّده بسماد غني بالنيتروجين في الربيع لتكون أوراقه كثيفة خضراء.",
 "Strong roots crack walls and pipes. The milky sap can irritate skin.","جذوره القوية تشقّ الجدران والأنابيب. عصارته الحليبية قد تهيّج الجلد.")
c("mesquite","full","low","high","tap","fast","5–10 m","any","alk",[3,4,5],["seed"],
 "Needs no care at all, and that is the problem: it is invasive. It's better not to plant it; pull up seedlings when you see them.",
 "لا يحتاج إلى أي عناية، وهذه هي المشكلة لأنه غازٍ. الأفضل ألا يُزرع، واقلع البادرات حين تراها.",
 "Invasive and thorny.","غازٍ وشوكي.")
c("parkinsonia","full","low","high","deep","fast","4–8 m","sandy","alk",[3,4,5,6],["seed"],
 "Water deeply every 2–3 weeks once established. No fertilizer needed. Prune in winter. It lives about 20 years.",
 "اسقها سقياً عميقاً كل أسبوعين إلى ثلاثة بعد أن تثبت. لا تحتاج إلى سماد. قلّمها في الشتاء. تعيش نحو 20 سنة.",
 "Thorny; can spread by seed.","شوكية، وقد تنتشر ببذورها.")
c("bougainvillea","full","low","med","shallow","fast","2–8 m (climber)","any","alk",[3,4,5,9,10,11],["cutting"],
 "Flowers best when kept a little dry and 'hungry'. Too much water and nitrogen give leaves instead of colour. Use a high-phosphorus and potassium fertilizer (for example 10-30-20) before flowering. Its roots are fragile, so don't break the root ball when planting.",
 "تزهر أفضل حين تبقى جافة قليلاً و«جائعة». الماء الكثير والنيتروجين يعطيان أوراقاً بدل الألوان. استخدم سماداً عالي الفسفور والبوتاسيوم (مثل 10-30-20) قبل موسم الإزهار. جذورها حساسة، فلا تكسر كتلة التربة عند الزراعة.",
 "Sharp thorns.","أشواك حادة.")
c("oleander","fullpart","low","high","spreading","med","2–5 m","any","alk",R(3,10),["cutting"],
 "Very tough and salt-tolerant. Prune after flowering to keep it bushy. A phosphorus-rich feed in spring gives more flowers.",
 "قوية جداً وتتحمل الملوحة. قلّمها بعد الإزهار لتبقى كثيفة. سماد غني بالفسفور في الربيع يعطي أزهاراً أكثر.",
 "Every part is highly poisonous. Wear gloves and never burn the cuttings.","كل أجزائها شديدة السمية. البس قفازات، ولا تحرق بقايا التقليم أبداً.")
c("jasmine","fullpart","med","low","shallow","med","1–3 m","loam","acid",R(4,10),["cutting","layering"],
 "Keep the soil moist but not wet, and give it afternoon shade in summer. Feed monthly in the growing season with a balanced or high-phosphorus fertilizer. Riyadh's soil is alkaline, so give iron chelate if leaves turn yellow with green veins. Pinch the tips for more flowers.",
 "حافظ على رطوبة التربة دون إغراق، وأعطه ظلاً بعد الظهر في الصيف. سمّده كل شهر في موسم النمو بسماد متوازن أو عالي الفسفور. تربة الرياض قلوية، فأعطه حديداً مخلبياً إذا اصفرّت الأوراق وبقيت عروقها خضراء. اقرص أطراف الأغصان لتكثر الأزهار.",
 types=[
  {"en":"Fulla jazani (Arabian jasmine), Jasminum sambac: small shrub, small white very fragrant flowers. This page.","ar":"الفل الجازاني (الياسمين العربي) Jasminum sambac: شجيرة صغيرة أزهارها بيضاء صغيرة عطرية جداً. هذه الصفحة.","id":"jasmine"},
  {"en":"Indian jasmine (frangipani), Plumeria: small tree with milky sap, big oval leaves and large white scented flowers.","ar":"الياسمين الهندي (الفتنة) Plumeria: شجرة صغيرة فيها حليب، أوراقها بيضاوية كبيرة وأزهارها بيضاء كبيرة عطرية.","id":"plumeria"},
  {"en":"Red climbing jasmine (Rangoon creeper), Combretum indicum: climber with white-to-red hanging flowers and a strong sweet scent.","ar":"الياسمين الأحمر المتسلق Combretum indicum: متسلق أزهاره متدلية تتحول من الأبيض إلى الأحمر ورائحته حلوة قوية.","id":"rangoon"},
  {"en":"Blue jasmine (plumbago), Plumbago auriculata: shrub with sky-blue flowers and no scent — not a true jasmine.","ar":"الياسمين الأزرق Plumbago auriculata: شجيرة أزهارها زرقاء سماوية بلا رائحة، وليست من الياسمين الحقيقي.","id":"plumbago"}])
c("hibiscus","fullpart","med","low","shallow","fast","2–4 m","loam","acid",R(3,11),["cutting"],
 "Likes regular water and feeding. A fertilizer high in potassium and low in phosphorus keeps the flowers coming. Yellow leaves in Riyadh often mean iron deficiency, so give iron chelate. Shelter it from hot afternoon wind.",
 "يحب السقي والتسميد المنتظم. السماد الغني بالبوتاسيوم والقليل الفسفور يحافظ على استمرار الأزهار. اصفرار الأوراق في الرياض غالباً سببه نقص الحديد، فأعطه حديداً مخلبياً. احمه من رياح العصر الحارة.")
c("lantana","full","low","med","spreading","fast","1–2 m","any","alk",R(3,11),["cutting","seed"],
 "Needs little water or fertilizer; too much of either reduces flowering. Cut it back hard in late winter. Remove the berries to stop it spreading.",
 "تحتاج ماءً وسماداً قليلاً، والإكثار منهما يقلل الإزهار. قُصّها قصاً قوياً في آخر الشتاء. أزل الثمار حتى لا تنتشر.",
 "Berries and leaves are toxic. Can become invasive.","الثمار والأوراق سامة، وقد تصبح غازية.")
c("texas-sage","full","low","med","deep","med","1–2.5 m","drain","alk",R(5,10),["cutting"],
 "Overwatering kills it: once established, water every 2–3 weeks in summer. No fertilizer needed. Don't shear it into boxes; light pruning keeps its natural shape and more flowers.",
 "السقي الزائد يقتلها. بعد أن تثبت اسقها كل أسبوعين إلى ثلاثة في الصيف. لا تحتاج إلى سماد. لا تقصّها على شكل مربعات، فالتقليم الخفيف يحافظ على شكلها الطبيعي ويكثّر الأزهار.")
c("desert-rose","full","low","med","caudex","slow","0.5–2 m","drain","neutral",[3,4,5,6,9,10],["seed","cutting","graft"],
 "Water only when the soil is completely dry, and almost not at all in winter. Use a cactus mix and a pot with drainage holes. A high-phosphorus fertilizer in spring gives more flowers.",
 "اسقها فقط حين تجف التربة تماماً، وتقريباً لا تسقها في الشتاء. استخدم خلطة صبار وأصيصاً فيه فتحات تصريف. السماد عالي الفسفور في الربيع يعطي أزهاراً أكثر.",
 "Milky sap is poisonous.","عصارتها الحليبية سامة.")
c("aloe-vera","fullpart","low","med","shallow","med","0.3–0.6 m","drain","alk",[1,2,3],["offset"],
 "Water every 2–3 weeks, and less in winter. Needs fast-draining soil. Separate the offsets (pups) to make new plants. Light afternoon shade in summer stops the leaves turning red.",
 "اسقها كل أسبوعين إلى ثلاثة، وأقل في الشتاء. تحتاج تربة سريعة التصريف. افصل الخلفات لتحصل على نباتات جديدة. ظل خفيف بعد الظهر في الصيف يمنع احمرار الأوراق.",
 "The yellow sap under the skin is a strong laxative — don't eat the leaves.","العصارة الصفراء تحت القشرة مسهّلة قوية — لا تأكل الأوراق.")
c("moringa","full","med","med","tap","fast","5–10 m","drain","alk",[2,3,4,9,10],["seed","cutting"],
 "Grows several metres a year. Cut it back to 2–3 m to keep the leaves within reach. Waterlogging rots the taproot. Pick the leaves often.",
 "تنمو عدة أمتار في السنة. قُصّها إلى 2–3 أمتار لتبقى الأوراق في متناول يدك. تجمّع الماء يعفّن جذرها الوتدي. اقطف الأوراق باستمرار.")
c("olive","full","low","med","spreading","slow","4–8 m","drain","alk",[3,4],["cutting","graft"],
 "Needs some winter cold to fruit well; Riyadh winters suit some varieties. Water deeply every 1–2 weeks in summer. Give nitrogen in late winter, and prune to open the centre after the harvest.",
 "يحتاج إلى برودة الشتاء ليثمر جيداً، وشتاء الرياض يناسب بعض الأصناف. اسقه سقياً عميقاً كل أسبوع إلى أسبوعين في الصيف. أعطه نيتروجيناً في آخر الشتاء، وقلّمه لفتح وسط الشجرة بعد الحصاد.")
c("pomegranate","full","med","med","spreading","med","2–5 m","any","alk",[3,4,5,6],["cutting"],
 "Steady deep watering while the fruit grows stops it splitting. Feed with potassium when the fruit forms. Remove suckers from the base.",
 "السقي العميق المنتظم وقت نمو الثمار يمنع تشققها. سمّده بالبوتاسيوم عند تكوّن الثمار. أزل الخلفات من القاعدة.")
c("fig","full","med","med","invasive","fast","3–6 m","any","alk",[],["cutting"],
 "Water regularly in summer, especially while fruiting, and mulch the roots. Prune in winter when it has no leaves. Figs ripen in summer (June–August).",
 "اسقها بانتظام في الصيف خاصة وقت الإثمار، وغطّ الجذور بالملش. قلّمها في الشتاء حين تسقط أوراقها. ينضج التين في الصيف (يونيو–أغسطس).",
 "The milky sap irritates skin. Roots are strong — keep away from pipes.","العصارة الحليبية تهيّج الجلد. جذورها قوية — ازرعها بعيداً عن الأنابيب.")
c("lemon","full","med","low","shallow","med","2–5 m","loam","acid",[2,3,4],["graft","cutting"],
 "Keep watering steady, because irregular water makes the fruit drop. Use a citrus fertilizer with micronutrients (iron, zinc, manganese); yellow leaves are common in Riyadh's alkaline soil. Protect young trees from hot wind.",
 "حافظ على انتظام السقي، فالسقي المتقطع يُسقط الثمار. استخدم سماد حمضيات فيه عناصر صغرى (حديد وزنك ومنغنيز)، فاصفرار الأوراق شائع في تربة الرياض القلوية. احمِ الأشجار الصغيرة من الرياح الحارة.")
c("mint","part","high","low","runners","fast","0.3–0.6 m","loam","neutral",[6,7,8],["cutting","division"],
 "Loves water and afternoon shade in Riyadh. Grow it in a pot, because it spreads by runners. Cut it often to keep it bushy; a nitrogen-rich feed gives more leaves.",
 "يحب الماء والظل بعد الظهر في الرياض. ازرعه في أصيص لأنه ينتشر بسيقان زاحفة. قصّه باستمرار ليبقى كثيفاً، والسماد الغني بالنيتروجين يعطي أوراقاً أكثر.")
c("awsaj","full","low","high","deep","slow","1–3 m","any","alk",[2,3,4],["seed"],
 "Very tough: water rarely once established. Makes a good thorny hedge that birds love in native gardens.",
 "قوي جداً: اسقه نادراً بعد أن يثبت. يصلح سياجاً شوكياً تحبه الطيور في الحدائق المحلية.",
 "Thorny.","شوكي.")
c("markh","full","low","med","deep","slow","1–3 m","sandy","alk",[3,4,5],["seed"],
 "A sand-dune plant: needs deep sand and very little water, and no fertilizer.",
 "نبات كثبان رملية: يحتاج رملاً عميقاً وماءً قليلاً جداً، ولا يحتاج إلى سماد.")
c("arta","full","low","med","spreading","med","1–2.5 m","sandy","alk",[2,3,4],["seed","cutting"],
 "Plant it in deep sand. Its long, spreading roots hold dunes in place. Very little water and no fertilizer.",
 "ازرعه في رمل عميق. جذوره الطويلة الممتدة تثبّت الكثبان. يحتاج ماءً قليلاً جداً ولا يحتاج إلى سماد.")
c("ushar","full","low","high","tap","fast","2–5 m","any","alk",R(1,12),["seed"],
 "Grows by itself on waste ground and roadsides. Not recommended for gardens.",
 "ينمو وحده في الأراضي المهملة وعلى جوانب الطرق. لا يُنصح بزراعته في الحدائق.",
 "Milky sap is poisonous and dangerous to the eyes.","عصارته الحليبية سامة وخطيرة على العين.")
c("hanzal","full","low","med","tap","fast","creeping, 1–3 m long","sandy","alk",[4,5,6],["seed"],
 "A desert creeper that needs no care. Seeds sprout after rain on sand.",
 "نبات صحراوي زاحف لا يحتاج إلى عناية. تنبت بذوره على الرمل بعد المطر.",
 "The fruit is toxic and a violent purgative — never eat it.","الثمرة سامة ومسهّلة بشدة — لا تأكلها أبداً.")
c("nussi","full","low","med","fibrous","med","0.3–0.6 m","sandy","alk",[2,3,4],["seed"],
 "A good native grass for low-water landscapes. Water in the cool months only.",
 "عشب محلي مناسب للمسطحات القليلة الماء. اسقه في الأشهر الباردة فقط.")
c("thumam","full","low","med","fibrous","med","0.5–1 m","sandy","alk",R(3,10),["seed","division"],
 "Very drought-tolerant clump grass. Divide old clumps to make new plants. No fertilizer.",
 "عشب كثيف شديد التحمل للجفاف. قسّم الكتل القديمة لتحصل على نباتات جديدة. لا يحتاج إلى سماد.")
c("kaff","full","low","med","tap","fast","5–15 cm","sandy","alk",[2,3,4],["seed"],
 "A small winter annual that appears after rain and dries in spring. The dried plant is sold in markets as \"kaff maryam\".",
 "عشبة شتوية حولية صغيرة تظهر بعد المطر وتجف في الربيع. تُباع النبتة المجففة في الأسواق باسم «كف مريم».")
c("shih","full","low","med","deep","slow","0.2–0.5 m","any","alk",[10,11,12],["seed","cutting"],
 "Needs very little water. Trim lightly after flowering. Grows well in dry, stony garden corners.",
 "يحتاج ماءً قليلاً جداً. قلّمه تقليماً خفيفاً بعد الإزهار. ينمو جيداً في زوايا الحديقة الجافة الحجرية.")
c("qaysoom","full","low","med","deep","slow","0.3–0.6 m","drain","alk",[3,4,5],["seed","cutting"],
 "Makes a silver, scented shrub for dry gardens. Trim after flowering. Overwatering rots it.",
 "شجيرة فضية عطرية للحدائق الجافة. قلّمه بعد الإزهار. السقي الزائد يعفّنه.")
c("salam","full","low","high","tap","slow","2–5 m","any","alk",[3,4,5],["seed"],
 "Like other acacias: soak seeds in hot water, water rarely, no fertilizer.",
 "مثل بقية أنواع الأكاسيا: انقع البذور في ماء ساخن، واسقه نادراً، ولا يحتاج إلى سماد.",
 "Straight white thorns.","أشواك بيضاء مستقيمة.")
c("sarh","full","low","high","deep","slow","3–8 m","any","alk",[2,3,4],["seed"],
 "Evergreen and very drought-tolerant. Slow to grow but long-lived. No fertilizer.",
 "دائم الخضرة وشديد التحمل للجفاف. بطيء النمو لكنه معمّر. لا يحتاج إلى سماد.")
c("dhanoon","full","low","med","parasite","med","0.3–0.5 m","sandy","alk",[2,3,4],["seed"],
 "It can't be planted on its own: it's a parasite that grows on the roots of host shrubs such as rimth, arta and athel.",
 "لا يمكن زراعته وحده، فهو نبات متطفل ينمو على جذور شجيرات أخرى مثل الرمث والأرطى والأثل.")
c("humaidh","full","low","med","tap","fast","0.2–0.5 m","sandy","alk",[2,3,4],["seed"],
 "A winter-spring annual. Sow after the first rains or in pots in October, and water lightly.",
 "عشب حولي شتوي ربيعي. ازرعه بعد أول الأمطار أو في أصص في أكتوبر، واسقه سقياً خفيفاً.",
 "Contains oxalic acid — eat it in moderation.","يحتوي على حمض الأكساليك — كُله باعتدال.")
c("sadan","full","low","med","tap","fast","a few cm","sandy","alk",[2,3,4],["seed"],
 "A small annual that appears after rain on sand. Needs no care.",
 "عشب حولي صغير يظهر على الرمل بعد المطر. لا يحتاج إلى عناية.",
 "Spiny fruits stick to feet and tyres.","ثماره الشوكية تلتصق بالأقدام والإطارات.")
c("albizia","full","med","med","invasive","fast","10–20 m","any","alk",[4,5,6],["seed"],
 "A big shade tree for large spaces only. Deep watering every 1–2 weeks in summer. Little fertilizer needed.",
 "شجرة ظل كبيرة تناسب المساحات الواسعة فقط. سقي عميق كل أسبوع إلى أسبوعين في الصيف. تحتاج قليلاً من السماد.",
 "Spreading roots; drops lots of pods.","جذور ممتدة، وتُسقط قروناً كثيرة.")
c("tecoma","full","low","med","spreading","fast","2–5 m","any","alk",R(3,11),["seed","cutting"],
 "Cut it back in late winter to keep it compact and full of flowers. A phosphorus-rich feed in spring boosts flowering. Remove the seed pods if you don't want seedlings.",
 "قُصّها في آخر الشتاء لتبقى متماسكة ومليئة بالأزهار. السماد الغني بالفسفور في الربيع يزيد الإزهار. أزل القرون إذا لم ترغب في البادرات.",
 "Self-seeds and can spread.","تنثر بذورها وقد تنتشر.")
c("dodonaea","full","low","high","deep","fast","2–4 m","any","alk",[2,3],["seed","cutting"],
 "An excellent low-water hedge. Clip twice a year. No fertilizer needed.",
 "سياج ممتاز قليل الماء. قُصّها مرتين في السنة. لا تحتاج إلى سماد.")
c("casuarina","full","med","high","invasive","fast","10–25 m","sandy","alk",[3,4],["seed"],
 "A windbreak tree that fixes its own nitrogen, so it needs no fertilizer.",
 "شجرة مصدّة للرياح تثبّت النيتروجين بنفسها، فلا تحتاج إلى سماد.",
 "Far-reaching roots — keep away from buildings and pipes. Its needle litter stops plants growing underneath.","جذورها ممتدة — ازرعها بعيداً عن المباني والأنابيب. أوراقها الإبرية المتساقطة تمنع نمو النباتات تحتها.")
c("eucalyptus","full","med","med","invasive","fast","15–30 m","any","alk",[6,7,8,9],["seed"],
 "Plant it only in large open spaces. Needs deep watering in summer while young.",
 "ازرعها في المساحات المفتوحة الواسعة فقط. تحتاج سقياً عميقاً في الصيف وهي صغيرة.",
 "Uses a lot of water, roots travel far, and branches can drop without warning.","تستهلك ماءً كثيراً، وجذورها تمتد بعيداً، وقد تسقط أغصانها فجأة.")
c("clerodendrum","fullpart","med","high","spreading","fast","1–3 m","any","alk",R(4,10),["cutting"],
 "An excellent salt-tolerant hedge. Clip 3–4 times a year and give a balanced fertilizer in spring.",
 "سياج ممتاز يتحمل الملوحة. قُصّه 3 أو 4 مرات في السنة، وأعطه سماداً متوازناً في الربيع.")
c("duranta","fullpart","med","med","spreading","fast","2–4 m","any","alk",R(3,11),["cutting","seed"],
 "Clip for hedges; light pruning keeps the flowers coming. Give iron chelate if the leaves turn yellow.",
 "قُصّها لتكون سياجاً، والتقليم الخفيف يحافظ على الأزهار. أعطها حديداً مخلبياً إذا اصفرّت الأوراق.",
 "The golden berries are poisonous.","الثمار الذهبية سامة.")
c("periwinkle","full","low","med","shallow","fast","0.3–0.6 m","drain","alk",R(3,11),["seed","cutting"],
 "Hates wet feet: overwatering causes root rot. A great summer bedding flower for Riyadh. Pinch the tips for bushier plants.",
 "لا تحب تجمع الماء، فالسقي الزائد يعفّن الجذور. من أفضل أزهار الأحواض الصيفية في الرياض. اقرص الأطراف لتصبح أكثف.",
 "Poisonous if eaten.","سامة إذا أُكلت.")
c("basil","part","med","low","shallow","fast","0.3–0.6 m","loam","neutral",R(5,10),["seed","cutting"],
 "Pinch off the flower spikes to keep the leaves tender and tasty. It grows best in Riyadh's cooler months (October–May); in summer give it shade and water daily.",
 "اقرص الشماريخ الزهرية لتبقى الأوراق طرية ولذيذة. ينمو أفضل في أشهر الرياض الباردة (أكتوبر–مايو)، وفي الصيف أعطه ظلاً واسقه يومياً.",
 types=[
  {"en":"Shamoum (local Saudi basil): tall purple flower spikes, very strong scent, tough in heat.","ar":"الشموم (الريحان البلدي): شماريخ بنفسجية طويلة ورائحة قوية جداً، ويتحمل الحر.","id":"shamoum"},
  {"en":"White-flowered basil: green plant with white flower spikes and a milder smell. Several basils look like this (for example sweet basil left to flower, or lemon basil, Ocimum × africanum); local names vary.","ar":"ريحان بزهر أبيض: نبتة خضراء شماريخها بيضاء ورائحتها أخف. أكثر من نوع يشبه هذا الوصف (مثل الريحان الحلو إذا تُرك يزهر، أو الريحان الليموني Ocimum × africanum)، وأسماؤه المحلية تختلف."},
  {"en":"Italian (Genovese) basil: big, soft, shiny leaves and a sweet smell; the kitchen basil for pasta and pesto. This page.","ar":"الريحان الإيطالي (جنوفيزي): أوراق كبيرة طرية لامعة ورائحة حلوة، وهو ريحان الطبخ للمعكرونة والبيستو. هذه الصفحة.","id":"basil"},
  {"en":"Thai basil: purple stems and flowers, anise (licorice) taste; used in Asian cooking.","ar":"الريحان التايلندي: سيقان وأزهار بنفسجية وطعم يشبه اليانسون، ويُستخدم في الطبخ الآسيوي."},
  {"en":"Holy basil (tulsi), Ocimum tenuiflorum: hairy leaves, clove-like smell; used for herbal tea.","ar":"الريحان المقدس (تولسي) Ocimum tenuiflorum: أوراق مشعرة ورائحة تشبه القرنفل، ويُستخدم شاياً عشبياً."}])
c("shamoum","fullpart","med","low","shallow","fast","0.5–1 m","loam","alk",R(3,11),["seed","cutting"],
 "Tougher than Italian basil and handles Riyadh's heat with daily watering. Let some spikes flower for scent and seed, and cut others to keep it bushy. A light nitrogen feed every month keeps it leafy.",
 "أقوى من الريحان الإيطالي ويتحمل حر الرياض إذا سُقي يومياً. اترك بعض الشماريخ تزهر للرائحة والبذور، واقطع الباقي ليبقى كثيفاً. سماد نيتروجيني خفيف كل شهر يحافظ على كثافة أوراقه.",
 types="basil")
c("henna","full","low","med","deep","med","2–5 m","any","alk",R(5,9),["seed","cutting"],
 "Loves heat. Pick leaves from young shoots, and prune regularly to keep it bushy.",
 "تحب الحر. اقطف الأوراق من الأغصان الصغيرة، وقلّمها بانتظام لتبقى كثيفة.")
c("grape","full","med","med","deep","fast","5–15 m (climber)","any","alk",[3,4],["cutting"],
 "Prune hard in January, leaving 2–3 buds per shoot for fruit. Feed with potassium when the grapes form. Needs a strong pergola. Grapes ripen June–August.",
 "قلّمه تقليماً قوياً في يناير واترك 2–3 براعم في كل فرع للثمر. سمّده بالبوتاسيوم عند تكوّن العناقيد. يحتاج عريشة قوية. ينضج العنب من يونيو إلى أغسطس.")
c("mulberry","full","med","med","invasive","fast","8–15 m","any","alk",[2,3],["cutting"],
 "Easy and fast-growing. Water deeply in summer. Fruit ripens in spring (March–May).",
 "سهل وسريع النمو. اسقه سقياً عميقاً في الصيف. تنضج ثماره في الربيع (مارس–مايو).",
 "Strong surface roots lift paving. The fruit stains floors and cars.","جذوره السطحية القوية ترفع البلاط، وثماره تصبغ الأرضيات والسيارات.")
c("guava","full","med","low","shallow","fast","3–6 m","loam","acid",[3,4,5,9,10],["seed","cutting","layering"],
 "Water regularly in summer and mulch. Use a balanced fertilizer with micronutrients (iron and zinc) for Riyadh's alkaline soil.",
 "اسقها بانتظام في الصيف وغطّ التربة بالملش. استخدم سماداً متوازناً فيه عناصر صغرى (حديد وزنك) لتربة الرياض القلوية.")
c("thayyil","full","high","med","runners","fast","3–5 cm (mown)","any","alk",R(4,9),["division"],
 "Needs lots of water in summer (often daily) and nitrogen every 6–8 weeks. Mow regularly at 3–4 cm. It won't grow in shade, so use other ground covers under trees.",
 "يحتاج ماءً كثيراً في الصيف (غالباً يومياً) ونيتروجيناً كل 6–8 أسابيع. قُصّه بانتظام على ارتفاع 3–4 سم. لا ينمو في الظل، فاستخدم غطاءً أرضياً آخر تحت الأشجار.")
c("alfalfa","full","high","med","tap","fast","0.6–1 m","loam","alk",R(3,10),["seed"],
 "Fixes nitrogen, so it needs little nitrogen fertilizer but likes phosphorus and potassium. Cut every 3–5 weeks. Its taproot can reach several metres deep.",
 "يثبت النيتروجين فلا يحتاج إلى سماد نيتروجيني كثير، لكنه يحب الفسفور والبوتاسيوم. يُحشّ كل 3–5 أسابيع. جذره الوتدي قد يصل إلى عدة أمتار عمقاً.",
 "Very water-hungry: large alfalfa farms use a lot of Saudi groundwater.","يستهلك ماءً كثيراً جداً، ومزارعه الكبيرة تستنزف المياه الجوفية في المملكة.")
c("plumeria","full","low","med","shallow","med","3–6 m","drain","neutral",R(4,10),["cutting"],
 "Water deeply only when the soil has dried out, and keep it dry in winter when it may drop its leaves. A high-phosphorus fertilizer gives more flowers. Cuttings root easily after drying for a week.",
 "اسقه سقياً عميقاً فقط حين تجف التربة، وأبقه جافاً في الشتاء حين قد يُسقط أوراقه. السماد عالي الفسفور يعطي أزهاراً أكثر. تتجذر العُقل بسهولة بعد تجفيفها أسبوعاً.",
 "White milky sap irritates skin and eyes.","الحليب الأبيض يهيّج الجلد والعين.", types="jasmine")
c("rangoon","fullpart","med","med","spreading","fast","5–8 m (climber)","loam","neutral",R(3,11),["cutting","sucker"],
 "Needs a strong support. Prune after flowering to control its size. A monthly balanced feed in summer keeps it flowering.",
 "يحتاج دعامة قوية. قلّمه بعد الإزهار للتحكم في حجمه. سماد متوازن كل شهر في الصيف يحافظ على إزهاره.",
 "Suckers from the roots can spread.","الخلفات من الجذور قد تنتشر.", types="jasmine")
c("plumbago","fullpart","med","med","spreading","fast","1–3 m","any","neutral",R(3,11),["cutting"],
 "Prune in late winter, because it flowers on new growth. Give iron chelate if the leaves turn pale.",
 "قلّمه في آخر الشتاء لأنه يزهر على النموات الجديدة. أعطه حديداً مخلبياً إذا شحب لون الأوراق.", types="jasmine")
c("vitex","full","low","med","deep","fast","3–5 m","drain","alk",R(4,10),["cutting","seed"],
 "Very drought-tolerant. It flowers on new wood, so cut it back in late winter. Remove old flower spikes to get more blooms. Bees love it.",
 "يتحمل الجفاف كثيراً. يزهر على الخشب الجديد، فقُصّه في آخر الشتاء. أزل الشماريخ القديمة لتحصل على أزهار أكثر. النحل يحبه.")
c("ipomoea","full","med","med","shallow","fast","2–3 m (climber)","any","neutral",R(4,10),["seed"],
 "Soak the seeds overnight before sowing in spring. Give it a fence or trellis. Too much fertilizer gives leaves instead of flowers.",
 "انقع البذور ليلة قبل زراعتها في الربيع. أعطها سوراً أو تعريشة. السماد الكثير يعطي أوراقاً بدل الأزهار.",
 "Seeds are poisonous. It self-seeds and can spread.","البذور سامة، وتنثر بذورها وقد تنتشر.")

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT,"js","care.js"),"w") as f:
    f.write("/* Care guide for each plant. Generated from tools/care_data.py. */\n")
    f.write("window.CARE = "+json.dumps(C,ensure_ascii=False,indent=1)+";\n")
print(len(C))
