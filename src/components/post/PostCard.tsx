import { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Post } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { PostDialog } from './PostDialog';
import { ImageViewer } from '@/components/ui/image-viewer';

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export const PostCard = ({ post, onUpdate, onDelete }: PostCardProps) => {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const isLiked = user ? post.likes.includes(user._id) : false;
  const isOwner = user?._id === post.postedBy._id;

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      await api.likePost(post._id);
      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive',
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open dialog if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, a, [role="button"]')) {
      return;
    }
    setShowDialog(true);
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    try {
      await api.deletePost(post._id);
      onDelete?.();
      toast({
        title: 'Post deleted',
        description: 'Your post has been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="w-full cursor-pointer hover:bg-muted/20 transition-colors" onClick={handleCardClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.postedBy?.profilepic} alt={post.postedBy?.name || ''} />
                <AvatarFallback>{post.postedBy?.name ? post.postedBy.name[0]?.toUpperCase() : '?'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">@{post.postedBy?.username}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </Badge>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{post.content}</p>

            {post.image && (
              <div 
                className="rounded-lg overflow-hidden cursor-zoom-in relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageViewer(true);
                }}
              >
                <img
                  src={post.image}
                  alt="Post image"
                  className="w-full h-auto object-contain bg-muted/20 hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '400px' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Click to view full size
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                disabled={isLiking}
                className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs">{post.likes.length}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDialog(true);
                }}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{post.replies.length}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PostDialog
        post={post}
        open={showDialog}
        onOpenChange={setShowDialog}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
      
      {post.image && (
        <ImageViewer
          src={post.image}
          alt="Post image"
          open={showImageViewer}
          onOpenChange={setShowImageViewer}
        />
      )}
    </>
  );
};