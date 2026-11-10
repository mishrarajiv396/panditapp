/* ==========================================================================
   Satyanarayan Puja Guide — content data
   Mantras are marked with a source note. The entire module is awaiting
   review by an empanelled pandit; regional and family traditions vary.
   ========================================================================== */
(function (root) {
  'use strict';

  var SOURCE = 'Traditional Satyanarayan Vrat Katha / puja vidhi. English meaning is a working translation.';

  var steps = [
    {
      id: 'sankalp',
      n: 1,
      title: 'Set the altar & take sankalp',
      hi: 'स्थापना एवं संकल्प',
      short: 'Sankalp',
      duration: 300,
      summary: 'The sankalp is the formal beginning. Set a clean altar, sit facing east or north, and state who is performing the vrata and why.',
      actions: [
        'Bathe and wear fresh, clean clothes. Sit on a clean mat facing east or north.',
        'Cover a wooden chowki with a red or yellow cloth. Place the Satyanarayan image or idol, a kalash and a lit diya on it.',
        'Keep the samagri tray on your right, the katha book on your left and a glass of clean water in front.',
        'Light the diya and incense. Sit quietly for a minute and remember your family deity before beginning.'
      ],
      mantras: [
        {
          label: 'Sankalp — fill your details',
          dev: 'ॐ तत्सत्।\nअद्य [तिथि] [वार], [नगर] निवासी अहं [नाम], [गोत्र] गोत्रः, सपरिवारः,\nश्री सत्यनारायण स्वामी प्रीत्यर्थं, [मनोकामना] सिद्ध्यर्थं,\nश्री सत्यनारायण व्रत-पूजनं करिष्ये।',
          translit: 'Om Tatsat. Adya [tithi] [vara], [nagar] nivasi aham [nama], [gotra] gotrah, saparivarah, Shri Satyanarayan Swami prityartham, [manokamna] siddhyartham, Shri Satyanarayan vrata-pujanam karishye.',
          meaning: 'Om Tatsat. On this date and day, I [name] of [gotra] gotra, residing in [city], together with my family, undertake the Satyanarayan vrata and puja for the pleasure of Lord Satyanarayan and for the fulfilment of [purpose].',
          source: 'Traditional sankalp formula adapted with placeholders. A family pandit may add the samvat, shaka, lunar month and tithi.',
          repeat: 'Once, with folded hands.'
        }
      ],
      tip: 'If you do not know your gotra, “Kashyap” is the traditional default used by many families. When in doubt, ask the elder who conducts your family rituals.',
      link: { tab: 'sankalp', label: 'Generate your sankalp text' }
    },
    {
      id: 'ganesh',
      n: 2,
      title: 'Ganesh Vandana',
      hi: 'गणेश वंदना',
      short: 'Ganesh',
      duration: 300,
      summary: 'Begin by invoking Ganesha, the remover of obstacles. Offer durva grass or a red flower and chant with a steady, unhurried voice.',
      actions: [
        'Offer a few blades of durva grass or one red flower at the altar.',
        'Chant the Ganesh mool mantra 3, 11 or 21 times — whichever count your family normally keeps.',
        'Offer a little water and akshata after the mantra.',
        'Ask for the removal of obstacles in the puja and in the family’s chosen intention.'
      ],
      mantras: [
        {
          label: 'Ganesh mool mantra',
          dev: 'ॐ गं गणपतये नमः।',
          translit: 'Om Gam Ganapataye Namah.',
          meaning: 'Om, salutations to the Lord of the ganas (Ganesha).',
          source: 'Traditional Ganapati mool mantra.',
          repeat: '3, 11 or 21 times.'
        },
        {
          label: 'Ganapati Vandana',
          dev: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
          translit: 'Vakratunda Mahakaya Suryakoti Samaprabha.\nNirvighnam Kuru Me Deva Sarva-Karyeshu Sarvada.',
          meaning: 'O curved-trunk, great-bodied one, radiant as millions of suns — remove every obstacle from all my endeavours, always.',
          source: 'Traditional Ganapati Vandana, widely recited before household rituals.',
          repeat: 'Once or three times.'
        }
      ],
      tip: 'Keep the count simple. A sincere 11 repetitions recited clearly is better than a rushed 108.'
    },
    {
      id: 'kalash',
      n: 3,
      title: 'Kalash & Navgrah Sthapana',
      hi: 'कलश एवं नवग्रह स्थापना',
      short: 'Kalash',
      duration: 420,
      summary: 'Install the kalash as the seat of the sacred presence and remember the nine grahas. This step is shorter in some families; follow your own vidhi if it differs.',
      actions: [
        'Place the kalash on the altar. Put mango leaves around its mouth and place a coconut wrapped in red cloth on top.',
        'Fill the kalash with clean water and a little gangajal. Drop in a few akshata grains.',
        'Place nine grains or nine small coloured cloths beside the kalash to represent the navgrahas.',
        'Chant the kalash mantra, then repeat the Vishnu mool mantra nine times for the nine grahas.'
      ],
      mantras: [
        {
          label: 'Kalash mantra',
          dev: 'ॐ कलशस्य मुखे विष्णुः कण्ठे रुद्रः समाश्रितः।\nमूले त्वं वरुणो देवः सहस्रं वसुधातलम्॥',
          translit: 'Om Kalashasya Mukhe Vishnuh Kanthe Rudrah Samashritah.\nMoole Tvam Varuno Devah Sahasram Vasudhatalam.',
          meaning: 'Vishnu resides at the mouth of the kalash, Rudra at its neck and Varuna at its base. May the vessel be filled with a thousandfold prosperity.',
          source: 'Traditional Kalash Puja mantra.',
          repeat: 'Once while offering water and akshata.'
        },
        {
          label: 'Navgrah remembrance',
          dev: 'ॐ नमो भगवते वासुदेवाय।',
          translit: 'Om Namo Bhagavate Vasudevaya.',
          meaning: 'Om, salutations to Lord Vasudeva.',
          source: 'Vaishnava mool mantra; used here as a simple navgrah remembrance. The full navgrah sthapana differs by sampradaya.',
          repeat: '9 times.'
        }
      ],
      tip: 'If you do not have nine grains or coloured cloths, a clean water offering and the mantra with a clear intention are enough. Do not postpone the puja for one missing item.'
    },
    {
      id: 'avahana',
      n: 4,
      title: 'Satyanarayan Avahana & Shodashopachar',
      hi: 'सत्यनारायण आवाहन एवं षोडशोपचार',
      short: 'Avahana',
      duration: 600,
      summary: 'Welcome Lord Satyanarayan and offer the sixteen upacharas. If your family follows a shorter panchopachar, keep that tradition.',
      actions: [
        'Offer flowers at the Lord’s feet and invite him to accept the puja.',
        'Offer water for washing feet and hands, then arghya, a seat, clean cloth and akshata.',
        'Offer scent, flowers, dhoop, a diya, naivedya (fruit or panjiri) and tambula (betel leaf with a little sweet).',
        'Chant the Satyanarayan mool mantra 12 or 108 times. Offer a flower after each round if you have enough.',
        'Place a banana leaf or a clean plate with prasad in front of the Lord. Do not taste the prasad before offering.'
      ],
      mantras: [
        {
          label: 'Satyanarayan mool mantra',
          dev: 'ॐ नमो भगवते वासुदेवाय।',
          translit: 'Om Namo Bhagavate Vasudevaya.',
          meaning: 'Om, salutations to Lord Vasudeva — the all-pervading Lord who is the source of the Satyanarayan form.',
          source: 'Vaishnava mool mantra from the Vishnu tradition.',
          repeat: '12 or 108 times.'
        },
        {
          label: 'Invocation',
          dev: 'ॐ सत्यनारायणाय नमः।',
          translit: 'Om Satyanarayanaya Namah.',
          meaning: 'Om, salutations to Lord Satyanarayan.',
          source: 'Traditional invocation used in Satyanarayan puja.',
          repeat: 'Once while offering flowers.'
        }
      ],
      tip: 'Shodashopachar means sixteen offerings. The order and names vary by region; the heart of the step is respectful offering, not perfect choreography.'
    },
    {
      id: 'katha',
      n: 5,
      title: 'Vrat Katha — five adhyay',
      hi: 'व्रत कथा — पाँच अध्याय',
      short: 'Katha',
      duration: 1800,
      summary: 'Listen to or read all five chapters of the Satyanarayan Vrat Katha. The complete ritual text should be read from an authorised katha book; this guide offers a faithful retelling for understanding.',
      actions: [
        'Open the authorised Satyanarayan katha book and read the five adhyay in order.',
        'Keep the diya burning and the family seated together. Children may listen or sit quietly.',
        'Offer a few akshata after each chapter and pause briefly before the next.',
        'If you are listening rather than reading, follow along with the reader in the Katha tab.',
        'Do not skip the final chapter. The fifth adhyay closes the vow and the story.'
      ],
      mantras: [],
      tip: 'The ritual reading should be from a printed or published katha, not from a summary. Use the reader to understand the story and to follow along.',
      link: { tab: 'katha', label: 'Open the 5-adhyay reader' }
    },
    {
      id: 'aarti',
      n: 6,
      title: 'Aarti',
      hi: 'आरती',
      short: 'Aarti',
      duration: 300,
      summary: 'Light camphor and sing the aarti with the family. The aarti is the emotional heart of the puja — keep it unhurried.',
      actions: [
        'Light camphor on a clean plate or hold a small aarti diya. Keep hair and loose clothing away from the flame.',
        'Ring the bell if you have one, then sing the aarti together.',
        'Offer flowers at the end and bow with folded hands.',
        'If your family has a separate Satyanarayan aarti, sing that instead; this guide uses a widely known Vishnu aarti.'
      ],
      mantras: [
        {
          label: 'Vaishnava aarti — opening verse',
          dev: 'ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।\nभक्त जनों के संकट, क्षण में दूर करे॥\nॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।',
          translit: 'Om Jai Jagdish Hare, Swami Jai Jagdish Hare.\nBhakt Janon Ke Sankat, Kshan Mein Door Kare.\nOm Jai Jagdish Hare, Swami Jai Jagdish Hare.',
          meaning: 'Victory to the Lord of the universe. He removes the difficulties of devotees in an instant.',
          source: 'Traditional Vishnu aarti. Families often sing a Satyanarayan-specific aarti from their katha book.',
          repeat: 'Two or three rounds, or as your family sings it.'
        }
      ],
      tip: 'A recorded aarti is not required. Your own voice, even if unpolished, is the traditional offering.'
    },
    {
      id: 'havan',
      n: 7,
      title: 'Havan & Purnahuti',
      hi: 'हवन एवं पूर्णाहुति',
      short: 'Havan',
      duration: 900,
      summary: 'Offer ghee into the sacred fire with the havan mantra. Count 11, 21 or 108 ahutis, then complete the purnahuti.',
      actions: [
        'Set a tabletop havan kund or a clean metal plate on a heat-safe surface. Keep water and a sand bucket nearby.',
        'Light the fire with small wood or cotton wicks. Do not use plastic, paper with ink, or synthetic incense in the fire.',
        'Offer ghee with a wooden or metal ladle while chanting the havan mantra. Count each ahuti in the Havan tab if you wish.',
        'After the chosen count, offer the purnahuti with the purnahuti mantra and a final coconut or ghee offering as per your family custom.',
        'Sit quietly for a minute after the final offering. Do not leave the fire unattended.'
      ],
      mantras: [
        {
          label: 'Havan mantra (one ahuti)',
          dev: 'ॐ नमो भगवते वासुदेवाय स्वाहा।',
          translit: 'Om Namo Bhagavate Vasudevaya Svaha.',
          meaning: 'Om, salutations to Lord Vasudeva — this offering is made into the sacred fire.',
          source: 'Vaishnava havan tradition. The number of ahutis and the full sequence vary by family and region.',
          repeat: '11, 21 or 108 times.'
        }
      ],
      tip: 'Keep children and pets away from the fire. If you live in an apartment with a smoke alarm, use a small tabletop havan and keep a window open.',
      link: { tab: 'havan', label: 'Open the ahuti counter' }
    },
    {
      id: 'prasad',
      n: 8,
      title: 'Prasad, Kshama & Visarjan',
      hi: 'प्रसाद, क्षमा एवं विसर्जन',
      short: 'Prasad',
      duration: 300,
      summary: 'Offer the final prasad, ask forgiveness for any mistake, and close the puja with gratitude. Share the prasad with everyone present.',
      actions: [
        'Offer a portion of the prasad to the Lord, then distribute it to the family and any guests.',
        'Recite the kshama prarthana for any omission in mantra, vidhi or offering.',
        'Offer a final diya and bow with folded hands.',
        'Collect flowers and biodegradable samagri for respectful visarjan. Do not put plastic or wrappers into water.',
        'Thank everyone who helped and note what you would like to prepare earlier next time.'
      ],
      mantras: [
        {
          label: 'Kshama prarthana',
          dev: 'ॐ यदक्षरपदभ्रष्टं मात्राहीनं च यद्भवेत्।\nतत्सर्वं क्षमस्व मे देव नारायण नमोऽस्तु ते॥',
          translit: 'Om Yad Akshara-Pada-Bhrashtam Matra-Hinam Cha Yad Bhavet.\nTat Sarvam Kshamasva Me Deva Narayana Namostu Te.',
          meaning: 'Whatever syllable, word or metre was omitted or wrongly pronounced, forgive all of it, O Lord Narayana. Salutations to you.',
          source: 'Traditional kshama prarthana recited at the close of puja.',
          repeat: 'Once, with folded hands.'
        }
      ],
      tip: 'The puja is complete when the family has shared prasad and gratitude — not when every item on a checklist is perfect.'
    }
  ];

  var samagri = [
    {
      id: 'altar',
      title: 'Mandap & altar',
      hi: 'मंडप एवं वेदी',
      items: [
        { id: 'chowki', name: 'Wooden chowki / low table', hi: 'चौकी', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: true },
        { id: 'cloth', name: 'Clean red or yellow cloth', hi: 'लाल/पीला वस्त्र', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: true },
        { id: 'idol', name: 'Satyanarayan idol or framed photo', hi: 'सत्यनारायण प्रतिमा/चित्र', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: true },
        { id: 'kalash', name: 'Brass or steel kalash', hi: 'कलश', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: true },
        { id: 'coconut', name: 'Coconut with red cloth', hi: 'नारियल एवं लाल वस्त्र', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: true },
        { id: 'mango', name: 'Mango leaves', hi: 'आम के पत्ते', qtyBase: 1, qtyPer: 0, unit: 'bunch', essential: false },
        { id: 'banana-leaf', name: 'Banana leaves for prasad', hi: 'केले के पत्ते', qtyBase: 2, qtyPer: 0.5, unit: 'leaf', essential: false },
        { id: 'mat', name: 'Clean sitting mat', hi: 'आसन', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: false }
      ]
    },
    {
      id: 'puja',
      title: 'Puja samagri',
      hi: 'पूजा सामग्री',
      items: [
        { id: 'gangajal', name: 'Gangajal or clean water', hi: 'गंगाजल/शुद्ध जल', qtyBase: 1, qtyPer: 0, unit: 'small bottle', essential: true },
        { id: 'panchamrit', name: 'Panchamrit — milk, curd, honey, ghee, sugar', hi: 'पंचामृत', qtyBase: 1, qtyPer: 0, unit: 'set', essential: true },
        { id: 'roli', name: 'Roli / kumkum', hi: 'रोली/कुमकुम', qtyBase: 1, qtyPer: 0, unit: 'small box', essential: true },
        { id: 'haldi', name: 'Haldi', hi: 'हल्दी', qtyBase: 1, qtyPer: 0, unit: 'small bowl', essential: false },
        { id: 'chandan', name: 'Chandan', hi: 'चंदन', qtyBase: 1, qtyPer: 0, unit: 'small piece', essential: false },
        { id: 'akshata', name: 'Akshata (unbroken rice with kumkum)', hi: 'अक्षत', qtyBase: 1, qtyPer: 0, unit: 'bowl', essential: true },
        { id: 'kalava', name: 'Kalava / mauli', hi: 'कलावा', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: false },
        { id: 'tulsi', name: 'Tulsi leaves', hi: 'तुलसी पत्र', qtyBase: 1, qtyPer: 0, unit: 'handful', essential: false },
        { id: 'flowers', name: 'Fresh flowers', hi: 'ताजे फूल', qtyBase: 1, qtyPer: 0.25, unit: 'bunch', essential: true },
        { id: 'durva', name: 'Durva grass for Ganesh', hi: 'दूर्वा', qtyBase: 1, qtyPer: 0, unit: 'bundle', essential: false },
        { id: 'dhoop', name: 'Dhoop / agarbatti', hi: 'धूप/अगरबत्ती', qtyBase: 1, qtyPer: 0, unit: 'pack', essential: true },
        { id: 'camphor', name: 'Camphor', hi: 'कपूर', qtyBase: 1, qtyPer: 0, unit: 'small box', essential: true },
        { id: 'diya', name: 'Diya and cotton wicks', hi: 'दीपक एवं बाती', qtyBase: 2, qtyPer: 1, unit: 'diya', essential: true },
        { id: 'lamp-ghee', name: 'Ghee for the lamp', hi: 'दीपक का घी', qtyBase: 1, qtyPer: 0, unit: 'small bowl', essential: true },
        { id: 'matchbox', name: 'Matchbox', hi: 'माचिस', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: true },
        { id: 'itra', name: 'Itra / natural perfume', hi: 'इत्र', qtyBase: 1, qtyPer: 0, unit: 'bottle', essential: false }
      ]
    },
    {
      id: 'katha-havan',
      title: 'Katha & havan',
      hi: 'कथा एवं हवन',
      items: [
        { id: 'katha-book', name: 'Authorised Satyanarayan katha book', hi: 'सत्यनारायण कथा पुस्तक', qtyBase: 1, qtyPer: 0, unit: 'copy', essential: true },
        { id: 'havan-kund', name: 'Tabletop havan kund or metal plate', hi: 'हवन कुंड/थाली', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: true },
        { id: 'havan-samagri', name: 'Havan samagri', hi: 'हवन सामग्री', qtyBase: 1, qtyPer: 0, unit: 'packet', essential: true },
        { id: 'havan-ghee', name: 'Cow ghee for havan', hi: 'हवन का घी', qtyBase: 250, qtyPer: 50, unit: 'g', essential: true },
        { id: 'wood', name: 'Small wood or cotton wicks for the fire', hi: 'हवन की लकड़ी/बाती', qtyBase: 1, qtyPer: 0, unit: 'set', essential: false },
        { id: 'ladle', name: 'Havan ladle / spoon', hi: 'हवन चम्मच', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: false },
        { id: 'bowls', name: 'Small bowls for ghee and water', hi: 'घी/जल के कटोरे', qtyBase: 2, qtyPer: 0, unit: 'piece', essential: false },
        { id: 'purnahuti', name: 'Coconut for purnahuti', hi: 'पूर्णाहुति का नारियल', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: false }
      ]
    },
    {
      id: 'prasad',
      title: 'Prasad & offerings',
      hi: 'प्रसाद एवं नैवेद्य',
      items: [
        { id: 'panjiri', name: 'Panjiri, sooji halwa or seasonal sweet', hi: 'पंजीरी/हलवा', qtyBase: 500, qtyPer: 100, unit: 'g', essential: true },
        { id: 'sugar', name: 'Sugar or mishri', hi: 'चीनी/मिश्री', qtyBase: 1, qtyPer: 0, unit: 'bowl', essential: false },
        { id: 'banana', name: 'Bananas', hi: 'केले', qtyBase: 2, qtyPer: 1, unit: 'piece', essential: true },
        { id: 'fruit', name: 'Seasonal fruit', hi: 'मौसमी फल', qtyBase: 1, qtyPer: 0, unit: 'bowl', essential: false },
        { id: 'milk', name: 'Milk for panchamrit / offering', hi: 'दूध', qtyBase: 500, qtyPer: 0, unit: 'ml', essential: true },
        { id: 'tulsi-offer', name: 'Tulsi leaves for offering', hi: 'तुलसी पत्र', qtyBase: 1, qtyPer: 0, unit: 'handful', essential: false }
      ]
    },
    {
      id: 'cleanup',
      title: 'Cleanup & visarjan',
      hi: 'सफाई एवं विसर्जन',
      items: [
        { id: 'waste-bag', name: 'Biodegradable waste bag', hi: 'बायोडिग्रेडेबल कचरा थैली', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: false },
        { id: 'old-cloth', name: 'Old cloth or newspaper for spills', hi: 'पुराना कपड़ा/अखबार', qtyBase: 1, qtyPer: 0, unit: 'piece', essential: false },
        { id: 'visarjan-water', name: 'Bucket of clean water for visarjan', hi: 'विसर्जन के लिए जल', qtyBase: 1, qtyPer: 0, unit: 'bucket', essential: false }
      ]
    }
  ];

  var katha = [
    {
      id: 'adhyay-1',
      n: 1,
      title: 'The vow is revealed',
      hi: 'प्रथम अध्याय — व्रत का वर्णन',
      summary: [
        'The Satyanarayan Vrat Katha begins with the sages gathered at Naimisharanya. Suta narrates that Narada once asked Lord Vishnu how people living in Kali Yuga could find relief from poverty, illness and sorrow.',
        'Vishnu described the Satyanarayan vrata: a day of fasting, worship of Lord Satyanarayan with the family, listening to the katha, and sharing prasad with others. Narada then brought this teaching to earth.',
        'The first household to receive it was a poor Brahmin family. They had very little, but they observed the vrata with faith, offered what they could, and listened to the story together. By the Lord’s grace their hardship eased and they lived with contentment.'
      ],
      teaching: 'The vow is not a transaction. It is remembrance, gratitude and sharing — even when the offering is small.',
      source: 'Retelling of adhyay 1. Details vary between published katha editions.'
    },
    {
      id: 'adhyay-2',
      n: 2,
      title: 'The woodcutter’s faith',
      hi: 'द्वितीय अध्याय — लकड़हारे की श्रद्धा',
      summary: [
        'A poor woodcutter was passing through the forest when he saw a family performing the Satyanarayan puja. He stopped, bowed and asked what they were doing.',
        'They explained the vrata and invited him to join. He had nothing to offer except his presence and his sincere devotion. He sat with them, listened to the katha and shared whatever little food he had.',
        'Later, while cutting wood, he found a hidden treasure. He understood it as grace rather than a reward for cleverness. From then on he observed the vrata regularly and shared his good fortune with others.'
      ],
      teaching: 'Sincerity matters more than expensive samagri. The smallest offering made with a full heart is accepted.',
      source: 'Retelling of adhyay 2. Details vary between published katha editions.'
    },
    {
      id: 'adhyay-3',
      n: 3,
      title: 'The merchant’s daughter',
      hi: 'तृतीय अध्याय — व्यापारी की पुत्री',
      summary: [
        'A wealthy merchant and his family observed the vrata. During the puja, his daughter was serving prasad. Without first offering it to the Lord, she ate a small portion herself.',
        'Soon afterwards, a boat carrying the merchant’s goods was caught in a storm and sank. The family remembered their vow, completed the puja with humility, and the daughter prayed for forgiveness.',
        'By grace, the lost goods were recovered and the family was reunited. The story is told as a reminder that prasad is first offered, then received — and that respect in small things matters.'
      ],
      teaching: 'Carelessness in little things can disturb the home. Reverence and gratitude restore it.',
      source: 'Retelling of adhyay 3. Details vary between published katha editions.'
    },
    {
      id: 'adhyay-4',
      n: 4,
      title: 'The son, the king and the vow',
      hi: 'चतुर्थ अध्याय — पुत्र, राजा और व्रत',
      summary: [
        'The merchant’s son travelled to another kingdom for trade. Through a turn of events, he was imprisoned by the king and could not return home.',
        'At home, his wife observed the Satyanarayan vrata and prayed for his safety. The Lord appeared to the king in a dream and told him that the prisoner was a devotee who had been wrongly held.',
        'The king released him and honoured him. The son returned home, and the family continued the vrata with gratitude. The chapter shows that the vow is kept in difficulty, not only in prosperity.'
      ],
      teaching: 'Family members can pray and act on behalf of one another. Faith is tested most when life is uncertain.',
      source: 'Retelling of adhyay 4. Details vary between published katha editions.'
    },
    {
      id: 'adhyay-5',
      n: 5,
      title: 'Remembering in prosperity',
      hi: 'पंचम अध्याय — समृद्धि में स्मरण',
      summary: [
        'The merchant prospered and slowly forgot the vrata. He stopped arranging the puja and became absorbed in business and wealth.',
        'Losses followed, and the family remembered their promise. They observed the vrata again with full devotion, invited others to listen, and shared prasad generously.',
        'The Lord, pleased, restored their fortune and gave the merchant a vision of his grace. The katha ends by saying that whoever listens to or reads this story with faith receives the Lord’s blessings.'
      ],
      teaching: 'Prosperity is not a reason to forget. Gratitude keeps it alive, and the vrata is a lifelong remembrance.',
      source: 'Retelling of adhyay 5. Details vary between published katha editions.'
    }
  ];

  var havan = {
    targetOptions: [11, 21, 108],
    mantra: {
      label: 'Havan mantra — one ahuti',
      dev: 'ॐ नमो भगवते वासुदेवाय स्वाहा।',
      translit: 'Om Namo Bhagavate Vasudevaya Svaha.',
      meaning: 'Om, salutations to Lord Vasudeva — this offering is made into the sacred fire.',
      source: 'Vaishnava havan tradition. The full havan sequence varies by family and region.',
      repeat: 'Once per ahuti.'
    },
    purnahuti: {
      label: 'Purnahuti mantra',
      dev: 'ॐ पूर्णमदः पूर्णमिदं पूर्णात्पूर्णमुदच्यते।\nपूर्णस्य पूर्णमादाय पूर्णमेवावशिष्यते॥\nॐ शान्तिः शान्तिः शान्तिः।',
      translit: 'Om Purnamadah Purnamidam Purnat Purnam Udachyate.\nPurnasya Purnam Adaya Purnam Evavashishyate.\nOm Shantih Shantih Shantih.',
      meaning: 'That is full, this is full. From the full, the full emerges. Taking the full from the full, the full alone remains. Om, peace, peace, peace.',
      source: 'Ishavasya Upanishad, Shanti Path.',
      repeat: 'Once at the completion of the havan.'
    },
    note: 'Keep a bucket of water and a sand bucket near the fire. Never leave a havan unattended. If your building does not allow fire, ask a pandit about a non-fire alternative; do not improvise near smoke detectors.'
  };

  var muhurat = {
    title: 'Purnima, Ekadashi & Makar Sankranti',
    note: 'Dates are computed from your chosen city’s sunrise and the Lahiri ayanamsa. Published panchangs may differ by a day because of tithi timing and local observance. Confirm the final puja window with your family pandit.'
  };

  // Seva plans. Change a price here once and every card, WhatsApp message and
  // printed reference picks it up. Prices are indicative: samagri, travel and
  // the pandit's dakshina are confirmed on WhatsApp before a booking.
  var plans = [
    {
      id: 'katha-basic',
      name: 'Online Katha Basic',
      hi: 'ऑनलाइन कथा — बेसिक',
      price: 1100,
      duration: '1.5–2 hours',
      mode: 'Online',
      summary: 'A short online katha with the sankalp taken in your family name.',
      includes: ['Sankalp in your name and gotra', 'Satyanarayan katha reading', 'Aarti and closing prasad'],
      popular: false
    },
    {
      id: 'katha-standard',
      name: 'Online Katha Standard',
      hi: 'ऑनलाइन कथा — स्टैंडर्ड',
      price: 2100,
      duration: '2 hours',
      mode: 'Live video',
      summary: 'A live video puja with the full katha and aarti, so the family can join from anywhere.',
      includes: ['Live video puja', 'Satyanarayan katha', 'Aarti and prasad guidance', 'Recording on request'],
      popular: true
    },
    {
      id: 'ghar-puja',
      name: 'Ghar par Satyanarayan Puja',
      hi: 'घर पर सत्यनारायण पूजा',
      price: 5100,
      duration: '2–3 hours',
      mode: 'At home',
      summary: 'The complete household vidhi with a pandit at your home.',
      includes: ['Pandit ji at your home', 'Full Satyanarayan vidhi', 'Katha, aarti and prasad', 'Samagri guidance before the day'],
      popular: false
    },
    {
      id: 'grand-havan',
      name: 'Grand Puja + Havan',
      hi: 'ग्रैंड पूजा एवं हवन',
      price: 11000,
      duration: '3–4 hours',
      mode: 'At home',
      summary: 'Two pandits, a full havan and purnahuti for a larger family gathering.',
      includes: ['2 pandits', 'Satyanarayan puja and katha', 'Havan with purnahuti', 'Prasad distribution'],
      popular: false
    },
    {
      id: 'anushthan-3',
      name: '3 Din Anushthan',
      hi: 'तीन दिन अनुष्ठान',
      price: 21000,
      duration: '3 days',
      mode: 'At home',
      summary: 'Three days of daily puja, jaap and havan with a closing purnahuti.',
      includes: ['Daily puja for 3 days', 'Jaap and havan', 'Katha on the final day', 'Purnahuti and prasad'],
      popular: false
    },
    {
      id: 'maha-puja-5',
      name: '5 Din Maha Puja',
      hi: 'पाँच दिन महापूजा',
      price: 31000,
      duration: '5 days',
      mode: 'At home',
      summary: 'A five-day mahapuja with daily jaap, katha and a complete havan.',
      includes: ['Daily puja for 5 days', 'Jaap and katha', 'Poorna havan', 'Family sankalp each day'],
      popular: false
    },
    {
      id: 'maha-anushthan-7',
      name: '7 Din Maha Anushthan',
      hi: 'सात दिन महाअनुष्ठान',
      price: 51000,
      duration: '7 days',
      mode: 'At home',
      summary: 'A full saptah with daily puja, jaap, katha and a poorna havan on the last day.',
      includes: ['Saptah puja for 7 days', 'Daily jaap and katha', 'Poorna havan and purnahuti', 'Senior pandit coordination'],
      popular: false
    }
  ];

  var planNote = 'Prices are indicative and start from the amount shown. Samagri, travel outside Gurugram/NCR and the pandit’s dakshina are confirmed in writing on WhatsApp before booking. A 30% advance confirms the date; the balance is paid after the puja. No online payment is collected by this website.';

  var sankalpPurposes = [
    { value: 'कुटुंब क्षेम एवं सुख', label: 'Family well-being and peace' },
    { value: 'आरोग्य एवं निरोगता', label: 'Health and recovery' },
    { value: 'व्यापार एवं समृद्धि', label: 'Business and prosperity' },
    { value: 'संतान एवं कुटुंब वृद्धि', label: 'Children and family growth' },
    { value: 'विवाह एवं शुभ मंगल', label: 'Marriage and auspicious beginnings' },
    { value: 'नवीन गृह प्रवेश', label: 'New home / griha pravesh' },
    { value: 'विद्या एवं उन्नति', label: 'Education and progress' },
    { value: 'मनोकामना पूर्ति', label: 'A personal intention' }
  ];

  var aarti = {
    title: 'Aarti',
    note: 'If your family has a Satyanarayan-specific aarti, sing that. This is a widely known Vaishnava aarti that many households use.'
  };

  root.PujaData = {
    version: '2026-10-31',
    source: SOURCE,
    disclaimer: 'This guide is for personal preparation. It does not replace a pandit or your family sampradaya. Mantras and vidhi are awaiting review by an empanelled pandit; regional order, pronunciation and offerings vary. A pandit’s guidance is final.',
    steps: steps,
    samagri: samagri,
    katha: katha,
    havan: havan,
    muhurat: muhurat,
    plans: plans,
    planNote: planNote,
    sankalpPurposes: sankalpPurposes,
    aarti: aarti
  };
})(window);
