export type Lang = "en" | "ta" | "hi";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" },
  { id: "ta", label: "த" },
  { id: "hi", label: "हि" },
];

const dict = {
  en: {
    brand: "Thamarai", queue: "Queue", tagline: "Scan. Sit. Savour.",
    requestTitle: "Request Token", joinQueue: "Join the queue and get your spot in line.",
    reserveSpot: "Reserve your spot and enjoy your meal without standing in the hall.",
    validating: "Validating entrance code…", invalidQr: "Invalid entrance code",
    qrNotScanned: "Entrance code not scanned",
    scanToContinue: "Scan the QR at the restaurant entrance to take a token.",
    validQr: "Entrance code accepted", completeDetails: "Fill in your details to join the waitlist.",
    fullName: "Full name", namePh: "Meena Iyer", phone: "Phone number", phonePh: "98765 43210",
    guests: "Number of guests", notes: "Notes (optional)", notesPh: "High chair, senior citizen, celebrating…",
    allowSplit: "Allow splitting the group across tables if needed",
    whatsapp: "Notify me on WhatsApp when my table is ready",
    getToken: "Get my queue token", processing: "Issuing token…", success: "You are on the list",
    track: "Track my queue status", atCounter: "I am at the restaurant",
    position: "People ahead", wait: "Est. wait", yourToken: "Your token",
    checkStatus: "Check queue status", tokenNo: "Token number", last4: "Last 4 digits of phone",
    tableAssign: "Table assignment", splitAcross: "Your group is split across multiple tables",
    waiting: "Waiting", notified: "Please come to the desk", seated: "Seated",
    completed: "Completed", cancelled: "Cancelled", selectBranch: "Select a hall", continue: "Continue",
  },
  ta: {
    brand: "தாமரை", queue: "வரிசை", tagline: "ஸ்கேன். உட்கார். ருசி.",
    requestTitle: "டோக்கன் கோரிக்கை", joinQueue: "வரிசையில் சேர்ந்து உங்கள் இடத்தை உறுதி செய்யவும்.",
    reserveSpot: "நின்று காத்திருக்காமல் உணவை அனுபவிக்க இடம் பிடிக்கவும்.",
    validating: "நுழைவு குறியீடு சரிபார்க்கப்படுகிறது…", invalidQr: "தவறான நுழைவு குறியீடு",
    qrNotScanned: "நுழைவு குறியீடு ஸ்கேன் செய்யப்படவில்லை",
    scanToContinue: "டோக்கன் எடுக்க உணவக நுழைவாயிலில் உள்ள QR ஐ ஸ்கேன் செய்யவும்.",
    validQr: "நுழைவு குறியீடு ஏற்கப்பட்டது", completeDetails: "காத்திருப்பு பட்டியலில் சேர விவரங்களை நிரப்பவும்.",
    fullName: "முழுப் பெயர்", namePh: "மீனா ஐயர்", phone: "தொலைபேசி எண்", phonePh: "98765 43210",
    guests: "விருந்தினர் எண்ணிக்கை", notes: "குறிப்பு (விருப்பம்)", notesPh: "குழந்தை நாற்காலி, மூத்த குடிமகன்…",
    allowSplit: "தேவைப்பட்டால் குழுவை பல மேசைகளில் பிரிக்க அனுமதிக்கவும்",
    whatsapp: "மேசை தயாரானதும் WhatsApp அறிவிப்பு வேண்டும்",
    getToken: "என் வரிசை டோக்கனை பெறவும்", processing: "டோக்கன் உருவாக்கப்படுகிறது…", success: "நீங்கள் பட்டியலில் உள்ளீர்கள்",
    track: "வரிசை நிலையை கண்காணிக்கவும்", atCounter: "நான் உணவகத்தில் இருக்கிறேன்",
    position: "முன்னால் உள்ளோர்", wait: "எதிர்பார்ப்பு நேரம்", yourToken: "உங்கள் டோக்கன்",
    checkStatus: "வரிசை நிலை பார்க்க", tokenNo: "டோக்கன் எண்", last4: "தொலைபேசியின் கடைசி 4 இலக்கங்கள்",
    tableAssign: "மேசை ஒதுக்கீடு", splitAcross: "உங்கள் குழு பல மேசைகளில் பிரிக்கப்பட்டுள்ளது",
    waiting: "காத்திருப்பு", notified: "கௌண்டருக்கு வாருங்கள்", seated: "அமர்த்தப்பட்டது",
    completed: "முடிந்தது", cancelled: "ரத்து", selectBranch: "கிளையை தேர்வு செய்க", continue: "தொடரவும்",
  },
  hi: {
    brand: "थामरे", queue: "कतार", tagline: "स्कैन. बैठो. स्वाद लो.",
    requestTitle: "टोकन अनुरोध", joinQueue: "कतार में शामिल हों और अपनी जगह पाएं।",
    reserveSpot: "खड़े हुए इंतजार के बिना भोजन का आनंद लें।",
    validating: "प्रवेश कोड जाँचा जा रहा है…", invalidQr: "अमान्य प्रवेश कोड",
    qrNotScanned: "प्रवेश कोड स्कैन नहीं हुआ",
    scanToContinue: "टोकन लेने के लिए रेस्तरां द्वार पर QR स्कैन करें।",
    validQr: "प्रवेश कोड स्वीकृत", completeDetails: "वेटलिस्ट में जुड़ने के लिए विवरण भरें।",
    fullName: "पूरा नाम", namePh: "मीना अय्यर", phone: "फ़ोन नंबर", phonePh: "98765 43210",
    guests: "अतिथियों की संख्या", notes: "नोट (वैकल्पिक)", notesPh: "हाई चेयर, वरिष्ठ नागरिक…",
    allowSplit: "ज़रूरत हो तो समूह को कई टेबलों में बाँटने दें",
    whatsapp: "टेबल तैयार होने पर WhatsApp सूचना दें",
    getToken: "मेरा कतार टोकन लें", processing: "टोकन बन रहा है…", success: "आप सूची में हैं",
    track: "कतार की स्थिति देखें", atCounter: "मैं रेस्तरां में हूँ",
    position: "आगे के लोग", wait: "अनुमानित प्रतीक्षा", yourToken: "आपका टोकन",
    checkStatus: "कतार की स्थिति", tokenNo: "टोकन संख्या", last4: "फ़ोन के अंतिम 4 अंक",
    tableAssign: "टेबल आवंटन", splitAcross: "आपका समूह कई टेबलों में बँटा है",
    waiting: "प्रतीक्षा", notified: "डेस्क पर आएँ", seated: "बैठाया गया",
    completed: "पूर्ण", cancelled: "रद्द", selectBranch: "शाखा चुनें", continue: "जारी रखें",
  },
} as const;

export type CopyKey = keyof typeof dict.en;

export function t(lang: Lang, key: CopyKey): string {
  return dict[lang][key];
}
