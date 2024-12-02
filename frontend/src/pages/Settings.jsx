import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState, userBasicInfoState, userProfileState, themeState } from '../store/atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Moon, Sun, User, Shield, Bell, Palette } from 'lucide-react';
import EditProfile from '../components/EditProfile';

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const theme = useRecoilValue(themeState);
  const setTheme = useSetRecoilState(themeState);
  const auth = useRecoilValue(authState);
  const userBasicInfo = useRecoilValue(userBasicInfoState);
  const [isEdited, setIsEdited] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <EditProfile isEdited={isEdited} setIsEdited={setIsEdited} />
            </TabsContent>

            <TabsContent value="appearance">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Theme</h3>
                    <p className="text-sm text-gray-500">Choose your preferred theme</p>
                  </div>
                  <Button onClick={toggleTheme} variant="outline" size="icon">
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                {/* Add notification settings here */}
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security Settings</h3>
                {/* Add security settings here */}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings; 