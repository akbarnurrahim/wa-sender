require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;

const userRouter = require("./routes/userRoute");
app.use("/api/user", userRouter);

const messageRouter = require("./routes/messageRoute");
app.use("/api/message", messageRouter);

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});