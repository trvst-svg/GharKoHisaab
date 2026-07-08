export const TRANSLATIONS = {
  en: {
    // Tab Navigation
    dashboard: '🏠 Dashboard',
    marketplace: '🌐 Marketplace',
    settings: '⚙️ Settings',

    // Settings Headers
    personalization: 'Personalization',
    appSettings: 'App Settings',
    securityHeader: '🔐 App Lock & Security',
    securitySubtitle: 'Secure your ledger records. Re-authenticates on launch and resuming from background.',
    enableLock: 'Enable Application Lock',
    enableLockSub: 'Requires biometric scan or 4-digit PIN',
    changePin: '✏️ Change Passcode PIN',

    // Settings Language
    languageHeader: '🌐 Language / भाषा',
    languageSubtitle: 'Select your preferred language for the system interface.',
    englishLabel: 'English',
    nepaliLabel: 'नेपाली (Nepali)',

    // Settings Theme
    themeHeader: '🎨 Theme Selection',
    themeSubtitle: 'Choose the visual colors and appearance for the app interface.',
    themeIndigo: 'Indigo Slate',
    themeDark: 'Dark Slate',
    themeEmerald: 'Emerald Forest',

    // Settings Khalti
    khaltiHeader: '💸 Khalti Payment Integration',
    khaltiSubtitle: 'Configure your Khalti merchant wallet details to accept direct rent transactions.',
    khaltiStatus: 'Linked Status:',
    khaltiLinked: 'Linked to',
    khaltiNotLinked: 'Not Linked',
    btnConfigureKhalti: 'Configure Khalti',
    btnTestCheckout: 'Simulate Khalti Payment',

    // Modal PIN
    modalTitlePin: 'Configure App Lock PIN',
    modalSubPin: 'Configure a 4-digit fallback PIN. This is used if biometrics fail or are unavailable.',
    enterPin: 'Enter 4-Digit Passcode',
    confirmPin: 'Confirm 4-Digit Passcode',
    btnSavePin: 'Save PIN',
    btnCancel: 'Cancel',

    // Modal Khalti
    modalTitleKhalti: 'Link Khalti Account',
    modalSubKhalti: 'Enter your registered Khalti phone number and API Public Key to set up direct links.',
    khaltiIdLabel: 'Khalti Phone Number (10 digits)',
    khaltiKeyLabel: 'Khalti Public Key (e.g. live_public_key...)',
    btnLinkKhalti: 'Link Wallet',
  },
  ne: {
    // Tab Navigation
    dashboard: '🏠 मुख्य पृष्ठ',
    marketplace: '🌐 बजार',
    settings: '⚙️ सेटिङहरू',

    // Settings Headers
    personalization: 'निजिकरण',
    appSettings: 'एप सेटिङहरू',
    securityHeader: '🔐 एप लक र सुरक्षा',
    securitySubtitle: 'तपाईंको खाताको रेकर्डहरू सुरक्षित गर्नुहोस्। एप खोल्दा वा ब्याकग्राउन्डबाट फर्कँदा पुन: प्रमाणीकरण गर्नुहोस्।',
    enableLock: 'अनुप्रयोग लक सक्रिय गर्नुहोस्',
    enableLockSub: 'बायोमेट्रिक स्क्यान वा ४-अङ्कको PIN आवश्यक पर्दछ',
    changePin: '✏️ पासकोड PIN परिवर्तन गर्नुहोस्',

    // Settings Language
    languageHeader: '🌐 भाषा / Language',
    languageSubtitle: 'सिस्टम इन्टरफेसको लागि आफ्नो मनपर्ने भाषा चयन गर्नुहोस्।',
    englishLabel: 'English',
    nepaliLabel: 'नेपाली',

    // Settings Theme
    themeHeader: '🎨 थीम चयन',
    themeSubtitle: 'एपको रङ्ग र सजावट चयन गर्नुहोस्।',
    themeIndigo: 'इन्डिगो स्लेट',
    themeDark: 'डार्क स्लेट',
    themeEmerald: 'इमराल्ड फरेस्ट',

    // Settings Khalti
    khaltiHeader: '💸 खल्ती भुक्तानी एकीकरण',
    khaltiSubtitle: 'प्रत्यक्ष भाडा कारोबार स्वीकार गर्न आफ्नो खल्ती मर्चेन्ट वालेट विवरणहरू कन्फिगर गर्नुहोस्।',
    khaltiStatus: 'लिङ्क गरिएको स्थिति:',
    khaltiLinked: 'लिङ्क गरिएको नम्बर:',
    khaltiNotLinked: 'लिङ्क गरिएको छैन',
    btnConfigureKhalti: 'खल्ती कन्फिगर गर्नुहोस्',
    btnTestCheckout: 'खल्ती भुक्तानी अनुकरण',

    // Modal PIN
    modalTitlePin: 'एप लक PIN कन्फिगर गर्नुहोस्',
    modalSubPin: '४-अङ्कको वैकल्पिक PIN कन्फिगर गर्नुहोस्। यदि बायोमेट्रिक्स असफल भएमा यो प्रयोग गरिन्छ।',
    enterPin: '४-अङ्कको पासकोड प्रविष्ट गर्नुहोस्',
    confirmPin: 'पासकोड पुष्टि गर्नुहोस्',
    btnSavePin: 'PIN सुरक्षित गर्नुहोस्',
    btnCancel: 'रद्द गर्नुहोस्',

    // Modal Khalti
    modalTitleKhalti: 'खल्ती खाता लिङ्क गर्नुहोस्',
    modalSubKhalti: 'प्रत्यक्ष भुक्तानी लिङ्क सेटअप गर्न आफ्नो दर्ता गरिएको खल्ती फोन नम्बर र API Public Key प्रविष्ट गर्नुहोस्।',
    khaltiIdLabel: 'खल्ती फोन नम्बर (१० अङ्क)',
    khaltiKeyLabel: 'खल्ती Public Key (उदा. live_public_key...)',
    btnLinkKhalti: 'वालेट लिङ्क गर्नुहोस्',
  },
};

export type LanguageType = 'en' | 'ne';

export function t(key: keyof typeof TRANSLATIONS['en'], lang: LanguageType): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dictionary[key] || TRANSLATIONS.en[key] || String(key);
}
