import { useTranslation } from "react-i18next";
import { AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

export const AuthModalHeader = () => {
  const { t } = useTranslation();
  
  return (
    <AlertDialogHeader>
      <AlertDialogTitle>{t('auth.modal.title')}</AlertDialogTitle>
      <AlertDialogDescription className="mb-6">
        {t('auth.modal.description')}
      </AlertDialogDescription>
    </AlertDialogHeader>
  );
};

