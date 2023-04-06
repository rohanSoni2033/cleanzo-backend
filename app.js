import express from 'express';
import authRouters from './routers/authRouters.js';
import servicesRouters from './routers/serviceRouters.js';
import userRouters from './routers/userRouter.js';
import meRouter from './routers/meRouters.js';
import GlobalError from './error/GlobalError.js';
import statusCode from './utils/statusCode.js';

const app = express();

app.use(express.json());

app.use('/api/v1.0/auth', authRouters);
app.use('/api/v1.0/services', servicesRouters);
app.use('/api/v1.0/users', userRouters);
app.use('/api/v1.0/me', meRouter);

app.use('*', (req, res, next) => {
  return next(new GlobalError('invalid route request', statusCode.BAD_REQUEST));
});

app.use((err, req, res, next) => {
  res.status(400).json({
    status: 'error',
    message: err.message,
  });
});

export default app;
