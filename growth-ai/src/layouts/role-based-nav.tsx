import type { UserRole } from '@/types/user';
import { navData } from './config-nav-dashboard';

export function getFilteredNavData(role: UserRole) {
    const dataClone = navData.map((subheader) => {
      return {
        ...subheader,
        items: subheader.items.map((item) => {
          return { ...item };
        }),
      };
    });
  
    switch (role) {
      case 'admin':
        dataClone.forEach((subheader) => {
          subheader.items = subheader.items.filter(
            (item) => item.title !== 'Evaluation Process' && item.title !== 'View Assignments'
          );
        });
        break;
      case 'client':
        dataClone.forEach((subheader) => {
          subheader.items = subheader.items.filter(
            (item) => item.title !== 'Manage Evaluations' && item.title !== 'Process Tests' && item.title !== 'Manage Assignments' && item.title !== 'Assignments Templates' && item.title !== 'Academic Management'
          );
        });
        break;
      default:
        break;
    }
  
    const filteredData = dataClone.filter((sh) => sh.items.length > 0);
    return filteredData;
}
  
