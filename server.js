const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });
const app = require('./app');

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION... SHUTTING DOWN');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('UNHANDLED EXCEPTION... SHUTTING DOWN');
  process.exit(1);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DATABASE CONNECTION IS SUCCESSFULL');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening to the server on port ${port}`);
});
