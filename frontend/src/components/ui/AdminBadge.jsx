// import { Shield } from 'lucide-react';
import { BadgeCheck } from 'lucide-react';
const AdminBadge = ({ className = "" }) => (

<span className="inline-flex items-center bg-transparent text-slate-500 font-bold text-xs rounded-full font-medium">
    <BadgeCheck className="w-4 h-4 " strokeWidth={3} />
  </span>
  //   <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
//     <Shield className="w-3 h-3" />
//     Admin
//   </span>
);

export default AdminBadge; 