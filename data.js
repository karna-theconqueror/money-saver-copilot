// MoneySaver Copilot — India benefits database (curated, verifiable schemes)
// Profile shape: { incomeLakh, age, gender, work, state, flags:Set }
// flags: 'girl','nopucca','vendor','land','unorg','ration','divyang'
// tag: cash | subsidy | cover | loan | training | savings
// value: estimated ANNUAL rupee value (cash/subsidy only counted in total)
// hi: Hindi name + summary (rest of UI translated via langs.js)
// scope: 'urban' | 'rural' (optional) — requires profile.flags 'urban'|'rural'

const VERIFIED = "October 2026";

const SCHEMES = [
  {
    id:'pmkisan', name:'PM-KISAN Samman Nidhi', agency:'Ministry of Agriculture & Farmers Welfare',
    tag:'cash', value:6000, worth:'₹6,000 / year',
    hi:{name:'पीएम-किसान सम्मान निधि', why:'कृषि योग्य ज़मीन रखने वाले किसान परिवारों को हर साल ₹6,000 की तीन किस्तों में सीधे बैंक खाते में मिलते हैं।'},
    who:'Small & marginal farmer families with land',
    why:'Farmer families with cultivable land receive ₹6,000 a year in three instalments, straight into their bank account.',
    match:p=>p.work==='farmer' && p.flags.has('land'),
    steps:['Aadhaar card','Land ownership records (khatauni / 7-12 extract)','Bank passbook (linked to Aadhaar)','Self-register at pmkisan.gov.in or visit your nearest CSC'],
    url:'https://pmkisan.gov.in'
  },
  {
    id:'pmjay', name:'Ayushman Bharat PM-JAY', agency:'National Health Authority',
    tag:'cover', value:0, worth:'₹5,00,000 health cover / family / year',
    hi:{name:'आयुष्मान भारत पीएम-जेएवाई', why:'परिवार के सभी सदस्यों के लिए ₹5 लाख तक का मुफ़्त अस्पताल इलाज कवर — कोई प्रीमियम नहीं।'},
    who:'Families with income up to ₹5 lakh (varies by state)',
    why:'Free hospitalisation cover of ₹5 lakh for your whole family at empanelled hospitals — no premium to pay.',
    match:p=>p.incomeLakh<=5,
    steps:['Aadhaar card','Ration card / family ID','Income certificate (if asked)','Check eligibility & create card at pmjay.gov.in or via CSC'],
    url:'https://pmjay.gov.in'
  },
  {
    id:'nfsa', name:'Subsidised Food Grain (NFSA / Ration)', agency:'Department of Food & Public Distribution',
    tag:'subsidy', value:15000, worth:'~₹15,000 / year in food grain value',
    hi:{name:'रियायती अनाज (राशन योजना)', why:'पात्र परिवारों को लगभग ₹3 प्रति किलो की दर से अनाज — बाज़ार मूल्य पर यह हर साल लगभग ₹15,000 की बचत है।'},
    who:'Eligible low-income households (₹35 kg rice/wheat at ~₹3/kg)',
    why:'A family of four gets 140 kg of rice or wheat a month at about ₹3/kg — worth roughly ₹15,000 a year at market prices.',
    match:p=>p.incomeLakh<=2.5 || p.flags.has('ration'),
    steps:['Aadhaar card','Address proof','Family details / marriage certificate if needed','Apply at nfsa.gov.in or your local ration office'],
    url:'https://nfsa.gov.in'
  },
  {
    id:'pmay_u', name:'PM Awas Yojana (Urban)', agency:'Ministry of Housing & Urban Affairs',
    tag:'subsidy', value:0, worth:'Up to ₹2.35 L one-time subsidy',
    scope:'urban',
    hi:{name:'पीएम आवास योजना (शहरी)', why:'शहर में पक्का मकान न होने पर सरकारी सब्सिडी और सस्ता होम लोन — सबसे बड़ा आवास लाभ।'},
    who:'Families without a pucca house, income up to ₹8 lakh',
    why:'A capital subsidy plus a cheaper home loan if you don’t own a pucca house in an urban area — the single biggest housing benefit in India.',
    match:p=>p.flags.has('nopucca') && p.incomeLakh<=8 && p.flags.has('urban'),
    steps:['Aadhaar card','Income certificate','Bank / loan papers','Apply at pmay-urban.gov.in or via CSC'],
    url:'https://pmay-urban.gov.in'
  },
  {
    id:'pmay_g', name:'PM Awas Yojana (Gramin)', agency:'Ministry of Rural Development',
    tag:'subsidy', value:0, worth:'~₹1.20 L housing assistance',
    scope:'rural',
    hi:{name:'पीएम आवास योजना (ग्रामीण)', why:'गाँव में पक्का मकान न होने पर मकान बनाने के लिए सरकारी सहायता और मुफ़्त श्रम।'},
    who:'Rural households without a pucca house (BPL / SECC listed)',
    why:'Around ₹1.20 lakh of assistance to build a pucca house in rural areas, plus 90–95 days of free unskilled labour under MGNREGS.',
    match:p=>p.flags.has('nopucca') && p.flags.has('rural'),
    steps:['Aadhaar card','Job card / SECC listing proof','Bank passbook','Apply at pmayg.nic.in or Gram Panchayat / block office'],
    url:'https://pmayg.nic.in'
  },
  {
    id:'mgnrega', name:'MGNREGS — 100 Days Guaranteed Work', agency:'Ministry of Rural Development',
    tag:'cash', value:22000, worth:'~₹22,000 / year (100 days at local wage)',
    scope:'rural',
    hi:{name:'मनरेगा — 100 दिन की गारंटीशुदा रोज़गार', why:'ग्रामीण परिवारों को हर साल 100 दिनों का कानूनी अधिकार — मज़दूरी सीधे बैंक खाते में।'},
    who:'Rural households willing to do unskilled manual work',
    why:'A legal guarantee of 100 days of wage work per rural household per year, with wages paid directly to your bank account.',
    match:p=>p.flags.has('rural') && p.work!=='salaried',
    steps:['Aadhaar card','Bank passbook','Register for a Job Card at Gram Panchayat / block office','Demand work in writing and keep the receipt'],
    url:'https://nrega.nic.in'
  },
  {
    id:'nspsch', name:'National Scholarship Portal (Pre/Post Matric)', agency:'Ministry of Education & partner states',
    tag:'cash', value:12000, worth:'₹5,000 – ₹25,000 / year',
    hi:{name:'राष्ट्रीय छात्रवृत्ति पोर्टल', why:'पढ़ने वाले बच्चों के लिए फ़ीस और पढ़ाई खर्च पर सीधी सहायता — केंद्र और राज्य योजनाएँ एक ही पोर्टल पर।'},
    who:'Students from families with income up to ₹2.5 lakh',
    why:'One portal covers dozens of central and state scholarships — tuition support and maintenance allowance paid directly to your bank.',
    match:p=>p.work==='student' && p.incomeLakh<=2.5,
    steps:['Aadhaar card','Income certificate / BPL card','Previous marksheet','Bank passbook','Register and apply at nsp.gov.in'],
    url:'https://nsp.gov.in'
  },
  {
    id:'poshan', name:'PM POSHAN (Mid-Day Meal)', agency:'Ministry of Education',
    tag:'subsidy', value:6000, worth:'~₹6,000 / year in free meals',
    hi:{name:'पीएम पोषण (मिड-डे मील)', why:'सरकारी स्कूलों के बच्चों को हर स्कूल दिन गरम पौष्टिक भोजन — बिल्कुल मुफ़्त।'},
    who:'Children in government and aided schools (Classes 1–8)',
    why:'A free hot cooked meal every school day — nutrition and attendance support worth thousands per child per year.',
    match:p=>p.work==='student',
    steps:['School enrolment','Aadhaar for the child','No income proof needed','Visit your nearest government school office'],
    url:'https://poshan.nic.in'
  },
  {
    id:'ujjwala', name:'PMUY — Free LPG Connection & Subsidy', agency:'Ministry of Petroleum & Natural Gas',
    tag:'subsidy', value:3600, worth:'~₹3,600 / year (₹300 / month subsidy)',
    hi:{name:'उज्ज्वला योजना — मुफ़्त एलपीजी कनेक्शन', why:'पात्र महिलाओं को मुफ़्त गैस कनेक्शन और हर सिलेंडर पर मासिक सब्सिडी सीधे बैंक में।'},
    who:'Eligible women from low-income households (up to ₹3 lakh)',
    why:'A free LPG connection plus a monthly subsidy credited to your bank for every cylinder you refill.',
    match:p=>p.gender==='female' && p.incomeLakh<=3,
    steps:['Aadhaar card','Ration card','Bank passbook','Apply at pmuy.gov.in or any LPG distributor'],
    url:'https://www.pmuy.gov.in'
  },
  {
    id:'sukanya', name:'Sukanya Samriddhi Yojana', agency:'Ministry of Finance / India Post',
    tag:'savings', value:3000, worth:'8.2% tax-free interest',
    hi:{name:'सुकन्या समृद्धि योजना', why:'10 साल से छोटी बेटी के नाम पर बचत — देश की सबसे ऊँची गारंटीड ब्याज दर, पूरी तरह कर-मुक्त।'},
    who:'Parents of a girl child under 10 years',
    why:'The highest guaranteed-return savings scheme in India — interest is fully tax-free and the money is locked for her education and marriage.',
    match:p=>p.flags.has('girl'),
    steps:['Girl child’s birth certificate','Guardian’s Aadhaar','Open at any post office or authorised bank','Invest at least ₹250 / year'],
    url:'https://www.india.gov.in/sukanya-samriddhi-yojana-scheme-details'
  },
  {
    id:'apy', name:'Atal Pension Yojana', agency:'PFRDA',
    tag:'savings', value:4000, worth:'₹1,000 – ₹5,000 / month pension after 60',
    hi:{name:'अटल पेंशन योजना', why:'असंगठित कामगारों के लिए छोटी मासिक बचत, जो 60 की उम्र के बाद जीवन भर गारंटीशुदा पेंशन देती है।'},
    who:'Unorganised workers aged 18–40 without PF or pension',
    why:'A small monthly contribution now buys a guaranteed government pension for life after age 60.',
    match:p=>p.age>=18 && p.age<=40 && p.flags.has('unorg') && p.work!=='salaried',
    steps:['Aadhaar card','Savings bank account','Mobile number','Open at your bank branch or via net banking'],
    url:'https://www.npscra.nsdl.co.in/scheme-details.php'
  },
  {
    id:'pmjjby', name:'PM Jeevan Jyoti Bima (PMJJBY)', agency:'Life Insurance Corporation of India',
    tag:'cover', value:0, worth:'₹2,00,000 life cover for ₹435 / year',
    hi:{name:'पीएम जीवन ज्योति बीमा', why:'सिर्फ़ ₹435 सालाना में ₹2 लाख का जीवन बीमा — बैंक खाते से अपने आप कटौती।'},
    who:'Any person aged 18–50 with a bank account',
    why:'Two lakh rupees of life cover for less than the price of a movie ticket per month — auto-debited from your bank account.',
    match:p=>p.age>=18 && p.age<=50,
    steps:['Aadhaar card','Savings account','Give one-time consent at your bank branch or net banking'],
    url:'https://www.jansuraksha.gov.in'
  },
  {
    id:'pmsby', name:'PM Suraksha Bima (PMSBY)', agency:'Insurance companies via banks',
    tag:'cover', value:0, worth:'₹2,00,000 accident cover for ₹20 / year',
    hi:{name:'पीएम सुरक्षा बीमा', why:'सालाना सिर्फ़ ₹20 में ₹2 लाख का दुर्घटना बीमा — देश का सबसे सस्ता बीमा।'},
    who:'Any person aged 18–70 with a bank account',
    why:'₹2 lakh accidental death or total permanent disability cover — the cheapest insurance in the country.',
    match:p=>p.age>=18 && p.age<=70,
    steps:['Aadhaar card','Savings account','Give one-time consent at your bank'],
    url:'https://www.jansuraksha.gov.in'
  },
  {
    id:'eshram', name:'e-Shram Card (Unorganised Workers)', agency:'Ministry of Labour & Employment',
    tag:'cover', value:0, worth:'₹2 L accident cover + pension link',
    hi:{name:'ई-श्रम कार्ड', why:'असंगठित कामगारों के लिए एक रजिस्ट्रेशन — दुर्घटना बीमा और भविष्य की सामाजिक सुरक्षा योजनाओं का लाभ।'},
    who:'Unorganised workers aged 16–59 (not in EPFO/ESIC)',
    why:'One registration unlocks accident insurance and puts you on the list for future social-security schemes for labourers, domestic workers, street workers and farmers.',
    match:p=>p.flags.has('unorg') && p.age>=16 && p.age<=59 && p.work!=='salaried',
    steps:['Aadhaar card (mobile-linked for OTP)','Bank passbook','Register free at eshram.gov.in or any CSC'],
    url:'https://eshram.gov.in'
  },
  {
    id:'svanidhi', name:'PM SVANidhi (Street Vendor Loan)', agency:'Ministry of Housing & Urban Affairs',
    tag:'loan', value:6000, worth:'₹50,000 working-capital loan + interest subsidy',
    scope:'urban',
    hi:{name:'पीएम स्वनिधि — रेहड़ी-पटरी ऋण', why:'छोटे दुकानदारों को बिना गारंटी कार्यशील पूँजी ऋण, ब्याज सब्सिडी और समय पर चुकाने पर कैशबैक।'},
    who:'Street vendors and small shop owners in urban areas',
    why:'A collateral-free working loan with an interest subsidy, and a cashback reward for repaying on time — built for the smallest businesses.',
    match:p=>(p.flags.has('vendor') || p.work==='business') && p.flags.has('urban'),
    steps:['Aadhaar card','Certificate of vending / letter from ULB (or a vendor declaration)','Bank passbook','Apply via pmsvanidhi.mohua.gov.in or a CSC / bank'],
    url:'https://pmsvanidhi.mohua.gov.in'
  },
  {
    id:'mudra', name:'MUDRA Loan (PMMY)', agency:'SIDBI / public sector banks',
    tag:'loan', value:0, worth:'Up to ₹10 L collateral-free business loan',
    hi:{name:'मुद्रा ऋण (पीएमएमवाई)', why:'दुकान, ठेला, व्यापार या छोटे काम के लिए बिना गारंटी ₹50,000 से ₹10 लाख तक का ऋण।'},
    who:'Self-employed, shopkeepers, traders, food vendors, artisans',
    why:'Shishu (up to ₹50k), Kishore (up to ₹5L) and Tarun (up to ₹10L) tranches — no collateral, government-guaranteed.',
    match:p=>p.work==='business',
    steps:['Aadhaar card','Business plan (one page is enough)','Bank passbook','Apply at any bank branch or pmmudra.org.in'],
    url:'https://www.mudra.org.in'
  },
  {
    id:'pmkvy', name:'Skill India (PMKVY) Free Training', agency:'Ministry of Skill Development',
    tag:'training', value:8000, worth:'Free certified skill training (worth ₹8k+)',
    hi:{name:'कौशल भारत (पीएमकेवीवाई) मुफ़्त प्रशिक्षण', why:'कंप्यूटर, रिटेल, ब्यूटी, इलेक्ट्रॉनिक्स जैसे छोटे कोर्स — पूरी तरह मुफ़्त, प्रमाणपत्र के साथ।'},
    who:'Students and job-seekers aged 15+',
    why:'Short-term certified courses — computers, retail, beauty, electronics, healthcare — completely free, with an assessment and certificate.',
    match:p=>p.work==='student' || p.work==='unemployed',
    steps:['Aadhaar card','2 photos','10th marksheet (if available)','Find a training centre at pmkvy4india.org.in or skillindiadigital.gov.in'],
    url:'https://skillindiadigital.gov.in'
  },
  {
    id:'bus', name:'Free Bus Travel for Women', agency:'State transport departments',
    tag:'subsidy', value:6000, worth:'~₹6,000 / year in free bus fares',
    hi:{name:'महिलाओं के लिए मुफ़्त बस यात्रा', why:'कई राज्यों में महिलाएँ सरकारी साधारण बसों में मुफ़्त यात्रा कर सकती हैं — हर महीने सीधी बचत।'},
    who:'Women travelling on state-run buses in eligible states',
    why:'Several states let women ride ordinary state buses free — a direct monthly saving for anyone who commutes.',
    match:p=>p.gender==='female' && ['Delhi','Karnataka','Telangana','Tamil Nadu','Punjab','Himachal Pradesh','Maharashtra','Goa'].includes(p.state),
    steps:['Aadhaar card','Some states want a bus pass — check your state transport website','Travel on ordinary (non-AC) state buses'],
    url:'https://www.myscheme.gov.in'
  },
  {
    id:'delhipower', name:'Delhi — 200 Units Free Electricity', agency:'Delhi Government / discoms',
    tag:'subsidy', value:2400, worth:'~₹2,400 / year savings',
    hi:{name:'दिल्ली — 200 यूनिट बिजली मुफ़्त', why:'दिल्ली में 200 यूनिट तक बिजली हर महीने मुफ़्त — सब्सिडी सीधे बिल में।'},
    who:'Delhi households consuming up to 200 units / month',
    why:'Up to 200 units of electricity per month are free in Delhi — the subsidy appears on your bill automatically if your meter is up to date.',
    match:p=>p.state==='Delhi',
    steps:['Aadhaar card','Latest electricity bill','Ensure your meter and Aadhaar are linked with your discom'],
    url:'https://www.myscheme.gov.in'
  },
  {
    id:'oap', name:'Indira Gandhi Old Age Pension (NSAP)', agency:'Ministry of Rural Development',
    tag:'cash', value:6000, worth:'₹300 – ₹500 / month',
    hi:{name:'इंदिरा गांधी वृद्धावस्था पेंशन', why:'60 साल से ऊपर, कम आय वाले बुज़ुर्गों को हर महीने सरकारी पेंशन — बहुत पात्र परिवार आवेदन ही नहीं करते।'},
    who:'Senior citizens aged 60+ from BPL households',
    why:'A monthly central pension for older people with little or no income — many eligible families never apply.',
    match:p=>p.age>=60 && p.incomeLakh<=2,
    steps:['Aadhaar card','Age proof','BPL card / income declaration','Apply at your Gram Panchayat, block office, or via CSC'],
    url:'https://nsap.nic.in'
  },
  {
    id:'dispen', name:'Disability Pension (NSAP — IGNDPS)', agency:'Ministry of Rural Development',
    tag:'cash', value:6000, worth:'₹300 – ₹500 / month',
    hi:{name:'दिव्यांग पेंशन (आईजीएनडीपीएस)', why:'गंभीर दिव्यांगता (80%+) वाले 18–59 आयु के लोगों को मासिक पेंशन।'},
    who:'Persons with severe disability (80%+) aged 18–59 in BPL households',
    why:'A monthly pension for people with 80% or more disability who cannot work — covers both rural and urban areas.',
    match:p=>p.flags.has('divyang') && p.age>=18 && p.age<=59 && p.incomeLakh<=2,
    steps:['Aadhaar card','Disability certificate (UDID card)','BPL card / income declaration','Apply at the block / municipal office or via CSC'],
    url:'https://nsap.nic.in'
  },
  {
    id:'rythu', name:'Rythu Bandhu (Telangana)', agency:'Government of Telangana',
    tag:'cash', value:12000, worth:'~₹6,000 / acre / season',
    hi:{name:'रैथू बंधु (तेलंगाना)', why:'तेलंगाना के किसानों को हर सीज़न खेती के निवेश सहायता के रूप में सीधा भुगतान।'},
    who:'Farmers in Telangana with cultivable land',
    why:'An investment support paid twice a year directly to farmer bank accounts for every acre cultivated.',
    match:p=>p.state==='Telangana' && p.work==='farmer' && p.flags.has('land'),
    steps:['Aadhaar card','Pattadar passbook / land records','Bank passbook','Enrol at your local Mandal agriculture office'],
    url:'https://rythubandhu.telangana.gov.in'
  },
  {
    id:'maiyasamman', name:'Jharkhand Mukhyamantri Maiya Samman Yojana', agency:'Government of Jharkhand',
    tag:'cash', value:30000, worth:'~₹2,500 / month (verify current rate)',
    hi:{name:'झारखंड मुख्यमंत्री मईया सम्मान योजना', why:'झारखंड की पात्र महिलाओं को हर महीने राज्य सहायता — नियम और दर की जाँच ज़रूर करें।'},
    who:'Eligible women aged 18–50 in Jharkhand',
    why:'A monthly state assistance transfer for eligible women — one of the largest per-household state benefits in India.',
    match:p=>p.state==='Jharkhand' && p.gender==='female' && p.age>=18 && p.age<=50,
    steps:['Aadhaar card','Residence proof of Jharkhand','Bank passbook','Apply via the state portal or designated camps (verify current rules)'],
    url:'https://www.myscheme.gov.in'
  },
  {
    id:'ladlibehna', name:'Delhi Mukhyamantri Ladli Behna Yojana', agency:'Government of Delhi',
    tag:'cash', value:30000, worth:'~₹2,500 / month (verify current rate)',
    hi:{name:'दिल्ली मुख्यमंत्री लाड़ली बहना योजना', why:'दिल्ली की पात्र महिलाओं को हर महीने सहायता राशि — हाल ही में शुरू, नवीनतम नियम जाँचें।'},
    who:'Eligible women aged 18–60 residing in Delhi',
    why:'A monthly assistance transfer to women in Delhi — recently launched, so check the latest eligibility rules on the state portal.',
    match:p=>p.state==='Delhi' && p.gender==='female' && p.age>=18 && p.age<=60,
    steps:['Aadhaar card','Delhi residence proof','Bank passbook','Apply via the Delhi state portal or authorised centres (verify current rules)'],
    url:'https://www.myscheme.gov.in'
  }
];

