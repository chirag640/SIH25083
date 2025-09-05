"use client"

export interface Translations {
  // Common
  common: {
    backToHome: string
    loading: string
    error: string
    save: string
    cancel: string
    edit: string
    delete: string
    download: string
    upload: string
    search: string
    view: string
    print: string
    yes: string
    no: string
    required: string
    optional: string
  }

  // Navigation
  nav: {
    workerRecords: string
    doctorDashboard: string
    workerDashboard: string
    searchRecords: string
    registerWorker: string
  }

  // Home Page
  home: {
    title: string
    subtitle: string
    description: string
    keyFeatures: string
    easyRegistration: string
    easyRegistrationDesc: string
    easyRegistrationDetail: string
    qrCodeAccess: string
    qrCodeAccessDesc: string
    qrCodeAccessDetail: string
    securePrivate: string
    securePrivateDesc: string
    securePrivateDetail: string
    footer: string
  }

  // Worker Registration
  registration: {
    title: string
    formTitle: string
    formDescription: string
    personalInfo: string
    locationInfo: string
    healthInfo: string
    healthInfoEncrypted: string
    fullName: string
    dateOfBirth: string
    gender: string
    phoneNumber: string
    nativeState: string
    nativeDistrict: string
    currentAddress: string
    currentAddressKerala: string
    bloodGroup: string
    allergies: string
    allergiesPlaceholder: string
    currentMedication: string
    currentMedicationPlaceholder: string
    healthHistory: string
    healthHistoryPlaceholder: string
    dataPrivacySecurity: string
    privacyPoints: string[]
    consentText: string
    registerWorker: string
    savingSecurely: string
    // Gender options
    male: string
    female: string
    other: string
    // Blood groups
    selectBloodGroup: string
    selectGender: string
    // Validation errors
    errors: {
      fullNameRequired: string
      fullNameInvalid: string
      dobRequired: string
      ageRange: string
      genderRequired: string
      nativeStateRequired: string
      nativeDistrictRequired: string
      currentAddressRequired: string
      phoneInvalid: string
      consentRequired: string
      savingError: string
    }
  }

  // Worker Dashboard
  dashboard: {
    title: string
    enterWorkerId: string
    loadProfile: string
    personalInfo: string
    locationInfo: string
    healthInfo: string
    healthTimeline: string
    qrCode: string
    documents: string
    downloadCard: string
    uploadDocument: string
    age: string
    bloodGroup: string
    allergies: string
    medications: string
    healthHistory: string
    nativePlace: string
    currentAddress: string
    registrationDate: string
    noAllergies: string
    noMedications: string
    noHealthHistory: string
    quickActions: string
    generateProfessionalCard: string
    documentsUploaded: string
    noDocumentsYet: string
  }

  // Doctor Dashboard
  doctor: {
    title: string
    subtitle: string
    qrScanner: string
    auditLogs: string
    totalWorkers: string
    withAllergies: string
    onMedication: string
    recentRecords: string
    searchRecords: string
    searchDescription: string
    searchPlaceholder: string
    recentRegistrations: string
    recentDescription: string
    medicalAlerts: string
    workersWithAllergies: string
    workersOnMedication: string
    noAllergiesRecorded: string
    noMedicationsRecorded: string
    viewDetails: string
    registered: string
    noRecentRecords: string
    noWorkersMatch: string
    noWorkerRecords: string
  }

  // Document Management
  documents: {
    title: string
    uploadTitle: string
    uploadDescription: string
    selectFile: string
    documentType: string
    description: string
    descriptionPlaceholder: string
    supportedFormats: string
    documentSecurity: string
    securityPoints: string[]
    consentText: string
    uploading: string
    uploadDocument: string
    myDocuments: string
    myDocumentsDescription: string
    noDocuments: string
    uploadFirst: string
    // Document types
    prescription: string
    labReport: string
    vaccination: string
    medicalCertificate: string
    other: string
    selectDocumentType: string
    // Errors
    fillAllFields: string
    fileTypeError: string
    fileSizeError: string
    uploadError: string
    downloadError: string
    deleteConfirm: string
    encrypted: string
  }

  // Health Card
  healthCard: {
    title: string
    healthCard: string
    emergencyCard: string
    workerName: string
    workerId: string
    bloodGroup: string
    allergies: string
    emergencyContact: string
    issuedBy: string
    scanForDetails: string
    noAllergies: string
    downloadPNG: string
    downloadPDF: string
    printCard: string
    cardStyle: string
    standard: string
    emergency: string
    compact: string
    cardPreview: string
    cardInformation: string
    notSpecified: string
    notProvided: string
  }
}

