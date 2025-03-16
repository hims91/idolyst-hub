
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProfileSkillsProps {
  skills: string[];
  interests: string[];
}

const ProfileSkills: React.FC<ProfileSkillsProps> = ({
  skills = [],
  interests = []
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Skills & Interests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {interests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge key={index} variant="outline">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {skills.length === 0 && interests.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills or interests added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSkills;
