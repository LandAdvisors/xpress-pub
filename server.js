const express = require('express');
const errorhandler = require('errorhandler');
const app = express();
// const bodyParser = require('body-parser');
// const morgan = require('morgan');
// const sqlite3 = require('sqlite3');
// const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const PORT = process.env.PORT || 4000;

const artistsRouter = require('./artists.js');
app.use('/api/artists', artistsRouter);

const seriesRouter = require('./series.js');
app.use('/api/series', seriesRouter);

app.use(errorhandler());

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

module.exports = app;
/*
app.put('', (req, res, next) => {});
db.run(qs, function(err) {});
*/