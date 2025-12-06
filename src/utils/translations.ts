import { Language } from '@/state/pensieveState';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    memoryPreserved: "Memory Preserved",
    threadSpun: "The thread has been spun.",
    close: "Close",
    castMemory: "Cast Memory",
    pourThoughts: "Pour your thoughts into the basin",
    writeMemory: "Write your memory here...",
    secretKey: "Secret Key",
    wordToSeal: "A word to seal it",
    discard: "Discard",
    sealedMemory: "Sealed Memory",
    memoryLiesWithin: "A memory lies within",
    speakWord: "Speak the word",
    reveal: "Reveal",
    returnToBasin: "Return to the Basin",
    touchToOffer: "Touch the liquid to offer a memory",
    selectLanguage: "Language"
  },
  zh: {
    memoryPreserved: "记忆已封存",
    threadSpun: "记忆之线已纺成",
    close: "关闭",
    castMemory: "封存记忆",
    pourThoughts: "将思绪倾入冥想盆",
    writeMemory: "在此写下你的记忆...",
    secretKey: "密语",
    wordToSeal: "封印之词",
    discard: "丢弃",
    sealedMemory: "尘封记忆",
    memoryLiesWithin: "一段记忆沉睡于此",
    speakWord: "说出密语",
    reveal: "显形",
    returnToBasin: "返回冥想盆",
    touchToOffer: "轻触液体以通过记忆",
    selectLanguage: "语言"
  },
  ko: {
    memoryPreserved: "기억이 보존됨",
    threadSpun: "실이 자아졌습니다.",
    close: "닫기",
    castMemory: "기억 주조",
    pourThoughts: "생각을 펜시브에 쏟으세요",
    writeMemory: "여기에 기억을 적으세요...",
    secretKey: "비밀 열쇠",
    wordToSeal: "봉인할 단어",
    discard: "버리기",
    sealedMemory: "봉인된 기억",
    memoryLiesWithin: "기억이 그 안에 있습니다",
    speakWord: "단어를 말하세요",
    reveal: "드러내다",
    returnToBasin: "펜시브로 돌아가기",
    touchToOffer: "기억을 제공하려면 액체를 터치하세요",
    selectLanguage: "언어"
  },
  ja: {
    memoryPreserved: "記憶は保存されました",
    threadSpun: "糸は紡がれました。",
    close: "閉じる",
    castMemory: "記憶を投じる",
    pourThoughts: "思考を水盆に注いでください",
    writeMemory: "ここに記憶を記してください...",
    secretKey: "秘密の鍵",
    wordToSeal: "封印の言葉",
    discard: "破棄",
    sealedMemory: "封印された記憶",
    memoryLiesWithin: "記憶がそこにあります",
    speakWord: "言葉を唱えてください",
    reveal: "明かす",
    returnToBasin: "水盆に戻る",
    touchToOffer: "記憶を捧げるには液体に触れてください",
    selectLanguage: "言語"
  },
  fr: {
    memoryPreserved: "Mémoire Préservée",
    threadSpun: "Le fil a été tissé.",
    close: "Fermer",
    castMemory: "Lancer la Mémoire",
    pourThoughts: "Versez vos pensées dans la bassine",
    writeMemory: "Écrivez votre mémoire ici...",
    secretKey: "Clé Secrète",
    wordToSeal: "Un mot pour le sceller",
    discard: "Jeter",
    sealedMemory: "Mémoire Scellée",
    memoryLiesWithin: "Une mémoire réside à l'intérieur",
    speakWord: "Prononcez le mot",
    reveal: "Révéler",
    returnToBasin: "Retourner à la Bassine",
    touchToOffer: "Touchez le liquide pour offrir une mémoire",
    selectLanguage: "Langue"
  },
  spell: {
    memoryPreserved: "Conservio Memoria",
    threadSpun: "Filum Expletum",
    close: "Claudenum",
    castMemory: "Memoriam Iacere",
    pourThoughts: "Cogitatio Effundio",
    writeMemory: "Scribo Memoria...",
    secretKey: "Clavis Arcana",
    wordToSeal: "Verbum Sigillum",
    discard: "Evanesco",
    sealedMemory: "Memoria Obsignata",
    memoryLiesWithin: "Latet Intus",
    speakWord: "Dicere Verbum",
    reveal: "Aparecium",
    returnToBasin: "Redire Pelvim",
    touchToOffer: "Tange Offerus",
    selectLanguage: "Lingua"
  }
};

export const useTranslation = (lang: Language) => {
  return translations[lang] || translations.en;
};
