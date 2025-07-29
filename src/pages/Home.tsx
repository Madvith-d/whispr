import { useState, useEffect } from 'react';
import { CreatePost } from '@/components/post/CreatePost';
import { PostCard } from '@/components/post/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Post, api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const feedPosts = await api.getFeed();
      setPosts(feedPosts);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostUpdate = () => {
    fetchPosts();
  };

  const handlePostDelete = (deletedPostId: string) => {
    setPosts(prev => prev.filter(post => post._id !== deletedPostId));
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Home</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPosts(true)}
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Create post */}
      <CreatePost onPostCreated={handlePostUpdate} />

      {/* Posts feed */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-8 w-[60px]" />
                <Skeleton className="h-8 w-[60px]" />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <p className="text-lg mb-2">No posts yet!</p>
              <p className="text-sm">Follow some users or create your first post to get started.</p>
            </div>
          </div>
        ) : (
          // Posts list
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={handlePostUpdate}
              onDelete={() => handlePostDelete(post._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};