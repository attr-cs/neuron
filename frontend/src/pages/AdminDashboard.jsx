import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { authState, userBasicInfoState } from '../store/atoms';
import {
  Users,
  Activity,
  BarChart2,
  Settings,
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersList from '@/components/admin/UsersList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const auth = useRecoilValue(authState);
  const userBasicInfo = useRecoilValue(userBasicInfoState);
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Users', value: users.length, icon: Users, color: 'blue' },
    { title: 'Active Users', value: users.filter(u => u.status === 'active').length, icon: Activity, color: 'green' },
    { title: 'New Today', value: 12, icon: BarChart2, color: 'purple' },
  ];

  useEffect(() => {
    if (!userBasicInfo.isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    // Your existing useEffect code for fetching users
    setTimeout(() => {
      setUsers([
        {
          _id: '1',
          username: 'johndoe',
          email: 'john@example.com',
          status: 'active',
          isAdmin: true,
          lastSeen: new Date(),
          createdAt: new Date(),
          profileImageUrl: 'https://i.pravatar.cc/150?img=1'
        },
        // Add more mock users as needed
      ]);
      setLoading(false);
    }, 1000);
  }, [auth.isAdmin, navigate]);

  const handleUpdateStatus = async (userId, newStatus) => {
    // Implement status update logic
    console.log('Updating status:', userId, newStatus);
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log('Exporting data...');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 py-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform and users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button variant="default">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="flex items-center p-6">
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10 mr-4`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActiveFilter('all')}>
                  All Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('active')}>
                  Active Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveFilter('inactive')}>
                  Inactive Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <UsersList users={users} onUpdateStatus={handleUpdateStatus} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 