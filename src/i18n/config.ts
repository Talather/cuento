import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './translations/en';
import { es } from './translations/es';
 import { pt } from './translations/pt';

i18n
  .use(initReactI18next)
  .init({
    lng: 'es', // Force Spanish
    fallbackLng: 'es',
    resources: {
      es: {
        translation: es
      },
      en: {
        translation: en
       },
       pt: {
         translation: pt
       }
    },
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;