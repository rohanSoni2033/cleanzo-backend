import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import sanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import GlobalError from './error/GlobalError.js';
import statusCode from './utils/statusCode.js';

import authRouters from './routers/authRouters.js';
import serviceCategoryRouters from './routers/serviceCategoryRouters.js';
import serviceRouters from './routers/serviceRouters.js';
import userRouters from './routers/userRouter.js';
import meRouter from './routers/meRouters.js';
import slotRouters from './routers/slotRouters.js';
import bookingRouters from './routers/bookingRouter.js';
import vehicleRouters from './routers/vehicleRouter.js';

import membershipRouters from './routers/membershipRouters.js';
import membershipPlanRouters from './routers/membershipPlanRouters.js';

const app = express();

app.use(helmet());
app.use(sanitize());
app.use(xss());
app.use(express.json());

process.env.TZ = 'Asia/Kolkata';

const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this ip, try again after sometime',
});

app.use('*', (req, res, next) => {
  const reqObj = {
    url: req.url,
    queries: req.query,
    params: req.params,
    method: req.method,
    body: req.body,
  };

  console.log(reqObj);

  next();
});

app.use('/api/v1.0', limit);
app.use(express.json({ limit: '10kb' }));

app.use('/api/v1.0/auth', authRouters);
app.use('/api/v1.0/me', meRouter);

app.use('/api/v1.0/service-categories', serviceCategoryRouters);
app.use('/api/v1.0/services', serviceRouters);
app.use('/api/v1.0/vehicles', vehicleRouters);

app.use('/api/v1.0/bookings', bookingRouters);
app.use('/api/v1.0/users', userRouters);
app.use('/api/v1.0/slots', slotRouters);

app.use('/api/v1.0/membership-plans', membershipPlanRouters);
app.use('/api/v1.0/memberships', membershipRouters);

app.use('*', (req, res, next) => {
  return next(
    new GlobalError(`url ${req.baseUrl} not found`, statusCode.NOT_FOUND)
  );
});

app.use((err, req, res, next) => {
  res.status(err.statusCode).json({
    status: 'error',
    ok: false,
    message: err.message,
  });
});

export default app;
