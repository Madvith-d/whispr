import { useState } from 'react';
import { Search as SearchIcon, Users, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { User, api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const Search = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Since there's no search endpoint, we'll simulate it by fetching all posts
      // and extracting unique users, then filtering by search query
      const posts = await api.getAllPosts();
      const usersMap = new Map<string, User>();
      
      // Collect unique users from posts
      posts.forEach(post => {
        if (post.postedBy && post.postedBy.username.toLowerCase().includes(searchQuery.toLowerCase())) {
          usersMap.set(post.postedBy._id, post.postedBy);
        }
      });

      const users = Array.from(usersMap.values());
      setSearchResults(users);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUser) return;

    setFollowingStates(prev => ({ ...prev, [userId]: true }));
    
    try {
      if (isCurrentlyFollowing) {
        await api.unfollowUser(userId);
        toast({
          title: 'Unfollowed',
          description: 'User unfollowed successfully',
        });
      } else {
        await api.followUser(userId);
        toast({
          title: 'Following',
          description: 'You are now following this user',
        });
      }
      
      // Refresh search results to update follow status
      handleSearch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    } finally {
      setFollowingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const isFollowing = (user: User) => {
    return currentUser ? user.followers.includes(currentUser._id) : false;
  };

  const isOwnProfile = (user: User) => {
    return currentUser?._id === user._id;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SearchIcon className="h-5 w-5" />
            <span>Search Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length === 0 && searchQuery && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">No users found</p>
            <p className="text-muted-foreground">
              Try searching with a different username
            </p>
          </CardContent>
        </Card>
      )}

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {searchResults.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar 
                    className="h-12 w-12 cursor-pointer"
                    onClick={() => navigate(`/profile/${user.username}`)}
                  >
                    <AvatarImage src={user.profilepic} alt={user.username} />
                    <AvatarFallback>
                      {user.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p 
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {user.bio}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>{user.followers.length} followers</span>
                      <span>{user.following.length} following</span>
                    </div>
                  </div>
                </div>

                {!isOwnProfile(user) && currentUser && (
                  <Button
                    variant={isFollowing(user) ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleFollow(user._id, isFollowing(user))}
                    disabled={followingStates[user._id]}
                    className="min-w-[100px]"
                  >
                    {followingStates[user._id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : isFollowing(user) ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!searchQuery && (
        <Card>
          <CardContent className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Discover People</p>
            <p className="text-muted-foreground">
              Search for users by their username to connect and follow them
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
