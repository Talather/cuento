import { useTranslation } from "react-i18next";
import { ProfileForm } from "@/components/profile/ProfileForm";

const Profile = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t('nav.edit_profile')}</h1>
      <ProfileForm onSuccess={() => {}} />
    </div>
  );
};

export default Profile;