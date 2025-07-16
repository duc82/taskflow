import { useContext } from 'react';
import { AuthContext } from '../providers/UserProvider';

export default function useUser() {
  return useContext(AuthContext);
}