// PIN code (first 2 digits) → state/UT circle (approximate — user can override)
const PIN_CIRCLE = {
  '01':'Jammu & Kashmir','02':'Jammu & Kashmir','03':'Jammu & Kashmir','04':'Jammu & Kashmir','19':'Jammu & Kashmir',
  '11':'Delhi','12':'Haryana','13':'Haryana','14':'Punjab','15':'Punjab','16':'Punjab',
  '17':'Himachal Pradesh','18':'Chandigarh',
  '20':'Uttar Pradesh','21':'Uttar Pradesh','22':'Uttar Pradesh','23':'Uttar Pradesh','24':'Uttar Pradesh',
  '25':'Uttar Pradesh','26':'Uttarakhand','27':'Uttar Pradesh','28':'Uttar Pradesh',
  '30':'Rajasthan','31':'Rajasthan','32':'Rajasthan','33':'Rajasthan','34':'Rajasthan',
  '36':'Gujarat','37':'Gujarat','38':'Gujarat','39':'Gujarat',
  '40':'Maharashtra','41':'Maharashtra','42':'Maharashtra','43':'Maharashtra','44':'Maharashtra',
  '45':'Madhya Pradesh','46':'Madhya Pradesh','47':'Madhya Pradesh','48':'Madhya Pradesh','49':'Chhattisgarh',
  '50':'Telangana','51':'Telangana','52':'Andhra Pradesh','53':'Andhra Pradesh',
  '56':'Karnataka','57':'Karnataka','58':'Karnataka','59':'Karnataka',
  '60':'Tamil Nadu','61':'Tamil Nadu','62':'Tamil Nadu','63':'Tamil Nadu','64':'Tamil Nadu',
  '67':'Kerala','68':'Kerala','69':'Kerala',
  '70':'West Bengal','71':'West Bengal','72':'West Bengal','73':'West Bengal','74':'West Bengal',
  '75':'Odisha','76':'Odisha','77':'Odisha','78':'Assam',
  '79':'Arunachal Pradesh','80':'Bihar','81':'Bihar','82':'Jharkhand','83':'Jharkhand','84':'Bihar',
  '85':'Jharkhand','86':'Odisha',
  '90':'Uttar Pradesh','91':'Uttar Pradesh','92':'Uttar Pradesh','93':'Uttar Pradesh','94':'Uttar Pradesh',
  '95':'Uttar Pradesh','96':'Uttar Pradesh','97':'Uttar Pradesh','98':'Uttar Pradesh','99':'Uttar Pradesh'
};
