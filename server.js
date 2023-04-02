import app from './app.js';

app.listen(process.env.port, () => {
  console.log(`🚀 server is running at port ${process.env.port} in ${process.env.NODE_ENV} environment`);
});


process.on("uncaughtException", (err) => {
  console.log("something went wrong");
})
