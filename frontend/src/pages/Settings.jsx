import { useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState } from '@/store/atoms';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, Save, User, Bell, Shield, 
  Key, Eye, EyeOff, Lock, Globe, Mail 
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Add this function at the top of your file, outside the component
const isValidUsername = (username) => {
  const regex = /^[a-z0-9_-]+$/;
  return regex.test(username);
};

const Settings = () => {
  const auth = useRecoilValue(authState);
  const setAuth = useSetRecoilState(authState);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("account");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/user/profile/${auth.username}`,
          {
            headers: { Authorization: `Bearer ${auth.token}` }
          }
        );
        console.log('Fetched user data:', response.data); // Debug log
        return response.data;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
      }
    }
  });

  // Form data state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    bio: '',
    location: '',
    website: '',
    gender: '',
    birthdate: '',
    username: ''
  });

  // Other states
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    followNotifications: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: true,
    showBirthdate: true
  });

  // Update form data when user data is fetched
  useEffect(() => {
    if (user) {
      console.log('Setting initial form data:', user); // Debug log
      setFormData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        gender: user.gender || '',
        birthdate: user.birthdate ? format(new Date(user.birthdate), 'yyyy-MM-dd') : '',
        username: user.username || ''
      });
    }
  }, [user]);

  // Update handleChange to handle username validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      // Convert to lowercase and remove invalid characters
      const sanitizedValue = value.toLowerCase();
      
      // Only update if the value matches our criteria
      if (value === '' || isValidUsername(sanitizedValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: sanitizedValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Update username check
  const checkUsername = async (username) => {
    // First check if username is valid format
    if (!isValidUsername(username)) {
      setUsernameAvailable(false);
      toast({
        title: "Invalid Username",
        description: "Username can only contain lowercase letters, numbers, underscore and hyphen",
        variant: "destructive"
      });
      return;
    }

    if (!username || username === user?.username) {
      setUsernameAvailable(true);
      return;
    }

    try {
      setIsCheckingUsername(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/check-username`,
        { username },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      setUsernameAvailable(!response.data.exists);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounced username check
  useEffect(() => {
    if (!formData.username) return;

    const timer = setTimeout(() => {
      if (formData.username !== user?.username) {
        checkUsername(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, user?.username]);

  // Handle select changes (for gender)
  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }));
  };

  // Update mutation with navigation and auth update
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Sending update data:', data);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/update`,
        data,
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Update successful:', data);
      queryClient.setQueryData(['userSettings'], data);
      
      // If username was changed, update auth state and redirect
      if (data.username !== auth.username) {
        // Update auth state with new username
        setAuth(prev => ({
          ...prev,
          username: data.username
        }));

        // Update localStorage if you're storing auth there
        const storedAuth = JSON.parse(localStorage.getItem('auth'));
        if (storedAuth) {
          localStorage.setItem('auth', JSON.stringify({
            ...storedAuth,
            username: data.username
          }));
        }

        // Show success message
        toast({
          title: "Success",
          description: "Your username has been updated.",
        });

        // Redirect to new profile route
        setTimeout(() => {
          navigate(`/profile/${data.username}`);
        }, 1500); // Give time for the toast to be visible
      } else {
        // Regular success message for other updates
        toast({
          title: "Success",
          description: "Your settings have been updated.",
        });
      }
    },
    onError: (error) => {
      console.error('Update error:', error.response?.data || error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update settings",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); // Debug log

    // Check username availability if it's changed
    if (formData.username !== user?.username) {
      if (!usernameAvailable) {
        toast({
          title: "Error",
          description: "Username is not available",
          variant: "destructive"
        });
        return;
      }
    }

    // Remove empty strings or undefined values
    const dataToUpdate = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== undefined && value !== '')
    );

    console.log('Data to update:', dataToUpdate); // Debug log
    updateMutation.mutate(dataToUpdate);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <Toaster />
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="p-6">
          <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 gap-4 mb-6">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* Account Settings */}
            <TabsContent value="account">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Username</h2>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <div className="relative">
                      <Input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`pr-10 ${
                          formData.username !== user?.username
                            ? usernameAvailable && isValidUsername(formData.username)
                              ? 'border-green-500 focus:border-green-500'
                              : 'border-red-500 focus:border-red-500'
                            : ''
                        }`}
                        placeholder="lowercase_username"
                      />
                      {isCheckingUsername && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {formData.username !== user?.username && !isCheckingUsername && (
                        <div className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                          usernameAvailable && isValidUsername(formData.username) ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {usernameAvailable && isValidUsername(formData.username) ? '✓' : '✗'}
                        </div>
                      )}
                    </div>
                    {formData.username && !isValidUsername(formData.username) && (
                      <p className="text-sm text-red-500">
                        Username can only contain lowercase letters, numbers, underscore (_) and hyphen (-)
                      </p>
                    )}
                    {formData.username !== user?.username && !usernameAvailable && isValidUsername(formData.username) && (
                      <p className="text-sm text-red-500">This username is already taken</p>
                    )}
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Birth Date</label>
                    <Input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      max={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Contact Information</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={updateMutation.isPending || (formData.username !== user?.username && !usernameAvailable)}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  {/* Add more notification settings as needed */}
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Privacy Settings</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-medium">Profile Visibility</label>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) => 
                        setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="followers">Followers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Online Status</h3>
                      <p className="text-sm text-muted-foreground">Show when you're online</p>
                    </div>
                    <Switch
                      checked={privacySettings.showOnlineStatus}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, showOnlineStatus: checked }))
                      }
                    />
                  </div>

                  {/* Add more privacy settings as needed */}
                </div>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Security Settings</h2>
                
                <div className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <Input type="password" placeholder="Current Password" />
                      <Input type="password" placeholder="New Password" />
                      <Input type="password" placeholder="Confirm New Password" />
                      <Button className="w-full">Update Password</Button>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </Card>

                  {/* Add more security settings as needed */}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Settings; 