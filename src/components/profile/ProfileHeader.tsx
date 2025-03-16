
import React from 'react';
import { User } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Link2, 
  Calendar, 
  Users, 
  Briefcase, 
  Edit, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
  profileData: any;
  isOwnProfile: boolean;
  onEditProfile: () => void;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
  followersCount: number;
  followingCount: number;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  profileData,
  isOwnProfile,
  onEditProfile,
  isFollowing,
  onFollow,
  onUnfollow,
  followersCount,
  followingCount,
  onFollowersClick,
  onFollowingClick
}) => {
  // Get the first two letters of the user's name for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-full bg-card rounded-lg shadow-sm p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24 md:h-32 md:w-32">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Profile Info */}
        <div className="flex-grow space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                {user.role === 'admin' && (
                  <Badge variant="secondary" className="ml-2">Admin</Badge>
                )}
                {user.role && user.role !== 'admin' && (
                  <Badge variant="outline" className="ml-2">{user.role}</Badge>
                )}
                {(user.role === 'verified' || user.role === 'admin') && (
                  <CheckCircle2 className="ml-1 h-5 w-5 text-primary" />
                )}
              </div>
              {profileData.email && (
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Mail className="mr-1 h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 mt-2 md:mt-0">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={onEditProfile}>
                  <Edit className="mr-1 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  {isFollowing ? (
                    <Button variant="outline" size="sm" onClick={onUnfollow}>
                      Unfollow
                    </Button>
                  ) : (
                    <Button size="sm" onClick={onFollow}>
                      Follow
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {profileData.bio && (
            <p className="text-sm text-foreground">{profileData.bio}</p>
          )}
          
          {/* Stats and Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-2">
              {profileData.company && (
                <div className="flex items-center text-sm">
                  <Briefcase className="mr-2 h-4 w-4 opacity-70" />
                  <span>{profileData.company}</span>
                </div>
              )}
              {profileData.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 opacity-70" />
                  <span>{profileData.location}</span>
                </div>
              )}
              {profileData.website && (
                <div className="flex items-center text-sm">
                  <Link2 className="mr-2 h-4 w-4 opacity-70" />
                  <a 
                    href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {profileData.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 opacity-70" />
                <span>Joined {new Date(profileData.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 opacity-70" />
                <button 
                  onClick={onFollowersClick} 
                  className="hover:underline"
                >
                  <span className="font-medium">{followersCount}</span> Followers
                </button>
                <span className="mx-2">•</span>
                <button 
                  onClick={onFollowingClick} 
                  className="hover:underline"
                >
                  <span className="font-medium">{followingCount}</span> Following
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
