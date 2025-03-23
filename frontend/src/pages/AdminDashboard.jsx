import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import defaultAvatar from '@/utils/defaultAvatar';

const ITEMS_PER_PAGE = 10;
const TABLE_HEIGHT = "calc(100vh - 400px)"; // Adjust this value as needed

const AdminDashboard = () => {
  const { toast } = useToast();
  const auth = useRecoilValue(authState);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [loading, setLoading] = useState({
    reports: true,
    messages: true,
    users: true,
    broadcast: false
  });

  // Pagination states
  const [page, setPage] = useState({
    reports: 1,
    messages: 1,
    users: 1
  });
  const [hasMore, setHasMore] = useState({
    reports: true,
    messages: true,
    users: true
  });

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${auth.token}`
    }
  });

  const loadMore = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    
    if (type === 'reports') {
      setPage(prev => ({ ...prev, reports: prev.reports + 1 }));
      await fetchReports();
    } else if (type === 'messages') {
      setPage(prev => ({ ...prev, messages: prev.messages + 1 }));
      await fetchLatestMessages();
    } else if (type === 'users') {
      setPage(prev => ({ ...prev, users: prev.users + 1 }));
      await fetchUsers();
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axiosInstance.get(`/report/all?page=${page.reports}&limit=${ITEMS_PER_PAGE}`);
      const formattedReports = response.data.reports.map(report => ({
        ...report,
        targetUser: {
          ...report.targetUser,
          isBanned: Boolean(report.targetUser.isBanned),
          isAdmin: Boolean(report.targetUser.isAdmin)
        }
      }));

      if (page.reports === 1) {
        setReports(formattedReports);
      } else {
        const newReports = formattedReports.filter(
          newReport => !reports.some(existingReport => existingReport._id === newReport._id)
        );
        setReports(prev => [...prev, ...newReports]);
      }
      setHasMore(prev => ({ ...prev, reports: response.data.reports.length === ITEMS_PER_PAGE }));
      setLoading(prev => ({ ...prev, reports: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching reports",
        description: error.response?.data?.message || "Something went wrong"
      });
      setLoading(prev => ({ ...prev, reports: false }));
    }
  };

  const fetchLatestMessages = async () => {
    try {
      const response = await axiosInstance.get(`/chat/latest-messages?page=${page.messages}&limit=${ITEMS_PER_PAGE}`);
      const formattedMessages = response.data.messages.map(message => ({
        ...message,
        sender: {
          ...message.sender,
          isBanned: Boolean(message.sender.isBanned),
          isAdmin: Boolean(message.sender.isAdmin)
        }
      }));

      if (page.messages === 1) {
        setMessages(formattedMessages);
      } else {
        const newMessages = formattedMessages.filter(
          newMessage => !messages.some(existingMessage => existingMessage._id === newMessage._id)
        );
        setMessages(prev => [...prev, ...newMessages]);
      }
      setHasMore(prev => ({ ...prev, messages: response.data.messages.length === ITEMS_PER_PAGE }));
      setLoading(prev => ({ ...prev, messages: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching messages",
        description: error.response?.data?.message || "Something went wrong"
      });
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(`/admin/users?page=${page.users}&limit=${ITEMS_PER_PAGE}`);
      if (page.users === 1) {
        // Reset the list for first page
        setUsers(response.data.users);
      } else {
        // Filter out duplicates when appending new data
        const newUsers = response.data.users.filter(
          newUser => !users.some(existingUser => existingUser._id === newUser._id)
        );
        setUsers(prev => [...prev, ...newUsers]);
      }
      setHasMore(prev => ({ 
        ...prev, 
        users: response.data.hasMore 
      }));
      setLoading(prev => ({ ...prev, users: false }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching users",
        description: error.response?.data?.message || "Something went wrong"
      });
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  useEffect(() => {
    if (auth.token && page.reports === 1) fetchReports();
  }, [auth.token]);

  useEffect(() => {
    if (auth.token && page.messages === 1) fetchLatestMessages();
  }, [auth.token]);

  useEffect(() => {
    if (auth.token && page.users === 1) fetchUsers();
  }, [auth.token]);

  const handleBanUser = async (userId) => {
    try {
      const response = await axiosInstance.post('/user/ban', { userId });
      toast({
        title: "Success",
        description: "User banned successfully"
      });
      // Update the users state to reflect the change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isBanned: true } : user
        )
      );
      // Also update reports and messages lists if they contain the banned user
      setReports(prevReports =>
        prevReports.map(report =>
          report.targetUser._id === userId ? 
          { ...report, targetUser: { ...report.targetUser, isBanned: true } } : report
        )
      );
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.sender._id === userId ? 
          { ...message, sender: { ...message.sender, isBanned: true } } : message
        )
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error banning user",
        description: error.response?.data?.message || "Something went wrong"
      });
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      const response = await axiosInstance.post('/user/unban', { userId });
      toast({
        title: "Success",
        description: "User unbanned successfully"
      });
      // Update the users state to reflect the change
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isBanned: false } : user
        )
      );
      // Also update reports and messages lists if they contain the unbanned user
      setReports(prevReports =>
        prevReports.map(report =>
          report.targetUser._id === userId ? 
          { ...report, targetUser: { ...report.targetUser, isBanned: false } } : report
        )
      );
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.sender._id === userId ? 
          { ...message, sender: { ...message.sender, isBanned: false } } : message
        )
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error unbanning user",
        description: error.response?.data?.message || "Something went wrong"
      });
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await axiosInstance.put(`/report/resolve/${reportId}`);
      toast({
        title: "Success",
        description: "Report resolved successfully"
      });
      // Refresh reports
      fetchReports();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error resolving report",
        description: error.response?.data?.message || "Something went wrong"
      });
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Broadcast message cannot be empty"
      });
      return;
    }

    setLoading(prev => ({ ...prev, broadcast: true }));
    try {
      await axiosInstance.post('/admin/broadcast', { message: broadcastMessage });
      toast({
        title: "Success",
        description: "Broadcast message sent successfully"
      });
      setBroadcastMessage('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sending broadcast",
        description: error.response?.data?.message || "Something went wrong"
      });
    }
    setLoading(prev => ({ ...prev, broadcast: false }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>
      
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="messages">Recent Messages</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Manage reported content and users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div 
                  style={{ 
                    height: TABLE_HEIGHT, 
                    overflowY: 'auto', 
                    overflowX: 'auto' 
                  }} 
                  className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                >
                  <div className="min-w-[1000px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Target User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report._id}>
                            <TableCell><Link to={`/profile/${report.reporter.username}`}>{report.reporter.username}</Link></TableCell>
                            <TableCell><Link to={`/profile/${report.targetUser.username}`}>{report.targetUser.username}</Link></TableCell>
                        <TableCell>{report.targetType}</TableCell>
                        <TableCell>{report.reasons.join(', ')}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {report.targetUser.isBanned ? (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleUnbanUser(report.targetUser._id)}
                                disabled={report.targetUser.isAdmin}
                              >
                                Unban User
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleBanUser(report.targetUser._id)}
                                disabled={report.targetUser.isAdmin}
                              >
                                Ban User
                              </Button>
                            )}
                            {report.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveReport(report._id)}
                                className="ml-2"
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  </div>
                {loading.reports ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" />
                  </div>
                ) : hasMore.reports && (
                  <div className="text-center py-4">
                    <Button 
                      variant="outline" 
                      onClick={() => loadMore('reports')}
                      className="w-1/3"
                    >
                      Load More Reports
                    </Button>
                  </div>
                )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Monitor recent chat activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div 
                  style={{ 
                    height: TABLE_HEIGHT, 
                    overflowY: 'auto', 
                    overflowX: 'auto' 
                  }} 
                  className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                >
                  <div className="min-w-[1000px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sender</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message._id}>
                            <TableCell><Link to={`/profile/${message.sender.username}`}>{message.sender.username}</Link></TableCell>
                        <TableCell className="max-w-md truncate">{message.content}</TableCell>
                        <TableCell>{new Date(message.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {message.sender.isBanned ? (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleUnbanUser(message.sender._id)}
                                disabled={message.sender.isAdmin}
                              >
                                Unban User
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleBanUser(message.sender._id)}
                                disabled={message.sender.isAdmin}
                              >
                                Ban User
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  </div>
                {loading.messages ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" />
                  </div>
                ) : hasMore.messages && (
                  <div className="text-center py-4">
                    <Button 
                      variant="outline" 
                      onClick={() => loadMore('messages')}
                      className="w-1/3"
                    >
                      Load More Messages
                    </Button>
                  </div>
                )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div 
                  style={{ 
                    height: TABLE_HEIGHT, 
                    overflowY: 'auto', 
                    overflowX: 'auto' 
                  }} 
                  className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
                >
                  <div className="min-w-[1000px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Verification</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                              <img 
                                  src={user.profileImage?.thumbUrl || defaultAvatar} 
                                alt={user.username}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            <div>
                                  <div className="font-medium">
                                    <Link 
                                      to={`/profile/${user.username}`}
                                      className="hover:underline text-blue-600 dark:text-blue-400"
                                    >
                                      {user.username}
                                    </Link>
                                  </div>
                              <div className="text-sm text-gray-500">
                                {user.firstname} {user.lastname}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                          <Badge variant={user.isOnline ? "success" : "secondary"}>
                            {user.isOnline ? "Online" : "Offline"}
                            </Badge>
                            {user.isAdmin && (
                              <Badge variant="default">Admin</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isVerified ? "success" : "warning"}>
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                                {user.isBanned ? (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleUnbanUser(user._id)}
                                    disabled={user.isAdmin}
                                  >
                                    Unban User
                                  </Button>
                                ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleBanUser(user._id)}
                                    disabled={user.isAdmin}
                          >
                                    Ban User
                          </Button>
                                )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                  </div>
                {loading.users ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent" />
                  </div>
                ) : hasMore.users && (
                  <div className="text-center py-4">
                    <Button 
                      variant="outline" 
                      onClick={() => loadMore('users')}
                      className="w-1/3"
                    >
                      Load More Users
                    </Button>
                  </div>
                )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Message</CardTitle>
              <CardDescription>Send a message to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your broadcast message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleBroadcast}
                  disabled={loading.broadcast || !broadcastMessage.trim()}
                >
                  {loading.broadcast ? "Sending..." : "Send Broadcast"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
};

export default AdminDashboard;
