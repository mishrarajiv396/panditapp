/* ==========================================================================
   SITE SETTINGS — single place for the puja owner's public details.
   Change the values below and the whole site (header, footer, Seva tab,
   WhatsApp, call and UPI links) updates automatically.
   ========================================================================== */
(function (root) {
  'use strict';

  var SETTINGS = {
    owner: {
      name: 'Rajiv Lochan Mishra',
      nameHi: 'राजीव लोचन मिश्रा',
      // International format for tel: / wa.me links, without spaces or "+".
      phone: '918889685370',
      phoneDisplay: '+91 88896 85370',
      email: 'rajivlochanmishra952@gmail.com',
      upi: 'rajivlochanmishra952-1@okhdfcbank',
      upiName: 'Rajiv Lochan Mishra',
      city: 'Gurugram',
      cityHi: 'गुरुग्राम',
      region: 'Haryana',
      regionHi: 'हरियाणा'
    },
    site: {
      name: 'Satyanarayan Puja',
      tagline: 'A complete household puja guide',
      // Used in share text and print footers. Keep this the puja guide page.
      guidePath: 'puja-guide.html'
    },
    seva: {
      heading: 'Seva &amp; dakshina',
      note: 'The puja guide is free. If you wish to offer seva or dakshina, use only the details below. They belong to Rajiv Lochan Mishra.',
      disclaimer: 'Never pay anyone who claims to represent this site but uses a different name, UPI ID or number. When in doubt, call and confirm first.'
    }
  };

  function normalisePhone() {
    return String(SETTINGS.owner.phone || '').replace(/[^\d]/g, '');
  }

  function upiLink() {
    var p = SETTINGS.owner;
    // Keep the raw "@" in the UPI ID: some payment apps reject %40.
    return 'upi://pay?pa=' + p.upi +
      '&pn=' + encodeURIComponent(p.upiName) +
      '&cu=INR';
  }

  function waLink(text) {
    var base = 'https://wa.me/' + normalisePhone();
    return text ? base + '?text=' + encodeURIComponent(text) : base;
  }

  function telLink() {
    return 'tel:+' + normalisePhone();
  }

  function mailLink(subject) {
    var base = 'mailto:' + SETTINGS.owner.email;
    return subject ? base + '?subject=' + encodeURIComponent(subject) : base;
  }

  SETTINGS.upiLink = upiLink;
  SETTINGS.waLink = waLink;
  SETTINGS.telLink = telLink;
  SETTINGS.mailLink = mailLink;
  SETTINGS.phoneDigits = normalisePhone;

  root.SITE_SETTINGS = SETTINGS;
})(window);
