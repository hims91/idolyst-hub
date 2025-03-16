
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Link2, User, Mail, X, Plus } from "lucide-react";
import { Badge } from '@/components/ui/badge';

// Define the form schema
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
  }).optional().or(z.literal('')),
  company: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditFormProps {
  initialData: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [skillInput, setSkillInput] = React.useState("");
  const [interestInput, setInterestInput] = React.useState("");
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      bio: "",
      location: "",
      website: "",
      company: "",
      skills: [],
      interests: []
    },
  });

  const handleSkillAdd = () => {
    if (skillInput.trim() && !form.getValues().skills?.includes(skillInput.trim())) {
      form.setValue('skills', [...(form.getValues().skills || []), skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skill: string) => {
    form.setValue(
      'skills',
      (form.getValues().skills || []).filter(s => s !== skill)
    );
  };

  const handleInterestAdd = () => {
    if (interestInput.trim() && !form.getValues().interests?.includes(interestInput.trim())) {
      form.setValue('interests', [...(form.getValues().interests || []), interestInput.trim()]);
      setInterestInput("");
    }
  };

  const handleInterestRemove = (interest: string) => {
    form.setValue(
      'interests',
      (form.getValues().interests || []).filter(i => i !== interest)
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md pl-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Your name" {...field} className="border-0 focus-visible:ring-0" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="flex items-center border rounded-md pl-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="your.email@example.com" {...field} className="border-0 focus-visible:ring-0" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself in a few words..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    You can <span className="font-medium">@mention</span> other users and organizations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md pl-3">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Company or organization" {...field} value={field.value || ''} className="border-0 focus-visible:ring-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md pl-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Your location" {...field} value={field.value || ''} className="border-0 focus-visible:ring-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <div className="flex items-center border rounded-md pl-3">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Your website URL" {...field} value={field.value || ''} className="border-0 focus-visible:ring-0" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Skills */}
            <div>
              <FormLabel>Skills</FormLabel>
              <div className="flex mt-2 mb-1">
                <Input
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSkillAdd();
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={handleSkillAdd}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.getValues().skills?.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {skill}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleSkillRemove(skill)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <FormLabel>Interests</FormLabel>
              <div className="flex mt-2 mb-1">
                <Input
                  placeholder="Add an interest"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInterestAdd();
                    }
                  }}
                />
                <Button 
                  type="button"
                  variant="outline"
                  size="icon"
                  className="ml-2"
                  onClick={handleInterestAdd}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.getValues().interests?.map((interest, index) => (
                  <Badge key={index} variant="outline" className="gap-1">
                    {interest}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleInterestRemove(interest)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProfileEditForm;
