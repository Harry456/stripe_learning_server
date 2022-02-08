const dotenv = require('dotenv');
// Getting access to env variables. dotenv need to above app.only then app can get access to env variable
dotenv.config({ path: './config.env' });

const app = require('./app');

const databaseConnection = require('./DBconfig');
const port = process.env.PORT || 5050;

// DB Connection
databaseConnection();

console.log(process.env.NODE_ENV);

app.listen(port, () => {
  console.log(`Server Listening on Port ${port}`);
});
