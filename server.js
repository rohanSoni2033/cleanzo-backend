import app from './app.js';

const port = process.env.PORT || process.env.localPort;

const server = app.listen(port, () => {
  console.log(
    `🚀 server is running at port ${port} in ${process.env.NODE_ENV} environment`
  );
});

process.on('uncaughtException', err => {
  console.log(err);
});

process.on('SIGTERM', () => {
  console.log('sigterm received');

  server.close(err => {
    console.log('🚫 shutting down');
  });
});
