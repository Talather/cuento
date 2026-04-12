
import { ProfilesTable } from './database/profiles';

export interface AdminUserType {
  id: string;
  email?: string | null;
  created_at?: string | null;
  profile?: ProfilesTable['Row'];
  stories_count?: number;
}
