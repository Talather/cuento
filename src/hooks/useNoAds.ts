
import { useLocation } from 'react-router-dom';

export const useNoAds = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  return searchParams.has('noads');
};
