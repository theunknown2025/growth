import { paths } from '@/routes/paths';
import { MessageCircle, Settings, Sparkles ,ClipboardList , Activity , PlusCircle , BookOpen}  from 'lucide-react';

export const navData = [
  {
    items: [
      {
        title: 'Growth Chat',
        path: paths.dashboard.chat,
        icon: <MessageCircle size={20} />,
      },
      {
        title: 'Manage Evaluations',
        path: paths.dashboard.manage,
        icon: <Activity size={20} />,
      },
      {
        title: 'Evaluation Process',
        path: paths.dashboard.evaluation,
        icon: <Sparkles size={20} />,
      },
      {
        title: 'User Settings',
        path: paths.dashboard.settings,
        icon: <Settings size={20} />,
      },
      {
        title: 'Manage Assignments',
        path: paths.dashboard.assignements.root,
        icon: <ClipboardList size={20} />,
      },
      {
        title: 'Assignments Templates',
        path: paths.dashboard.assignmentTemplates.root,
        icon:  <PlusCircle size={20} />,
      },
      {
        title: 'Academic Management',
        icon:  <BookOpen size={20} />,
      },
      {
        title: 'View Assignments',
        path: paths.dashboard.processing.root,
        icon: <ClipboardList size={20} />,
      },
    ],
  },
];
