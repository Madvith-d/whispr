# Whispr

[![Live Demo](https://img.shields.io/badge/demo-online-green)](https://whispr-three-alpha.vercel.app)

**Whispr** is a modern social media backend and API, built for connecting, sharing, and discovering content in a dynamic community environment.

---

## 🚀 Overview

Whispr provides a Node.js/Express REST API for a social media-like application. It uses MongoDB (via Mongoose) for persistent data storage and JWT-based authentication (with cookies). The API is suitable for frontend integration, powering features like user signup, posting, following, feeds, likes, and replies.

---

## ⚙️ Technologies Used

- **Node.js**, **Express.js**
- **MongoDB**, **Mongoose**
- **JWT** (jsonwebtoken)
- **bcryptjs** (password hashing)
- **dotenv** (environment config)
- **cookie-parser**

---

## 🗄️ Database Schemas

### User

```js
{
  name: String,           // Required
  username: String,       // Required, Unique
  email: String,          // Required, Unique
  password: String,       // Required (hashed)
  profilepic: String,     // Default: Gravatar URL
  followers: [String],    // Array of user IDs
  following: [String],    // Array of user IDs
  bio: String,            // Optional
  createdAt: Date,
  updatedAt: Date
}
```

### Post

```js
{
  postedBy: ObjectId,     // User ID (ref: User)
  content: String,        // Required, maxLength: 500
  image: String,          // Optional
  likes: [ObjectId],      // User IDs who liked the post
  replies: [
    {
      userID: ObjectId,         // User ID (ref: User)
      content: String,          // Required
      image: String,            // Optional
      likes: [ObjectId],        // User IDs who liked the reply
      userProfilePic: String,   // User's profile picture
      username: String          // User's username
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication

- **JWT** is used for authentication, stored in an HTTP-only cookie named `jwt`.
- All protected routes require the user to be authenticated (cookie must be present).

---

## 🚦 API Routes

### User Routes (`/api/users`)
| Method | Endpoint                | Auth Required | Description                   | Body / Params                                      |
|--------|-------------------------|--------------|-------------------------------|----------------------------------------------------|
| POST   | `/signup`               | No           | Register a new user           | `{ name, username, email, password }`              |
| POST   | `/login`                | No           | Login user, sets JWT cookie   | `{ email, password }`                              |
| POST   | `/logout`               | Yes          | Logout user, clears JWT       |                                                    |
| POST   | `/follow/:id`           | Yes          | Follow a user by ID           | URL param: `id` (user to follow)                   |
| POST   | `/unfollow/:id`         | Yes          | Unfollow a user by ID         | URL param: `id` (user to unfollow)                 |
| POST   | `/update`               | Yes          | Update profile                | `{ name, email, password, profilepic, bio, username }` |
| GET    | `/profile/:username`    | No           | Get public profile by username| URL param: `username`                              |

### Post Routes (`/api/posts`)
| Method | Endpoint                | Auth Required | Description                   | Body / Params                                      |
|--------|-------------------------|--------------|-------------------------------|----------------------------------------------------|
| POST   | `/create`               | Yes          | Create a new post             | `{ content, image? }`                              |
| GET    | `/get/:id`              | Yes          | Get a single post by ID       | URL param: `id`                                    |
| DELETE | `/delete/:id`           | Yes          | Delete a post (must be owner) | URL param: `id`                                    |
| POST   | `/like/:id`             | Yes          | Like/unlike a post            | URL param: `id`                                    |
| POST   | `/reply/:id`            | Yes          | Reply to a post               | `{ content, image? }`, URL param: `id`             |
| GET    | `/feed`                 | Yes          | Get feed (posts from followings + self) |                                        |
| GET    | `/all`                  | Yes          | Get all posts (most recent first) |                                    |

---

## 🛡️ Middleware

- **secureRoute**: Protects routes, checks for valid JWT in cookies, attaches user to `req.user`.

---

## 📝 Usage Notes

- All POST/DELETE/PUT requests require `Content-Type: application/json`.
- All protected routes require the `jwt` cookie to be present (set on login).
- All responses are in JSON format.
- All date fields are ISO strings.

---

## 🧑‍💻 Example API Usage

### Signup
```http
POST /api/users/signup
{
  "name": "Alice",
  "username": "alice123",
  "email": "alice@example.com",
  "password": "password123"
}
```

### Login
```http
POST /api/users/login
{
  "email": "alice@example.com",
  "password": "password123"
}
```
_Response sets a `jwt` cookie._

### Get Feed
```http
GET /api/posts/feed
// Requires jwt cookie
```

### Get All Posts
```http
GET /api/posts/all
// Requires jwt cookie
```

---

## 🌩️ Additional Features

- All user and post IDs are MongoDB ObjectIds (24-char hex strings).
- All endpoints return appropriate HTTP status codes and error messages.
- All posts and replies can include images (provided as URLs).
- [Cloudinary integration](CLOUDINARY_SETUP.md) for uploading profile pictures and images.

---

## 📄 License

This project currently does not specify a license. Please contact the repository owner for usage permissions.

---

## 🌐 Live Demo

Try Whispr online: [https://whispr-three-alpha.vercel.app](https://whispr-three-alpha.vercel.app)