export const translations: Record<string, Translations> = {
  en: {
    common: {
      backToHome: "Back to Home",
      loading: "Loading...",
      error: "Error",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      download: "Download",
      upload: "Upload",
      search: "Search",
      view: "View",
      print: "Print",
      yes: "Yes",
      no: "No",
      required: "Required",
      optional: "Optional",
    },
    nav: {
      workerRecords: "Worker Records",
      doctorDashboard: "Doctor Dashboard",
      workerDashboard: "Worker Dashboard",
      searchRecords: "Search Records",
      registerWorker: "Register New Worker",
    },
    home: {
      title: "HealthRecord",
      subtitle: "Healthcare Records for Migrant Workers",
      description:
        "Secure, accessible healthcare record management system designed for migrant workers and healthcare providers in Kerala.",
      keyFeatures: "Key Features",
      easyRegistration: "Easy Registration",
      easyRegistrationDesc: "Quick and simple worker registration with essential health information",
      easyRegistrationDetail: "Streamlined form to capture worker details, health history, and generate unique IDs",
      qrCodeAccess: "QR Code Access",
      qrCodeAccessDesc: "Instant access to health records via QR codes",
      qrCodeAccessDetail: "Each worker gets a unique QR code for quick access to their health information",
      securePrivate: "Secure & Private",
      securePrivateDesc: "End-to-end encryption and secure data storage",
      securePrivateDetail: "All health data is encrypted and stored securely with proper consent management",
      footer: "© 2025 HealthRecord System. Built for migrant worker healthcare access.",
    },
    registration: {
      title: "Register New Worker",
      formTitle: "Worker Registration Form",
      formDescription:
        "Please fill in all required information to create a new worker health record. All sensitive data is encrypted and stored securely.",
      personalInfo: "Personal Information",
      locationInfo: "Location Information",
      healthInfo: "Health Information",
      healthInfoEncrypted: "Health Information (Encrypted)",
      fullName: "Full Name",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      phoneNumber: "Phone Number",
      nativeState: "Native State",
      nativeDistrict: "Native District",
      currentAddress: "Current Address",
      currentAddressKerala: "Current Address in Kerala",
      bloodGroup: "Blood Group",
      allergies: "Known Allergies",
      allergiesPlaceholder: "List any known allergies...",
      currentMedication: "Current Medications",
      currentMedicationPlaceholder: "List current medications...",
      healthHistory: "Health History",
      healthHistoryPlaceholder: "Past diseases, surgeries, chronic conditions...",
      dataPrivacySecurity: "Data Privacy & Security",
      privacyPoints: [
        "All sensitive health information is encrypted before storage",
        "Data access is logged and monitored for security",
        "Information is used solely for healthcare purposes",
        "You have the right to access, modify, or delete your data",
      ],
      consentText:
        "I agree to my data being stored for healthcare purposes and understand my rights regarding data privacy and security measures in place.",
      registerWorker: "Register Worker",
      savingSecurely: "Saving Securely...",
      male: "Male",
      female: "Female",
      other: "Other",
      selectBloodGroup: "Select blood group",
      selectGender: "Select gender",
      errors: {
        fullNameRequired: "Full name is required",
        fullNameInvalid: "Full name contains invalid characters",
        dobRequired: "Date of birth is required",
        ageRange: "Age must be between 16 and 100 years",
        genderRequired: "Gender is required",
        nativeStateRequired: "Native state is required",
        nativeDistrictRequired: "Native district is required",
        currentAddressRequired: "Current address is required",
        phoneInvalid: "Invalid phone number format",
        consentRequired: "Consent is required to proceed",
        savingError: "Error saving record. Please try again.",
      },
    },
    dashboard: {
      title: "Worker Dashboard",
      enterWorkerId: "Enter your Worker ID",
      loadProfile: "Load My Profile",
      personalInfo: "Personal Information",
      locationInfo: "Location Information",
      healthInfo: "Health Information",
      healthTimeline: "Health Timeline",
      qrCode: "My Health Card",
      documents: "My Documents",
      downloadCard: "Download Health Card",
      uploadDocument: "Upload Document",
      age: "Age",
      bloodGroup: "Blood Group",
      allergies: "Allergies",
      medications: "Current Medications",
      healthHistory: "Health History",
      nativePlace: "Native Place",
      currentAddress: "Current Address",
      registrationDate: "Registration Date",
      noAllergies: "No known allergies",
      noMedications: "No current medications",
      noHealthHistory: "No health history recorded",
      quickActions: "Quick Actions",
      generateProfessionalCard: "Generate Professional Card",
      documentsUploaded: "documents uploaded",
      noDocumentsYet: "No documents yet",
    },
    doctor: {
      title: "Doctor Dashboard",
      subtitle: "Migrant Worker Health Records",
      qrScanner: "QR Scanner",
      auditLogs: "Audit Logs",
      totalWorkers: "Total Workers",
      withAllergies: "With Allergies",
      onMedication: "On Medication",
      recentRecords: "Recent Records",
      searchRecords: "Search Records",
      searchDescription: "Search by name, worker ID, phone number, or blood group",
      searchPlaceholder: "Enter name, ID, phone, or blood group...",
      recentRegistrations: "Recently Registered Workers",
      recentDescription: "Latest worker registrations for quick access",
      medicalAlerts: "Medical Alerts",
      workersWithAllergies: "Workers with Allergies",
      workersOnMedication: "Workers on Medication",
      noAllergiesRecorded: "No workers with recorded allergies.",
      noMedicationsRecorded: "No workers with recorded medications.",
      viewDetails: "View Details",
      registered: "Registered",
      noRecentRecords: "No recent records available.",
      noWorkersMatch: "No workers match your search.",
      noWorkerRecords: "No worker records available.",
    },
    documents: {
      title: "Medical Documents",
      uploadTitle: "Upload Medical Document",
      uploadDescription: "Upload prescriptions, lab reports, vaccination cards, and other medical documents",
      selectFile: "Select File",
      documentType: "Document Type",
      description: "Description (Optional)",
      descriptionPlaceholder: "Brief description of the document...",
      supportedFormats: "Supported formats: PDF, JPG, PNG (Max 5MB)",
      documentSecurity: "Document Security & Privacy",
      securityPoints: [
        "Documents are encrypted before storage",
        "Only you and authorized healthcare providers can access your documents",
        "All document access is logged for security",
        "You can delete documents at any time",
      ],
      consentText: "I consent to uploading this medical document and understand the security measures in place",
      uploading: "Uploading...",
      uploadDocument: "Upload Document",
      myDocuments: "My Documents",
      myDocumentsDescription: "Your uploaded medical documents",
      noDocuments: "No documents uploaded yet",
      uploadFirst: "Upload your first medical document above",
      prescription: "Prescription",
      labReport: "Lab Report",
      vaccination: "Vaccination Card",
      medicalCertificate: "Medical Certificate",
      other: "Other",
      selectDocumentType: "Select document type",
      fillAllFields: "Please fill all required fields and provide consent",
      fileTypeError: "Only PDF, JPG, and PNG files are allowed",
      fileSizeError: "File size must be less than 5MB",
      uploadError: "Error uploading document. Please try again.",
      downloadError: "Error downloading document",
      deleteConfirm: "Are you sure you want to delete this document? This action cannot be undone.",
      encrypted: "Encrypted",
    },
    healthCard: {
      title: "Health Card Generator",
      healthCard: "HEALTH RECORD CARD",
      emergencyCard: "EMERGENCY HEALTH CARD",
      workerName: "Name",
      workerId: "Worker ID",
      bloodGroup: "Blood Group",
      allergies: "Allergies",
      emergencyContact: "Emergency Contact",
      issuedBy: "Issued by Kerala Health Department",
      scanForDetails: "Scan QR code for complete health record",
      noAllergies: "No known allergies",
      downloadPNG: "Download as PNG",
      downloadPDF: "Download as PDF",
      printCard: "Print Card",
      cardStyle: "Card Style",
      standard: "Standard",
      emergency: "Emergency",
      compact: "Compact",
      cardPreview: "Card Preview",
      cardInformation: "Card Information",
      notSpecified: "Not specified",
      notProvided: "Not provided",
    },
  },

  ml: {
    common: {
      backToHome: "ഹോമിലേക്ക് മടങ്ങുക",
      loading: "ലോഡ് ചെയ്യുന്നു...",
      error: "പിശക്",
      save: "സേവ് ചെയ്യുക",
      cancel: "റദ്ദാക്കുക",
      edit: "എഡിറ്റ് ചെയ്യുക",
      delete: "ഇല്ലാതാക്കുക",
      download: "ഡൗൺലോഡ് ചെയ്യുക",
      upload: "അപ്‌ലോഡ് ചെയ്യുക",
      search: "തിരയുക",
      view: "കാണുക",
      print: "പ്രിന്റ് ചെയ്യുക",
      yes: "അതെ",
      no: "ഇല്ല",
      required: "ആവശ്യമാണ്",
      optional: "ഓപ്ഷണൽ",
    },
    nav: {
      workerRecords: "തൊഴിലാളി രേഖകൾ",
      doctorDashboard: "ഡോക്ടർ ഡാഷ്ബോർഡ്",
      workerDashboard: "തൊഴിലാളി ഡാഷ്ബോർഡ്",
      searchRecords: "രേഖകൾ തിരയുക",
      registerWorker: "പുതിയ തൊഴിലാളിയെ രജിസ്റ്റർ ചെയ്യുക",
    },
    home: {
      title: "ആരോഗ്യരേഖ",
      subtitle: "കുടിയേറ്റ തൊഴിലാളികൾക്കുള്ള ആരോഗ്യ രേഖകൾ",
      description:
        "കേരളത്തിലെ കുടിയേറ്റ തൊഴിലാളികൾക്കും ആരോഗ്യ പ്രവർത്തകർക്കും വേണ്ടി രൂപകൽപ്പന ചെയ്ത സുരക്ഷിതവും ആക്സസ് ചെയ്യാവുന്നതുമായ ആരോഗ്യ രേഖാ മാനേജ്മെന്റ് സിസ്റ്റം.",
      keyFeatures: "പ്രധാന സവിശേഷതകൾ",
      easyRegistration: "എളുപ്പമുള്ള രജിസ്ട്രേഷൻ",
      easyRegistrationDesc: "അത്യാവശ്യ ആരോഗ്യ വിവരങ്ങളോടെ വേഗത്തിലും ലളിതമായും തൊഴിലാളി രജിസ്ട്രേഷൻ",
      easyRegistrationDetail: "തൊഴിലാളി വിശദാംശങ്ങൾ, ആരോഗ്യ ചരിത്രം പിടിച്ചെടുക്കാനും അദ്വിതീയ ഐഡികൾ സൃഷ്ടിക്കാനുമുള്ള സ്ട്രീംലൈൻ ഫോം",
      qrCodeAccess: "QR കോഡ് ആക്സസ്",
      qrCodeAccessDesc: "QR കോഡുകൾ വഴി ആരോഗ്യ രേഖകളിലേക്ക് തൽക്ഷണ ആക്സസ്",
      qrCodeAccessDetail: "ഓരോ തൊഴിലാളിക്കും അവരുടെ ആരോഗ്യ വിവരങ്ങളിലേക്ക് വേഗത്തിൽ ആക്സസ് ചെയ്യുന്നതിനായി ഒരു അദ്വിതീയ QR കോഡ് ലഭിക്കുന്നു",
      securePrivate: "സുരക്ഷിതവും സ്വകാര്യവും",
      securePrivateDesc: "എൻഡ്-ടു-എൻഡ് എൻക്രിപ്ഷനും സുരക്ഷിത ഡാറ്റ സ്റ്റോറേജും",
      securePrivateDetail: "എല്ലാ ആരോഗ്യ ഡാറ്റയും എൻക്രിപ്റ്റ് ചെയ്യുകയും ശരിയായ സമ്മത മാനേജ്മെന്റോടെ സുരക്ഷിതമായി സംഭരിക്കുകയും ചെയ്യുന്നു",
      footer: "© 2025 ആരോഗ്യരേഖ സിസ്റ്റം. കുടിയേറ്റ തൊഴിലാളികളുടെ ആരോഗ്യ പരിരക്ഷയ്ക്കായി നിർമ്മിച്ചത്.",
    },
    registration: {
      title: "പുതിയ തൊഴിലാളിയെ രജിസ്റ്റർ ചെയ്യുക",
      formTitle: "തൊഴിലാളി രജിസ്ട്രേഷൻ ഫോം",
      formDescription:
        "പുതിയ തൊഴിലാളി ആരോഗ്യ രേഖ സൃഷ്ടിക്കുന്നതിന് ആവശ്യമായ എല്ലാ വിവരങ്ങളും പൂരിപ്പിക്കുക. എല്ലാ സെൻസിറ്റീവ് ഡാറ്റയും എൻക്രിപ്റ്റ് ചെയ്യുകയും സുരക്ഷിതമായി സംഭരിക്കുകയും ചെയ്യുന്നു.",
      personalInfo: "വ്യക്തിഗത വിവരങ്ങൾ",
      locationInfo: "സ്ഥാന വിവരങ്ങൾ",
      healthInfo: "ആരോഗ്യ വിവരങ്ങൾ",
      healthInfoEncrypted: "ആരോഗ്യ വിവരങ്ങൾ (എൻക്രിപ്റ്റഡ്)",
      fullName: "പൂർണ്ണ നാമം",
      dateOfBirth: "ജനന തീയതി",
      gender: "ലിംഗം",
      phoneNumber: "ഫോൺ നമ്പർ",
      nativeState: "ജന്മ സംസ്ഥാനം",
      nativeDistrict: "ജന്മ ജില്ല",
      currentAddress: "നിലവിലെ വിലാസം",
      currentAddressKerala: "കേരളത്തിലെ നിലവിലെ വിലാസം",
      bloodGroup: "രക്തഗ്രൂപ്പ്",
      allergies: "അറിയപ്പെടുന്ന അലർജികൾ",
      allergiesPlaceholder: "അറിയപ്പെടുന്ന അലർജികൾ പട്ടികപ്പെടുത്തുക...",
      currentMedication: "നിലവിലെ മരുന്നുകൾ",
      currentMedicationPlaceholder: "നിലവിലെ മരുന്നുകൾ പട്ടികപ്പെടുത്തുക...",
      healthHistory: "ആരോഗ്യ ചരിത്രം",
      healthHistoryPlaceholder: "മുൻകാല രോഗങ്ങൾ, ശസ്ത്രക്രിയകൾ, വിട്ടുമാറാത്ത അവസ്ഥകൾ...",
      dataPrivacySecurity: "ഡാറ്റ സ്വകാര്യതയും സുരക്ഷയും",
      privacyPoints: [
        "എല്ലാ സെൻസിറ്റീവ് ആരോഗ്യ വിവരങ്ങളും സംഭരിക്കുന്നതിന് മുമ്പ് എൻക്രിപ്റ്റ് ചെയ്യുന്നു",
        "ഡാറ്റ ആക്സസ് ലോഗ് ചെയ്യുകയും സുരക്ഷയ്ക്കായി നിരീക്ഷിക്കുകയും ചെയ്യുന്നു",
        "വിവരങ്ങൾ ആരോഗ്യ ആവശ്യങ്ങൾക്ക് മാത്രമായി ഉപയോഗിക്കുന്നു",
        "നിങ്ങളുടെ ഡാറ്റ ആക്സസ് ചെയ്യാനും പരിഷ്കരിക്കാനും ഇല്ലാതാക്കാനുമുള്ള അവകാശം നിങ്ങൾക്കുണ്ട്",
      ],
      consentText:
        "ആരോഗ്യ ആവശ്യങ്ങൾക്കായി എന്റെ ഡാറ്റ സംഭരിക്കുന്നതിന് ഞാൻ സമ്മതിക്കുകയും ഡാറ്റ സ്വകാര്യതയും സുരക്ഷാ നടപടികളും സംബന്ധിച്ച എന്റെ അവകാശങ്ങൾ മനസ്സിലാക്കുകയും ചെയ്യുന്നു.",
      registerWorker: "തൊഴിലാളിയെ രജിസ്റ്റർ ചെയ്യുക",
      savingSecurely: "സുരക്ഷിതമായി സേവ് ചെയ്യുന്നു...",
      male: "പുരുഷൻ",
      female: "സ്ത്രീ",
      other: "മറ്റുള്ളവ",
      selectBloodGroup: "രക്തഗ്രൂപ്പ് തിരഞ്ഞെടുക്കുക",
      selectGender: "ലിംഗം തിരഞ്ഞെടുക്കുക",
      errors: {
        fullNameRequired: "പൂർണ്ണ നാമം ആവശ്യമാണ്",
        fullNameInvalid: "പൂർണ്ണ നാമത്തിൽ അസാധുവായ പ്രതീകങ്ങൾ അടങ്ങിയിരിക്കുന്നു",
        dobRequired: "ജനന തീയതി ആവശ്യമാണ്",
        ageRange: "പ്രായം 16 നും 100 നും ഇടയിൽ ആയിരിക്കണം",
        genderRequired: "ലിംഗം ആവശ്യമാണ്",
        nativeStateRequired: "ജന്മ സംസ്ഥാനം ആവശ്യമാണ്",
        nativeDistrictRequired: "ജന്മ ജില്ല ആവശ്യമാണ്",
        currentAddressRequired: "നിലവിലെ വിലാസം ആവശ്യമാണ്",
        phoneInvalid: "അസാധുവായ ഫോൺ നമ്പർ ഫോർമാറ്റ്",
        consentRequired: "തുടരുന്നതിന് സമ്മതം ആവശ്യമാണ്",
        savingError: "രേഖ സേവ് ചെയ്യുന്നതിൽ പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
      },
    },
    dashboard: {
      title: "തൊഴിലാളി ഡാഷ്ബോർഡ്",
      enterWorkerId: "നിങ്ങളുടെ തൊഴിലാളി ഐഡി നൽകുക",
      loadProfile: "എന്റെ പ്രൊഫൈൽ ലോഡ് ചെയ്യുക",
      personalInfo: "വ്യക്തിഗത വിവരങ്ങൾ",
      locationInfo: "സ്ഥാന വിവരങ്ങൾ",
      healthInfo: "ആരോഗ്യ വിവരങ്ങൾ",
      healthTimeline: "ആരോഗ്യ ചരിത്രം",
      qrCode: "എന്റെ ആരോഗ്യ കാർഡ്",
      documents: "എന്റെ രേഖകൾ",
      downloadCard: "ആരോഗ്യ കാർഡ് ഡൗൺലോഡ് ചെയ്യുക",
      uploadDocument: "രേഖ അപ്‌ലോഡ് ചെയ്യുക",
      age: "പ്രായം",
      bloodGroup: "രക്തഗ്രൂപ്പ്",
      allergies: "അലർജികൾ",
      medications: "നിലവിലെ മരുന്നുകൾ",
      healthHistory: "ആരോഗ്യ ചരിത്രം",
      nativePlace: "ജന്മസ്ഥലം",
      currentAddress: "നിലവിലെ വിലാസം",
      registrationDate: "രജിസ്ട്രേഷൻ തീയതി",
      noAllergies: "അറിയപ്പെടുന്ന അലർജികൾ ഇല്ല",
      noMedications: "നിലവിലെ മരുന്നുകൾ ഇല്ല",
      noHealthHistory: "ആരോഗ്യ ചരിത്രം രേഖപ്പെടുത്തിയിട്ടില്ല",
      quickActions: "ദ്രുത പ്രവർത്തനങ്ങൾ",
      generateProfessionalCard: "പ്രൊഫഷണൽ കാർഡ് സൃഷ്ടിക്കുക",
      documentsUploaded: "രേഖകൾ അപ്‌ലോഡ് ചെയ്തു",
      noDocumentsYet: "ഇതുവരെ രേഖകൾ ഇല്ല",
    },
    doctor: {
      title: "ഡോക്ടർ ഡാഷ്ബോർഡ്",
      subtitle: "കുടിയേറ്റ തൊഴിലാളി ആരോഗ്യ രേഖകൾ",
      qrScanner: "QR സ്കാനർ",
      auditLogs: "ഓഡിറ്റ് ലോഗുകൾ",
      totalWorkers: "മൊത്തം തൊഴിലാളികൾ",
      withAllergies: "അലർജികളുള്ളവർ",
      onMedication: "മരുന്ന് കഴിക്കുന്നവർ",
      recentRecords: "സമീപകാല രേഖകൾ",
      searchRecords: "രേഖകൾ തിരയുക",
      searchDescription: "പേര്, തൊഴിലാളി ഐഡി, ഫോൺ നമ്പർ, അല്ലെങ്കിൽ രക്തഗ്രൂപ്പ് ഉപയോഗിച്ച് തിരയുക",
      searchPlaceholder: "പേര്, ഐഡി, ഫോൺ, അല്ലെങ്കിൽ രക്തഗ്രൂപ്പ് നൽകുക...",
      recentRegistrations: "സമീപത്ത് രജിസ്റ്റർ ചെയ്ത തൊഴിലാളികൾ",
      recentDescription: "വേഗത്തിൽ ആക്സസ് ചെയ്യുന്നതിനുള്ള ഏറ്റവും പുതിയ തൊഴിലാളി രജിസ്ട്രേഷനുകൾ",
      medicalAlerts: "മെഡിക്കൽ അലേർട്ടുകൾ",
      workersWithAllergies: "അലർജികളുള്ള തൊഴിലാളികൾ",
      workersOnMedication: "മരുന്ന് കഴിക്കുന്ന തൊഴിലാളികൾ",
      noAllergiesRecorded: "രേഖപ്പെടുത്തിയ അലർജികളുള്ള തൊഴിലാളികൾ ഇല്ല.",
      noMedicationsRecorded: "രേഖപ്പെടുത്തിയ മരുന്നുകളുള്ള തൊഴിലാളികൾ ഇല്ല.",
      viewDetails: "വിശദാംശങ്ങൾ കാണുക",
      registered: "രജിസ്റ്റർ ചെയ്തു",
      noRecentRecords: "സമീപകാല രേഖകൾ ലഭ്യമല്ല.",
      noWorkersMatch: "നിങ്ങളുടെ തിരയലുമായി പൊരുത്തപ്പെടുന്ന തൊഴിലാളികൾ ഇല്ല.",
      noWorkerRecords: "തൊഴിലാളി രേഖകൾ ലഭ്യമല്ല.",
    },
    documents: {
      title: "മെഡിക്കൽ രേഖകൾ",
      uploadTitle: "മെഡിക്കൽ രേഖ അപ്‌ലോഡ് ചെയ്യുക",
      uploadDescription: "കുറിപ്പുകൾ, ലാബ് റിപ്പോർട്ടുകൾ, വാക്സിനേഷൻ കാർഡുകൾ, മറ്റ് മെഡിക്കൽ രേഖകൾ എന്നിവ അപ്‌ലോഡ് ചെയ്യുക",
      selectFile: "ഫയൽ തിരഞ്ഞെടുക്കുക",
      documentType: "രേഖയുടെ തരം",
      description: "വിവരണം (ഓപ്ഷണൽ)",
      descriptionPlaceholder: "രേഖയുടെ ഹ്രസ്വ വിവരണം...",
      supportedFormats: "പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ: PDF, JPG, PNG (പരമാവധി 5MB)",
      documentSecurity: "രേഖ സുരക്ഷയും സ്വകാര്യതയും",
      securityPoints: [
        "രേഖകൾ സംഭരിക്കുന്നതിന് മുമ്പ് എൻക്രിപ്റ്റ് ചെയ്യുന്നു",
        "നിങ്ങൾക്കും അധികാരമുള്ള ആരോഗ്യ പ്രവർത്തകർക്കും മാത്രമേ നിങ്ങളുടെ രേഖകൾ ആക്സസ് ചെയ്യാൻ കഴിയൂ",
        "എല്ലാ രേഖ ആക്സസും സുരക്ഷയ്ക്കായി ലോഗ് ചെയ്യുന്നു",
        "നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും രേഖകൾ ഇല്ലാതാക്കാം",
      ],
      consentText: "ഈ മെഡിക്കൽ രേഖ അപ്‌ലോഡ് ചെയ്യുന്നതിന് ഞാൻ സമ്മതിക്കുകയും സുരക്ഷാ നടപടികൾ മനസ്സിലാക്കുകയും ചെയ്യുന്നു",
      uploading: "അപ്‌ലോഡ് ചെയ്യുന്നു...",
      uploadDocument: "രേഖ അപ്‌ലോഡ് ചെയ്യുക",
      myDocuments: "എന്റെ രേഖകൾ",
      myDocumentsDescription: "നിങ്ങൾ അപ്‌ലോഡ് ചെയ്ത മെഡിക്കൽ രേഖകൾ",
      noDocuments: "ഇതുവരെ രേഖകൾ അപ്‌ലോഡ് ചെയ്തിട്ടില്ല",
      uploadFirst: "മുകളിൽ നിങ്ങളുടെ ആദ്യത്തെ മെഡിക്കൽ രേഖ അപ്‌ലോഡ് ചെയ്യുക",
      prescription: "കുറിപ്പ്",
      labReport: "ലാബ് റിപ്പോർട്ട്",
      vaccination: "വാക്സിനേഷൻ കാർഡ്",
      medicalCertificate: "മെഡിക്കൽ സർട്ടിഫിക്കറ്റ്",
      other: "മറ്റുള്ളവ",
      selectDocumentType: "രേഖയുടെ തരം തിരഞ്ഞെടുക്കുക",
      fillAllFields: "ദയവായി എല്ലാ ആവശ്യമായ ഫീൽഡുകളും പൂരിപ്പിച്ച് സമ്മതം നൽകുക",
      fileTypeError: "PDF, JPG, PNG ഫയലുകൾ മാത്രമേ അനുവദിക്കൂ",
      fileSizeError: "ഫയൽ വലുപ്പം 5MB-യിൽ കുറവായിരിക്കണം",
      uploadError: "രേഖ അപ്‌ലോഡ് ചെയ്യുന്നതിൽ പിശക്. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
      downloadError: "രേഖ ഡൗൺലോഡ് ചെയ്യുന്നതിൽ പിശക്",
      deleteConfirm: "ഈ രേഖ ഇല്ലാതാക്കണമെന്ന് നിങ്ങൾക്ക് ഉറപ്പാണോ? ഈ പ്രവർത്തനം പഴയപടിയാക്കാൻ കഴിയില്ല.",
      encrypted: "എൻക്രിപ്റ്റഡ്",
    },
    healthCard: {
      title: "ആരോഗ്യ കാർഡ് ജനറേറ്റർ",
      healthCard: "ആരോഗ്യ രേഖ കാർഡ്",
      emergencyCard: "അടിയന്തര ആരോഗ്യ കാർഡ്",
      workerName: "പേര്",
      workerId: "തൊഴിലാളി ഐഡി",
      bloodGroup: "രക്തഗ്രൂപ്പ്",
      allergies: "അലർജികൾ",
      emergencyContact: "അടിയന്തര ബന്ധം",
      issuedBy: "കേരള ആരോഗ്യ വകുപ്പ് നൽകിയത്",
      scanForDetails: "പൂർണ്ണ ആരോഗ്യ രേഖയ്ക്കായി QR കോഡ് സ്കാൻ ചെയ്യുക",
      noAllergies: "അറിയപ്പെടുന്ന അലർജികൾ ഇല്ല",
      downloadPNG: "PNG ആയി ഡൗൺലോഡ് ചെയ്യുക",
      downloadPDF: "PDF ആയി ഡൗൺലോഡ് ചെയ്യുക",
      printCard: "കാർഡ് പ്രിന്റ് ചെയ്യുക",
      cardStyle: "കാർഡ് ശൈലി",
      standard: "സാധാരണ",
      emergency: "അടിയന്തര",
      compact: "ചെറുത്",
      cardPreview: "കാർഡ് പ്രിവ്യൂ",
      cardInformation: "കാർഡ് വിവരങ്ങൾ",
      notSpecified: "വ്യക്തമാക്കിയിട്ടില്ല",
      notProvided: "നൽകിയിട്ടില്ല",
    },
  },

  hi: {
    common: {
      backToHome: "होम पर वापस जाएं",
      loading: "लोड हो रहा है...",
      error: "त्रुटि",
      save: "सहेजें",
      cancel: "रद्द करें",
      edit: "संपादित करें",
      delete: "हटाएं",
      download: "डाउनलोड करें",
      upload: "अपलोड करें",
      search: "खोजें",
      view: "देखें",
      print: "प्रिंट करें",
      yes: "हां",
      no: "नहीं",
      required: "आवश्यक",
      optional: "वैकल्पिक",
    },
    nav: {
      workerRecords: "श्रमिक रिकॉर्ड",
      doctorDashboard: "डॉक्टर डैशबोर्ड",
      workerDashboard: "श्रमिक डैशबोर्ड",
      searchRecords: "रिकॉर्ड खोजें",
      registerWorker: "नया श्रमिक पंजीकृत करें",
    },
    home: {
      title: "स्वास्थ्य रिकॉर्ड",
      subtitle: "प्रवासी श्रमिकों के लिए स्वास्थ्य रिकॉर्ड",
      description: "केरल में प्रवासी श्रमिकों और स्वास्थ्य प्रदाताओं के लिए डिज़ाइन किया गया सुरक्षित, सुलभ स्वास्थ्य रिकॉर्ड प्रबंधन सिस्टम।",
      keyFeatures: "मुख्य विशेषताएं",
      easyRegistration: "आसान पंजीकरण",
      easyRegistrationDesc: "आवश्यक स्वास्थ्य जानकारी के साथ त्वरित और सरल श्रमिक पंजीकरण",
      easyRegistrationDetail: "श्रमिक विवरण, स्वास्थ्य इतिहास कैप्चर करने और अद्वितीय आईडी जेनरेट करने के लिए सुव्यवस्थित फॉर्म",
      qrCodeAccess: "QR कोड एक्सेस",
      qrCodeAccessDesc: "QR कोड के माध्यम से स्वास्थ्य रिकॉर्ड तक तत्काल पहुंच",
      qrCodeAccessDetail: "प्रत्येक श्रमिक को अपनी स्वास्थ्य जानकारी तक त्वरित पहुंच के लिए एक अद्वितीय QR कोड मिलता है",
      securePrivate: "सुरक्षित और निजी",
      securePrivateDesc: "एंड-टू-एंड एन्क्रिप्शन और सुरक्षित डेटा स्टोरेज",
      securePrivateDetail:
        "सभी स्वास्थ्य डेटा एन्क्रिप्ट किया जाता है और उचित सहमति प्रबंधन के साथ सुरक्षित रूप से संग्रहीत किया जाता है",
      footer: "© 2025 स्वास्थ्य रिकॉर्ड सिस्टम। प्रवासी श्रमिक स्वास्थ्य पहुंच के लिए निर्मित।",
    },
    registration: {
      title: "नया श्रमिक पंजीकृत करें",
      formTitle: "श्रमिक पंजीकरण फॉर्म",
      formDescription:
        "नया श्रमिक स्वास्थ्य रिकॉर्ड बनाने के लिए कृपया सभी आवश्यक जानकारी भरें। सभी संवेदनशील डेटा एन्क्रिप्ट किया जाता है और सुरक्षित रूप से संग्रहीत किया जाता है।",
      personalInfo: "व्यक्तिगत जानकारी",
      locationInfo: "स्थान की जानकारी",
      healthInfo: "स्वास्थ्य जानकारी",
      healthInfoEncrypted: "स्वास्थ्य जानकारी (एन्क्रिप्टेड)",
      fullName: "पूरा नाम",
      dateOfBirth: "जन्म तिथि",
      gender: "लिंग",
      phoneNumber: "फोन नंबर",
      nativeState: "मूल राज्य",
      nativeDistrict: "मूल जिला",
      currentAddress: "वर्तमान पता",
      currentAddressKerala: "केरल में वर्तमान पता",
      bloodGroup: "रक्त समूह",
      allergies: "ज्ञात एलर्जी",
      allergiesPlaceholder: "किसी भी ज्ञात एलर्जी की सूची बनाएं...",
      currentMedication: "वर्तमान दवाएं",
      currentMedicationPlaceholder: "वर्तमान दवाओं की सूची बनाएं...",
      healthHistory: "स्वास्थ्य इतिहास",
      healthHistoryPlaceholder: "पिछली बीमारियां, सर्जरी, पुरानी स्थितियां...",
      dataPrivacySecurity: "डेटा गोपनीयता और सुरक्षा",
      privacyPoints: [
        "सभी संवेदनशील स्वास्थ्य जानकारी भंडारण से पहले एन्क्रिप्ट की जाती है",
        "डेटा एक्सेस लॉग किया जाता है और सुरक्षा के लिए निगरानी की जाती है",
        "जानकारी का उपयोग केवल स्वास्थ्य उद्देश्यों के लिए किया जाता है",
        "आपको अपने डेटा तक पहुंचने, संशोधित करने या हटाने का अधिकार है",
      ],
      consentText:
        "मैं स्वास्थ्य उद्देश्यों के लिए अपने डेटा के संग्रहीत होने से सहमत हूं और डेटा गोपनीयता और सुरक्षा उपायों के संबंध में अपने अधिकारों को समझता हूं।",
      registerWorker: "श्रमिक पंजीकृत करें",
      savingSecurely: "सुरक्षित रूप से सहेज रहे हैं...",
      male: "पुरुष",
      female: "महिला",
      other: "अन्य",
      selectBloodGroup: "रक्त समूह चुनें",
      selectGender: "लिंग चुनें",
      errors: {
        fullNameRequired: "पूरा नाम आवश्यक है",
        fullNameInvalid: "पूरे नाम में अमान्य वर्ण हैं",
        dobRequired: "जन्म तिथि आवश्यक है",
        ageRange: "आयु 16 और 100 वर्ष के बीच होनी चाहिए",
        genderRequired: "लिंग आवश्यक है",
        nativeStateRequired: "मूल राज्य आवश्यक है",
        nativeDistrictRequired: "मूल जिला आवश्यक है",
        currentAddressRequired: "वर्तमान पता आवश्यक है",
        phoneInvalid: "अमान्य फोन नंबर प्रारूप",
        consentRequired: "आगे बढ़ने के लिए सहमति आवश्यक है",
        savingError: "रिकॉर्ड सहेजने में त्रुटि। कृपया पुनः प्रयास करें।",
      },
    },
    dashboard: {
      title: "श्रमिक डैशबोर्ड",
      enterWorkerId: "अपना श्रमिक आईडी दर्ज करें",
      loadProfile: "मेरी प्रोफ़ाइल लोड करें",
      personalInfo: "व्यक्तिगत जानकारी",
      locationInfo: "स्थान की जानकारी",
      healthInfo: "स्वास्थ्य जानकारी",
      healthTimeline: "स्वास्थ्य इतिहास",
      qrCode: "मेरा स्वास्थ्य कार्ड",
      documents: "मेरे दस्तावेज़",
      downloadCard: "स्वास्थ्य कार्ड डाउनलोड करें",
      uploadDocument: "दस्तावेज़ अपलोड करें",
      age: "उम्र",
      bloodGroup: "रक्त समूह",
      allergies: "एलर्जी",
      medications: "वर्तमान दवाएं",
      healthHistory: "स्वास्थ्य इतिहास",
      nativePlace: "मूल स्थान",
      currentAddress: "वर्तमान पता",
      registrationDate: "पंजीकरण तिथि",
      noAllergies: "कोई ज्ञात एलर्जी नहीं",
      noMedications: "कोई वर्तमान दवाएं नहीं",
      noHealthHistory: "कोई स्वास्थ्य इतिहास दर्ज नहीं",
      quickActions: "त्वरित क्रियाएं",
      generateProfessionalCard: "पेशेवर कार्ड जेनरेट करें",
      documentsUploaded: "दस्तावेज़ अपलोड किए गए",
      noDocumentsYet: "अभी तक कोई दस्तावेज़ नहीं",
    },
    doctor: {
      title: "डॉक्टर डैशबोर्ड",
      subtitle: "प्रवासी श्रमिक स्वास्थ्य रिकॉर्ड",
      qrScanner: "QR स्कैनर",
      auditLogs: "ऑडिट लॉग",
      totalWorkers: "कुल श्रमिक",
      withAllergies: "एलर्जी वाले",
      onMedication: "दवा पर",
      recentRecords: "हाल के रिकॉर्ड",
      searchRecords: "रिकॉर्ड खोजें",
      searchDescription: "नाम, श्रमिक आईडी, फोन नंबर, या रक्त समूह द्वारा खोजें",
      searchPlaceholder: "नाम, आईडी, फोन, या रक्त समूह दर्ज करें...",
      recentRegistrations: "हाल ही में पंजीकृत श्रमिक",
      recentDescription: "त्वरित पहुंच के लिए नवीनतम श्रमिक पंजीकरण",
      medicalAlerts: "चिकित्सा अलर्ट",
      workersWithAllergies: "एलर्जी वाले श्रमिक",
      workersOnMedication: "दवा पर श्रमिक",
      noAllergiesRecorded: "दर्ज एलर्जी वाले कोई श्रमिक नहीं।",
      noMedicationsRecorded: "दर्ज दवाओं वाले कोई श्रमिक नहीं।",
      viewDetails: "विवरण देखें",
      registered: "पंजीकृत",
      noRecentRecords: "कोई हाल के रिकॉर्ड उपलब्ध नहीं।",
      noWorkersMatch: "आपकी खोज से मेल खाने वाले कोई श्रमिक नहीं।",
      noWorkerRecords: "कोई श्रमिक रिकॉर्ड उपलब्ध नहीं।",
    },
    documents: {
      title: "चिकित्सा दस्तावेज़",
      uploadTitle: "चिकित्सा दस्तावेज़ अपलोड करें",
      uploadDescription: "प्रिस्क्रिप्शन, लैब रिपोर्ट, वैक्सीनेशन कार्ड, और अन्य चिकित्सा दस्तावेज़ अपलोड करें",
      selectFile: "फ़ाइल चुनें",
      documentType: "दस्तावेज़ प्रकार",
      description: "विवरण (वैकल्पिक)",
      descriptionPlaceholder: "दस्तावेज़ का संक्षिप्त विवरण...",
      supportedFormats: "समर्थित प्रारूप: PDF, JPG, PNG (अधिकतम 5MB)",
      documentSecurity: "दस्तावेज़ सुरक्षा और गोपनीयता",
      securityPoints: [
        "दस्तावेज़ भंडारण से पहले एन्क्रिप्ट किए जाते हैं",
        "केवल आप और अधिकृत स्वास्थ्य प्रदाता आपके दस्तावेज़ों तक पहुंच सकते हैं",
        "सभी दस्तावेज़ पहुंच सुरक्षा के लिए लॉग की जाती है",
        "आप किसी भी समय दस्तावेज़ हटा सकते हैं",
      ],
      consentText: "मैं इस चिकित्सा दस्तावेज़ को अपलोड करने के लिए सहमति देता हूं और सुरक्षा उपायों को समझता हूं",
      uploading: "अपलोड हो रहा है...",
      uploadDocument: "दस्तावेज़ अपलोड करें",
      myDocuments: "मेरे दस्तावेज़",
      myDocumentsDescription: "आपके अपलोड किए गए चिकित्सा दस्तावेज़",
      noDocuments: "अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया",
      uploadFirst: "ऊपर अपना पहला चिकित्सा दस्तावेज़ अपलोड करें",
      prescription: "प्रिस्क्रिप्शन",
      labReport: "लैब रिपोर्ट",
      vaccination: "वैक्सीनेशन कार्ड",
      medicalCertificate: "चिकित्सा प्रमाणपत्र",
      other: "अन्य",
      selectDocumentType: "दस्तावेज़ प्रकार चुनें",
      fillAllFields: "कृपया सभी आवश्यक फ़ील्ड भरें और सहमति प्रदान करें",
      fileTypeError: "केवल PDF, JPG, और PNG फ़ाइलों की अनुमति है",
      fileSizeError: "फ़ाइल का आकार 5MB से कम होना चाहिए",
      uploadError: "दस्तावेज़ अपलोड करने में त्रुटि। कृपया पुनः प्रयास करें।",
      downloadError: "दस्तावेज़ डाउनलोड करने में त्रुटि",
      deleteConfirm: "क्या आप वाकई इस दस्तावेज़ को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।",
      encrypted: "एन्क्रिप्टेड",
    },
    healthCard: {
      title: "स्वास्थ्य कार्ड जेनरेटर",
      healthCard: "स्वास्थ्य रिकॉर्ड कार्ड",
      emergencyCard: "आपातकालीन स्वास्थ्य कार्ड",
      workerName: "नाम",
      workerId: "श्रमिक आईडी",
      bloodGroup: "रक्त समूह",
      allergies: "एलर्जी",
      emergencyContact: "आपातकालीन संपर्क",
      issuedBy: "केरल स्वास्थ्य विभाग द्वारा जारी",
      scanForDetails: "पूर्ण स्वास्थ्य रिकॉर्ड के लिए QR कोड स्कैन करें",
      noAllergies: "कोई ज्ञात एलर्जी नहीं",
      downloadPNG: "PNG के रूप में डाउनलोड करें",
      downloadPDF: "PDF के रूप में डाउनलोड करें",
      printCard: "कार्ड प्रिंट करें",
      cardStyle: "कार्ड शैली",
      standard: "मानक",
      emergency: "आपातकालीन",
      compact: "संक्षिप्त",
      cardPreview: "कार्ड पूर्वावलोकन",
      cardInformation: "कार्ड जानकारी",
      notSpecified: "निर्दिष्ट नहीं",
      notProvided: "प्रदान नहीं किया गया",
    },
  },
}

export function useTranslations(language = "en"): Translations {
  return translations[language] || translations.en
}
