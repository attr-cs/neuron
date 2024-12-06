import { BadgeCheck } from 'lucide-react';

const AdminBadge = ({ className = "" }) => (
  <span className="inline-flex items-center text-blue-500 font-bold text-xs rounded-full font-medium">
    <BadgeCheck className="w-4 h-4" strokeWidth={3} />
  </span>
);

export default AdminBadge; 