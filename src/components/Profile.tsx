
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit, CheckCircle2, Mail, MapPin, Link2, User2, GraduationCap, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import gamificationService from '@/services/gamificationService';
import TwoFactorAuth from '@/components/auth/TwoFactorAuth';

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z.string().max(160, {
    message: "Bio must not exceed 160 characters.",
  }).optional(),
  location: z.string().optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  isAvailable: z.boolean().default(true).optional(),
})

interface ProfileProps {
  userId: string;
}

type ProfileData = z.infer<typeof profileFormSchema> & {
  has2FA?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const { data: userLevel, isLoading: levelLoading } = useQuery({
    queryKey: ['user-level', userId],
    queryFn: () => gamificationService.getUserLevel(userId),
    enabled: !!userId && auth.isValidSession,
  });

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      location: "",
      website: "",
      skills: [],
      interests: [],
      isAvailable: true,
    },
    mode: "onChange",
  })

  useEffect(() => {
    // Mock fetching profile data
    setTimeout(() => {
      const mockProfile: ProfileData = {
        name: "John Doe",
        email: "john.doe@example.com",
        bio: "Software Engineer | Open Source Enthusiast",
        location: "San Francisco, CA",
        website: "https://johndoe.com",
        skills: ["JavaScript", "React", "Node.js"],
        interests: ["Web Development", "Machine Learning"],
        isAvailable: true,
        has2FA: true,
      };
      setProfileData(mockProfile);
      form.reset(mockProfile);
    }, 500);
  }, [form]);

  function onSubmit(data: ProfileData) {
    console.log("Profile data submitted", data);
    toast({
      title: "Profile updated successfully!",
    });
    setIsEditing(false);
  }

  if (!profileData) {
    return (
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Loading profile info...</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
          <Separator />
          <div className="space-y-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <Separator />
          <Skeleton className="h-4 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          {isEditing ? "Edit your profile details." : "View your profile details."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>{profileData.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <h4 className="text-sm font-semibold">
              {profileData.name}
              <CheckCircle2 className="ml-1 h-4 w-4 text-green-500 inline-block align-middle" />
            </h4>
            <p className="text-sm text-muted-foreground">{profileData.email}</p>
            {userLevel && (
              <Badge variant="secondary">
                Level {userLevel.level} - {userLevel.title}
              </Badge>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {profileData.bio || "No bio yet."}
          </p>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 opacity-70" />
            {profileData.location || "No location set"}
          </div>
          <div className="flex items-center text-sm">
            <Link2 className="mr-2 h-4 w-4 opacity-70" />
            <a href={profileData.website} target="_blank" rel="noopener noreferrer">
              {profileData.website || "No website set"}
            </a>
          </div>
        </div>
        <Separator />
        <Accordion type="single" collapsible>
          <AccordionItem value="skills">
            <AccordionTrigger>Skills</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {profileData.skills?.map((skill, index) => (
                  <li key={index}>{skill}</li>
                )) || <li>No skills added.</li>}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="interests">
            <AccordionTrigger>Interests</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {profileData.interests?.map((interest, index) => (
                  <li key={index}>{interest}</li>
                )) || <li>No interests added.</li>}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Separator />
        {/* 2FA Authentication */}
        {auth.user?.id && (
          <TwoFactorAuth 
            userId={auth.user.id}
            is2FAEnabled={profileData?.has2FA || false}
            onStatusChange={(status) => {
              // Update the profile data
              if (profileData) {
                setProfileData({
                  ...profileData,
                  has2FA: status
                });
              }
            }}
          />
        )}
        <Separator />
        <Button onClick={() => setIsEditing(true)} disabled={isEditing}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default Profile;
