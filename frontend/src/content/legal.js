// The privacy policy and terms of use. Plain data so the wording lives in one place.
// A block is a paragraph (string) or a bullet list (array). [text](url) becomes a link.
// Change LEGAL_UPDATED whenever the meaning of either document changes.

export const LEGAL_UPDATED = '29 October 2026';

export const LEGAL_FALLBACK = {
  name: 'Sunika Lombard',
  email: 'lombardsunika@gmail.com',
  location: 'South Africa',
};

// How long a contact message is kept. The form writes the matching expiry date, and
// firestore.rules only accepts an expiry between 300 and 400 days away.
export const MESSAGE_RETENTION_DAYS = 365;

const RECAPTCHA_NOTE = 'To keep out spam and automated abuse, the site uses Google reCAPTCHA, through Firebase App Check, to confirm that requests come from a real browser on this site. reCAPTCHA reads information about your browser and device and sends it to Google, and may set its own cookies. See [Google\'s privacy policy](https://policies.google.com/privacy) and [terms](https://policies.google.com/terms).';

export const privacyPolicy = ({ name, email, location, recaptcha }) => ({
  title: 'Privacy policy',
  intro: 'What this site collects about you, why, and what you can do about it. The short version: no tracking, no advertising and no cookies of my own. If you send me a message, I keep it so I can reply.',
  sections: [
    {
      heading: 'Who is responsible',
      blocks: [
        `This site is the portfolio of ${name}, a designer and illustrator based in ${location}. I am the responsible party for your personal information under the Protection of Personal Information Act, 2013 (POPIA), and the controller for the purposes of the EU and UK GDPR. You can reach me at [${email}](mailto:${email}).`,
        'The site is built and looked after for me by Francois Meiring, who acts as my operator under POPIA. He handles information on the site only on my instructions and only to keep it running.',
      ],
    },
    {
      heading: 'What I collect',
      blocks: [
        'When you send a message through the Contact page: your name, your email address, your message, and the time it was sent. Nothing else is attached to it.',
        'When you visit any page: the site is served by Google Firebase Hosting, which, like every web host, receives your IP address, browser details and the page requested in order to deliver it. I do not run analytics, advertising or tracking scripts, and I do not build a profile of you.',
        'When you download my CV: the PDF is put together inside your own browser from the information already on this site. Nothing about you is sent or stored.',
        'Please do not send special personal information (health, religion, political views and the like) or anything about children through the form. I do not need it.',
      ],
    },
    {
      heading: 'Why I use it',
      blocks: [
        [
          'To read and reply to your message. This is the only use of what you send. The basis is your request to be contacted (POPIA section 11(1)(a) and (d); GDPR article 6(1)(b) and (f)).',
          'To keep the site running and secure, for example to stop the form being abused. The basis is my legitimate interest in a working, safe site.',
        ],
        'I never sell, rent or trade personal information, and I will not add you to a mailing list.',
      ],
    },
    {
      heading: 'Where it goes',
      blocks: [
        [
          'Google (Firebase and Google Cloud) hosts the site, stores the images you see, and keeps contact messages in a database in Belgium (europe-west1). See [Google\'s privacy policy](https://policies.google.com/privacy).',
          'A small program in the same Google Cloud region emails a copy of each message to my Gmail inbox so I can reply. Your email address is set as the reply address.',
          ...(recaptcha ? ['Google reCAPTCHA checks that the form is used by a person and not a bot. See the cookies section below.'] : []),
        ],
        'These providers store or process information outside South Africa. I rely on them because they are bound by data-protection terms that give protection comparable to POPIA (POPIA section 72), including the EU Standard Contractual Clauses where they apply.',
        'I would only share your information with anyone else if the law required me to.',
      ],
    },
    {
      heading: 'How long I keep it',
      blocks: [
        'Contact messages are deleted from the database automatically 12 months after they arrive, and I delete the email copy in my inbox on the same schedule. If we end up working together, I keep what is needed for that work only for as long as it, and any legal record-keeping duty, requires.',
      ],
    },
    {
      heading: 'Cookies and local storage',
      blocks: [
        'This site sets no cookies of its own. It saves two small things in your browser\'s local storage: your light or dark theme and animation choice, and the time you last sent a message, so the form can stop an accidental double send within a minute. They never leave your device, and clearing your browser data removes them.',
        'Fonts are part of the site itself, so no font service is contacted. Links to Instagram, LinkedIn, Behance and my gallery site take you to those sites, which have their own terms and policies.',
        ...(recaptcha ? [RECAPTCHA_NOTE] : []),
      ],
    },
    {
      heading: 'Your rights',
      blocks: [
        'You may ask me to confirm whether I hold information about you, to see it, to correct it, or to delete it. You may object to my use of it and, where the GDPR applies, ask me to restrict it or hand it over in a portable form. Write to the address above. I will answer within 30 days and will not charge you.',
        'If you are unhappy with how I handled your information, you may complain to the [Information Regulator of South Africa](https://inforegulator.org.za). If you are in the EU or UK, you may also complain to your local data-protection authority. I would appreciate the chance to put it right first.',
      ],
    },
    {
      heading: 'Security',
      blocks: [
        'The site is served only over HTTPS. Stored messages can be read only by me, enforced by the database\'s access rules and a signed-in, verified account. No system is perfectly secure, but if a breach ever affected your information I would tell you and the Information Regulator as POPIA requires.',
      ],
    },
    {
      heading: 'Children',
      blocks: [
        'This site is meant for adults looking at design and illustration work. I do not knowingly collect information from anyone under 18. If you believe a child has sent me their details, tell me and I will delete them.',
      ],
    },
    {
      heading: 'Changes',
      blocks: [
        'If this policy changes, the new version will be posted here with a new date at the top. I will not use information you already sent in a way the policy did not allow when you sent it.',
      ],
    },
  ],
});

