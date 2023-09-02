const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
require('dotenv').config();
require('./db');
const userRouter = require('./routes/user');
const { errorHandler } = require('./middlewares/error');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/user', userRouter);

app.use(errorHandler);

app.listen(8000, () => { 
  console.log('the port is listening on port 8000');
});