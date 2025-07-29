import { Button } from '@/components/ui/button';
import { Moon, Sun, MessageCircle, User, LogOut, Home, Search } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, setUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      navigate('/auth');
      toast({
        title: 'Logged out successfully',
        description: 'Come back soon!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive',
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Whispr
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/')}
            className="hidden sm:flex"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          
          <Button
            variant={isActive('/explore') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/explore')}
            className="hidden sm:flex"
          >
            <Search className="h-4 w-4 mr-2" />
            Explore
          </Button>

          {/* Mobile navigation */}
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/')}
            className="sm:hidden"
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isActive('/explore') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/explore')}
            className="sm:hidden"
          >
            <Search className="h-4 w-4" />
          </Button>
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilepic} alt={user?.name} />
                  <AvatarFallback>{user?.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    @{user?.username}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/profile/${user?.username}`)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};