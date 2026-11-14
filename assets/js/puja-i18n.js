/* ==========================================================================
   Satyanarayan Puja Guide — interface strings and Hindi content
   Loaded after puja-data.js and before puja.js. Keeping translations in one
   file makes it easy for a Hindi editor or pandit to review wording without
   touching the interaction code.
   ========================================================================== */
(function (root) {
  'use strict';

  var UI = {
    en: {
      skip: 'Skip to the puja guide',
      home: 'Home',
      pageTitle: 'Satyanarayan Puja Guide',
      loading: 'Loading…',
      offline: 'You are offline. The guide, checklist and saved progress still work on this device.',
      chooseCity: 'Choose city',
      theme: {
        dark: 'Dark',
        light: 'Light',
        toDark: 'Switch to dark mode',
        toLight: 'Switch to light mode'
      },
      lang: {
        switchToHi: 'Switch to Hindi',
        switchToEn: 'Switch to English',
        hi: 'हिंदी',
        en: 'English'
      },
      hero: {
        eyebrow: 'Free · Bilingual · Offline-ready',
        titleHtml: 'Satyanarayan Puja, <em>step by step.</em>',
        sub: 'A complete household guide — 8 clear steps, Devanagari mantras with transliteration and meaning, samagri by family size, the five-adhyay katha, a havan counter and a printable sankalp. No guesswork, no missing pages.',
        badge1: '8-step vidhi',
        badge2: '60–90 minutes',
        badge3: 'Samagri checklist',
        badge4: 'Havan counter',
        start: 'Start the 8 steps',
        samagri: 'Open samagri list',
        share: 'Share this guide',
        tiny: 'Mantras are awaiting final review by an empanelled pandit. Your family sampradaya and a pandit’s guidance are final.',
        path: 'The path',
        cardTitle: 'Eight steps, one calm puja',
        loadingToday: 'Today’s panchang is loading…',
        step1: 'Sankalp',
        step2: 'Ganesh',
        step3: 'Kalash',
        step4: 'Avahana',
        step5: 'Katha',
        step6: 'Aarti',
        step7: 'Havan',
        step8: 'Prasad'
      },
      tab: {
        start: 'Start',
        samagri: 'Samagri',
        puja: 'Guided Puja',
        havan: 'Havan',
        katha: 'Katha',
        muhurat: 'Muhurat',
        sankalp: 'Sankalp',
        about: 'About'
      },
      panchang: {
        tithi: 'Tithi',
        nakshatra: 'Nakshatra',
        rahu: 'Rahu Kaal',
        abhijit: 'Abhijit',
        rahuNote: 'avoid starting new work',
        abhijitNote: 'daily fallback window',
        sunrise: 'Sunrise',
        sunset: 'Sunset',
        full: 'Full panchang',
        ends: 'ends {time}',
        pada: '{lord} · pada {pada}',
        at: 'Today at a glance'
      },
      start: {
        kicker: 'Today, for your city',
        title: 'Before you begin',
        desc: 'A quick check of tithi, Rahu Kaal and the day’s muhurat.',
        quick1Title: 'Keep 60–90 minutes',
        quick1: 'Most families finish the vidhi in about 75 minutes. The katha reading often takes the longest. Keep water and a cushion nearby.',
        quick2Title: 'Buy only what you need',
        quick2: 'The checklist adjusts quantities for your family size. A ready kit is available if you would rather not shop item by item.',
        quick3Title: 'Print your sankalp',
        quick3: 'Generate the sankalp with your name and gotra, then print it or save it as a PDF to keep with the katha book.',
        disclaimerTitle: 'Please read.',
        disclaimer: 'This is a preparation guide, not a substitute for a pandit. Mantra pronunciation, the order of vidhi and the offerings vary by family and region (sampradaya). The mantras here are traditional and are marked with their source; final review by an empanelled pandit is pending. A pandit’s guidance is final.'
      },
      progress: {
        kicker: 'Your progress',
        unit: 'complete',
        initial: 'Your steps and checklist are saved on this device only.',
        allDone: 'All eight steps are marked complete. Share prasad and close with gratitude.',
        remaining: '{n} step{s} still to go. Your progress is saved on this device.',
        start: 'Start the puja',
        review: 'Review the puja',
        continue: 'Continue the puja',
        reset: 'Reset saved progress',
        local: 'No account needed. Nothing is sent to a server.',
        resetConfirm: 'Reset saved steps, checklist ticks and bookmarks on this device?',
        resetDone: 'Saved progress reset'
      },
      next: {
        kicker: 'Plan ahead',
        title: 'Next Purnima & Ekadashi',
        desc: 'Computed for your city. Confirm the final window with your family pandit.',
        full: 'Full muhurat calendar',
        none: 'Could not calculate dates on this device. Open the full panchang.',
        labelSankranti: 'Makar Sankranti',
        labelEkadashi: '{paksha} Ekadashi',
        labelPurnima: 'Purnima Vrat'
      },
      samagri: {
        kicker: 'Nothing missing',
        title: 'Samagri checklist',
        desc: 'Quantities adjust for your household. Tick what you already have; share the rest on WhatsApp.',
        family: 'Family size',
        itemReady: 'items ready',
        share: 'Share list',
        copy: 'Copy list',
        reset: 'Clear ticks',
        buy: 'Buy a ready kit',
        ready: '{done}/{total} ready',
        essential: 'essential',
        noteTitle: 'Substitutions are normal.',
        note: 'If a flower, fruit or leaf is not available, offer what is clean and local. Do not delay the puja for one item. Avoid plastic, synthetic flowers and non-biodegradable offerings in the havan or visarjan.',
        copied: 'Samagri list copied',
        cleared: 'Checklist cleared',
        shareHeading: 'Satyanarayan Puja samagri — family of {n}',
        guide: 'Guide: {url}'
      },
      units: {
        piece: 'piece', bunch: 'bunch', leaf: 'leaf', bottle: 'bottle', box: 'box',
        diya: 'diya', copy: 'copy', set: 'set', handful: 'handful', bundle: 'bundle',
        pack: 'pack', packet: 'packet', bowl: 'bowl', bucket: 'bucket', g: 'g', ml: 'ml',
        'small bottle': 'small bottle', 'small box': 'small box',
        'small piece': 'small piece', 'small bowl': 'small bowl'
      },
      puja: {
        kicker: 'Guided vidhi',
        title: 'The eight steps',
        desc: 'Read the mantra in Devanagari, follow the transliteration, and use the timer if you like. Your progress is saved on this device.',
        audioNote: 'Audio uses your device voice. No recording is downloaded.',
        yourPlace: 'Your place',
        backSamagri: 'Back to samagri',
        stepOf: 'Step {n} of {total} · {short}',
        completed: 'Completed',
        minutes: '{n} min',
        readingStep: 'This step is a reading and listening step. Open the Katha tab for the five chapters.',
        tip: 'Tip:',
        timerOptional: 'Optional step timer',
        timerStart: 'Start',
        timerPause: 'Pause',
        timerReset: 'Reset',
        timerDone: 'Step timer complete',
        back: 'Back',
        next: 'Next step',
        finish: 'Finish puja',
        mark: 'Mark complete',
        undo: 'Mark incomplete',
        marked: 'Step {n} marked complete',
        source: 'Source:',
        playMantra: 'Play {label}',
        completeTitle: 'Your puja is complete',
        completeText: 'Offer the prasad to everyone present, ask forgiveness for any omission, and close with gratitude. The merit of the vrata is in the sharing, not in a perfect checklist.',
        printSankalp: 'Print sankalp',
        openHavan: 'Open havan counter',
        readKatha: 'Read the katha',
        completeLocal: 'Your progress is saved on this device. You can review any step from the rail.',
        completeToast: 'Puja complete — prasad shared, gratitude offered'
      },
      havan: {
        kicker: 'Fire offering',
        title: 'Havan & ahuti counter',
        desc: 'Choose a count, tap once for every offering, and complete the purnahuti. Keep water and a sand bucket nearby.',
        safetyNote: 'Never leave a havan unattended. Follow your building’s fire safety rules.',
        target: '{n} ahutis',
        tap: 'Tap for one ahuti',
        oneAhuti: 'One ahuti',
        toClose: 'To close',
        purnahuti: 'Purnahuti',
        offered: '{done} of {target} offered',
        msg0: 'Keep a steady count.',
        msgLeft: '{n} more to go.',
        msgDone: 'Target complete — offer the purnahuti when ready.',
        msgExtra: 'Extra offerings counted. Offer the purnahuti when ready.',
        reset: 'Start a fresh count',
        complete: 'Mark havan complete',
        resetToast: 'Havan count reset',
        completeToast: 'Havan step marked complete',
        source: 'Source:'
      },
      katha: {
        kicker: 'Five adhyay',
        title: 'The Satyanarayan Katha',
        desc: 'A faithful retelling for understanding and listening. At the altar, read the complete authorised katha from your printed book.',
        listenAll: 'Listen to all',
        complete: 'Mark katha read',
        noteTitle: 'Reader vs. ritual text.',
        note: 'The five chapters below are a retelling, not a verbatim scripture. Published katha books differ in wording and detail. For the actual vrata, read from an authorised book or invite a pandit.',
        bookmark: 'Bookmark chapter {n}',
        listenChapter: 'Listen to chapter {n}',
        teaching: 'Teaching:',
        bookmarked: 'Bookmarked on this device',
        bookmarkHint: 'Tap the star to bookmark',
        listen: 'Listen',
        bookmarkedToast: 'Chapter bookmarked',
        unbookmarkedToast: 'Bookmark removed',
        completeToast: 'Katha step marked complete',
        disclaimerTitle: 'Source status.',
        disclaimer: 'Katha summaries are based on the traditional Satyanarayan Vrat Katha and are marked as retellings. They are awaiting pandit review. Regional versions may name characters differently or add local episodes.',
        readAllTitle: 'The Satyanarayan Katha'
      },
      muhurat: {
        kicker: 'Choose a date',
        title: 'Purnima, Ekadashi & Sankranti',
        desc: 'Upcoming dates for your city, with sunrise, Abhijit and Rahu Kaal. Confirm the final puja window with your family pandit.',
        none: 'Could not calculate muhurat dates on this device. Open the full panchang.',
        sankranti: 'Sankranti',
        ekadashi: 'Ekadashi',
        purnima: 'Purnima',
        book: 'Book pandit',
        use: 'Use guide',
        tithiEnds: 'Tithi ends',
        sunrise: 'Sunrise',
        abhijit: 'Abhijit',
        rahu: 'Rahu Kaal',
        noteTitle: 'Tithi timing matters.',
        note: 'Purnima or Ekadashi may span two evenings. The date shown is based on the tithi at sunrise. Many families observe the vrata on the evening when the tithi prevails at moonrise; follow your family panchang or pandit. Avoid Rahu Kaal for beginning the puja.',
        ics: 'Add dates to calendar',
        icsDone: 'Calendar file downloaded',
        notify: 'Festival reminder',
        notifyOn: 'Reminder on',
        notifyOff: 'Reminder off',
        notifyUnsupported: 'Notifications are not supported in this browser.',
        notifyDenied: 'Notifications were blocked. Allow them in browser settings.',
        notifyEnabled: 'Festival reminder enabled on this device',
        notifyDisabled: 'Festival reminder disabled'
      },
      sankalp: {
        kicker: 'Your intention',
        title: 'Sankalp generator',
        desc: 'Fill your details and get a printable sankalp in Devanagari with an English translation. Your data stays in this browser.',
        local: 'Local only',
        name: 'Your name',
        namePlaceholder: 'e.g. Rajiv Sharma',
        gotra: 'Gotra',
        gotraPlaceholder: 'e.g. Kashyap',
        gotraHelp: 'Not sure? Use Kashyap or ask a family elder.',
        city: 'City',
        cityPlaceholder: 'e.g. Gurugram',
        date: 'Date',
        purpose: 'Purpose / intention',
        family: 'Family members',
        optional: 'optional',
        familyPlaceholder: 'e.g. Sunita, Aarav, Meera',
        familyHelp: 'Names are added as “together with family” in the sankalp.',
        print: 'Print / save PDF',
        copy: 'Copy text',
        whatsapp: 'WhatsApp',
        printDone: 'Choose “Save as PDF” in the print dialog',
        copied: 'Sankalp copied',
        paperTitle: 'संकल्प पत्र',
        paperSub: 'Sankalp for the Satyanarayan vrata',
        fill: 'Fill the form to generate your sankalp.',
        metaName: 'Name:',
        metaGotra: 'Gotra:',
        metaCity: 'City:',
        metaDate: 'Date:',
        sign: 'Family signature / thumb impression',
        signDate: 'Date',
        foot: 'This sankalp is a template. A family pandit may add the samvat, shaka, lunar month, tithi and family lineage.'
      },
      about: {
        kicker: 'Read before you begin',
        title: 'Sources, review status & safety',
        desc: 'This guide is built to reduce confusion, not to replace the living tradition of a family pandit.',
        s1Title: 'What is sourced',
        s1: 'Every mantra card has a source note. The Ganesh, kalash, Satyanarayan, havan, purnahuti and kshama mantras are traditional and widely published. The katha chapters are retellings, not verbatim scripture.',
        s1Note: 'Review status: awaiting empanelled pandit review. Until then, treat pronunciation and sequence as a study aid.',
        s2Title: 'What varies by family',
        s2: 'The order of shodashopachar, the number of ahutis, the aarti, the katha edition, the offerings and the visarjan method all vary. Follow your sampradaya. A parent’s or family pandit’s instruction comes first.',
        s2Note: 'Purnima and Ekadashi dates can differ by a day between panchangs because of tithi timing and local observance.',
        s3Title: 'Privacy & data',
        s3: 'Names, gotra, checklist ticks and progress are stored in your browser’s localStorage. This page has no analytics, no account and no server sync. Clearing browser data removes everything.',
        s3Note: 'The print/save-as-PDF action is handled by your browser. Nothing is uploaded.',
        s4Title: 'Fire, water & safety',
        s4: 'Keep a water bucket and sand near the havan. Never leave a flame unattended. Do not use plastic, printed paper or synthetic flowers in the fire. Dispose of flowers and ash responsibly; do not put plastic into water during visarjan.',
        s4Note: 'If your home or building does not allow fire, ask a pandit about a safe alternative.',
        disclaimerTitle: 'Full disclaimer.',
        disclaimer: 'This guide is for personal preparation and education. It does not replace a pandit, a family guru, or your sampradaya. Mantras are traditional; English meanings are working translations. The module is awaiting final review by an empanelled pandit. Regional and family traditions vary, and a pandit’s guidance is final. If you are unsure about any step, pause and ask a qualified pandit.',
        ctaKicker: 'Prefer to have it performed?',
        ctaTitle: 'Book a verified pandit for the same vidhi',
        ctaText: 'The booking team can arrange a senior pandit, samagri, havan and visarjan, with a live option for NRI families.',
        book: 'Book Satyanarayan Katha',
        buy: 'Buy samagri kit'
      },
      cta: {
        kicker: 'A calm puja, not a perfect performance',
        title: 'Do what you can. Offer it with a full heart.',
        text: 'If a step is unclear, stop and ask. Our team can connect you with a pandit for guidance or a full home puja.',
        whatsapp: 'Ask on WhatsApp',
        book: 'Book a pandit',
        tiny: 'Free cancellation up to 24 hours before the ritual.'
      },
      misc: {
        close: 'Close',
        plus: 'Increase',
        minus: 'Decrease'
      },
      names: {
        paksha: { Shukla: 'Shukla', Krishna: 'Krishna' },
        tithi: {
          Pratipada: 'Pratipada', Dwitiya: 'Dwitiya', Tritiya: 'Tritiya', Chaturthi: 'Chaturthi',
          Panchami: 'Panchami', Shashthi: 'Shashthi', Saptami: 'Saptami', Ashtami: 'Ashtami',
          Navami: 'Navami', Dashami: 'Dashami', Ekadashi: 'Ekadashi', Dwadashi: 'Dwadashi',
          Trayodashi: 'Trayodashi', Chaturdashi: 'Chaturdashi', Purnima: 'Purnima', Amavasya: 'Amavasya'
        },
        nakshatra: {
          Ashwini: 'Ashwini', Bharani: 'Bharani', Krittika: 'Krittika', Rohini: 'Rohini',
          Mrigashira: 'Mrigashira', Ardra: 'Ardra', Punarvasu: 'Punarvasu', Pushya: 'Pushya',
          Ashlesha: 'Ashlesha', Magha: 'Magha', 'Purva Phalguni': 'Purva Phalguni',
          'Uttara Phalguni': 'Uttara Phalguni', Hasta: 'Hasta', Chitra: 'Chitra', Swati: 'Swati',
          Vishakha: 'Vishakha', Anuradha: 'Anuradha', Jyeshtha: 'Jyeshtha', Mula: 'Mula',
          'Purva Ashadha': 'Purva Ashadha', 'Uttara Ashadha': 'Uttara Ashadha', Shravana: 'Shravana',
          Dhanishtha: 'Dhanishtha', Shatabhisha: 'Shatabhisha', 'Purva Bhadrapada': 'Purva Bhadrapada',
          'Uttara Bhadrapada': 'Uttara Bhadrapada', Revati: 'Revati'
        },
        lord: {
          Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury', Jupiter: 'Jupiter',
          Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu'
        },
        weekday: {
          Sunday: 'Sunday', Monday: 'Monday', Tuesday: 'Tuesday', Wednesday: 'Wednesday',
          Thursday: 'Thursday', Friday: 'Friday', Saturday: 'Saturday'
        }
      }
    },
    hi: {
      skip: 'सीधे पूजा गाइड पर जाएँ',
      home: 'होम',
      pageTitle: 'सत्यनारायण पूजा गाइड',
      loading: 'लोड हो रहा है…',
      offline: 'आप ऑफ़लाइन हैं। गाइड, सामग्री सूची और सहेजी गई प्रगति इस डिवाइस पर काम करती रहेगी।',
      chooseCity: 'शहर चुनें',
      theme: {
        dark: 'डार्क',
        light: 'लाइट',
        toDark: 'डार्क मोड पर जाएँ',
        toLight: 'लाइट मोड पर जाएँ'
      },
      lang: {
        switchToHi: 'हिंदी में देखें',
        switchToEn: 'अंग्रेज़ी में देखें',
        hi: 'हिंदी',
        en: 'English'
      },
      hero: {
        eyebrow: 'मुफ़्त · द्विभाषी · ऑफ़लाइन तैयार',
        titleHtml: 'सत्यनारायण पूजा, <em>चरण दर चरण।</em>',
        sub: 'घर के लिए पूरी गाइड — 8 स्पष्ट चरण, देवनागरी मंत्र, उच्चारण और अर्थ, परिवार के अनुसार सामग्री, पाँच अध्याय की कथा, हवन काउंटर और प्रिंट करने योग्य संकल्प। न कोई अनुमान, न कोई छूटा हुआ पन्ना।',
        badge1: '8-चरण विधि',
        badge2: '60–90 मिनट',
        badge3: 'सामग्री सूची',
        badge4: 'हवन काउंटर',
        start: '8 चरण शुरू करें',
        samagri: 'सामग्री सूची खोलें',
        share: 'गाइड शेयर करें',
        tiny: 'मंत्रों की अंतिम समीक्षा पैनल पंडित द्वारा बाकी है। आपकी पारिवारिक परंपरा और पंडित का मार्गदर्शन अंतिम है।',
        path: 'मार्ग',
        cardTitle: 'आठ चरण, एक शांत पूजा',
        loadingToday: 'आज का पंचांग लोड हो रहा है…',
        step1: 'संकल्प',
        step2: 'गणेश',
        step3: 'कलश',
        step4: 'आवाहन',
        step5: 'कथा',
        step6: 'आरती',
        step7: 'हवन',
        step8: 'प्रसाद'
      },
      tab: {
        start: 'आरंभ',
        samagri: 'सामग्री',
        puja: 'निर्देशित पूजा',
        havan: 'हवन',
        katha: 'कथा',
        muhurat: 'मुहूर्त',
        sankalp: 'संकल्प',
        about: 'जानकारी'
      },
      panchang: {
        tithi: 'तिथि',
        nakshatra: 'नक्षत्र',
        rahu: 'राहु काल',
        abhijit: 'अभिजीत',
        rahuNote: 'नया कार्य शुरू करने से बचें',
        abhijitNote: 'दैनिक वैकल्पिक समय',
        sunrise: 'सूर्योदय',
        sunset: 'सूर्यास्त',
        full: 'पूरा पंचांग',
        ends: '{time} तक',
        pada: '{lord} · चरण {pada}',
        at: 'आज एक नज़र में'
      },
      start: {
        kicker: 'आज, आपके शहर के लिए',
        title: 'शुरू करने से पहले',
        desc: 'तिथि, राहु काल और दिन के मुहूर्त की एक त्वरित जाँच।',
        quick1Title: '60–90 मिनट रखें',
        quick1: 'अधिकांश परिवार विधि लगभग 75 मिनट में पूरी करते हैं। कथा पढ़ने में सबसे अधिक समय लगता है। पास में जल और आसन रखें।',
        quick2Title: 'केवल ज़रूरी सामग्री खरीदें',
        quick2: 'सूची आपके परिवार के आकार के अनुसार मात्रा बदलती है। यदि आप एक-एक वस्तु नहीं खरीदना चाहते, तो तैयार किट उपलब्ध है।',
        quick3Title: 'अपना संकल्प प्रिंट करें',
        quick3: 'अपने नाम और गोत्र के साथ संकल्प बनाएँ, फिर उसे प्रिंट करें या PDF में सहेजकर कथा पुस्तक के साथ रखें।',
        disclaimerTitle: 'कृपया पढ़ें।',
        disclaimer: 'यह तैयारी की गाइड है, पंडित का विकल्प नहीं। मंत्रोच्चार, विधि का क्रम और अर्पण परिवार तथा क्षेत्र (संप्रदाय) के अनुसार बदलते हैं। यहाँ दिए मंत्र परंपरागत हैं और उनका स्रोत अंकित है; पैनल पंडित द्वारा अंतिम समीक्षा बाकी है। पंडित का मार्गदर्शन अंतिम है।'
      },
      progress: {
        kicker: 'आपकी प्रगति',
        unit: 'पूरा',
        initial: 'आपके चरण और सामग्री सूची केवल इस डिवाइस पर सहेजे जाते हैं।',
        allDone: 'सभी आठ चरण पूरे हो गए हैं। प्रसाद बाँटें और कृतज्ञता के साथ पूजा समाप्त करें।',
        remaining: '{n} चरण बाकी हैं। आपकी प्रगति इस डिवाइस पर सहेजी जाती है।',
        start: 'पूजा शुरू करें',
        review: 'पूजा दोहराएँ',
        continue: 'पूजा जारी रखें',
        reset: 'सहेजी प्रगति रीसेट करें',
        local: 'कोई खाता नहीं चाहिए। कुछ भी सर्वर पर नहीं भेजा जाता।',
        resetConfirm: 'इस डिवाइस पर सहेजे गए चरण, सामग्री के निशान और बुकमार्क रीसेट करें?',
        resetDone: 'सहेजी प्रगति रीसेट हो गई'
      },
      next: {
        kicker: 'आगे की योजना',
        title: 'अगली पूर्णिमा और एकादशी',
        desc: 'आपके शहर के लिए गणना की गई। अंतिम समय अपने पारिवारिक पंडित से पुष्टि करें।',
        full: 'पूरा मुहूर्त कैलेंडर',
        none: 'इस डिवाइस पर तिथियाँ गणना नहीं हो सकीं। पूरा पंचांग खोलें।',
        labelSankranti: 'मकर संक्रांति',
        labelEkadashi: '{paksha} एकादशी',
        labelPurnima: 'पूर्णिमा व्रत'
      },
      samagri: {
        kicker: 'कुछ भी न छूटे',
        title: 'सामग्री सूची',
        desc: 'मात्रा आपके परिवार के अनुसार बदलती है। जो सामग्री पास है उस पर निशान लगाएँ; बाकी WhatsApp पर शेयर करें।',
        family: 'परिवार का आकार',
        itemReady: 'वस्तुएँ तैयार',
        share: 'सूची शेयर करें',
        copy: 'सूची कॉपी करें',
        reset: 'निशान हटाएँ',
        buy: 'तैयार किट खरीदें',
        ready: '{done}/{total} तैयार',
        essential: 'आवश्यक',
        noteTitle: 'विकल्प सामान्य हैं।',
        note: 'यदि कोई फूल, फल या पत्ता उपलब्ध न हो, तो जो स्वच्छ और स्थानीय हो वही अर्पित करें। एक वस्तु के लिए पूजा न टालें। हवन या विसर्जन में प्लास्टिक, कृत्रिम फूल और अपघटन न होने वाली सामग्री न डालें।',
        copied: 'सामग्री सूची कॉपी हो गई',
        cleared: 'सूची के निशान हट गए',
        shareHeading: 'सत्यनारायण पूजा सामग्री — {n} सदस्यों का परिवार',
        guide: 'गाइड: {url}'
      },
      units: {
        piece: 'टुकड़ा', bunch: 'गुच्छ', leaf: 'पत्ता', bottle: 'बोतल', box: 'डिब्बा',
        diya: 'दीपक', copy: 'प्रति', set: 'सेट', handful: 'मुट्ठी', bundle: 'गड्डी',
        pack: 'पैक', packet: 'पैकेट', bowl: 'कटोरी', bucket: 'बाल्टी', g: 'ग्राम', ml: 'मिली',
        'small bottle': 'छोटी बोतल', 'small box': 'छोटा डिब्बा',
        'small piece': 'छोटा टुकड़ा', 'small bowl': 'छोटी कटोरी'
      },
      puja: {
        kicker: 'निर्देशित विधि',
        title: 'आठ चरण',
        desc: 'मंत्र देवनागरी में पढ़ें, उच्चारण सहित देखें और चाहें तो टाइमर का उपयोग करें। आपकी प्रगति इस डिवाइस पर सहेजी जाती है।',
        audioNote: 'ऑडियो आपके डिवाइस की आवाज़ का उपयोग करता है। कोई रिकॉर्डिंग डाउनलोड नहीं होती।',
        yourPlace: 'आपका स्थान',
        backSamagri: 'सामग्री सूची पर लौटें',
        stepOf: 'चरण {n} / {total} · {short}',
        completed: 'पूरा हुआ',
        minutes: '{n} मिनट',
        readingStep: 'यह पढ़ने और सुनने का चरण है। पाँच अध्यायों के लिए कथा टैब खोलें।',
        tip: 'सुझाव:',
        timerOptional: 'वैकल्पिक चरण टाइमर',
        timerStart: 'शुरू करें',
        timerPause: 'रोकें',
        timerReset: 'रीसेट',
        timerDone: 'चरण टाइमर पूरा हुआ',
        back: 'पीछे',
        next: 'अगला चरण',
        finish: 'पूजा पूरी करें',
        mark: 'पूरा हुआ चिह्नित करें',
        undo: 'अधूरा चिह्नित करें',
        marked: 'चरण {n} पूरा चिह्नित हुआ',
        source: 'स्रोत:',
        playMantra: '{label} सुनें',
        completeTitle: 'आपकी पूजा पूरी हुई',
        completeText: 'उपस्थित सभी लोगों को प्रसाद अर्पित करें, किसी भी भूल के लिए क्षमा माँगें और कृतज्ञता के साथ पूजा समाप्त करें। व्रत का पुण्य बाँटने में है, सही-सही चेकलिस्ट में नहीं।',
        printSankalp: 'संकल्प प्रिंट करें',
        openHavan: 'हवन काउंटर खोलें',
        readKatha: 'कथा पढ़ें',
        completeLocal: 'आपकी प्रगति इस डिवाइस पर सहेजी है। आप किसी भी चरण को बाईं सूची से दोबारा देख सकते हैं।',
        completeToast: 'पूजा पूरी — प्रसाद बाँटा, कृतज्ञता अर्पित'
      },
      havan: {
        kicker: 'अग्नि अर्पण',
        title: 'हवन और आहुति काउंटर',
        desc: 'संख्या चुनें, हर अर्पण के लिए एक बार टैप करें और पूर्णाहुति करें। पास में जल और रेत की बाल्टी रखें।',
        safetyNote: 'हवन को कभी बिना देखभाल के न छोड़ें। अपनी इमारत के अग्नि सुरक्षा नियमों का पालन करें।',
        target: '{n} आहुतियाँ',
        tap: 'एक आहुति के लिए टैप करें',
        oneAhuti: 'एक आहुति',
        toClose: 'समापन के लिए',
        purnahuti: 'पूर्णाहुति',
        offered: '{target} में से {done} अर्पित',
        msg0: 'स्थिर गति से गिनती रखें।',
        msgLeft: '{n} और बाकी हैं।',
        msgDone: 'लक्ष्य पूरा — तैयार होने पर पूर्णाहुति करें।',
        msgExtra: 'अतिरिक्त आहुतियाँ गिनी गईं। तैयार होने पर पूर्णाहुति करें।',
        reset: 'नई गिनती शुरू करें',
        complete: 'हवन पूरा चिह्नित करें',
        resetToast: 'हवन गिनती रीसेट हुई',
        completeToast: 'हवन चरण पूरा चिह्नित हुआ',
        source: 'स्रोत:'
      },
      katha: {
        kicker: 'पाँच अध्याय',
        title: 'सत्यनारायण कथा',
        desc: 'समझने और सुनने के लिए निष्ठापूर्ण पुनर्कथन। वेदी पर पूरी अधिकृत कथा अपनी मुद्रित पुस्तक से पढ़ें।',
        listenAll: 'सभी सुनें',
        complete: 'कथा पढ़ी चिह्नित करें',
        noteTitle: 'पाठक और अनुष्ठान पाठ।',
        note: 'नीचे दिए पाँच अध्याय पुनर्कथन हैं, शब्दशः शास्त्र नहीं। प्रकाशित कथा पुस्तकों में शब्द और विवरण भिन्न होते हैं। वास्तविक व्रत के लिए अधिकृत पुस्तक पढ़ें या पंडित जी को बुलाएँ।',
        bookmark: 'अध्याय {n} बुकमार्क करें',
        listenChapter: 'अध्याय {n} सुनें',
        teaching: 'शिक्षा:',
        bookmarked: 'इस डिवाइस पर बुकमार्क है',
        bookmarkHint: 'बुकमार्क के लिए स्टार दबाएँ',
        listen: 'सुनें',
        bookmarkedToast: 'अध्याय बुकमार्क हुआ',
        unbookmarkedToast: 'बुकमार्क हटा',
        completeToast: 'कथा चरण पूरा चिह्नित हुआ',
        disclaimerTitle: 'स्रोत स्थिति।',
        disclaimer: 'कथा सारांश परंपरागत सत्यनारायण व्रत कथा पर आधारित पुनर्कथन हैं। इनकी पंडित समीक्षा बाकी है। क्षेत्रीय संस्करणों में पात्रों के नाम भिन्न या स्थानीय प्रसंग जुड़े हो सकते हैं।',
        readAllTitle: 'सत्यनारायण कथा'
      },
      muhurat: {
        kicker: 'तिथि चुनें',
        title: 'पूर्णिमा, एकादशी और संक्रांति',
        desc: 'आपके शहर के आगामी दिन, सूर्योदय, अभिजीत और राहु काल के साथ। पूजा का अंतिम समय अपने पारिवारिक पंडित से पुष्टि करें।',
        none: 'इस डिवाइस पर मुहूर्त तिथियाँ गणना नहीं हो सकीं। पूरा पंचांग खोलें।',
        sankranti: 'संक्रांति',
        ekadashi: 'एकादशी',
        purnima: 'पूर्णिमा',
        book: 'पंडित बुक करें',
        use: 'गाइड खोलें',
        tithiEnds: 'तिथि समाप्त',
        sunrise: 'सूर्योदय',
        abhijit: 'अभिजीत',
        rahu: 'राहु काल',
        noteTitle: 'तिथि का समय महत्वपूर्ण है।',
        note: 'पूर्णिमा या एकादशी दो शामों तक रह सकती है। दिखाई गई तिथि सूर्योदय के समय की है। अनेक परिवार चंद्रोदय के समय तिथि होने पर व्रत करते हैं; अपने पारिवारिक पंचांग या पंडित का पालन करें। पूजा आरंभ करने के लिए राहु काल से बचें।',
        ics: 'तिथियाँ कैलेंडर में जोड़ें',
        icsDone: 'कैलेंडर फ़ाइल डाउनलोड हुई',
        notify: 'त्योहार अनुस्मारक',
        notifyOn: 'अनुस्मारक चालू',
        notifyOff: 'अनुस्मारक बंद',
        notifyUnsupported: 'इस ब्राउज़र में सूचनाएँ समर्थित नहीं हैं।',
        notifyDenied: 'सूचनाएँ अवरुद्ध हैं। ब्राउज़र की सेटिंग में अनुमति दें।',
        notifyEnabled: 'इस डिवाइस पर त्योहार अनुस्मारक चालू हो गया',
        notifyDisabled: 'त्योहार अनुस्मारक बंद हो गया'
      },
      sankalp: {
        kicker: 'आपका संकल्प',
        title: 'संकल्प जनरेटर',
        desc: 'अपनी जानकारी भरें और देवनागरी में प्रिंट करने योग्य संकल्प पाएँ, अंग्रेज़ी अनुवाद के साथ। आपकी जानकारी इसी ब्राउज़र में रहती है।',
        local: 'केवल इस उपकरण पर',
        name: 'आपका नाम',
        namePlaceholder: 'जैसे: राजीव शर्मा',
        gotra: 'गोत्र',
        gotraPlaceholder: 'जैसे: कश्यप',
        gotraHelp: 'पता नहीं? कश्यप लिखें या परिवार के बड़े से पूछें।',
        city: 'शहर',
        cityPlaceholder: 'जैसे: गुरुग्राम',
        date: 'तिथि',
        purpose: 'उद्देश्य / मनोकामना',
        family: 'परिवार के सदस्य',
        optional: 'वैकल्पिक',
        familyPlaceholder: 'जैसे: सुनीता, आरव, मीरा',
        familyHelp: 'नाम संकल्प में “सपरिवार” के रूप में जुड़ते हैं।',
        print: 'प्रिंट / PDF सहेजें',
        copy: 'पाठ कॉपी करें',
        whatsapp: 'WhatsApp',
        printDone: 'प्रिंट डायलॉग में “Save as PDF” चुनें',
        copied: 'संकल्प कॉपी हो गया',
        paperTitle: 'संकल्प पत्र',
        paperSub: 'सत्यनारायण व्रत का संकल्प',
        fill: 'अपना संकल्प बनाने के लिए फ़ॉर्म भरें।',
        metaName: 'नाम:',
        metaGotra: 'गोत्र:',
        metaCity: 'शहर:',
        metaDate: 'तिथि:',
        sign: 'परिवार के हस्ताक्षर / अंगूठा',
        signDate: 'तिथि',
        foot: 'यह संकल्प एक खाका है। पारिवारिक पंडित संवत्, शक, चंद्रमास, तिथि और कुल-परंपरा जोड़ सकते हैं।'
      },
      about: {
        kicker: 'शुरू करने से पहले पढ़ें',
        title: 'स्रोत, समीक्षा स्थिति और सुरक्षा',
        desc: 'यह गाइड भ्रम कम करने के लिए है, पारिवारिक पंडित की जीवंत परंपरा का विकल्प नहीं।',
        s1Title: 'क्या स्रोत-सहित है',
        s1: 'हर मंत्र कार्ड पर स्रोत लिखा है। गणेश, कलश, सत्यनारायण, हवन, पूर्णाहुति और क्षमा मंत्र परंपरागत और व्यापक रूप से प्रकाशित हैं। कथा अध्याय पुनर्कथन हैं, शब्दशः शास्त्र नहीं।',
        s1Note: 'समीक्षा स्थिति: पैनल पंडित की समीक्षा बाकी। तब तक उच्चारण और क्रम को अध्ययन सहायता मानें।',
        s2Title: 'परिवार के अनुसार क्या बदलता है',
        s2: 'षोडशोपचार का क्रम, आहुतियों की संख्या, आरती, कथा संस्करण, अर्पण और विसर्जन विधि सब बदलते हैं। अपने संप्रदाय का पालन करें। माता-पिता या पारिवारिक पंडित का निर्देश पहले है।',
        s2Note: 'तिथि के समय और स्थानीय पालन के कारण पूर्णिमा और एकादशी की तिथि पंचांगों में एक दिन भिन्न हो सकती है।',
        s3Title: 'गोपनीयता और डेटा',
        s3: 'नाम, गोत्र, सामग्री के निशान और प्रगति आपके ब्राउज़र के localStorage में रहते हैं। इस पेज पर कोई analytics, खाता या सर्वर सिंक नहीं है। ब्राउज़र डेटा साफ़ करने पर सब हट जाता है।',
        s3Note: 'प्रिंट/PDF क्रिया आपका ब्राउज़र संभालता है। कुछ भी अपलोड नहीं होता।',
        s4Title: 'अग्नि, जल और सुरक्षा',
        s4: 'हवन के पास जल की बाल्टी और रेत रखें। जलती अग्नि को कभी अकेला न छोड़ें। अग्नि में प्लास्टिक, छपा कागज़ या कृत्रिम फूल न डालें। फूल और राख का ज़िम्मेदारी से निपटान करें; विसर्जन में प्लास्टिक जल में न डालें।',
        s4Note: 'यदि घर या इमारत में अग्नि की अनुमति नहीं है, तो पंडित से सुरक्षित विकल्प पूछें।',
        disclaimerTitle: 'पूरी अस्वीकृति।',
        disclaimer: 'यह गाइड व्यक्तिगत तैयारी और शिक्षा के लिए है। यह पंडित, कुलगुरु या आपके संप्रदाय का विकल्प नहीं। मंत्र परंपरागत हैं; अंग्रेज़ी अर्थ कार्यशील अनुवाद हैं। मॉड्यूल की पैनल पंडित द्वारा अंतिम समीक्षा बाकी है। क्षेत्रीय और पारिवारिक परंपराएँ भिन्न हैं, और पंडित का मार्गदर्शन अंतिम है। किसी भी चरण में संदेह हो तो रुकें और योग्य पंडित से पूछें।',
        ctaKicker: 'क्या इसे पंडित द्वारा करवाना चाहेंगे?',
        ctaTitle: 'उसी विधि के लिए सत्यापित पंडित बुक करें',
        ctaText: 'बुकिंग टीम वरिष्ठ पंडित, सामग्री, हवन और विसर्जन की व्यवस्था कर सकती है; NRI परिवारों के लिए लाइव विकल्प भी उपलब्ध है।',
        book: 'सत्यनारायण कथा बुक करें',
        buy: 'सामग्री किट खरीदें'
      },
      cta: {
        kicker: 'शांत पूजा, सही प्रदर्शन नहीं',
        title: 'जो कर सकें, पूरे मन से अर्पित करें।',
        text: 'कोई चरण स्पष्ट न हो तो रुकें और पूछें। हमारी टीम आपको मार्गदर्शन या पूरी घर-पूजा के लिए पंडित से जोड़ सकती है।',
        whatsapp: 'WhatsApp पर पूछें',
        book: 'पंडित बुक करें',
        tiny: 'अनुष्ठान से 24 घंटे पहले तक मुफ़्त रद्दीकरण।'
      },
      misc: {
        close: 'बंद करें',
        plus: 'बढ़ाएँ',
        minus: 'घटाएँ'
      },
      names: {
        paksha: { Shukla: 'शुक्ल', Krishna: 'कृष्ण' },
        tithi: {
          Pratipada: 'प्रतिपदा', Dwitiya: 'द्वितीया', Tritiya: 'तृतीया', Chaturthi: 'चतुर्थी',
          Panchami: 'पंचमी', Shashthi: 'षष्ठी', Saptami: 'सप्तमी', Ashtami: 'अष्टमी',
          Navami: 'नवमी', Dashami: 'दशमी', Ekadashi: 'एकादशी', Dwadashi: 'द्वादशी',
          Trayodashi: 'त्रयोदशी', Chaturdashi: 'चतुर्दशी', Purnima: 'पूर्णिमा', Amavasya: 'अमावस्या'
        },
        nakshatra: {
          Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी',
          Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा', Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य',
          Ashlesha: 'आश्लेषा', Magha: 'मघा', 'Purva Phalguni': 'पूर्वा फाल्गुनी',
          'Uttara Phalguni': 'उत्तरा फाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा', Swati: 'स्वाति',
          Vishakha: 'विशाखा', Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा', Mula: 'मूल',
          'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा', Shravana: 'श्रवण',
          Dhanishtha: 'धनिष्ठा', Shatabhisha: 'शतभिषा', 'Purva Bhadrapada': 'पूर्वा भाद्रपद',
          'Uttara Bhadrapada': 'उत्तरा भाद्रपद', Revati: 'रेवती'
        },
        lord: {
          Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु',
          Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु'
        },
        weekday: {
          Sunday: 'रविवार', Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार',
          Thursday: 'गुरुवार', Friday: 'शुक्रवार', Saturday: 'शनिवार'
        }
      }
    }
  };

  /* --------------------------------------------------------- Hindi content */
  var HI = {
    steps: {
      sankalp: {
        title: 'वेदी तैयार करें और संकल्प लें',
        summary: 'संकल्प औपचारिक आरंभ है। स्वच्छ वेदी बनाएँ, पूर्व या उत्तर की ओर मुख करके बैठें और बताएँ कि व्रत कौन कर रहा है और क्यों।',
        actions: [
          'स्नान करें और स्वच्छ, ताज़े वस्त्र पहनें। स्वच्छ आसन पर पूर्व या उत्तर की ओर मुख करके बैठें।',
          'लकड़ी की चौकी पर लाल या पीला वस्त्र बिछाएँ। उस पर सत्यनारायण जी की प्रतिमा या चित्र, कलश और जलता हुआ दीपक रखें।',
          'सामग्री की थाली दाईं ओर, कथा पुस्तक बाईं ओर और आगे एक गिलास शुद्ध जल रखें।',
          'दीपक और धूप जलाएँ। एक मिनट शांत बैठकर आरंभ से पहले अपने कुलदेवता का स्मरण करें।'
        ],
        tip: 'यदि आप अपना गोत्र नहीं जानते, तो अनेक परिवारों में परंपरागत रूप से “कश्यप” का उपयोग होता है। संदेह हो तो परिवार के उस बड़े से पूछें जो पारिवारिक अनुष्ठान करवाते हैं।',
        link: 'अपना संकल्प पाठ बनाएँ',
        mantras: [
          {
            label: 'संकल्प — अपनी जानकारी भरें',
            meaning: 'ॐ तत्सत्। इस तिथि और दिन, [शहर] निवासी मैं [नाम], [गोत्र] गोत्र का, परिवार सहित, भगवान सत्यनारायण की प्रसन्नता और [मनोकामना] की पूर्ति के लिए सत्यनारायण व्रत और पूजन करता हूँ।',
            source: 'परंपरागत संकल्प सूत्र, जिसमें स्थान की जानकारी भरनी है। परिवार के पंडित संवत्, शक, चंद्रमास और तिथि जोड़ सकते हैं।',
            repeat: 'एक बार, हाथ जोड़कर।'
          }
        ]
      },
      ganesh: {
        title: 'गणेश वंदना',
        summary: 'विघ्नहर्ता गणेश जी का आवाहन करके आरंभ करें। दूर्वा या एक लाल फूल अर्पित करें और धीर, स्थिर स्वर में मंत्र जपें।',
        actions: [
          'वेदी पर कुछ दूर्वा की पत्तियाँ या एक लाल फूल अर्पित करें।',
          'गणेश मूल मंत्र 3, 11 या 21 बार जपें — जितनी संख्या आपका परिवार सामान्यतः रखता है।',
          'मंत्र के बाद थोड़ा जल और अक्षत अर्पित करें।',
          'पूजा में और परिवार की चुनी हुई मनोकामना में विघ्न दूर करने की प्रार्थना करें।'
        ],
        tip: 'गिनती सरल रखें। सच्चे मन से स्पष्ट कहे गए 11 जाप, जल्दबाज़ी में किए गए 108 से बेहतर हैं।',
        mantras: [
          {
            label: 'गणेश मूल मंत्र',
            meaning: 'ॐ, गणों के स्वामी गणेश को नमस्कार।',
            source: 'परंपरागत गणपति मूल मंत्र।',
            repeat: '3, 11 या 21 बार।'
          },
          {
            label: 'गणपति वंदना',
            meaning: 'हे मुड़ी हुई सूँड़ और विशाल देह वाले, करोड़ों सूर्यों समान तेजस्वी देव! मेरे सभी कार्यों से सदा विघ्न दूर करें।',
            source: 'परंपरागत गणपति वंदना, जो घरेलू अनुष्ठानों से पहले व्यापक रूप से पढ़ी जाती है।',
            repeat: 'एक या तीन बार।'
          }
        ]
      },
      kalash: {
        title: 'कलश एवं नवग्रह स्थापना',
        summary: 'कलश को पवित्र उपस्थिति का आसन मानकर स्थापित करें और नवग्रहों का स्मरण करें। कुछ परिवारों में यह चरण छोटा होता है; अपनी विधि का पालन करें।',
        actions: [
          'कलश को वेदी पर रखें। उसके मुँह पर आम के पत्ते रखें और ऊपर लाल वस्त्र में लिपटा नारियल रखें।',
          'कलश में शुद्ध जल और थोड़ा गंगाजल भरें। कुछ अक्षत के दाने डालें।',
          'नवग्रहों के प्रतीक के रूप में कलश के पास नौ अनाज या नौ छोटे रंगीन वस्त्र रखें।',
          'कलश मंत्र पढ़ें, फिर नौ ग्रहों के लिए विष्णु मूल मंत्र नौ बार दोहराएँ।'
        ],
        tip: 'यदि नौ अनाज या रंगीन वस्त्र नहीं हैं, तो शुद्ध जल अर्पण और स्पष्ट भावना से मंत्र कहना पर्याप्त है। एक वस्तु के लिए पूजा न टालें।',
        mantras: [
          {
            label: 'कलश मंत्र',
            meaning: 'विष्णु कलश के मुख में, रुद्र कंठ में और वरुण देव मूल में स्थित हैं। यह पात्र हजारगुना ऐश्वर्य से भरा रहे।',
            source: 'परंपरागत कलश पूजा मंत्र।',
            repeat: 'जल और अक्षत अर्पित करते समय एक बार।'
          },
          {
            label: 'नवग्रह स्मरण',
            meaning: 'ॐ, भगवान वासुदेव को नमस्कार।',
            source: 'वैष्णव मूल मंत्र; यहाँ सरल नवग्रह स्मरण के रूप में। पूर्ण नवग्रह स्थापना संप्रदाय के अनुसार भिन्न होती है।',
            repeat: '9 बार।'
          }
        ]
      },
      avahana: {
        title: 'सत्यनारायण आवाहन एवं षोडशोपचार',
        summary: 'भगवान सत्यनारायण का स्वागत करें और सोलह उपचार अर्पित करें। यदि आपका परिवार छोटा पंचोपचार करता है, तो उसी परंपरा को निभाएँ।',
        actions: [
          'भगवान के चरणों में फूल अर्पित करें और पूजा स्वीकार करने का निमंत्रण दें।',
          'चरण और हाथ धोने के लिए जल, फिर अर्घ्य, आसन, स्वच्छ वस्त्र और अक्षत अर्पित करें।',
          'इत्र, फूल, धूप, दीपक, नैवेद्य (फल या पंजीरी) और तांबूल (थोड़ी मिठाई के साथ पान का पत्ता) अर्पित करें।',
          'सत्यनारायण मूल मंत्र 12 या 108 बार जपें। पर्याप्त फूल हों तो हर बार के बाद एक फूल अर्पित करें।',
          'भगवान के आगे केले का पत्ता या स्वच्छ थाली में प्रसाद रखें। अर्पण से पहले प्रसाद चखें नहीं।'
        ],
        tip: 'षोडशोपचार का अर्थ सोलह अर्पण हैं। क्रम और नाम क्षेत्र के अनुसार बदलते हैं; इस चरण का हृदय आदरपूर्वक अर्पण है, सटीक नृत्य-क्रम नहीं।',
        mantras: [
          {
            label: 'सत्यनारायण मूल मंत्र',
            meaning: 'ॐ, भगवान वासुदेव को नमस्कार — वे सर्वव्यापी भगवान हैं जो सत्यनारायण स्वरूप के स्रोत हैं।',
            source: 'विष्णु परंपरा का वैष्णव मूल मंत्र।',
            repeat: '12 या 108 बार।'
          },
          {
            label: 'आवाहन',
            meaning: 'ॐ, भगवान सत्यनारायण को नमस्कार।',
            source: 'सत्यनारायण पूजा में प्रयुक्त परंपरागत आवाहन।',
            repeat: 'फूल अर्पित करते समय एक बार।'
          }
        ]
      },
      katha: {
        title: 'व्रत कथा — पाँच अध्याय',
        summary: 'सत्यनारायण व्रत कथा के पाँचों अध्याय सुनें या पढ़ें। पूरा अनुष्ठान पाठ अधिकृत कथा पुस्तक से करें; यह गाइड समझने के लिए निष्ठापूर्ण पुनर्कथन देती है।',
        actions: [
          'अधिकृत सत्यनारायण कथा पुस्तक खोलें और पाँचों अध्याय क्रम से पढ़ें।',
          'दीपक जलता रखें और परिवार साथ बैठा रहे। बच्चे सुन सकते हैं या शांत बैठ सकते हैं।',
          'हर अध्याय के बाद कुछ अक्षत अर्पित करें और अगले से पहले थोड़ा विराम लें।',
          'यदि आप सुन रहे हैं, तो कथा टैब में दिए पाठ के साथ चलें।',
          'अंतिम अध्याय न छोड़ें। पाँचवाँ अध्याय व्रत और कथा को पूरा करता है।'
        ],
        tip: 'अनुष्ठान का पाठ मुद्रित या प्रकाशित कथा से होना चाहिए, सारांश से नहीं। पाठक का उपयोग कथा समझने और साथ चलने के लिए करें।',
        link: 'पाँच अध्याय का पाठ खोलें'
      },
      aarti: {
        title: 'आरती',
        summary: 'कपूर जलाएँ और परिवार के साथ आरती गाएँ। आरती पूजा का भावनात्मक हृदय है — इसे जल्दबाजी में न करें।',
        actions: [
          'स्वच्छ थाली में कपूर जलाएँ या छोटी आरती दीप लें। बाल और ढीले वस्त्र अग्नि से दूर रखें।',
          'घंटी हो तो बजाएँ, फिर साथ में आरती गाएँ।',
          'अंत में फूल अर्पित करें और हाथ जोड़कर प्रणाम करें।',
          'यदि आपके परिवार की अलग सत्यनारायण आरती है, तो वही गाएँ; यह गाइड व्यापक रूप से प्रचलित विष्णु आरती का उपयोग करती है।'
        ],
        tip: 'रिकॉर्डेड आरती आवश्यक नहीं। आपका अपना स्वर, चाहे साधारण हो, परंपरागत अर्पण है।',
        mantras: [
          {
            label: 'वैष्णव आरती — प्रथम पद',
            meaning: 'जगत के स्वामी की जय। वे भक्तों के संकट क्षण भर में दूर करते हैं।',
            source: 'परंपरागत विष्णु आरती। अनेक परिवार अपनी कथा पुस्तक से सत्यनारायण-विशेष आरती गाते हैं।',
            repeat: 'दो या तीन बार, या जैसे आपका परिवार गाता है।'
          }
        ]
      },
      havan: {
        title: 'हवन एवं पूर्णाहुति',
        summary: 'हवन मंत्र के साथ पवित्र अग्नि में घी अर्पित करें। 11, 21 या 108 आहुतियाँ गिनें, फिर पूर्णाहुति करें।',
        actions: [
          'ऊष्मा-सहनशील सतह पर टेबल हवन कुंड या स्वच्छ धातु की थाली रखें। पास में जल और रेत की बाल्टी रखें।',
          'छोटी लकड़ी या कपास की बाती से अग्नि जलाएँ। अग्नि में प्लास्टिक, छपा कागज़ या कृत्रिम धूप न डालें।',
          'लकड़ी या धातु के चम्मच से घी अर्पित करें और हवन मंत्र जपें। चाहें तो हवन टैब में हर आहुति गिनें।',
          'चुनी हुई संख्या पूरी होने पर पूर्णाहुति मंत्र के साथ पूर्णाहुति करें और पारिवारिक परंपरा के अनुसार अंतिम नारियल या घी अर्पित करें।',
          'अंतिम अर्पण के बाद एक मिनट शांत बैठें। अग्नि को बिना देखभाल के न छोड़ें।'
        ],
        tip: 'बच्चों और पालतू जानवरों को अग्नि से दूर रखें। यदि अपार्टमेंट में स्मोक अलार्म है, तो छोटा टेबल हवन करें और खिड़की खुली रखें।',
        link: 'आहुति काउंटर खोलें',
        mantras: [
          {
            label: 'हवन मंत्र (एक आहुति)',
            meaning: 'ॐ, भगवान वासुदेव को नमस्कार — यह अर्पण पवित्र अग्नि में किया जाता है।',
            source: 'वैष्णव हवन परंपरा। आहुतियों की संख्या और पूरा क्रम परिवार तथा क्षेत्र के अनुसार बदलता है।',
            repeat: '11, 21 या 108 बार।'
          }
        ]
      },
      prasad: {
        title: 'प्रसाद, क्षमा एवं विसर्जन',
        summary: 'अंतिम प्रसाद अर्पित करें, किसी भी भूल के लिए क्षमा माँगें और कृतज्ञता के साथ पूजा समाप्त करें। उपस्थित सभी लोगों के साथ प्रसाद बाँटें।',
        actions: [
          'प्रसाद का एक भाग भगवान को अर्पित करें, फिर परिवार और आए हुए अतिथियों में बाँटें।',
          'मंत्र, विधि या अर्पण में किसी भी चूक के लिए क्षमा प्रार्थना करें।',
          'अंतिम दीपक अर्पित करें और हाथ जोड़कर प्रणाम करें।',
          'फूल और जैव-अपघटनीय सामग्री को आदरपूर्वक विसर्जन के लिए एकत्र करें। जल में प्लास्टिक या रैपर न डालें।',
          'जिन्होंने सहयोग किया उनका आभार कहें और अगली बार पहले से क्या तैयार रखना है, यह लिख लें।'
        ],
        tip: 'पूजा तब पूरी है जब परिवार ने प्रसाद और कृतज्ञता बाँट ली — तब नहीं जब सूची की हर वस्तु सही हो।',
        mantras: [
          {
            label: 'क्षमा प्रार्थना',
            meaning: 'जो अक्षर, शब्द या छंद छूट गया या गलत उच्चारित हुआ, हे भगवान नारायण, वह सब क्षमा करें। आपको नमस्कार।',
            source: 'पूजा के समापन पर पढ़ी जाने वाली परंपरागत क्षमा प्रार्थना।',
            repeat: 'एक बार, हाथ जोड़कर।'
          }
        ]
      }
    },
    katha: {
      'adhyay-1': {
        title: 'प्रथम अध्याय — व्रत का वर्णन',
        summary: [
          'सत्यनारायण व्रत कथा नैमिषारण्य में एकत्र ऋषियों से आरंभ होती है। सूत जी बताते हैं कि नारद ने एक बार भगवान विष्णु से पूछा कि कलियुग में रहने वाले लोग दरिद्रता, रोग और दुःख से मुक्ति कैसे पाएँ।',
          'विष्णु जी ने सत्यनारायण व्रत का वर्णन किया: एक दिन उपवास, परिवार सहित भगवान सत्यनारायण की पूजा, कथा श्रवण और दूसरों के साथ प्रसाद बाँटना। नारद जी यह उपदेश पृथ्वी पर ले आए।',
          'सबसे पहले एक निर्धन ब्राह्मण परिवार ने इसे अपनाया। उनके पास बहुत कम था, पर उन्होंने श्रद्धा से व्रत किया, जो हो सका अर्पित किया और साथ बैठकर कथा सुनी। भगवान की कृपा से उनका कष्ट कम हुआ और वे संतोष से रहने लगे।'
        ],
        teaching: 'व्रत लेन-देन नहीं, स्मरण, कृतज्ञता और बाँटना है — अर्पण छोटा भी हो तो।',
        source: 'प्रथम अध्याय का पुनर्कथन। प्रकाशित कथा संस्करणों में विवरण भिन्न होते हैं।'
      },
      'adhyay-2': {
        title: 'द्वितीय अध्याय — लकड़हारे की श्रद्धा',
        summary: [
          'एक निर्धन लकड़हारा जंगल से गुज़र रहा था जब उसने एक परिवार को सत्यनारायण पूजा करते देखा। वह रुका, प्रणाम किया और पूछा कि वे क्या कर रहे हैं।',
          'उन्होंने व्रत समझाया और उसे शामिल होने का निमंत्रण दिया। उसके पास अपनी उपस्थिति और सच्ची श्रद्धा के अलावा कुछ नहीं था। वह उनके साथ बैठा, कथा सुनी और जो थोड़ा भोजन था, बाँटा।',
          'बाद में लकड़ी काटते समय उसे छिपा हुआ खजाना मिला। उसने इसे चतुराई का पुरस्कार नहीं, कृपा समझा। तब से वह नियमित रूप से व्रत करने लगा और अपना सौभाग्य दूसरों के साथ बाँटता रहा।'
        ],
        teaching: 'महँगी सामग्री से अधिक सच्चाई का महत्व है। पूरे मन से किया गया सबसे छोटा अर्पण भी स्वीकार होता है।',
        source: 'द्वितीय अध्याय का पुनर्कथन। प्रकाशित कथा संस्करणों में विवरण भिन्न होते हैं।'
      },
      'adhyay-3': {
        title: 'तृतीय अध्याय — व्यापारी की पुत्री',
        summary: [
          'एक धनी व्यापारी और उसका परिवार व्रत करता था। पूजा के दौरान उसकी पुत्री प्रसाद बाँट रही थी। भगवान को अर्पित करने से पहले उसने स्वयं थोड़ा प्रसाद खा लिया।',
          'कुछ समय बाद व्यापारी के माल से भरी नाव तूफ़ान में फँसकर डूब गई। परिवार ने अपना व्रत याद किया, विनम्रता से पूजा पूरी की और पुत्री ने क्षमा प्रार्थना की।',
          'कृपा से खोया माल मिल गया और परिवार फिर मिला। यह कथा याद दिलाती है कि प्रसाद पहले अर्पित होता है, फिर ग्रहण — और छोटी बातों में भी आदर आवश्यक है।'
        ],
        teaching: 'छोटी बातों में लापरवाही घर को अशांत कर सकती है। आदर और कृतज्ञता उसे फिर स्थिर करते हैं।',
        source: 'तृतीय अध्याय का पुनर्कथन। प्रकाशित कथा संस्करणों में विवरण भिन्न होते हैं।'
      },
      'adhyay-4': {
        title: 'चतुर्थ अध्याय — पुत्र, राजा और व्रत',
        summary: [
          'व्यापारी का पुत्र व्यापार के लिए दूसरे राज्य गया। परिस्थितियों से वह राजा द्वारा बंदी बना लिया गया और घर नहीं लौट सका।',
          'घर पर उसकी पत्नी ने सत्यनारायण व्रत किया और उसकी सुरक्षा के लिए प्रार्थना की। भगवान ने राजा के स्वप्न में दर्शन देकर कहा कि बंदी निर्दोष भक्त है।',
          'राजा ने उसे मुक्त किया और सम्मान दिया। पुत्र घर लौटा और परिवार कृतज्ञता के साथ व्रत करता रहा। यह अध्याय बताता है कि व्रत संकट में भी निभाया जाता है, केवल समृद्धि में नहीं।'
        ],
        teaching: 'परिवार के सदस्य एक-दूसरे के लिए प्रार्थना और कर्म कर सकते हैं। विश्वास की सबसे बड़ी परीक्षा अनिश्चित समय में होती है।',
        source: 'चतुर्थ अध्याय का पुनर्कथन। प्रकाशित कथा संस्करणों में विवरण भिन्न होते हैं।'
      },
      'adhyay-5': {
        title: 'पंचम अध्याय — समृद्धि में स्मरण',
        summary: [
          'व्यापारी समृद्ध हुआ और धीरे-धीरे व्रत भूल गया। उसने पूजा कराना बंद कर दिया और व्यापार तथा धन में डूब गया।',
          'हानि हुई और परिवार ने अपना वचन याद किया। उन्होंने फिर पूर्ण श्रद्धा से व्रत किया, दूसरों को कथा सुनने बुलाया और उदारता से प्रसाद बाँटा।',
          'भगवान प्रसन्न हुए, खोई समृद्धि लौटाई और व्यापारी को अपनी कृपा का दर्शन दिया। कथा कहती है कि जो श्रद्धा से इसे सुनता या पढ़ता है, उसे भगवान का आशीर्वाद मिलता है।'
        ],
        teaching: 'समृद्धि भूलने का कारण नहीं है। कृतज्ञता उसे जीवित रखती है, और व्रत जीवनभर का स्मरण है।',
        source: 'पंचम अध्याय का पुनर्कथन। प्रकाशित कथा संस्करणों में विवरण भिन्न होते हैं।'
      }
    },
    samagriGroups: {
      altar: 'मंडप एवं वेदी',
      puja: 'पूजा सामग्री',
      'katha-havan': 'कथा एवं हवन',
      prasad: 'प्रसाद एवं नैवेद्य',
      cleanup: 'सफाई एवं विसर्जन'
    },
    havan: {
      label: 'हवन मंत्र — एक आहुति',
      meaning: 'ॐ, भगवान वासुदेव को नमस्कार — यह अर्पण पवित्र अग्नि में किया जाता है।',
      source: 'वैष्णव हवन परंपरा। पूरा हवन क्रम परिवार और क्षेत्र के अनुसार बदलता है।',
      repeat: 'प्रति आहुति एक बार।',
      purnahutiMeaning: 'वह पूर्ण है, यह पूर्ण है। पूर्ण से पूर्ण प्रकट होता है। पूर्ण में से पूर्ण लेने पर भी पूर्ण ही शेष रहता है। ॐ, शांति, शांति, शांति।',
      purnahutiSource: 'ईशावास्य उपनिषद, शांति पाठ।',
      purnahutiRepeat: 'हवन के समापन पर एक बार।',
      note: 'अग्नि के पास जल की बाल्टी और रेत की बाल्टी रखें। हवन को कभी अकेला न छोड़ें। यदि आपकी इमारत में अग्नि की अनुमति नहीं है, तो पंडित से अग्निरहित सुरक्षित विकल्प पूछें; स्मोक डिटेक्टर के पास स्वयं प्रयोग न करें।'
    },
    muhurat: {
      note: 'तिथियाँ आपके चुने शहर के सूर्योदय और लाहिरी अयनांश से गणना की जाती हैं। तिथि के समय और स्थानीय पालन के कारण प्रकाशित पंचांग एक दिन भिन्न हो सकते हैं। पूजा का अंतिम समय अपने पारिवारिक पंडित से पुष्टि करें।'
    },
    purposes: {
      'कुटुंब क्षेम एवं सुख': 'परिवार का कल्याण और शांति',
      'आरोग्य एवं निरोगता': 'स्वास्थ्य और रोगमुक्ति',
      'व्यापार एवं समृद्धि': 'व्यापार और समृद्धि',
      'संतान एवं कुटुंब वृद्धि': 'संतान और परिवार की वृद्धि',
      'विवाह एवं शुभ मंगल': 'विवाह और शुभ आरंभ',
      'नवीन गृह प्रवेश': 'नया घर / गृह प्रवेश',
      'विद्या एवं उन्नति': 'शिक्षा और उन्नति',
      'मनोकामना पूर्ति': 'व्यक्तिगत मनोकामना'
    },
    plans: {
      'katha-basic': {
        name: 'ऑनलाइन कथा — बेसिक',
        duration: '1.5–2 घंटे',
        mode: 'ऑनलाइन',
        summary: 'आपके परिवार के नाम पर संकल्प के साथ छोटी ऑनलाइन कथा।',
        includes: ['आपके नाम और गोत्र में संकल्प', 'सत्यनारायण कथा पाठ', 'आरती और समापन प्रसाद']
      },
      'katha-standard': {
        name: 'ऑनलाइन कथा — स्टैंडर्ड',
        duration: '2 घंटे',
        mode: 'लाइव वीडियो',
        summary: 'पूरी कथा और आरती के साथ लाइव वीडियो पूजा, ताकि परिवार कहीं से भी जुड़ सके।',
        includes: ['लाइव वीडियो पूजा', 'सत्यनारायण कथा', 'आरती और प्रसाद मार्गदर्शन', 'अनुरोध पर रिकॉर्डिंग']
      },
      'ghar-puja': {
        name: 'घर पर सत्यनारायण पूजा',
        duration: '2–3 घंटे',
        mode: 'घर पर',
        summary: 'घर पर पंडित जी के साथ पूरी घरेलू विधि।',
        includes: ['पंडित जी आपके घर पर', 'पूरी सत्यनारायण विधि', 'कथा, आरती और प्रसाद', 'दिन से पहले सामग्री मार्गदर्शन']
      },
      'grand-havan': {
        name: 'ग्रैंड पूजा एवं हवन',
        duration: '3–4 घंटे',
        mode: 'घर पर',
        summary: 'बड़े पारिवारिक आयोजन के लिए दो पंडित, पूरा हवन और पूर्णाहुति।',
        includes: ['2 पंडित', 'सत्यनारायण पूजा और कथा', 'पूर्णाहुति सहित हवन', 'प्रसाद वितरण']
      },
      'anushthan-3': {
        name: 'तीन दिन अनुष्ठान',
        duration: '3 दिन',
        mode: 'घर पर',
        summary: 'तीन दिन की दैनिक पूजा, जाप और हवन, अंत में पूर्णाहुति।',
        includes: ['3 दिन दैनिक पूजा', 'जाप और हवन', 'अंतिम दिन कथा', 'पूर्णाहुति और प्रसाद']
      },
      'maha-puja-5': {
        name: 'पाँच दिन महापूजा',
        duration: '5 दिन',
        mode: 'घर पर',
        summary: 'दैनिक जाप, कथा और पूर्ण हवन के साथ पाँच दिन की महापूजा।',
        includes: ['5 दिन दैनिक पूजा', 'जाप और कथा', 'पूर्ण हवन', 'हर दिन पारिवारिक संकल्प']
      },
      'maha-anushthan-7': {
        name: 'सात दिन महाअनुष्ठान',
        duration: '7 दिन',
        mode: 'घर पर',
        summary: 'दैनिक पूजा, जाप, कथा और अंतिम दिन पूर्ण हवन के साथ पूरा सप्ताह।',
        includes: ['7 दिन सप्ताह पूजा', 'दैनिक जाप और कथा', 'पूर्ण हवन और पूर्णाहुति', 'वरिष्ठ पंडित समन्वय']
      }
    },
    planNote: 'मूल्य केवल आरंभिक हैं और दिखाई गई राशि से शुरू होते हैं। सामग्री, गुरुग्राम/NCR के बाहर यात्रा और पंडित की दक्षिणा बुकिंग से पहले WhatsApp पर लिखित रूप में पुष्टि की जाती है। तिथि की पुष्टि 30% अग्रिम से होती है; शेष पूजा के बाद दिया जाता है। यह वेबसाइट कोई ऑनलाइन भुगतान नहीं लेती।'
  };

  /* Static page text that is not part of a repeatable UI component. Keys are
     the exact English text nodes in puja-guide.html. */
  var STATIC = {
    'Satyanarayan Puja, ': 'सत्यनारायण पूजा, ',
    'step by step.': 'चरण दर चरण।',
    ' complete': ' पूरा',
    'Calculating the next dates…': 'अगली तिथियाँ गणना हो रही हैं…',
    'Calculating upcoming dates…': 'आगामी तिथियाँ गणना हो रही हैं…',
    'Use “Save as PDF” in the print dialog. The printed sheet is formatted for A4.': 'प्रिंट डायलॉग में “Save as PDF” चुनें। मुद्रित पत्र A4 के लिए तैयार है।',
    'Seven seva plans': 'सात सेवा योजनाएँ',
    'From a short online katha to a seven-day anushthan, every plan includes the sankalp in your family name. Prices are a starting point; samagri, travel and dakshina are confirmed in writing before booking.': 'छोटी ऑनलाइन कथा से सात दिन के अनुष्ठान तक, हर योजना में आपके परिवार के नाम का संकल्प शामिल है। मूल्य केवल आरंभिक हैं; सामग्री, यात्रा और दक्षिणा बुकिंग से पहले लिखित रूप में पुष्टि की जाती है।',
    'Booking on WhatsApp': 'WhatsApp पर बुकिंग',
    'Not sure which plan fits?': 'कौन-सी योजना ठीक है?',
    'Ask before you book': 'बुक करने से पहले पूछें',
    'Tell Rajiv the date, the city and how many family members will join. He will confirm the right plan, the samagri and the final dakshina on WhatsApp.': 'राजीव को तिथि, शहर और परिवार के सदस्यों की संख्या बताएँ। वे WhatsApp पर सही योजना, सामग्री और अंतिम दक्षिणा की पुष्टि करेंगे।',
    'Ask on WhatsApp': 'WhatsApp पर पूछें',
    'Call': 'कॉल करें',
    'Email': 'ईमेल',
    'Loading plans…': 'योजनाएँ लोड हो रही हैं…',
    'Seva & dakshina': 'सेवा और दक्षिणा',
    'Offer seva, directly': 'सीधे सेवा अर्पित करें',
    'The puja guide is free and stays free. If you would like to offer dakshina or support the seva, use only the owner details below. Nothing is collected by this website.': 'पूजा गाइड मुफ़्त है और मुफ़्त रहेगी। यदि आप दक्षिणा या सेवा सहयोग देना चाहें, तो केवल नीचे दी गई मालिक की जानकारी का उपयोग करें। यह वेबसाइट कुछ भी नहीं वसूलती।',
    'Direct UPI · no gateway': 'सीधा UPI · कोई गेटवे नहीं',
    'Seva accepted by': 'सेवा स्वीकार करने वाले',
    'Satyanarayan puja guide · ': 'सत्यनारायण पूजा गाइड · ',
    'UPI ID': 'UPI आईडी',
    'Copy UPI ID': 'UPI आईडी कॉपी करें',
    'Open UPI app': 'UPI ऐप खोलें',
    'Scan to pay': 'भुगतान के लिए स्कैन करें',
    'Scan with any UPI app, check the name, then pay any amount you wish.': 'किसी भी UPI ऐप से स्कैन करें, नाम जाँचें, फिर जो राशि चाहें भुगतान करें।',
    'Stay safe.': 'सुरक्षित रहें।',
    'The only UPI ID for this puja site is ': 'इस पूजा साइट की केवल एक UPI आईडी है ',
    ' and the only number is ': ' और केवल एक नंबर है ',
    ', both in the name of ': ', दोनों का नाम है ',
    '. Never pay anyone who claims to represent this site but uses a different name, UPI ID or number. When in doubt, call and confirm first.': '। जो इस साइट का प्रतिनिधि होने का दावा करे पर अलग नाम, UPI आईडी या नंबर दे, उसे कभी भुगतान न करें। संदेह हो तो पहले कॉल करके पुष्टि करें।',
    'Seva is voluntary and is not a payment for the puja guide. Your bank or UPI app will show the name ': 'सेवा स्वैच्छिक है और पूजा गाइड का भुगतान नहीं है। आपका बैंक या UPI ऐप नाम दिखाएगा ',
    ' before you confirm.': ' पुष्टि से पहले।',
    'Questions before you begin?': 'शुरू करने से पहले सवाल?',
    'Ask Rajiv, or offer seva': 'राजीव से पूछें या सेवा अर्पित करें',
    'For help with a step, samagri or the sankalp, message Rajiv Lochan Mishra directly. Seva details are on the next tab.': 'किसी चरण, सामग्री या संकल्प में सहायता के लिए सीधे राजीव लोचन मिश्रा को संदेश भेजें। सेवा की जानकारी अगले टैब में है।',
    'Seva & UPI': 'सेवा और UPI',
    'If a step is unclear, stop and ask. Message Rajiv directly for guidance, or open the Seva tab for dakshina details.': 'कोई चरण स्पष्ट न हो तो रुकें और पूछें। मार्गदर्शन के लिए सीधे राजीव को संदेश भेजें, या दक्षिणा की जानकारी के लिए सेवा टैब खोलें।',
    'Ask Rajiv on WhatsApp': 'WhatsApp पर राजीव से पूछें',
    'The guide is free. Seva is optional and goes directly to Rajiv Lochan Mishra.': 'गाइड मुफ़्त है। सेवा वैकल्पिक है और सीधे राजीव लोचन मिश्रा को जाती है।',
    'Plans': 'योजनाएँ',
    'Seva': 'सेवा',
    'Guided puja, your way': 'पूजा, आपके अपने तरीके से',
    'Call or WhatsApp': 'कॉल या WhatsApp करें',
    'WhatsApp': 'व्हाट्सएप',
    'Om Namo Bhagavate Vasudevaya Svaha.': 'ॐ नमो भगवते वासुदेवाय स्वाहा।',
    'Om Namo Bhagavate Vasudevaya Svaha': 'ॐ नमो भगवते वासुदेवाय स्वाहा',
    'Rajiv Lochan Mishra': 'राजीव लोचन मिश्रा',
    'Gurugram, Haryana': 'गुरुग्राम, हरियाणा',
    'Add dates to calendar': 'तिथियाँ कैलेंडर में जोड़ें'
  };

  var META = {
    en: {
      title: 'Satyanarayan Puja Guide — Step-by-Step Vidhi, Mantras, Katha & Havan | Vedic Pooja',
      description: 'A free bilingual Satyanarayan puja guide: 8-step vidhi, Devanagari mantras with transliteration and meaning, samagri checklist, 5-adhyay katha reader, havan ahuti counter, muhurat dates and printable sankalp.'
    },
    hi: {
      title: 'सत्यनारायण पूजा गाइड — विधि, मंत्र, कथा और हवन | वैदिक पूजा',
      description: 'मुफ़्त द्विभाषी सत्यनारायण पूजा गाइड: 8 चरणों की विधि, देवनागरी मंत्र, उच्चारण और अर्थ, सामग्री सूची, पाँच अध्याय की कथा, हवन आहुति काउंटर, मुहूर्त तिथियाँ और प्रिंट करने योग्य संकल्प।'
    }
  };

  function lookup(dict, key) {
    return String(key || '').split('.').reduce(function (obj, part) {
      return obj && Object.prototype.hasOwnProperty.call(obj, part) ? obj[part] : undefined;
    }, dict);
  }

  function t(lang, key, vars) {
    var value = lookup(UI[lang] || UI.en, key);
    if (value == null) value = lookup(UI.en, key);
    if (value == null) value = key;
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, function (match, name) {
      return vars && vars[name] != null ? vars[name] : match;
    });
  }

  root.PujaI18n = {
    ui: UI,
    hi: HI,
    meta: META,
    staticText: STATIC,
    t: t,
    has: function (key) { return lookup(UI.en, key) != null; }
  };
})(window);
