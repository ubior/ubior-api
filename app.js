const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

const userRouter = require('./routes/userRoutes');
const itemRouter = require('./routes/itemRoutes');
const outfitRouter = require('./routes/outfitRoutes');
const closetRouter = require('./routes/closetRoutes');
const postRouter = require('./routes/postRoutes');
const reportRouter = require('./routes/reportRoutes');
const searchRouter = require('./routes/searchRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/outfits', outfitRouter);
app.use('/api/v1/closets', closetRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/search', searchRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
