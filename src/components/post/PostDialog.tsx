import { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { ImageViewer } from '@/components/ui/image-viewer';
import { useNavigate } from 'react-router-dom';

interface PostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export const PostDialog = ({ post, open, onOpenChange, onUpdate, onDelete }: PostDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [replyContent, setReplyContent] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

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

  const handleReply = async () => {
    if (!replyContent.trim() || isReplying) return;

    setIsReplying(true);
    try {
      await api.replyToPost(post._id, { content: replyContent });
      setReplyContent('');
      onUpdate?.();
      toast({
        title: 'Reply posted!',
        description: 'Your reply has been added.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        variant: 'destructive',
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    try {
      await api.deletePost(post._id);
      onDelete?.();
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Post Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.postedBy?.profilepic} alt={post.postedBy?.name || ''} />
                <AvatarFallback>
                  {post.postedBy?.name ? post.postedBy.name[0]?.toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p 
                  className="font-semibold hover:text-primary cursor-pointer transition-colors"
                  onClick={() => {
                    if (post.postedBy?.username) {
                      navigate(`/profile/${post.postedBy.username}`);
                      onOpenChange(false);
                    }
                  }}
                >
                  @{post.postedBy?.username}
                </p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </Badge>
              </div>
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

          {/* Post Content */}
          <div className="space-y-4">
            <p className="text-base leading-relaxed">{post.content}</p>

            {post.image && (
              <div 
                className="rounded-lg overflow-hidden cursor-zoom-in relative group"
                onClick={() => setShowImageViewer(true)}
              >
                <img
                  src={post.image}
                  alt="Post image"
                  className="w-full h-auto object-contain bg-muted/20 hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '500px' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Click to view full size
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-6 py-3 border-y">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : ''}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes.length}</span>
              </Button>

              <div className="flex items-center space-x-2 text-muted-foreground">
                <MessageCircle className="h-5 w-5" />
                <span>{post.replies.length}</span>
              </div>
            </div>

            {/* Reply form */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilepic} alt={user?.name || ''} />
                  <AvatarFallback>
                    {user?.name ? user.name[0]?.toUpperCase() : '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || isReplying}
                      size="sm"
                    >
                      {isReplying ? 'Posting...' : 'Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies */}
            {post.replies.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Replies ({post.replies.length})</h3>
                <div className="space-y-4">
                  {post.replies.map((reply, index) => {
                    console.log('Reply data:', { 
                      username: reply.username, 
                      userProfilePic: reply.userProfilePic,
                      userID: reply.userID 
                    });
                    
                    return (
                    <div key={index} className="flex space-x-3 p-3 rounded-lg bg-muted/30">
                      <Avatar className="h-8 w-8">
                        {reply.userProfilePic && reply.userProfilePic.trim() !== '' && (
                          <AvatarImage 
                            src={reply.userProfilePic} 
                            alt={reply.username || 'User'}
                            onError={(e) => {
                              console.log('Reply image failed to load:', reply.userProfilePic);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <AvatarFallback className="text-xs font-semibold bg-primary/10">
                          {reply.username ? reply.username[0]?.toUpperCase() : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <p 
                            className="font-semibold text-sm hover:text-primary cursor-pointer transition-colors"
                            onClick={() => {
                              if (reply.username) {
                                navigate(`/profile/${reply.username}`);
                                onOpenChange(false);
                              }
                            }}
                          >
                            @{reply.username}
                          </p>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{reply.likes.length}</span>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed">{reply.content}</p>
                        {reply.image && (
                          <img
                            src={reply.image}
                            alt="Reply image"
                            className="rounded max-w-sm h-auto"
                          />
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
