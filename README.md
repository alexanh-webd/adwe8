# Reddit-Like Forum Application

## Overview

This project is a simplified Reddit-like forum application that allows users to create and view discussion topics. The application supports user authentication and implements Role-Based Access Control (RBAC) to manage permissions for different user roles.

All users can browse and view posts, but only registered users can create new topics. Administrative users have additional privileges, including the ability to delete posts.

## Features

- Public access to view all posts and topics
- User registration and authentication
- Authenticated users can create new topics/posts
- Role-Based Access Control (RBAC)
- Admin-only permission to delete posts

## User Roles

### Guest (Unregistered User)
- View all posts and topics

### Registered User
- View all posts and topics
- Create new topics and posts

### Admin User
- View all posts and topics
- Create new topics and posts
- Delete any post

## Functional Requirements

- Users must be authenticated to create posts
- Only users with the `ADMIN` role can delete posts
- Unauthorized actions are blocked and handled securely
- Posts are visible to all users regardless of authentication status

## Application Flow

1. A user visits the forum and can view all existing posts
2. The user registers or logs in to create new posts
3. Admin users can manage content by deleting posts when necessary
4. Role checks are enforced before performing restricted actions

## Future Enhancements (Optional)

- Commenting system
- Upvote/downvote functionality
- User profile pages
- Post editing
- Search and filtering of topics

