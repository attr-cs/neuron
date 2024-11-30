import { useEffect, useState } from "react";
import axios from 'axios';
import defaultImage from '../assets/default_profile_avatar.png';
import { authState } from '../store/atoms';
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCircle, Mail, Calendar, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function UsersPage() {
  const navigate = useNavigate();
  const auth = useRecoilValue(authState);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/userslist`);
        if (response.status === 200) {
          const usersList = response.data.users.filter(user => user._id !== auth.userId);
          setUsers(usersList);
        }
      } catch (err) {
        console.log("Failed to fetch users! : ", err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [auth.userId]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center">Users</h1>
      </motion.div>
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
          icon={<Search className="text-gray-400" />}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <motion.div
            key={user._id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <img
                  referrerPolicy="no-referrer"
                  src={user.profileImageUrl || defaultImage}
                  alt="profile_image"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <CardTitle>{`${user.firstname} ${user.lastname}`}</CardTitle>
                  <CardDescription>@{user.username}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {filteredUsers.length === 0 && (
        <div className="text-center mt-8">
          <UserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No users found</p>
        </div>
      )}
    </div>
  );
}

export default UsersPage;

