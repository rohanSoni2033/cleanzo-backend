import express from 'express';
import authRouters from "./routers/authRouters.js";
import servicesRouters from "./routers/serviceRouters.js";
import userRouters from "./routers/userRouter.js";

const app = express();

app.use(express.json());

app.use('/api/v1.0/auth', authRouters);
app.use("/api/v1.0/services", servicesRouters);
app.use("/api/v1.0/users", userRouters);

app.use((err, req, res, next) => {
  res.status(400).json({
    status: 'error',
    message: err.message,
  });
});

export default app;
