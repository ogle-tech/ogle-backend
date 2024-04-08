const express = require('express');
require('dotenv').config();
const schema = require('./src/schema/schema');
const connectDB = require('./config/db');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const jwt = require('jsonwebtoken');
const Property = require('./src/models/property');
const User = require('./src/models/user');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('pino')();

connectDB();

const app = express();
app.use(cors());


const authMiddleware = async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return null;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch (err) {
    return null;
  }
};

app.use(
  '/graphql',
  graphqlHTTP(async (req, res) => {
    const user = await authMiddleware(req, res);
    return {
      schema,
      graphiql: true,
      context: {
        User,
        Property,
        currentUser: user,
      },
    };
  }),
);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  logger.info(`server running on port ${port}`);
});

module.exports = app;
