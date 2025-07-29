import { useState, useEffect } from 'react';
import { PostCard } from '@/components/post/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Post, api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Explore = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const allPosts = await api.getAllPosts();
      setPosts(allPosts);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Explore</h1>
        </div>
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

      <p className="text-muted-foreground">
        Discover what's happening on Whispr
      </p>

      {/* Posts feed */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
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
              <p className="text-lg mb-2">No posts to explore yet!</p>
              <p className="text-sm">Check back later for new content.</p>
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