const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { dbConnect } = require("./controller/dbConnect");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");

const app = express();

// app.use(
//   cors({
//     origin: "*",
//   })
// );

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
dbConnect();

// const server = http.createServer(app);
// const io = socketIo(server, {
//     cors: {
//       origin: '*',
//     }
// });

// io.on('connection', (socket) => {
//     console.log('New user connected');

//     socket.on('sendMessage', (message) => {
//         io.emit('message', message);
//     });

//     socket.on('disconnect', () => {
//       console.log('User disconnected');
//     });
//   });

const PORT = process.env.PORT || 5000;

app.use("/auth", authRoutes); // auth routes
app.use("/req", requestRoutes); // auth routes
app.use("/user", userRoutes); // auth routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
