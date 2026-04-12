import { useTranslation } from 'react-i18next';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from './ui/dropdown-menu';
 import { Button } from './ui/button';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

   const languages = [
     { code: 'es', flag: '🇪🇸', label: 'Español' },
     { code: 'en', flag: '🇺🇸', label: 'English' },
     { code: 'pt', flag: '🇧🇷', label: 'Português' },
   ];
 
   const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
 
   const changeLanguage = (langCode: string) => {
     i18n.changeLanguage(langCode);
  };

  return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button
           variant="ghost"
           size="icon"
           className="w-9 px-0 text-lg"
           title="Change language"
         >
           {currentLang.flag}
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end">
         {languages.map((lang) => (
           <DropdownMenuItem
             key={lang.code}
             onClick={() => changeLanguage(lang.code)}
             className="cursor-pointer"
           >
             <span className="mr-2">{lang.flag}</span>
             {lang.label}
           </DropdownMenuItem>
         ))}
       </DropdownMenuContent>
     </DropdownMenu>
  );
};