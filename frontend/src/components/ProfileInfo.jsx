import { motion } from "framer-motion";
import { MapPin, Calendar, Globe, Link2, User2, Clock, Building, Briefcase, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { memo } from 'react';

const ProfileInfo = memo(({ userData }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.3, staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const InfoItem = ({ icon: Icon, label, value, href }) => (
    <motion.div variants={itemVariants} className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground/70" />
      <span className="font-medium text-muted-foreground">{label}:</span>
      {href ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline truncate"
        >
          {value}
        </a>
      ) : (
        <span className="text-foreground truncate">{value}</span>
      )}
    </motion.div>
  );

  const {
    isOnline,
    lastVisited,
    location,
    dateJoined,
    gender,
    occupation,
    website,
    company,
    email,
    phone,
    skills
  } = userData || {};

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Bio Section */}
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {userData.bio || "No bio available"}
            </p>
          </motion.div>
        </CardContent>
      </Card>

      {/* Details Section */}
      <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {location && (
                  <InfoItem 
                    icon={MapPin} 
                    label="Location" 
                    value={location} 
                  />
                )}
                {dateJoined && (
                  <InfoItem 
                    icon={Calendar} 
                    label="Joined" 
                    value={new Date(dateJoined).toLocaleDateString()} 
                  />
                )}
                {lastVisited && (
                  <InfoItem 
                    icon={Clock} 
                    label="Last Seen" 
                    value={new Date(lastVisited).toLocaleDateString()} 
                  />
                )}
                {gender && (
                  <InfoItem 
                    icon={User2} 
                    label="Gender" 
                    value={gender} 
                  />
                )}
                {occupation && (
                  <InfoItem 
                    icon={Briefcase} 
                    label="Occupation" 
                    value={occupation} 
                  />
                )}
              </div>

              <div className="space-y-4">
                {website && (
                  <InfoItem 
                    icon={Globe} 
                    label="Website" 
                    value={website}
                    href={website}
                  />
                )}
                {company && (
                  <InfoItem 
                    icon={Building} 
                    label="Company" 
                    value={company} 
                  />
                )}
                {email && (
                  <InfoItem 
                    icon={Mail} 
                    label="Email" 
                    value={email}
                    href={`mailto:${email}`}
                  />
                )}
                {phone && (
                  <InfoItem 
                    icon={Phone} 
                    label="Phone" 
                    value={phone} 
                  />
                )}
              </div>
            </div>

            {skills?.length > 0 && (
              <div className="pt-4 border-t border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default ProfileInfo;