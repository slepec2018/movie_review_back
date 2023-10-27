const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
require('dotenv').config();
require('./db');
const userRouter = require('./routes/user');
const { errorHandler } = require('./middlewares/error');
const { handleNotFound } = require('./utils/helper');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/user', userRouter);


app.use('/*', handleNotFound);
app.use(errorHandler);

app.listen(8000, () => { 
  console.log('the port is listening on port 8000');
});