/* ==========================================================================
   Vedic Pooja — Mantra & Aarti Library
   Devanagari text, transliteration, meaning, japa counter and voice recitation.
   All text is traditional/public-domain; UI text is bilingual via A.t().
   ========================================================================== */
(function () {
  'use strict';

  var A = window.App, D = window.PanditData;
  if (!A || !D) return;
  var $ = A.$, $$ = A.$$;

  /* ------------------------------------------------------------------ data */
  var L = function (en, hi) { return { en: en, hi: hi }; };

  var CATS = [
    ['all', 'All', 'सभी'],
    ['ganesh', 'Ganesh', 'गणेश'],
    ['shiva', 'Shiva', 'शिव'],
    ['devi', 'Devi', 'देवी'],
    ['vishnu', 'Vishnu', 'विष्णु'],
    ['hanuman', 'Hanuman', 'हनुमान'],
    ['surya', 'Surya', 'सूर्य'],
    ['shani', 'Shani', 'शनि'],
    ['saraswati', 'Saraswati', 'सरस्वती'],
    ['guru', 'Guru', 'गुरु'],
    ['universal', 'Universal', 'सार्वभौम'],
    ['aarti', 'Aartis', 'आरती']
  ];

  var MANTRA = [
    {
      id: 'vakratunda', cat: 'ganesh', deity: 'Ganesh',
      title: L('Vakratunda Mahakaya', 'वक्रतुण्ड महाकाय'),
      dev: ['ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।', 'निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥'],
      translit: ['Om Vakratunda Mahakaya, Suryakoti Samaprabha |', 'Nirvighnam Kuru Me Deva, Sarva-karyeshu Sarvada ||'],
      meaning: L('O Lord with the curved trunk and a mighty form, radiant like a million suns — please remove every obstacle from all my endeavours, always.', 'हे भगवान! आपका मुख मुड़ी हुई सूंड वाला और शरीर विशाल है, करोड़ों सूर्यों के समान तेजस्वी है। मेरे सभी कार्यों की बाधाएँ सदा दूर कीजिए।'),
      use: L('Before any pooja, exam, interview or new venture. The standard opening prayer.', 'किसी भी पूजा, परीक्षा, साक्षात्कार या नए काम से पहले। यह सबसे सामान्य प्रारंभिक प्रार्थना है।'),
      japa: 108, pooja: 'ganesh-pooja'
    },
    {
      id: 'om-gam', cat: 'ganesh', deity: 'Ganesh',
      title: L('Om Gam Ganapataye Namah', 'ॐ गं गणपतये नमः'),
      dev: ['ॐ गं गणपतये नमः'],
      translit: ['Om Gam Ganapataye Namah'],
      meaning: L('Salutations to Ganapati, the leader of the divine attendants and the remover of obstacles.', 'गणों के स्वामी और विघ्नहर्ता श्री गणपति को नमस्कार।'),
      use: L('A one-line beeja mantra for japa — 108 times before starting anything important.', 'जप के लिए एक पंक्ति का बीज मंत्र — किसी महत्वपूर्ण काम से पहले 108 बार।'),
      japa: 108, pooja: 'ganesh-pooja'
    },
    {
      id: 'gayatri', cat: 'surya', deity: 'Savitr',
      title: L('Gayatri Mantra', 'गायत्री मंत्र'),
      dev: ['ॐ भूर्भुवः स्वः ।', 'तत्सवितुर्वरेण्यं ।', 'भर्गो देवस्य धीमहि ।', 'धियो यो नः प्रचोदयात् ॥'],
      translit: ['Om Bhur Bhuvah Svah |', 'Tat Savitur Varenyam |', 'Bhargo Devasya Dhimahi |', 'Dhiyo Yo Nah Prachodayat ||'],
      meaning: L('We meditate on the auspicious light of Savitr, the Sun. May that light awaken and guide our intellect.', 'हम सविता देव के उस कल्याणकारी तेज का ध्यान करते हैं। वह तेज हमारी बुद्धि को प्रेरित करे।'),
      use: L('Daily sandhya vandana, upanayana, and before study. Considered the mother of all Vedic mantras.', 'दैनिक संध्या वंदन, उपनयन और अध्ययन से पहले। इसे सभी वैदिक मंत्रों की जननी कहा गया है।'),
      japa: 108, pooja: 'gayatri-jap'
    },
    {
      id: 'mrityunjay', cat: 'shiva', deity: 'Shiva',
      title: L('Mahamrityunjay Mantra', 'महामृत्युंजय मंत्र'),
      dev: ['ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।', 'उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय माऽमृतात् ॥'],
      translit: ['Om Tryambakam Yajamahe Sugandhim Pushti-vardhanam |', 'Urvarukam-iva Bandhanan Mrityor-Mukshiya Ma-amritat ||'],
      meaning: L('We worship the three-eyed Shiva, who is fragrant and nourishes all growth. May he release us from death and grant immortality, as a ripe cucumber is freed from its vine.', 'हम तीन नेत्रों वाले शिव की उपासना करते हैं, जो सुगंधमय हैं और पुष्टि बढ़ाते हैं। जैसे पका हुआ खरबूजा बेल से मुक्त हो जाता है, वैसे ही वे हमें मृत्यु के बंधन से मुक्त कर अमृत तक पहुँचाएँ।'),
      use: L('For health, recovery, accident protection and fear. Traditionally 108 or 1,008 times.', 'स्वास्थ्य, रोग-मुक्ति, दुर्घटना से रक्षा और भय के लिए। परंपरा में 108 या 1,008 बार।'),
      japa: 108, pooja: 'mahamrityunjay'
    },
    {
      id: 'om-namah-shivaya', cat: 'shiva', deity: 'Shiva',
      title: L('Om Namah Shivaya', 'ॐ नमः शिवाय'),
      dev: ['ॐ नमः शिवाय'],
      translit: ['Om Namah Shivaya'],
      meaning: L('I bow to Shiva, the auspicious and benevolent one.', 'मैं कल्याणस्वरूप शिव को नमन करता हूँ।'),
      use: L('Monday japa, Maha Shivratri, and any quiet moment of surrender.', 'सोमवार का जप, महाशिवरात्रि, और समर्पण के किसी भी शांत क्षण में।'),
      japa: 108, pooja: 'rudrabhishek'
    },
    {
      id: 'karpura-gauram', cat: 'shiva', deity: 'Shiva',
      title: L('Karpura Gauram', 'कर्पूरगौरं'),
      dev: ['कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम् ।', 'सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि ॥'],
      translit: ['Karpura-gauram karuna-avataram, sansara-saram bhujagendra-haram |', 'Sada-vasantam hridaya-ravinde, bhavam bhavani-sahitam namami ||'],
      meaning: L('White as camphor, compassion incarnate, the essence of the world, wearing the king of serpents as a garland — ever dwelling in the lotus of the heart, I bow to Shiva together with Bhavani.', 'कर्पूर के समान गौर वर्ण, करुणा के अवतार, संसार के सार और शेषनाग के हार वाले — हृदय कमल में सदा निवास करने वाले शिव और भवानी को मैं नमन करता हूँ।'),
      use: L('A short dhyana shloka before Rudrabhishek, Shiv pooja or meditation.', 'रुद्राभिषेक, शिव पूजा या ध्यान से पहले छोटा ध्यान श्लोक।'),
      japa: 11, pooja: 'rudrabhishek'
    },
    {
      id: 'chamunda', cat: 'devi', deity: 'Chamunda',
      title: L('Om Aim Hreem Kleem Chamundayai Vichche', 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे'),
      dev: ['ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे'],
      translit: ['Om Aim Hreem Kleem Chamundayai Vichche'],
      meaning: L('Salutations to Chamunda, the fierce protective form of the Goddess. The three beeja syllables invoke wisdom, abundance and action.', 'देवी के उग्र रक्षक स्वरूप चामुंडा को नमस्कार। तीन बीज अक्षर ज्ञान, समृद्धि और कर्म का आह्वान करते हैं।'),
      use: L('Navratri, protection from negativity, and difficult periods. Traditionally recited 108 times.', 'नवरात्रि, नकारात्मकता से रक्षा और कठिन समय में। परंपरा में 108 बार।'),
      japa: 108, pooja: 'durga-saptashati'
    },
    {
      id: 'ya-devi', cat: 'devi', deity: 'Devi',
      title: L('Ya Devi Sarvabhuteshu', 'या देवी सर्वभूतेषु'),
      dev: ['या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता ।', 'नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥'],
      translit: ['Ya Devi Sarva-bhuteshu Shakti-rupena Samsthita |', 'Namastasyai Namastasyai Namastasyai Namo Namah ||'],
      meaning: L('To the Goddess who dwells in every being in the form of power — we bow to her, again and again and again.', 'जो देवी सभी प्राणियों में शक्ति के रूप में विराजमान हैं — उन्हें बार-बार नमस्कार।'),
      use: L('Durga Saptashati, Navratri and any prayer for strength.', 'दुर्गा सप्तशती, नवरात्रि और शक्ति की प्रार्थना के लिए।'),
      japa: 108, pooja: 'durga-saptashati'
    },
    {
      id: 'mahalakshmi', cat: 'devi', deity: 'Lakshmi',
      title: L('Om Shreem Mahalakshmiyei Namah', 'ॐ श्रीं महालक्ष्म्यै नमः'),
      dev: ['ॐ श्रीं महालक्ष्म्यै नमः'],
      translit: ['Om Shreem Mahalakshmiyei Namah'],
      meaning: L('Salutations to Mahalakshmi, the great goddess of abundance, beauty and good fortune.', 'महालक्ष्मी, समृद्धि, सौंदर्य और सौभाग्य की महादेवी को नमस्कार।'),
      use: L('Diwali, Friday japa, and before starting a new source of income.', 'दिवाली, शुक्रवार का जप, और नई आय शुरू करने से पहले।'),
      japa: 108, pooja: 'lakshmi-kubera'
    },
    {
      id: 'vasudevaya', cat: 'vishnu', deity: 'Vishnu',
      title: L('Om Namo Bhagavate Vasudevaya', 'ॐ नमो भगवते वासुदेवाय'),
      dev: ['ॐ नमो भगवते वासुदेवाय'],
      translit: ['Om Namo Bhagavate Vasudevaya'],
      meaning: L('I bow to Lord Vasudeva, the all-pervading Vishnu who dwells in every heart.', 'सर्वव्यापी भगवान वासुदेव को नमन, जो हर हृदय में निवास करते हैं।'),
      use: L('Ekadashi, Vishnu Sahasranama, before sleep and during Satyanarayan katha.', 'एकादशी, विष्णु सहस्रनाम, सोने से पहले और सत्यनारायण कथा में।'),
      japa: 108, pooja: 'satyanarayan'
    },
    {
      id: 'hanuman-beeja', cat: 'hanuman', deity: 'Hanuman',
      title: L('Om Ham Hanumate Rudratmakaya Hum Phat', 'ॐ हं हनुमते रुद्रात्मकाय हुं फट्'),
      dev: ['ॐ हं हनुमते रुद्रात्मकाय हुं फट्'],
      translit: ['Om Ham Hanumate Rudratmakaya Hum Phat'],
      meaning: L('Salutations to Hanuman, who is Rudra himself. The beeja syllables invoke courage, strength and protection.', 'रुद्रस्वरूप हनुमान को नमस्कार। बीज अक्षर साहस, बल और रक्षा का आह्वान करते हैं।'),
      use: L('Tuesday, before travel, exams, court matters or any situation that needs courage.', 'मंगलवार, यात्रा, परीक्षा, न्यायालय या साहस की आवश्यकता वाले किसी भी अवसर पर।'),
      japa: 108, pooja: 'hanuman-chalisa'
    },
    {
      id: 'surya-beeja', cat: 'surya', deity: 'Surya',
      title: L('Om Ghrini Suryaya Namah', 'ॐ घृणिः सूर्याय नमः'),
      dev: ['ॐ घृणिः सूर्याय नमः'],
      translit: ['Om Ghrini Suryaya Namah'],
      meaning: L('Salutations to Surya, the source of light, vitality and clear sight.', 'प्रकाश, ऊर्जा और स्पष्ट दृष्टि के स्रोत सूर्यदेव को नमस्कार।'),
      use: L('At sunrise, with arghya, for confidence and vitality. Sunday is Surya’s day.', 'सूर्योदय पर अर्घ्य के साथ, आत्मविश्वास और ऊर्जा के लिए। रविवार सूर्य का दिन है।'),
      japa: 108, pooja: 'surya-shanti'
    },
    {
      id: 'shani-beeja', cat: 'shani', deity: 'Shani',
      title: L('Om Sham Shanaishcharaya Namah', 'ॐ शं शनैश्चराय नमः'),
      dev: ['ॐ शं शनैश्चराय नमः'],
      translit: ['Om Sham Shanaishcharaya Namah'],
      meaning: L('Salutations to Shani, the slow-moving lord of karma, discipline and patience.', 'कर्म, अनुशासन और धैर्य के स्वामी धीमी गति वाले शनिदेव को नमस्कार।'),
      use: L('Saturday, during Sade Sati or Shani dasha, and before long-term commitments.', 'शनिवार, साढ़े साती या शनि दशा में, और दीर्घकालिक संकल्प से पहले।'),
      japa: 108, pooja: 'shani-shanti'
    },
    {
      id: 'saraswati-beeja', cat: 'saraswati', deity: 'Saraswati',
      title: L('Om Aim Saraswatyai Namah', 'ॐ ऐं सरस्वत्यै नमः'),
      dev: ['ॐ ऐं सरस्वत्यै नमः'],
      translit: ['Om Aim Saraswatyai Namah'],
      meaning: L('Salutations to Saraswati, goddess of knowledge, music and speech.', 'ज्ञान, संगीत और वाणी की देवी सरस्वती को नमस्कार।'),
      use: L('Before study, exams, a first lesson, or Saraswati Pooja on Vasant Panchami.', 'अध्ययन, परीक्षा, पहले पाठ या वसंत पंचमी की सरस्वती पूजा से पहले।'),
      japa: 108, pooja: 'saraswati'
    },
    {
      id: 'guru-shloka', cat: 'guru', deity: 'Guru',
      title: L('Gurur Brahma Gurur Vishnu', 'गुरुर्ब्रह्मा गुरुर्विष्णुः'),
      dev: ['गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः ।', 'गुरुः साक्षात् परं ब्रह्म तस्मै श्री गुरवे नमः ॥'],
      translit: ['Gurur Brahma Gurur Vishnu, Gurur Devo Maheshvarah |', 'Guruh Sakshat Param Brahma, Tasmai Shri Gurave Namah ||'],
      meaning: L('The guru is Brahma, the guru is Vishnu, the guru is Maheshvara. The guru is the supreme Brahman itself — salutations to that guru.', 'गुरु ही ब्रह्मा, गुरु ही विष्णु और गुरु ही महेश्वर हैं। गुरु साक्षात परब्रह्म हैं — उन गुरु को नमस्कार।'),
      use: L('Guru Purnima, before a new course, and at the start of any learning.', 'गुरु पूर्णिमा, नए पाठ्यक्रम से पहले और किसी भी अध्ययन के आरंभ में।'),
      japa: 11, pooja: 'guru-shanti'
    },
    {
      id: 'sarve-bhavantu', cat: 'universal', deity: 'All',
      title: L('Sarve Bhavantu Sukhinah', 'सर्वे भवन्तु सुखिनः'),
      dev: ['ॐ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।', 'सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥'],
      translit: ['Om Sarve Bhavantu Sukhinah, Sarve Santu Niramayah |', 'Sarve Bhadrani Pashyantu, Ma Kashchid Duhkha-bhag Bhavet ||'],
      meaning: L('May all be happy. May all be free from illness. May all see what is auspicious. May no one suffer.', 'सभी सुखी हों, सभी रोगमुक्त हों, सभी शुभ देखें, कोई दुःखी न हो।'),
      use: L('Closing prayer after any pooja, havan or meditation.', 'किसी भी पूजा, हवन या ध्यान के बाद समापन प्रार्थना।'),
      japa: 11, pooja: 'satyanarayan'
    },

    /* ------------------------------------------------------------- aartis */
    {
      id: 'om-jai-jagdish', cat: 'aarti', deity: 'Vishnu', aarti: true,
      title: L('Om Jai Jagdish Hare', 'ॐ जय जगदीश हरे'),
      verses: [
        { dev: ['ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे ।', 'भक्त जनों के संकट, क्षण में दूर करे ॥'], translit: ['Om jai Jagdish hare, swami jai Jagdish hare |', 'Bhakt janon ke sankat, kshan mein door kare ||'] },
        { dev: ['जो ध्यावे फल पावे, दुख बिनसे मन का ।', 'स्वामी दुख बिनसे मन का ।', 'सुख सम्पति घर आवे, कष्ट मिटे तन का ॥'], translit: ['Jo dhyave phal pave, dukh binse man ka |', 'Swami dukh binse man ka |', 'Sukh sampati ghar aave, kasht mite tan ka ||'] },
        { dev: ['माता पिता तुम मेरे, शरण गहूँ किसकी ।', 'स्वामी शरण गहूँ किसकी ।', 'तुम बिन और न दूजा, आस करूँ जिसकी ॥'], translit: ['Mata pita tum mere, sharan gahun kiski |', 'Swami sharan gahun kiski |', 'Tum bin aur na dooja, aas karun jiski ||'] },
        { dev: ['तुम पूरण परमेश्वर, अंतर्यामी ।', 'स्वामी अंतर्यामी ।', 'परब्रह्म परमेश्वर, तुम सब के स्वामी ॥'], translit: ['Tum pooran parmeshwar, antaryami |', 'Swami antaryami |', 'Par-brahm parmeshwar, tum sab ke swami ||'] },
        { dev: ['तुम करुणा के सागर, तुम पालन करता ।', 'स्वामी तुम पालन करता ।', 'मैं मूरख खल खामी, क्षमा करो भरता ॥'], translit: ['Tum karuna ke sagar, tum palan karta |', 'Swami tum palan karta |', 'Main moorakh khal khami, kshama karo bharta ||'] },
        { dev: ['दीन दयाल दरस बिना, दुख मेरा न जाए ।', 'स्वामी दुख मेरा न जाए ।', 'जब तक दर्शन पाऊँ, तब तक मन न ललचाए ॥'], translit: ['Deen dayal daras bina, dukh mera na jaaye |', 'Swami dukh mera na jaaye |', 'Jab tak darshan paun, tab tak man na lalchaye ||'] }
      ],
      meaning: L('The most widely sung evening aarti. It praises the Lord of the universe, asks him to remove the devotee’s troubles, and surrenders completely.', 'सबसे प्रचलित संध्या आरती। यह जगदीश की स्तुति करती है, भक्त के कष्ट हरने की प्रार्थना करती है और पूर्ण समर्पण व्यक्त करती है।'),
      use: L('Every evening aarti, after Satyanarayan katha and at the end of any pooja.', 'प्रतिदिन संध्या आरती, सत्यनारायण कथा के बाद और किसी भी पूजा के समापन पर।'),
      pooja: 'satyanarayan'
    },
    {
      id: 'om-jai-shiv', cat: 'aarti', deity: 'Shiva', aarti: true,
      title: L('Om Jai Shiv Omkara', 'ॐ जय शिव ओंकारा'),
      verses: [
        { dev: ['ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा ।', 'ब्रह्मा विष्णु सदाशिव, अर्द्धांगी धारा ॥'], translit: ['Om jai Shiv Omkara, swami jai Shiv Omkara |', 'Brahma Vishnu Sadashiv, ardhangi dhara ||'] },
        { dev: ['एकानन चतुरानन, पंचानन राजे ।', 'स्वामी पंचानन राजे ।', 'हंसानन गरुड़ासन, वृषवाहन साजे ॥'], translit: ['Ekanan chaturanan, panchanan raje |', 'Swami panchanan raje |', 'Hansanan garudasan, vrish-vahan saje ||'] },
        { dev: ['दो भुज चार चतुर्भुज, दश भुज ते सोहे ।', 'स्वामी दश भुज ते सोहे ।', 'तीनों रूप निरखते, त्रिभुवन मन मोहे ॥'], translit: ['Do bhuj char chaturbhuj, dash bhuj te sohe |', 'Swami dash bhuj te sohe |', 'Teenon roop nirakhate, tribhuvan man mohe ||'] },
        { dev: ['अक्षमाला वनमाला, मुण्डमाला सोहे ।', 'स्वामी मुण्डमाला सोहे ।', 'त्रिपुरन तक्षु भूषण, शशि भूषण मोहे ॥'], translit: ['Akshamala vanamala, mundamala sohe |', 'Swami mundamala sohe |', 'Tripuran takshu bhushan, shashi bhushan mohe ||'] },
        { dev: ['श्वेताम्बर पीताम्बर, बाघाम्बर अंगे ।', 'स्वामी बाघाम्बर अंगे ।', 'सनकादिक ब्रह्मादिक, भूतादिक संगे ॥'], translit: ['Shwetambar pitambar, baghambar ange |', 'Swami baghambar ange |', 'Sanakadik brahmadik, bhutadik sange ||'] },
        { dev: ['कर के मधु घृत धारा, बहे छवि निरखें ।', 'स्वामी बहे छवि निरखें ।', 'देख के भोले शंकर, मन ही मन हरषें ॥'], translit: ['Kar ke madhu ghrit dhara, bahe chhavi nirakhen |', 'Swami bahe chhavi nirakhen |', 'Dekh ke bhole Shankar, man hi man harshen ||'] }
      ],
      meaning: L('The evening aarti of Shiva, describing his many forms, his simple ash-smeared beauty and the devotion he inspires.', 'शिव की संध्या आरती — उनके अनेक रूपों, भस्म-सज्जित सरल सौंदर्य और भक्ति का वर्णन।'),
      use: L('Maha Shivratri, Pradosha vrat, and Monday evening aarti.', 'महाशिवरात्रि, प्रदोष व्रत और सोमवार की संध्या आरती।'),
      pooja: 'rudrabhishek'
    },
    {
      id: 'jai-ambe-gauri', cat: 'aarti', deity: 'Devi', aarti: true,
      title: L('Jai Ambe Gauri', 'जय अम्बे गौरी'),
      verses: [
        { dev: ['जय अम्बे गौरी, मैया जय श्यामा गौरी ।', 'निशिदिन तुमको ध्यावत, हरि ब्रह्मा शिवरी ॥'], translit: ['Jai Ambe Gauri, maiya jai Shyama Gauri |', 'Nishidin tumko dhyavat, Hari Brahma Shivri ||'] },
        { dev: ['माँगो सिंदूर विराजत, टीको मृगमद को ।', 'उज्ज्वल से दो नैना, चंदन रूप को ॥'], translit: ['Maango sindoor virajat, tiko mrigamad ko |', 'Ujjwal se do naina, chandan roop ko ||'] },
        { dev: ['कनक समान कलेवर, विराजत सुभ केश ।', 'रक्ताम्बर राजे, मृगमद चंद्रेश ॥'], translit: ['Kanak saman kalevar, virajat subh kesh |', 'Raktambar raje, mrigamad chandresh ||'] },
        { dev: ['विष्णु वाहन विराजत, नारद श्रुति गावें ।', 'देवता स्तुति करें, घन आनंद मनावें ॥'], translit: ['Vishnu vahan virajat, Narad shruti gaven |', 'Devata stuti karen, ghan anand manaven ||'] }
      ],
      meaning: L('The aarti of Ambe Gauri, sung across north India during Navratri and daily Devi worship.', 'अम्बे गौरी की आरती, जो नवरात्रि और प्रतिदिन देवी पूजा में उत्तर भारत में गाई जाती है।'),
      use: L('Navratri, Durga Pooja, and any Devi sthapana.', 'नवरात्रि, दुर्गा पूजा और किसी भी देवी स्थापना में।'),
      pooja: 'durga-saptashati'
    },
    {
      id: 'om-jai-lakshmi', cat: 'aarti', deity: 'Lakshmi', aarti: true,
      title: L('Om Jai Lakshmi Mata', 'ॐ जय लक्ष्मी माता'),
      verses: [
        { dev: ['ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता ।', 'तुमको निशिदिन सेवत, हर विष्णु विराजाता ॥'], translit: ['Om jai Lakshmi mata, maiya jai Lakshmi mata |', 'Tumko nishidin sevat, Hari Vishnu virajata ||'] },
        { dev: ['उमा सही कमला, तुम ही जग माता ।', 'महालक्ष्मी नाम, निर्धन की दाता ॥'], translit: ['Uma sahi Kamala, tum hi jag mata |', 'Mahalakshmi naam, nirdhan ki data ||'] },
        { dev: ['तुम ही जग की माता, तुम ही हो भरता ।', 'हम सुत तुमरे, तुम सुख की दाता ॥'], translit: ['Tum hi jag ki mata, tum hi ho bharta |', 'Hum sut tumre, tum sukh ki data ||'] }
      ],
      meaning: L('The aarti of Lakshmi Mata, sung on Diwali, Fridays and at the end of Lakshmi pooja.', 'लक्ष्मी माता की आरती, दिवाली, शुक्रवार और लक्ष्मी पूजा के अंत में गाई जाती है।'),
      use: L('Diwali Lakshmi Poojan, Friday vrat and any dhan-related pooja.', 'दिवाली लक्ष्मी पूजन, शुक्रवार व्रत और धन संबंधी पूजा में।'),
      pooja: 'lakshmi-kubera'
    }
  ];

  var DAY_MANTRA = ['surya-beeja', 'om-namah-shivaya', 'hanuman-beeja', 'om-gam', 'vasudevaya', 'mahalakshmi', 'shani-beeja'];
  var DAY_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAY_NAME_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
  var DAY_LORD = ['Surya', 'Shiva', 'Hanuman', 'Ganesh', 'Vishnu', 'Devi', 'Shani'];
  var DAY_LORD_HI = ['सूर्य', 'शिव', 'हनुमान', 'गणेश', 'विष्णु', 'देवी', 'शनि'];

  var KEY = 'vp_japa_v1';
  var state = {
    cat: 'all',
    q: '',
    selected: DAY_MANTRA[new Date().getDay()],
    japa: {},
    speaking: null
  };

  function hi() { return A.isHi(); }
  function T(en, h) { return hi() ? h : en; }

  function loadJapa() {
    var saved = A.store.get(KEY, null);
    state.japa = (saved && typeof saved === 'object') ? saved : {};
  }
  function saveJapa() {
    A.store.set(KEY, state.japa);
  }
  function entry(id) {
    if (!state.japa[id]) state.japa[id] = { n: 0, target: 108, rounds: 0 };
    if (!state.japa[id].target) state.japa[id].target = 108;
    if (!state.japa[id].rounds) state.japa[id].rounds = 0;
    return state.japa[id];
  }
  function find(id) {
    return MANTRA.filter(function (m) { return m.id === id; })[0] || null;
  }
  function catLabel(id) {
    var c = CATS.filter(function (x) { return x[0] === id; })[0];
    return c ? (hi() ? c[2] : c[1]) : id;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  /* ------------------------------------------------------------ today card */
  function renderToday() {
    var host = $('#mantraToday');
    if (!host) return;
    var day = new Date().getDay();
    var m = find(DAY_MANTRA[day]);
    if (!m) return;
    host.innerHTML =
      '<div class="today-card__glow" aria-hidden="true"></div>' +
      '<div class="today-card__body">' +
        '<p class="today-card__eyebrow">' + A.icon('spark') + ' ' +
          T('Mantra of the day', 'आज का मंत्र') + ' · ' + (hi() ? DAY_NAME_HI[day] : DAY_NAME[day]) +
        '</p>' +
        '<h2>' + esc(hi() ? m.title.hi : m.title.en) + '</h2>' +
        '<p class="today-card__dev" lang="hi">' + (m.dev || []).join('<br>') + '</p>' +
        '<p class="today-card__why">' + (hi() ? m.meaning.hi : m.meaning.en) + '</p>' +
        '<div class="today-card__meta">' +
          '<span>' + T('Day of', 'दिन') + ' <b>' + (hi() ? DAY_LORD_HI[day] : DAY_LORD[day]) + '</b></span>' +
          '<span>' + T('Traditional count', 'पारंपरिक संख्या') + ' <b>' + m.japa + '</b></span>' +
        '</div>' +
        '<div class="today-card__actions">' +
          '<button class="btn btn--primary" type="button" data-today="japa">' + T('Start japa', 'जप शुरू करें') + '</button>' +
          '<button class="btn btn--ghost" type="button" data-today="listen">' + T('Listen', 'सुनें') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="today-card__ring" aria-hidden="true"><span>' + (hi() ? DAY_LORD_HI[day] : DAY_LORD[day]) + '</span></div>';

    host.setAttribute('data-id', m.id);
    host.querySelector('[data-today="japa"]').addEventListener('click', function () {
      selectForJapa(m.id, true);
    });
    host.querySelector('[data-today="listen"]').addEventListener('click', function () {
      speak(m);
    });
  }

  /* ---------------------------------------------------------------- filters */
  function renderChips() {
    var host = $('#mantraChips');
    if (!host) return;
    host.innerHTML = CATS.map(function (c) {
      return '<button class="m-chip' + (state.cat === c[0] ? ' is-active' : '') + '" type="button" data-cat="' + c[0] + '">' +
        (hi() ? c[2] : c[1]) + '</button>';
    }).join('');
  }

  function matches(m) {
    if (state.cat !== 'all' && m.cat !== state.cat) return false;
    if (!state.q) return true;
    var q = state.q.toLowerCase();
    var hay = [m.title.en, m.title.hi, m.deity, (m.translit || []).join(' '), (m.dev || []).join(' '), catLabel(m.cat)].join(' ').toLowerCase();
    return hay.indexOf(q) >= 0;
  }

  /* ------------------------------------------------------------------ cards */
  function card(m, index) {
    var e = entry(m.id);
    var pct = m.aarti ? 0 : Math.min(100, Math.round((e.n / (e.target || 108)) * 100));
    var head = '<div class="m-card__head">' +
      '<span class="m-card__tag m-card__tag--' + m.cat + '">' + catLabel(m.cat) + '</span>' +
      (m.aarti
        ? '<span class="m-card__count">' + m.verses.length + ' ' + T('verses', 'पद') + '</span>'
        : '<span class="m-card__count">' + A.icon('clock') + ' ' + (e.target || 108) + ' japa</span>') +
      '</div>';

    if (m.aarti) {
      return '<article class="m-card m-card--aarti" data-id="' + m.id + '" style="--i:' + Math.min(index, 8) + '">' +
        head +
        '<h2>' + esc(hi() ? m.title.hi : m.title.en) + '</h2>' +
        '<p class="m-card__translit">' + esc(m.verses[0].translit[0]) + '</p>' +
        '<p class="m-card__meaning">' + esc(hi() ? m.meaning.hi : m.meaning.en) + '</p>' +
        '<div class="m-card__actions">' +
          '<button class="m-act m-act--primary" type="button" data-act="aarti">' + A.icon('arrow') + T('Open aarti mode', 'आरती मोड खोलें') + '</button>' +
          '<button class="m-act" type="button" data-act="listen">' + T('Listen', 'सुनें') + '</button>' +
          '<button class="m-act" type="button" data-act="copy">' + T('Copy', 'कॉपी') + '</button>' +
        '</div>' +
      '</article>';
    }

    return '<article class="m-card" data-id="' + m.id + '" style="--i:' + Math.min(index, 8) + '">' +
      head +
      '<h2><span>' + esc(hi() ? m.title.hi : m.title.en) + '</span>' +
        '<small lang="hi">' + esc(hi() ? m.title.en : m.title.hi) + '</small></h2>' +
      '<div class="m-card__dev" lang="hi">' + m.dev.join('<br>') + '</div>' +
      '<p class="m-card__translit">' + m.translit.map(esc).join('<br>') + '</p>' +
      '<div class="m-card__progress" role="img" aria-label="' + pct + '%">' +
        '<span style="width:' + pct + '%"></span>' +
      '</div>' +
      '<details class="m-card__more">' +
        '<summary>' + T('Meaning and when to chant', 'अर्थ और कब जपें') + '</summary>' +
        '<p>' + esc(hi() ? m.meaning.hi : m.meaning.en) + '</p>' +
        '<p><b>' + T('When', 'कब') + ':</b> ' + esc(hi() ? m.use.hi : m.use.en) + '</p>' +
      '</details>' +
      '<div class="m-card__actions">' +
        '<button class="m-act m-act--primary" type="button" data-act="japa">' + T('Japa', 'जप') + '</button>' +
        '<button class="m-act" type="button" data-act="listen">' + T('Listen', 'सुनें') + '</button>' +
        '<button class="m-act" type="button" data-act="copy">' + T('Copy', 'कॉपी') + '</button>' +
        '<a class="m-act" href="booking.html?pooja=' + encodeURIComponent(m.pooja || '') + '">' + T('Book pooja', 'पूजा बुक करें') + '</a>' +
      '</div>' +
    '</article>';
  }

  function renderGrid() {
    var host = $('#mantraGrid');
    var empty = $('#mantraEmpty');
    if (!host) return;
    var rows = MANTRA.filter(matches);
    host.innerHTML = rows.map(card).join('');
    if (empty) {
      empty.hidden = rows.length > 0;
      empty.textContent = T('No mantra matches that search. Try a deity name, a syllable or clear the filter.', 'इस खोज से कोई मंत्र नहीं मिला। देवता का नाम या अक्षर आज़माएँ, या फ़िल्टर हटाएँ।');
    }
    host.querySelectorAll('.m-card').forEach(function (el, i) {
      el.style.animationDelay = Math.min(i, 10) * 45 + 'ms';
    });
  }

  /* ------------------------------------------------------------------- japa */
  function ringOffset(pct) {
    var c = 2 * Math.PI * 52;
    return c - (c * pct / 100);
  }

  function renderJapa() {
    var host = $('#japa');
    if (!host) return;
    var m = find(state.selected) || MANTRA[0];
    var e = entry(m.id);
    var pct = Math.min(100, Math.round((e.n / e.target) * 100));
    host.dataset.id = m.id;

    $('#japaTitle').textContent = hi() ? m.title.hi : m.title.en;
    $('#japaDev').innerHTML = (m.dev || []).join('<br>');
    $('#japaDev').lang = 'hi';
    $('#japaCount').textContent = String(e.n);
    $('#japaTarget').textContent = '/ ' + e.target;
    $('#japaRounds').textContent = e.rounds + ' ' + T(e.rounds === 1 ? 'round done' : 'rounds done', 'राउंड पूरे');
    $('#japaCount').setAttribute('aria-label', e.n + ' ' + T('of', 'में से') + ' ' + e.target);
    var bar = $('#japaBar');
    if (bar) {
      bar.style.strokeDasharray = String(2 * Math.PI * 52);
      bar.style.strokeDashoffset = String(ringOffset(pct));
    }
    var ring = $('#japaRing');
    if (ring) ring.style.setProperty('--pct', pct + '%');

    var beads = $('#japaBeads');
    if (beads) {
      var per = e.target / 12;
      var filled = Math.floor(e.n / per);
      beads.innerHTML = Array.from({ length: 12 }).map(function (_, i) {
        return '<i class="' + (i < filled ? 'is-on' : '') + '" style="--d:' + (i * 40) + 'ms"></i>';
      }).join('');
    }

    $('#japa').querySelectorAll('[data-target]').forEach(function (b) {
      b.classList.toggle('is-active', Number(b.dataset.target) === e.target);
    });
    $('#japaListen').textContent = state.speaking === m.id ? T('Stop', 'रोकें') : T('Listen', 'सुनें');
  }

  function selectForJapa(id, scroll) {
    if (!find(id)) return;
    state.selected = id;
    entry(id);
    saveJapa();
    renderJapa();
    if (scroll) {
      var el = $('#japa');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function addJapa() {
    var m = find(state.selected);
    if (!m) return;
    var e = entry(m.id);
    e.n += 1;
    if (e.n >= e.target) {
      e.n = 0;
      e.rounds += 1;
      saveJapa();
      renderJapa();
      celebrate();
      A.toast(T('Round complete — ' + e.target + ' japa. Sadhana continues.', e.target + ' जप पूरे हुए। साधना जारी रखें।'));
      return;
    }
    saveJapa();
    renderJapa();
    var ring = $('#japaRing');
    if (ring) {
      ring.classList.remove('is-pop');
      void ring.offsetWidth;
      ring.classList.add('is-pop');
    }
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (err) { /* ignore */ }
  }

  function celebrate() {
    var host = $('#japa');
    if (!host) return;
    host.classList.add('is-complete');
    setTimeout(function () { host.classList.remove('is-complete'); }, 1600);
  }

  /* ------------------------------------------------------------------ speech */
  function speak(m) {
    if (!('speechSynthesis' in window)) {
      A.toast(T('Your browser does not support voice recitation. Read the transliteration above.', 'आपका ब्राउज़र वाणी पाठ समर्थित नहीं करता। ऊपर लिप्यंतरण पढ़ें।'));
      return;
    }
    if (state.speaking === m.id) {
      window.speechSynthesis.cancel();
      state.speaking = null;
      renderJapa();
      return;
    }
    window.speechSynthesis.cancel();
    var text = (m.aarti ? m.verses.map(function (v) { return v.translit.join(' '); }).join(' ') : m.translit.join(' '))
      .replace(/\|/g, ',').replace(/\|\|/g, '.');
    if (m.dev && m.dev.length) text = m.dev.join(' । ') + ' ' + text;
    else if (m.aarti) text = m.verses.map(function (v) { return v.dev.join(' । '); }).join(' ') + ' ' + text;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.82;
    u.pitch = 1;
    var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    var v = voices.filter(function (x) { return /hi[-_]IN/i.test(x.lang); })[0] ||
      voices.filter(function (x) { return /^hi/i.test(x.lang); })[0];
    if (v) u.voice = v;
    state.speaking = m.id;
    u.onend = u.onerror = function () {
      state.speaking = null;
      renderJapa();
    };
    window.speechSynthesis.speak(u);
    renderJapa();
  }

  function copy(m) {
    var text = (hi() ? m.title.hi : m.title.en) + '\n\n' +
      (m.aarti
        ? m.verses.map(function (v) { return v.dev.join('\n') + '\n' + v.translit.join('\n'); }).join('\n\n')
        : m.dev.join('\n') + '\n\n' + m.translit.join('\n') + '\n\n' + (hi() ? m.meaning.hi : m.meaning.en));
    var done = function () { A.toast(T('Copied to clipboard.', 'क्लिपबोर्ड पर कॉपी हो गया।')); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { A.toast(T('Copy failed — select the text and copy manually.', 'कॉपी नहीं हुआ — पाठ चुनकर मैन्युअल कॉपी करें।')); }
    document.body.removeChild(ta);
  }

  /* ------------------------------------------------------------- aarti mode */
  var aartiIndex = 0;

  function aartis() {
    return MANTRA.filter(function (m) { return m.aarti; });
  }

  function openAarti(id) {
    var list = aartis();
    var i = list.map(function (m) { return m.id; }).indexOf(id);
    aartiIndex = i >= 0 ? i : 0;
    renderAarti();
    var modal = $('#aartiModal');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('m-lock');
    var close = modal.querySelector('[data-close-aarti]');
    if (close) close.focus();
  }

  function closeAarti() {
    var modal = $('#aartiModal');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('m-lock');
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.speaking = null;
  }

  function renderAarti() {
    var modal = $('#aartiModal');
    if (!modal) return;
    var list = aartis();
    var m = list[aartiIndex % list.length];
    if (!m) return;
    modal.setAttribute('data-id', m.id);
    $('#aartiTitle').textContent = hi() ? m.title.hi : m.title.en;
    $('#aartiCount').textContent = (aartiIndex + 1) + ' / ' + list.length;
    $('#aartiBody').innerHTML = m.verses.map(function (v, i) {
      return '<div class="aarti-verse">' +
        '<span class="aarti-verse__no">' + (i + 1) + '</span>' +
        '<p class="aarti-verse__dev" lang="hi">' + v.dev.join('<br>') + '</p>' +
        '<p class="aarti-verse__tr">' + v.translit.map(esc).join('<br>') + '</p>' +
      '</div>';
    }).join('');
    $('#aartiMeaning').textContent = hi() ? m.meaning.hi : m.meaning.en;
    $('#aartiListen').textContent = state.speaking === m.id ? T('Stop', 'रोकें') : T('Listen', 'सुनें');
  }

  /* ------------------------------------------------------------------- wire */
  function wire() {
    var search = $('#mantraSearch');
    if (search) {
      search.addEventListener('input', function () {
        state.q = search.value.trim();
        renderGrid();
      });
    }
    var chips = $('#mantraChips');
    if (chips) {
      chips.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-cat]');
        if (!b) return;
        state.cat = b.getAttribute('data-cat');
        renderChips();
        renderGrid();
      });
    }
    var grid = $('#mantraGrid');
    if (grid) {
      grid.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-act]');
        if (!btn) return;
        var cardEl = btn.closest('[data-id]');
        var m = cardEl && find(cardEl.getAttribute('data-id'));
        if (!m) return;
        var act = btn.getAttribute('data-act');
        if (act === 'japa') selectForJapa(m.id, true);
        else if (act === 'listen') speak(m);
        else if (act === 'copy') copy(m);
        else if (act === 'aarti') openAarti(m.id);
      });
    }
    var japa = $('#japa');
    if (japa) {
      japa.addEventListener('click', function (ev) {
        var t = ev.target.closest('[data-target]');
        if (t) {
          var e = entry(state.selected);
          e.target = Number(t.dataset.target) || 108;
          e.n = Math.min(e.n, e.target);
          saveJapa();
          renderJapa();
          return;
        }
        if (ev.target.closest('#japaAdd') || ev.target.closest('#japaRing')) addJapa();
        else if (ev.target.closest('#japaReset')) {
          var en = entry(state.selected);
          en.n = 0;
          en.rounds = 0;
          saveJapa();
          renderJapa();
          A.toast(T('Counter reset.', 'काउंटर रीसेट हो गया।'));
        } else if (ev.target.closest('#japaFinish')) {
          var en2 = entry(state.selected);
          en2.n = 0;
          en2.rounds += 1;
          saveJapa();
          renderJapa();
          celebrate();
        } else if (ev.target.closest('#japaListen')) {
          speak(find(state.selected));
        }
      });
      japa.addEventListener('keydown', function (ev) {
        if (ev.code === 'Space' && ev.target === japa) {
          ev.preventDefault();
          addJapa();
        }
      });
      japa.setAttribute('tabindex', '0');
    }
    var modal = $('#aartiModal');
    if (modal) {
      modal.addEventListener('click', function (ev) {
        if (ev.target.closest('[data-close-aarti]')) closeAarti();
        else if (ev.target.closest('[data-aarti-prev]')) { aartiIndex = (aartiIndex - 1 + aartis().length) % aartis().length; renderAarti(); }
        else if (ev.target.closest('[data-aarti-next]')) { aartiIndex = (aartiIndex + 1) % aartis().length; renderAarti(); }
        else if (ev.target.closest('#aartiListen')) speak(aartis()[aartiIndex]);
      });
      document.addEventListener('keydown', function (ev) {
        if (modal.hidden) return;
        if (ev.key === 'Escape') closeAarti();
        else if (ev.key === 'ArrowRight') { aartiIndex = (aartiIndex + 1) % aartis().length; renderAarti(); }
        else if (ev.key === 'ArrowLeft') { aartiIndex = (aartiIndex - 1 + aartis().length) % aartis().length; renderAarti(); }
      });
    }
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = function () { /* voices warm-up */ };
    }
  }

  function renderAll() {
    renderToday();
    renderChips();
    renderGrid();
    renderJapa();
    renderAarti();
  }

  function init() {
    loadJapa();
    entry(state.selected);
    renderAll();
    wire();
    A.onLang(function () {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      state.speaking = null;
      renderAll();
    });
  }

  window.MantraLibrary = {
    data: MANTRA,
    add: addJapa,
    select: selectForJapa,
    state: state
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
