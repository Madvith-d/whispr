import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MapPin, Link as LinkIcon, Edit } from 'lucide-react';
import { User, Post, api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { PostCard } from '@/components/post/PostCard';

export const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const isOwnProfile = currentUser?.username === username;
  const isFollowing = currentUser && profileUser ?
    profileUser.followers.includes(currentUser._id) : false;

  // Fetch all posts and filter for this user
  const { data: allPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: () => api.getAllPosts(),
    enabled: !!currentUser, // Only fetch if user is authenticated
  });

  // Filter posts by the profile user
  const userPosts = allPosts.filter(post => 
    post.postedBy.username === username
  );

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    if (!username) return;

    setLoading(true);
    try {
      const user = await api.getUserProfile(username);
      setProfileUser(user);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profileUser || !currentUser || following) return;

    setFollowing(true);
    try {
      if (isFollowing) {
        await api.unfollowUser(profileUser._id);
        setProfileUser(prev => prev ? {
          ...prev,
          followers: prev.followers.filter(id => id !== currentUser._id)
        } : null);
        toast({
          title: 'Unfollowed',
          description: `You unfollowed @${profileUser.username}`,
        });
      } else {
        await api.followUser(profileUser._id);
        setProfileUser(prev => prev ? {
          ...prev,
          followers: [...prev.followers, currentUser._id]
        } : null);
        toast({
          title: 'Following',
          description: `You are now following @${profileUser.username}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    } finally {
      setFollowing(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container max-w-2xl mx-auto py-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg font-semibold mb-2">User not found</p>
            <p className="text-muted-foreground">
              The user @{username} doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={profileUser.profilepic} alt={profileUser.name} />
                <AvatarFallback className="text-2xl font-semibold">
                  {profileUser.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div>
                  <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                  <p className="text-muted-foreground">@{profileUser.username}</p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{profileUser.followers.length} followers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{profileUser.following.length} following</span>
                  </div>
                </div>
              </div>
            </div>

            {currentUser && (
              isOwnProfile ? (
                <Button
                  onClick={() => navigate('/edit-profile')}
                  variant="outline"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={following}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {following ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {profileUser.bio && (
            <p className="text-sm leading-relaxed">{profileUser.bio}</p>
          )}

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {profileUser.createdAt && !isNaN(new Date(profileUser.createdAt))
                  ? formatDistanceToNow(new Date(profileUser.createdAt), { addSuffix: true })
                  : 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            Posts {userPosts.length > 0 && `(${userPosts.length})`}
          </h2>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-semibold mb-2">No posts yet</p>
              <p className="text-sm">
                {isOwnProfile 
                  ? "You haven't posted anything yet. Share your first thought!" 
                  : `@${profileUser.username} hasn't posted anything yet.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};