export const termsOfUse = ({ name, email, location }) => ({
  title: 'Terms of use',
  intro: 'The ground rules for using this site. By using it you agree to them. If you do not, please do not use it.',
  sections: [
    {
      heading: 'About this site',
      blocks: [
        `This is the portfolio of ${name}, a designer and illustrator based in ${location}. You can reach me at [${email}](mailto:${email}). How I handle personal information is set out in the [privacy policy](/privacy).`,
        'The site shows my work, experience and studies. It is not an offer to sell goods or services. Any work we agree on will be covered by a separate written agreement.',
      ],
    },
    {
      heading: 'Ownership of my work',
      blocks: [
        'The designs, illustrations, photographs, text and other content on this site belong to me unless stated otherwise, and all rights are reserved. You may view the site, share links to it, and quote short passages with credit.',
        [
          'Do not copy, download, print, adapt or reuse my work, or present it as your own, without my written permission.',
          'Do not use any content on this site to train, test or prompt artificial intelligence or machine-learning systems, or to build datasets.',
          'Do not scrape or bulk download the site.',
        ],
      ],
    },
    {
      heading: 'Client and study work',
      blocks: [
        'Some projects were made for clients or as part of my studies. They are shown to illustrate my work, with the permission of the client where one is involved. Client names, logos and brands remain the property of their owners, and showing them does not mean that any owner endorses me or this site.',
        'Software, schools and organisations are named to describe my own skills and history. This site is personal and does not speak for any of them.',
      ],
    },
    {
      heading: 'My CV',
      blocks: [
        'The downloadable CV is generated in your browser from the information on this site. It is provided so you can consider me for work or study. Please do not republish it.',
      ],
    },
    {
      heading: 'Acceptable use',
      blocks: [
        [
          'Do not use the contact form to send spam, advertising, abuse, malware or anything unlawful.',
          'Do not try to break, overload or gain unauthorised access to the site, its database or its admin area.',
          'Do not use the site in a way that infringes anyone\'s rights.',
        ],
        'I may block or delete messages and traffic that break these rules.',
      ],
    },
    {
      heading: 'Links to other sites',
      blocks: [
        'Links take you to sites I do not control, such as Instagram, LinkedIn and Behance. My gallery site has its own terms, which apply when you use it. I am not responsible for the content, availability or privacy practices of other sites.',
      ],
    },
    {
      heading: 'Availability and liability',
      blocks: [
        'The site is provided free of charge, as it is and as available. I may change, suspend or remove any part of it at any time. I keep the information here accurate, but I give it in good faith and without guarantee.',
        'To the fullest extent the law allows, I am not liable for any loss or damage arising from your use of the site, from relying on its content, or from sites it links to. Nothing in these terms limits any right you have, or any liability I have, that cannot lawfully be limited, including under the Consumer Protection Act, 2008, where it applies.',
      ],
    },
    {
      heading: 'Law and changes',
      blocks: [
        'These terms are governed by the law of the Republic of South Africa, and its courts have jurisdiction over any dispute, without taking away any protection you have under the law of the place you live. If any part of these terms is found unenforceable, the rest still applies.',
        'I may update these terms. The version and date posted here apply from the time they are posted.',
      ],
    },
  ],
});
