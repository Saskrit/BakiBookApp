const MAY_2026 = new Date('2026-05-01T00:00:00.000Z');

export const legalSeedDocuments = [
  {
    slug: 'terms',
    title: 'Terms & Conditions',
    lastUpdated: MAY_2026,
    sections: [
      {
        title: '1. Acceptance of Terms',
        paragraphs: [
          'By creating an account and using BakiBook, you agree to comply with these Terms and Conditions. If you do not agree with any part of these terms, you should not use the platform.',
        ],
      },
      {
        title: '2. About BakiBook',
        paragraphs: [
          'BakiBook is a digital credit management platform designed to help shopkeepers and customers manage credit transactions, payments, and account records electronically.',
        ],
      },
      {
        title: '3. User Accounts',
        paragraphs: ['Users are responsible for:'],
        bullets: [
          'Providing accurate registration information.',
          'Maintaining the confidentiality of their login credentials.',
          'Ensuring account information remains up to date.',
          'Reporting unauthorized access immediately.',
        ],
      },
      {
        title: '4. Shopkeeper Responsibilities',
        paragraphs: ['Shopkeepers agree to:'],
        bullets: [
          'Record transactions accurately.',
          'Maintain truthful customer information.',
          'Use the platform only for lawful business activities.',
          'Avoid manipulating or falsifying transaction records.',
        ],
      },
      {
        title: '5. Customer Responsibilities',
        paragraphs: ['Customers agree to:'],
        bullets: [
          'Provide correct personal information.',
          'Review transaction records regularly.',
          'Report discrepancies within a reasonable period.',
        ],
      },
      {
        title: '6. Transaction Records',
        paragraphs: [
          'BakiBook stores digital transaction records entered by shopkeepers. While the platform provides record-keeping tools, users remain responsible for verifying transaction accuracy.',
        ],
      },
      {
        title: '7. Prohibited Activities',
        paragraphs: ['Users may not:'],
        bullets: [
          'Use the platform for illegal purposes.',
          'Attempt unauthorized access to accounts or data.',
          'Upload malicious software or harmful content.',
          'Interfere with the operation of the system.',
        ],
      },
      {
        title: '8. Intellectual Property',
        paragraphs: [
          'All software, designs, logos, and content associated with BakiBook remain the property of the BakiBook development team unless otherwise stated.',
        ],
      },
      {
        title: '9. Service Availability',
        paragraphs: [
          'We strive to maintain reliable service but do not guarantee uninterrupted access. Temporary downtime may occur due to maintenance or technical issues.',
        ],
      },
      {
        title: '10. Limitation of Liability',
        paragraphs: ['BakiBook shall not be responsible for:'],
        bullets: [
          'Incorrect records entered by users.',
          'Financial disputes between shopkeepers and customers.',
          'Losses resulting from inaccurate information provided by users.',
        ],
      },
      {
        title: '11. Termination',
        paragraphs: [
          'We reserve the right to suspend or terminate accounts that violate these Terms and Conditions.',
        ],
      },
      {
        title: '12. Changes to Terms',
        paragraphs: [
          'These Terms and Conditions may be updated periodically. Continued use of the platform constitutes acceptance of any modifications.',
        ],
      },
      {
        title: '13. Contact Information',
        paragraphs: ['For questions regarding these Terms and Conditions, contact:'],
        contactEmail: 'support@bakibook.com',
      },
    ],
  },
  {
    slug: 'data-policy',
    title: 'Privacy Policy',
    lastUpdated: MAY_2026,
    sections: [
      {
        title: '1. Introduction',
        paragraphs: [
          'BakiBook respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how information is collected, used, and protected.',
        ],
      },
      {
        title: '2. Information We Collect',
        subsections: [
          {
            title: 'Account Information',
            bullets: ['Full Name', 'Phone Number', 'Email Address', 'Password (encrypted)'],
          },
          {
            title: 'Shop Information',
            bullets: ['Shop Name', 'Business Type', 'Shop Address', 'Contact Details'],
          },
          {
            title: 'Customer Information',
            bullets: ['Customer Name', 'Phone Number', 'Email Address', 'Address'],
          },
          {
            title: 'Transaction Information',
            bullets: [
              'Credit Transactions',
              'Payment Records',
              'Outstanding Balances',
              'Generated Reports',
            ],
          },
        ],
      },
      {
        title: '3. How We Use Information',
        paragraphs: ['We use collected information to:'],
        bullets: [
          'Create and manage user accounts.',
          'Store transaction records.',
          'Generate reports and statements.',
          'Send notifications and account updates.',
          'Improve platform performance and security.',
        ],
      },
      {
        title: '4. Email Notifications',
        paragraphs: ['BakiBook may send emails regarding:'],
        bullets: [
          'Account verification',
          'Password recovery',
          'Transaction updates',
          'Payment confirmations',
          'Monthly statements',
        ],
      },
      {
        title: '5. Data Security',
        paragraphs: ['We implement reasonable security measures including:'],
        bullets: [
          'Password encryption',
          'Secure authentication',
          'Role-based access control',
          'Protected database access',
        ],
      },
      {
        title: '6. Data Sharing',
        paragraphs: [
          'BakiBook does not sell, rent, or trade user information.',
          'Information may only be shared:',
        ],
        bullets: [
          'When required by law.',
          'To provide essential platform functionality.',
          'With user consent.',
        ],
      },
      {
        title: '7. Data Retention',
        paragraphs: [
          'User information and transaction records are retained for as long as necessary to provide services and maintain account history.',
        ],
      },
      {
        title: '8. User Rights',
        paragraphs: ['Users may:'],
        bullets: [
          'Access their information.',
          'Update profile information.',
          'Request correction of inaccurate data.',
          'Request account deletion where applicable.',
        ],
      },
      {
        title: '9. Cookies and Analytics',
        paragraphs: ['BakiBook may use cookies and similar technologies to:'],
        bullets: [
          'Improve user experience.',
          'Remember login preferences.',
          'Analyze platform usage.',
        ],
      },
      {
        title: '10. Third-Party Services',
        paragraphs: [
          'BakiBook may utilize trusted third-party services including:',
          'These services may process data according to their own privacy policies.',
        ],
        bullets: ['Firebase Authentication', 'Email Service Providers', 'Cloud Storage Services'],
        subsections: [],
      },
      {
        title: '11. Children\'s Privacy',
        paragraphs: ['BakiBook is not intended for use by individuals under 13 years of age.'],
      },
      {
        title: '12. Changes to Privacy Policy',
        paragraphs: [
          'This Privacy Policy may be updated periodically. Any significant changes will be communicated through the platform.',
        ],
      },
      {
        title: '13. Contact Us',
        paragraphs: ['If you have questions regarding this Privacy Policy, please contact:'],
        contactEmail: 'support@bakibook.com',
      },
    ],
  },
];
