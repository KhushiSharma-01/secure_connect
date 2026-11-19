# Lab 4 - Secure Connect and Communication Platform

## Features
- Signup and login with bcrypt password hashing
- JWT-based authentication
- Protected Notes CRUD; each user can access only their own notes
- Role-based admin endpoint
- Authenticated Socket.IO chat rooms
- Node.js EventEmitter logs chat messages
- dotenv configuration

## Requirements
Install Node.js LTS and MongoDB Community Server. Start the MongoDB service before starting the app.

## Setup (Windows PowerShell)
1. Extract this folder and open it in VS Code.
2. Open the terminal in the project folder.
3. Run `npm install`.
4. Copy `.env.example` to a new file named `.env`.
5. Edit `.env`; set a long private JWT_SECRET. Keep `.env` private.
6. Ensure MongoDB is running locally.
7. Run `npm run dev`.
8. Server should start at `http://localhost:5000`.

## API requests
Use Postman. Select Body > raw > JSON for POST/PUT requests.

### Signup
POST `http://localhost:5000/api/auth/signup`
```json
{ "username": "victor", "email": "victor@example.com", "password": "123456" }
```

### Login
POST `http://localhost:5000/api/auth/login`
```json
{ "email": "victor@example.com", "password": "123456" }
```
Copy the returned token.

For protected requests, add header:
`Authorization: Bearer YOUR_TOKEN`

### Notes
- POST `/api/notes` body: `{ "title": "My First Note", "content": "This is my note" }`
- GET `/api/notes`
- GET `/api/notes/NOTE_ID`
- PUT `/api/notes/NOTE_ID` with `{ "title": "Updated title", "content": "Updated content" }`
- DELETE `/api/notes/NOTE_ID`

### Protected route test
GET `/api/notes` without the Authorization header should return 401.
GET `/api/notes` with a valid token should return that user's notes.

### RBAC
GET `/api/admin/users` requires a valid token belonging to a user whose `role` is `admin`.
New signups are always `user`. To create an admin for a local lab, use MongoDB Compass to edit that user's document and change `role` from `user` to `admin`. Never expose an admin-registration endpoint.

## Socket.IO chat test
Socket.IO is a WebSocket client/server protocol, not a normal REST endpoint. Connect a Socket.IO client to `http://localhost:5000` and pass the login token as:
```js
io("http://localhost:5000", { auth: { token: "YOUR_JWT_TOKEN" } });
```
Then emit:
```js
socket.emit("join_room", "general");
socket.emit("chat_message", { room: "general", message: "Hello everyone!" });
```
Listen for:
```js
socket.on("receive_message", (data) => console.log(data));
```
You can test this from a second client as well. Both clients must log in and join the same room.

## Notes
- Do not share your `.env` file or JWT token.
- This is a teaching/lab implementation, not a production-ready messaging service.


### Easy chat test using the included client
After `npm install`, open two additional terminals in the project folder. Log in two users separately and copy each JWT token. In each terminal run:
`node chat-client.js PASTE_THE_TOKEN_HERE`
Both clients join the `general` room. Type a message in one terminal; it should appear in the other. Use `/exit` to close a client.
