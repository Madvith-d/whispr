const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilepic: string;
  followers: string[];
  following: string[];
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  postedBy: User;
  content: string;
  image?: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  _id?: string;
  userID: string;
  content: string;
  image?: string;
  likes: string[];
  userProfilePic: string;
  username: string;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async signup(data: { name: string; username: string; email: string; password: string }) {
    return this.request('/api/users/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/api/users/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUserProfile(username: string): Promise<User> {
    return this.request(`/api/users/profile/${username}`);
  }

  async followUser(userId: string) {
    return this.request(`/api/users/follow/${userId}`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string) {
    return this.request(`/api/users/unfollow/${userId}`, {
      method: 'POST',
    });
  }

  async updateProfile(data: Partial<User>) {
    return this.request('/api/users/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Post endpoints
  async createPost(data: { content: string; image?: string }) {
    return this.request('/api/posts/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPost(postId: string): Promise<Post> {
    return this.request(`/api/posts/get/${postId}`);
  }

  async deletePost(postId: string) {
    return this.request(`/api/posts/delete/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId: string) {
    return this.request(`/api/posts/like/${postId}`, {
      method: 'POST',
    });
  }

  async replyToPost(postId: string, data: { content: string; image?: string }) {
    return this.request(`/api/posts/reply/${postId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeed(): Promise<Post[]> {
    return this.request('/api/posts/feed');
  }

  async getAllPosts(): Promise<Post[]> {
    return this.request('/api/posts/all');
  }
}

export const api = new ApiService();