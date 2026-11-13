/* ==========================================================================
   Hindi terminology for the astrology tools (kundli, matching, panchang).
   English stays the base key so renderers can localise without touching the
   astronomical engine. Loaded before app.js on every page.
   ========================================================================== */
(function (root) {
  'use strict';

  var M = {
    planet: {
      Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
      Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु'
    },
    rashi: {
      Aries: 'मेष', Taurus: 'वृषभ', Gemini: 'मिथुन', Cancer: 'कर्क', Leo: 'सिंह',
      Virgo: 'कन्या', Libra: 'तुला', Scorpio: 'वृश्चिक', Sagittarius: 'धनु',
      Capricorn: 'मकर', Aquarius: 'कुंभ', Pisces: 'मीन',
      Mesha: 'मेष', Vrishabha: 'वृषभ', Mithuna: 'मिथुन', Karka: 'कर्क', Simha: 'सिंह',
      Kanya: 'कन्या', Tula: 'तुला', Vrishchika: 'वृश्चिक', Dhanu: 'धनु',
      Makara: 'मकर', Kumbha: 'कुंभ', Meena: 'मीन'
    },
    weekday: {
      Sunday: 'रविवार', Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार',
      Thursday: 'गुरुवार', Friday: 'शुक्रवार', Saturday: 'शनिवार'
    },
    month: {
      Chaitra: 'चैत्र', Vaishakha: 'वैशाख', Jyeshtha: 'ज्येष्ठ', Ashadha: 'आषाढ़',
      Shravana: 'श्रावण', Bhadrapada: 'भाद्रपद', Ashwin: 'आश्विन', Kartik: 'कार्तिक',
      Margashirsha: 'मार्गशीर्ष', Pausha: 'पौष', Magha: 'माघ', Phalguna: 'फाल्गुन'
    },
    nakshatra: {
      Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी',
      Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा', Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य',
      Ashlesha: 'आश्लेषा', Magha: 'मघा', 'Purva Phalguni': 'पूर्व फाल्गुनी',
      'Uttara Phalguni': 'उत्तर फाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा',
      Swati: 'स्वाति', Vishakha: 'विशाखा', Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा',
      Mula: 'मूल', 'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा',
      Shravana: 'श्रवण', Dhanishtha: 'धनिष्ठा', Shatabhisha: 'शतभिषा',
      'Purva Bhadrapada': 'पूर्व भाद्रपद', 'Uttara Bhadrapada': 'उत्तर भाद्रपद', Revati: 'रेवती'
    },
    deity: {
      'Ashwini Kumaras': 'अश्विनी कुमार', Yama: 'यम', Agni: 'अग्नि',
      'Brahma / Prajapati': 'ब्रह्मा / प्रजापति', Soma: 'सोम', Rudra: 'रुद्र',
      Aditi: 'अदिति', Brihaspati: 'बृहस्पति', Nagas: 'नाग', Pitris: 'पितृ',
      Bhaga: 'भग', Aryaman: 'अर्यमा', Savitar: 'सविता',
      'Tvashtar / Vishwakarma': 'त्वष्टा / विश्वकर्मा', Vayu: 'वायु',
      'Indra-Agni': 'इंद्र-अग्नि', Mitra: 'मित्र', Indra: 'इंद्र', Nirriti: 'निरृति',
      'Apas (waters)': 'अप (जल)', Vishvedevas: 'विश्वेदेव', Vishnu: 'विष्णु',
      Vasus: 'वसु', Varuna: 'वरुण', 'Aja Ekapada': 'अज एकपाद',
      Ahirbudhnya: 'अहिर्बुध्न्य', Pushan: 'पूषण', Ganesha: 'गणेश', Gauri: 'गौरी',
      Kartikeya: 'कार्तिकेय', Surya: 'सूर्य', Shiva: 'शिव', Durga: 'दुर्गा',
      Dharma: 'धर्म', 'Kama / Shiva': 'काम / शिव', 'Chandra / Vishnu': 'चंद्र / विष्णु',
      'Pitris / Shiva': 'पितृ / शिव', Brahma: 'ब्रह्मा', 'Mars / Saturn': 'मंगल / शनि',
      'Jupiter / Sun': 'गुरु / सूर्य', 'Sun / Mercury / Saturn': 'सूर्य / बुध / शनि'
    },
    yoni: {
      Horse: 'अश्व', Elephant: 'हाथी', Sheep: 'भेड़', Serpent: 'सर्प', Dog: 'कुत्ता',
      Cat: 'बिल्ली', Rat: 'चूहा', Cow: 'गाय', Buffalo: 'भैंस', Tiger: 'बाघ',
      Deer: 'मृग', Monkey: 'बंदर', Mongoose: 'नेवला', Lion: 'सिंह'
    },
    gana: { Deva: 'देव', Manushya: 'मनुष्य', Rakshasa: 'राक्षस' },
    nadi: { Adi: 'आदि', Madhya: 'मध्य', Antya: 'अंत्य' },
    nature: {
      Kshipra: 'क्षिप्र', Ugra: 'उग्र', Mishra: 'मिश्र', Dhruva: 'ध्रुव',
      Mridu: 'मृदु', Tikshna: 'तीक्ष्ण', Chara: 'चर'
    },
    natureText: {
      Kshipra: 'तीव्र और उपचारक — शीघ्र फल, चिकित्सा, यात्रा और शिक्षा।',
      Ugra: 'प्रचंड और प्रभावशाली — साहस, रूपांतरण और निर्णायक कार्य।',
      Mishra: 'मिश्रित — कोमल और तीव्र प्रभावों का संगम।',
      Dhruva: 'स्थिर और दृढ़ — सहनशीलता, निष्ठा और स्थायी फल।',
      Mridu: 'कोमल और सौम्य — कला, प्रेम, दया और परिष्कार।',
      Tikshna: 'तीक्ष्ण और भेदक — शोध, रणनीति और तीव्रता।',
      Chara: 'चल और परिवर्तनशील — अनुकूलन, गति और खोज।'
    },
    ganaText: {
      Deva: 'दैवी स्वभाव — सौम्य, उदार और आदर्शवादी।',
      Manushya: 'मानवीय स्वभाव — महत्वाकांक्षी, व्यावहारिक और मिश्रित।',
      Rakshasa: 'राक्षसी स्वभाव — तीव्र, रक्षात्मक और दृढ़ संकल्प।'
    },
    nadiText: {
      Adi: 'आदि (वात) — गति, श्वास और तंत्रिका तंत्र।',
      Madhya: 'मध्य (पित्त) — ऊष्मा, पाचन और रूपांतरण।',
      Antya: 'अंत्य (कफ) — संरचना, प्रतिरक्षा और शांति।'
    },
    yoga: {
      Vishkambha: 'विष्कंभ', Priti: 'प्रीति', Ayushman: 'आयुष्मान', Saubhagya: 'सौभाग्य',
      Shobhana: 'शोभन', Atiganda: 'अतिगंड', Sukarma: 'सुकर्मा', Dhriti: 'धृति',
      Shula: 'शूल', Ganda: 'गंड', Vriddhi: 'वृद्धि', Dhruva: 'ध्रुव',
      Vyaghata: 'व्याघात', Harshana: 'हर्षण', Vajra: 'वज्र', Siddhi: 'सिद्धि',
      Vyatipata: 'व्यतीपात', Variyana: 'वरीयान', Parigha: 'परिघ', Shiva: 'शिव',
      Siddha: 'सिद्ध', Sadhya: 'साध्य', Shubha: 'शुभ', Shukla: 'शुक्ल',
      Brahma: 'ब्रह्मा', Indra: 'इंद्र', Vaidhriti: 'वैधृति'
    },
    yogaMeaning: {
      'Support that can also obstruct': 'सहयोग जो बाधा भी बन सकता है',
      'Affection and friendship': 'स्नेह और मित्रता',
      'Long life and health': 'दीर्घायु और स्वास्थ्य',
      'Good fortune': 'सौभाग्य',
      'Beauty and charm': 'सौंदर्य और आकर्षण',
      'Great obstacles': 'बड़ी बाधाएँ',
      'Good deeds': 'शुभ कर्म',
      Steadiness: 'स्थिरता',
      'Pain and conflict': 'पीड़ा और संघर्ष',
      Blockage: 'अवरोध',
      'Growth and increase': 'वृद्धि और विकास',
      'Fixed and stable': 'स्थिर और दृढ़',
      'Injury and sudden loss': 'चोट और आकस्मिक हानि',
      'Joy and delight': 'आनंद और प्रसन्नता',
      'Conflict and hardness': 'टकराव और कठोरता',
      Accomplishment: 'सिद्धि',
      Calamity: 'विपत्ति',
      'Comfort and rest': 'सुख और विश्राम',
      Obstruction: 'बाधा',
      Auspiciousness: 'शुभता',
      Perfection: 'पूर्णता',
      'Achievable goals': 'प्राप्त करने योग्य लक्ष्य',
      Brightness: 'तेज',
      'Creative expansion': 'रचनात्मक विस्तार',
      'Leadership and power': 'नेतृत्व और शक्ति',
      'Calamity at the end': 'अंत में विपत्ति'
    },
    karana: {
      Bava: 'बव', Balava: 'बालव', Kaulava: 'कौलव', Taitila: 'तैतिल', Gara: 'गर',
      Vanija: 'वणिज', Vishti: 'विष्टि', Shakuni: 'शकुनि', Chatushpada: 'चतुष्पद',
      Naga: 'नाग', Kimstughna: 'किंस्तुघ्न'
    },
    karanaMeaning: {
      'Creative and supportive': 'रचनात्मक और सहायक',
      'Strong and protective': 'बलवान और रक्षात्मक',
      'Friendly and social': 'मैत्रीपूर्ण और सामाजिक',
      'Prosperous and steady': 'समृद्ध और स्थिर',
      'Productive and grounded': 'उत्पादक और व्यावहारिक',
      'Business and trade': 'व्यापार और वाणिज्य',
      'Bhadra — hold new beginnings': 'भद्रा — नई शुरुआत टालें',
      'Sharp and unpredictable': 'तीक्ष्ण और अप्रत्याशित',
      'Heavy and obstructing': 'भारी और बाधक',
      'Binding and restless': 'बंधनकारी और बेचैन',
      'Mixed and transitional': 'मिश्रित और संक्रमणकालीन'
    },
    varga: {
      Rashi: 'राशि', Hora: 'होरा', Drekkana: 'द्रेक्काण', Chaturthamsha: 'चतुर्थांश',
      Saptamsha: 'सप्तांश', Navamsa: 'नवांश', Dashamsha: 'दशांश',
      Dwadashamsha: 'द्वादशांश', Shodashamsha: 'षोडशांश', Vimshamsha: 'विंशांश',
      Chaturvimshamsha: 'चतुर्विंशांश', Bhamsha: 'भांश', Trimshamsha: 'त्रिंशांश',
      Khavedamsha: 'खवेदांश', Akshavedamsha: 'अक्षवेदांश', Shashtiamsha: 'षष्ट्यंश'
    },
    vargaTheme: {
      'Body & birth chart': 'शरीर और जन्म कुंडली', Wealth: 'धन',
      'Siblings & courage': 'भाई-बहन और साहस', 'Home & property': 'घर और संपत्ति',
      Children: 'संतान', 'Marriage & dharma': 'विवाह और धर्म', Career: 'करियर',
      Parents: 'माता-पिता', 'Vehicles & comforts': 'वाहन और सुख',
      'Spiritual practice': 'आध्यात्मिक साधना', Learning: 'शिक्षा',
      'Strengths & weaknesses': 'शक्ति और कमजोरी', Misfortunes: 'अशुभ फल',
      'Maternal legacy': 'मातृ परंपरा', 'Paternal legacy': 'पितृ परंपरा',
      'Past karma': 'पूर्व कर्म'
    },
    bhavaName: {
      'Tanu Bhava': 'तनु भाव', 'Dhana Bhava': 'धन भाव', 'Sahaja Bhava': 'सहज भाव',
      'Sukha Bhava': 'सुख भाव', 'Putra Bhava': 'पुत्र भाव', 'Shatru Bhava': 'शत्रु भाव',
      'Kalatra Bhava': 'कलत्र भाव', 'Ayur Bhava': 'आयु भाव', 'Dharma Bhava': 'धर्म भाव',
      'Karma Bhava': 'कर्म भाव', 'Labha Bhava': 'लाभ भाव', 'Vyaya Bhava': 'व्यय भाव'
    },
    bhavaMeaning: {
      'Body & self': 'शरीर और स्वयं', 'Wealth & speech': 'धन और वाणी',
      'Courage & siblings': 'साहस और भाई-बहन', 'Home & mother': 'घर और माता',
      'Children & creativity': 'संतान और रचनात्मकता',
      'Obstacles & service': 'बाधा और सेवा', 'Marriage & partners': 'विवाह और साथी',
      'Longevity & transformation': 'आयु और रूपांतरण',
      'Fortune & dharma': 'भाग्य और धर्म', 'Career & status': 'करियर और प्रतिष्ठा',
      'Gains & network': 'लाभ और नेटवर्क', 'Loss & moksha': 'हानि और मोक्ष'
    },
    bhavaText: {
      'Tanu Bhava': 'शरीर, स्वास्थ्य, व्यक्तित्व, जीवन शक्ति और पहली छाप।',
      'Dhana Bhava': 'बचत, पारिवारिक संसाधन, भोजन, वाणी, मूल्य और प्रिय वस्तुएँ।',
      'Sahaja Bhava': 'छोटे भाई-बहन, साहस, संवाद, छोटी यात्राएँ, कौशल और स्वयं का प्रयास।',
      'Sukha Bhava': 'माता, घर, संपत्ति, वाहन, आंतरिक शांति और प्रारंभिक शिक्षा।',
      'Putra Bhava': 'संतान, प्रेम, रचनात्मक अभिव्यक्ति, बुद्धि, मंत्र और पूर्व पुण्य।',
      'Shatru Bhava': 'रोग, ऋण, शत्रु, प्रतिस्पर्धा, दैनिक सेवा, अनुशासन और मुकदमा।',
      'Kalatra Bhava': 'विवाह, व्यापारिक साथी, अनुबंध, सार्वजनिक व्यवहार और व्यक्तिगत संबंध।',
      'Ayur Bhava': 'आयु, विरासत, गूढ़ विद्या, शोध, दीर्घ रोग और गहरा परिवर्तन।',
      'Dharma Bhava': 'भाग्य, गुरु, पिता, उच्च शिक्षा, तीर्थ, नैतिकता और लंबी यात्राएँ।',
      'Karma Bhava': 'करियर, अधिकार, सार्वजनिक प्रतिष्ठा, संसार में कर्म और कर्तव्य।',
      'Labha Bhava': 'आय, लाभ, बड़े भाई-बहन, मित्र, आकांक्षाएँ और इच्छापूर्ति।',
      'Vyaya Bhava': 'व्यय, विदेश, निद्रा, एकांत, त्याग और आध्यात्मिक मुक्ति।'
    },
    avastha: { Bala: 'बाल', Kumara: 'कुमार', Yuva: 'युवा', Vriddha: 'वृद्ध', Mrita: 'मृत' },
    avasthaText: {
      Bala: 'अपरिपक्व अभिव्यक्ति — क्षमता अभी विकसित हो रही है।',
      Kumara: 'बढ़ती अभिव्यक्ति — जिज्ञासु, सीखने वाला और खेलप्रिय।',
      Yuva: 'पूर्ण शक्ति — ग्रह अपने फल खुलकर देता है।',
      Vriddha: 'कमजोर अभिव्यक्ति — फल प्रयास या देरी से मिलते हैं।',
      Mrita: 'सुप्त अभिव्यक्ति — ग्रह चुपचाप काम करता है या सहारा चाहता है।'
    },
    dignity: { Exalted: 'उच्च', Debilitated: 'नीच', 'Own sign': 'स्वराशि' },
    moonPhase: {
      'New Moon': 'अमावस्या', 'Waxing Crescent': 'शुक्ल पक्ष का बढ़ता चंद्रमा',
      'First Quarter': 'प्रथम चतुर्थांश', 'Waxing Gibbous': 'शुक्ल पक्ष का पूर्णप्राय चंद्रमा',
      'Full Moon': 'पूर्णिमा', 'Waning Gibbous': 'कृष्ण पक्ष का घटता चंद्रमा',
      'Last Quarter': 'अंतिम चतुर्थांश', 'Waning Crescent': 'कृष्ण पक्ष का क्षीण चंद्रमा'
    },
    ritu: {
      Vasant: 'वसंत', Grishma: 'ग्रीष्म', Varsha: 'वर्षा', Sharad: 'शरद',
      Hemant: 'हेमंत', Shishir: 'शिशिर'
    },
    ayana: { Uttarayana: 'उत्तरायण', Dakshinayana: 'दक्षिणायन' },
    paksha: { Shukla: 'शुक्ल', Krishna: 'कृष्ण' },
    tithi: {
      Pratipada: 'प्रतिपदा', Dwitiya: 'द्वितीया', Tritiya: 'तृतीया', Chaturthi: 'चतुर्थी',
      Panchami: 'पंचमी', Shashthi: 'षष्ठी', Saptami: 'सप्तमी', Ashtami: 'अष्टमी',
      Navami: 'नवमी', Dashami: 'दशमी', Ekadashi: 'एकादशी', Dwadashi: 'द्वादशी',
      Trayodashi: 'त्रयोदशी', Chaturdashi: 'चतुर्दशी', Purnima: 'पूर्णिमा', Amavasya: 'अमावस्या'
    },
    tithiMeaning: {
      Pratipada: 'पहला कदम', Dwitiya: 'आधार', Tritiya: 'वृद्धि',
      Chaturthi: 'विघ्न और निवारण', Panchami: 'पोषण', Shashthi: 'रक्षा और संतान',
      Saptami: 'शक्ति और यात्रा', Ashtami: 'शक्ति और निवारण', Navami: 'साहस और धर्म',
      Dashami: 'सफलता', Ekadashi: 'भक्ति और व्रत', Dwadashi: 'पूर्णता',
      Trayodashi: 'आनंद और प्रेम', Chaturdashi: 'तीव्रता', Purnima: 'पूर्णता',
      Amavasya: 'शांति'
    },
    tithiDeity: {
      Pratipada: 'अग्नि', Dwitiya: 'ब्रह्मा', Tritiya: 'गौरी', Chaturthi: 'गणेश',
      Panchami: 'नाग', Shashthi: 'कार्तिकेय', Saptami: 'सूर्य', Ashtami: 'दुर्गा',
      Navami: 'दुर्गा', Dashami: 'धर्म', Ekadashi: 'विष्णु', Dwadashi: 'विष्णु',
      Trayodashi: 'काम / शिव', Chaturdashi: 'शिव', Purnima: 'चंद्र / विष्णु',
      Amavasya: 'पितृ / शिव'
    },
    tithiNature: {
      Nanda: 'नंद', Bhadra: 'भद्र', Jaya: 'जय', Rikta: 'रिक्त', Purna: 'पूर्ण'
    },
    tithiGuidance: {
      Pratipada: 'नया कार्य आरंभ करें, समझौते पर हस्ताक्षर करें, कोर्स या दुकान शुरू करें। यह दिन नए संकल्प और पहले कदम के लिए शुभ है।',
      Dwitiya: 'बचत, निवेश, गृह प्रवेश और नींव रखने के लिए अच्छा। स्थिर और संचयी ऊर्जा का दिन।',
      Tritiya: 'विजय तिथि — विवाह, सगाई, यात्रा, स्वर्ण खरीद और रचनात्मक शुरुआत के लिए अनुकूल।',
      Chaturthi: 'गणेश पूजन से विघ्न दूर करें। रिक्ता तिथि: लंबी यात्रा, विवाह और बड़े नए कार्य टालें; निवारण, चिकित्सा और मुकदमे के लिए अच्छा।',
      Panchami: 'अध्ययन, चिकित्सा, संस्कार और आतिथ्य के लिए पूर्ण तिथि। नाग पूजन और संतान कल्याण के लिए शुभ।',
      Shashthi: 'कार्तिकेय और षष्ठी माता की पूजा। प्रतिस्पर्धा, यात्रा और साहस के लिए अच्छा; विवाह से बचें।',
      Saptami: 'सूर्य और सप्तमी देवी की पूजा। स्वास्थ्य, यात्रा और नए वाहन के लिए शुभ।',
      Ashtami: 'दुर्गा और शिव की पूजा। शक्ति और निवारण के लिए अच्छा; शुभ कार्यों में सावधानी रखें।',
      Navami: 'दुर्गा पूजा और उपाय फलदायी; रिक्ता तिथि: विवाह, मुंडन और बड़ी खरीद टालें। राम नवमी इसी दिन पड़ती है।',
      Dashami: 'लक्ष्य, दान, संस्कार और विजयादशमी के लिए पूर्णता की तिथि। जो आरंभ किया उसे पूर्ण करें।',
      Ekadashi: 'व्रत रखें और विष्णु का स्मरण करें। जप, दान और स्वाध्याय के लिए उत्तम; अनाज, विवाह और भारी यात्रा से बचें।',
      Dwadashi: 'दान और विष्णु पूजन। दान, मंदिर सेवा, अन्नदान और पारिवारिक संस्कार के लिए अच्छा।',
      Trayodashi: 'प्रदोष व्रत और शिव पूजन। उत्सव, प्रेम, संगीत और सुलह के लिए अनुकूल।',
      Chaturdashi: 'शिव और रक्षा अनुष्ठान, विशेषकर महाशिवरात्रि। रिक्ता तिथि: नए उपक्रम, विवाह और लंबी यात्रा टालें।',
      Purnima: 'सत्यनारायण कथा, दान, ध्यान और पारिवारिक आशीर्वाद। मन ग्रहणशील रहता है; नशा और कठोर वाणी से बचें।',
      Amavasya: 'पितृ तर्पण, श्राद्ध और आत्मचिंतन। शुभ आरंभ, विवाह या यात्रा के लिए नहीं; पूर्वजों के निवारण के लिए उत्तम।'
    },
    kundliYoga: {
      Ruchaka: 'रुचक', Bhadra: 'भद्र', Hamsa: 'हंस', Malavya: 'मालव्य', Sasa: 'शश',
      Gajakesari: 'गजकेसरी', Budhaditya: 'बुधादित्य', 'Chandra-Mangala': 'चंद्र-मंगल',
      Sunapha: 'सुनफा', Anapha: 'अनफा', Durudhara: 'दुरुधरा', Kemadruma: 'केमद्रुम',
      Adhi: 'अधि', Amala: 'अमल', 'Vipreet Raja': 'विपरीत राज', Raja: 'राज',
      Dhana: 'धन', Saraswati: 'सरस्वती'
    },
    kundliYogaText: {
      Ruchaka: 'केंद्र में स्वराशि या उच्च राशि का मंगल — साहस, नेतृत्व और शारीरिक ऊर्जा।',
      Bhadra: 'केंद्र में स्वराशि या उच्च बुध — तीव्र बुद्धि, व्यापार और संवाद।',
      Hamsa: 'केंद्र में स्वराशि या उच्च गुरु — ज्ञान, नैतिकता, शिक्षण और सम्मान।',
      Malavya: 'केंद्र में स्वराशि या उच्च शुक्र — सौंदर्य, कला, सुख और संबंधों में सहजता।',
      Sasa: 'केंद्र में स्वराशि या उच्च शनि — अनुशासन, संगठन और अधिकार।',
      Gajakesari: 'चंद्रमा से केंद्र में गुरु — ज्ञान, प्रतिष्ठा और रक्षात्मक प्रभाव।',
      Budhaditya: 'सूर्य और बुध एक ही राशि में — विश्लेषणात्मक बुद्धि और स्पष्ट संवाद।',
      'Chandra-Mangala': 'चंद्रमा और मंगल युति या परस्पर दृष्टि में — परिश्रम से अर्जन, साहस और धन।',
      Sunapha: 'चंद्रमा से दूसरे भाव में ग्रह — स्वयं अर्जित संसाधन, आत्मविश्वास और स्थिर सहयोग।',
      Anapha: 'चंद्रमा से बारहवें भाव में ग्रह — उदारता, सुसंस्कृतता और आंतरिक चिंतन।',
      Durudhara: 'चंद्रमा के दोनों ओर ग्रह — लेन-देन में संतुलन, सुख और साथ।',
      Kemadruma: 'चंद्रमा के दूसरे, बारहवें या साथ में कोई ग्रह नहीं। यह भावनात्मक आत्मनिर्भरता की चेतावनी है, श्राप नहीं; बलवान चंद्र या गुरु इसे संतुलित करते हैं।',
      Adhi: 'चंद्रमा से छठे, सातवें और आठवें भाव में शुभ ग्रह — नेतृत्व, समृद्धि और स्थायी प्रतिष्ठा।',
      Amala: 'चंद्रमा या लग्न से दशम भाव में शुभ ग्रह — स्वच्छ प्रतिष्ठा और स्थायी सुनाम।',
      'Vipreet Raja': 'छठे, आठवें या बारहवें भाव का स्वामी अन्य दुस्थान में — विपरीत परिस्थितियों से उत्थान, सुधार और संसाधनशीलता।',
      Raja: 'केंद्र और त्रिकोण का स्वामी युति या परस्पर दृष्टि में — अधिकार और सफलता का शास्त्रीय योग।',
      Dhana: 'दूसरे और ग्यारहवें भाव के स्वामी जुड़े हैं, या एक-दूसरे के भाव में हैं — धन का शास्त्रीय योग।',
      Saraswati: 'गुरु, शुक्र और बुध केंद्र, त्रिकोण, दूसरे या पाँचवें भाव में — विद्या, कला और वाक्पटुता।'
    },
    gem: {
      'Red Coral': 'लाल मूंगा', Emerald: 'पन्ना', Pearl: 'मोती', Ruby: 'माणिक',
      Diamond: 'हीरा', 'Yellow Sapphire': 'पुखराज', 'Blue Sapphire': 'नीलम'
    },
    metal: {
      Copper: 'तांबा', Silver: 'चांदी', Gold: 'सोना',
      'Silver/Platinum': 'चांदी/प्लेटिनम', 'Iron/Silver': 'लोहा/चांदी'
    },
    remedyTitle: {
      'Primary Gemstone': 'प्राथमिक रत्न', 'Ishta Mantra': 'इष्ट मंत्र',
      'Mangal Shanti': 'मंगल शांति', 'Kaal Sarp Shanti': 'काल सर्प शांति',
      'Shani Shanti': 'शनि शांति'
    },
    koota: {
      Varna: 'वर्ण', Vashya: 'वश्य', Tara: 'तारा', Yoni: 'योनि',
      'Graha Maitri': 'ग्रह मैत्री', Gana: 'गण', Bhakoot: 'भकूट', Nadi: 'नाड़ी'
    },
    kootaNote: {
      'Natural harmony in temperament.': 'स्वभाव में स्वाभाविक सामंजस्य।',
      'Different social temperaments — manageable.': 'अलग सामाजिक स्वभाव — सामंजस्य संभव।',
      'Mutual attraction and respect.': 'परस्पर आकर्षण और सम्मान।',
      'Partial magnetic pull.': 'आंशिक आकर्षण।',
      'Needs conscious effort in understanding.': 'समझने में सचेत प्रयास आवश्यक।',
      'Destiny supports the union.': 'भाग्य संबंध का साथ देता है।',
      'Some planetary friction in timing.': 'समय में कुछ ग्रहीय घर्षण।',
      'Physical and instinctive compatibility.': 'शारीरिक और सहज अनुकूलता।',
      'Average physical compatibility.': 'औसत शारीरिक अनुकूलता।',
      'Instinctive clash — needs patience.': 'सहज टकराव — धैर्य आवश्यक।',
      'Minds meet naturally.': 'मन स्वाभाविक रूप से मिलते हैं।',
      'Balanced mental wavelength.': 'मानसिक तरंग संतुलित।',
      'Different world views; communication is key.': 'अलग दृष्टिकोण; संवाद महत्वपूर्ण।',
      'Temperaments blend beautifully.': 'स्वभाव सुंदर ढंग से मिलते हैं।',
      'Temperament mismatch — needs maturity.': 'स्वभाव में अंतर — परिपक्वता आवश्यक।',
      'Emotional and material growth supported.': 'भावनात्मक और भौतिक विकास को सहयोग।',
      'Bhakoot dosha — traditional remedies advised.': 'भकूट दोष — पारंपरिक उपाय सुझाए जाते हैं।',
      'Health and progeny indications are strong.': 'स्वास्थ्य और संतान के संकेत मजबूत।',
      'Nadi dosha — pooja and lifestyle remedies advised.': 'नाड़ी दोष — पूजा और जीवनशैली के उपाय सुझाए जाते हैं।',
      'Manglik status is balanced between both charts.': 'दोनों कुंडलियों में मांगलिक स्थिति संतुलित है।',
      'One-sided Manglik — Mangal Shanti recommended before marriage.': 'एकतरफा मांगलिक — विवाह से पहले मंगल शांति सुझाई जाती है।'
    },
    matchLabel: {
      'Excellent Match': 'उत्कृष्ट मिलान', 'Very Good Match': 'बहुत अच्छा मिलान',
      'Good Match': 'अच्छा मिलान', 'Average Match': 'औसत मिलान',
      'Needs Careful Review': 'सावधानी से समीक्षा आवश्यक'
    },
    festival: {
      'Gudi Padwa / Ugadi': 'गुड़ी पड़वा / उगादी', 'Ram Navami': 'राम नवमी',
      'Hanuman Jayanti': 'हनुमान जयंती', 'Akshaya Tritiya': 'अक्षय तृतीया',
      'Buddha Purnima': 'बुद्ध पूर्णिमा', 'Nirjala Ekadashi': 'निर्जला एकादशी',
      'Vat Purnima': 'वट पूर्णिमा', 'Devshayani Ekadashi': 'देवशयनी एकादशी',
      'Guru Purnima': 'गुरु पूर्णिमा', 'Hariyali Teej': 'हरियाली तीज',
      'Nag Panchami': 'नाग पंचमी', 'Raksha Bandhan': 'रक्षाबंधन',
      'Krishna Janmashtami': 'कृष्ण जन्माष्टमी', 'Ganesh Chaturthi': 'गणेश चतुर्थी',
      'Radha Ashtami': 'राधा अष्टमी', 'Anant Chaturdashi': 'अनंत चतुर्दशी',
      'Pitru Paksha begins': 'पितृ पक्ष प्रारंभ', 'Mahalaya Amavasya': 'महालया अमावस्या',
      'Navratri Ghatasthapana': 'नवरात्रि घटस्थापना', 'Durga Ashtami': 'दुर्गा अष्टमी',
      'Maha Navami': 'महानवमी', Dussehra: 'दशहरा', 'Sharad Purnima': 'शरद पूर्णिमा',
      'Karwa Chauth': 'करवा चौथ', Dhanteras: 'धनतेरस',
      'Narak Chaturdashi': 'नरक चतुर्दशी', 'Diwali / Lakshmi Poojan': 'दिवाली / लक्ष्मी पूजन',
      'Govardhan Puja': 'गोवर्धन पूजा', 'Bhai Dooj': 'भाई दूज', 'Chhath Puja': 'छठ पूजा',
      'Dev Uthani Ekadashi': 'देव उठनी एकादशी', 'Kartik Purnima': 'कार्तिक पूर्णिमा',
      'Gita Jayanti': 'गीता जयंती', 'Paush Purnima': 'पौष पूर्णिमा',
      'Vasant Panchami': 'वसंत पंचमी', 'Maha Shivratri': 'महाशिवरात्रि',
      'Holika Dahan': 'होलिका दहन', Holi: 'होली', 'Makar Sankranti': 'मकर संक्रांति',
      Lohri: 'लोहड़ी', Pongal: 'पोंगल'
    },
    choghadiya: {
      Udveg: 'उद्वेग', Char: 'चर', Labh: 'लाभ', Amrit: 'अमृत', Kaal: 'काल',
      Shubh: 'शुभ', Rog: 'रोग'
    },
    choghadiyaMeaning: {
      Udveg: 'चिंता — शुभ कार्य टालें', Char: 'चल — यात्रा और गतिविधि के लिए अच्छा',
      Labh: 'लाभ — व्यापार और अर्जन के लिए शुभ', Amrit: 'अमृत — सर्वश्रेष्ठ मुहूर्त',
      Kaal: 'काल — हानि, शुभ कार्य से बचें', Shubh: 'शुभ — मांगलिक कार्य के लिए अच्छा',
      Rog: 'रोग — बीमारी, शुभ कार्य से बचें'
    },
    sadeSatiPhase: { Rising: 'उदय', Peak: 'शिखर', Setting: 'अस्त' }
  };

  function get(category, key) {
    var table = M[category];
    if (!table || key == null) return key;
    return table[key] || key;
  }

  root.VP_ASTRO_HI = M;
  root.VPAstroHi = { get: get, map: M };
})(window);
