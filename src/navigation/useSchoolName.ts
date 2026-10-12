import { useQuery } from '@tanstack/react-query';
import i18n from 'i18next';
import apiClient from '../api/apiClient';
import app from '../../app.json';

interface SchoolSettings {
  schoolName: string | null;
  schoolNameAr: string | null;
}

/** GET /api/school/settings (any signed-in user): Arabic name in Arabic, Latin name otherwise; the app name until it loads. */
export const useSchoolName = (): string => {
  const { data } = useQuery({
    queryKey: ['school-settings'],
    queryFn: async () => (await apiClient.get('/school/settings')).data.data as SchoolSettings,
    staleTime: 60 * 60 * 1000,
  });
  return (i18n.language === 'ar' ? data?.schoolNameAr : data?.schoolName) || data?.schoolNameAr || app.expo.name;
};
