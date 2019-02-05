const express = require('express');
seriesRouter = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const bodyParser = require('body-parser');
seriesRouter.use(bodyParser.json());

const issuesRouter = require('./issues.js');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const sql = 'SELECT * FROM Series WHERE Series.id = $seriesId';
    const values = {$seriesId: seriesId};
    db.get(sql, values, (error, series) => {
      if (error) {
        next(error);
      } else if (series) {
        req.series = series;
        next();
      } else {
        res.sendStatus(404);
      }
    });
  });

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
    db.all('Select * from Series', (err, rows) => {
        res.status(200).json({series: rows});
    });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    const seriesID = req.params.seriesId;
    db.get(`Select * from Series where id = ${seriesID}`, (err, row) => {
        if (err) {
            console.log(err);
            return res.status(404);
        } else if (row) {
            res.status(200).json({series: row});
        } else {
            res.sendStatus(404);
        }
    });
});

const validateSeries = (req, res, next) => {
    const inputSeries = req.body.series;
    //console.log(inputSeries);
    if (!inputSeries.name || !inputSeries.description) {
        return res.sendStatus(400);
    }
    next();
}

seriesRouter.post('/', validateSeries, (req, res, next) => {
    const inputSeries = req.body.series;
    db.run('INSERT INTO Series (name, description) VALUES ($name, $description)',
        {$name: inputSeries.name, 
        $description: inputSeries.description}, 
        function(err) {
            if (err){
                return res.sendStatus(500);
            }
            db.get(`Select * from Series where id = ${this.lastID}`, (err, row) => {
                if (!row) {
                    return res.sendStatus(500);
                }
                res.status(201).send({series: row});
            });
    });
});

seriesRouter.put('/:seriesId', validateSeries, (req, res, next) => {
    const seriesID = req.params.seriesId;
    const updateSeries = req.body.series;
    // if (!updateSeries.name || !updateSeries.dateOfBirth || !updateSeries.biography){
    //     return res.sendStatus(400);
    // }
    const qs = `UPDATE Series SET name = '${updateSeries.name}', description = '${updateSeries.description}' WHERE id = ${seriesID}`;
    // console.log(seriesID);
    // console.log(updateSeries);
    // console.log(qs);
    db.run(qs, (err) => {
        if (err){
            console.log(err)
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${seriesID}`, (err, row) => {
                if (!row){
                    return res.sendStatus(500);
                }
                res.status(200).json({series: row});
            })
        }
    });
});

// sometimes issueCheck doesn't run first ?????
// const issueCheck = (req, res, next) => {
//     const seriesID = req.params.seriesId;
//     db.get(`SELECT * FROM Issue WHERE series_id = ${seriesID}`, (err, row) => {
//         if (err) {
//             next(err);
//             return res.sendStatus(500);
//         } else if (row) {
//             return res.sendStatus(400);
//         }
//     });
//     next();
// }

// seriesRouter.delete('/:seriesId', issueCheck, (req, res, next) => {
//     const seriesID = req.params.seriesId;
//     const qs = `DELETE FROM Series WHERE id = ${seriesID}`;
//     db.run(qs, (err) => {
//         if (err) {
//             next(err);
//         } else {
//             res.sendStatus(204);
//         }
//     });
// });

seriesRouter.delete('/:seriesId', (req, res, next) =>{
    const seriesID = req.params.seriesId;
    const issueQS = `SELECT * FROM Issue WHERE series_id = ${seriesID}`;
    const delQS = `DELETE FROM Series WHERE id = ${seriesID}`;
    db.get(issueQS, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            res.sendStatus(400);
        } else {
            db.run(delQS, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

// seriesRouter.delete('/:seriesId', (req, res, next) => {
//     const issueSql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
//     const issueValues = {$seriesId: req.params.seriesId};
//     db.get(issueSql, issueValues, (error, issue) => {
//       if (error) {
//         next(error);
//       } else if (issue) {
//         res.sendStatus(400);
//       } else {
//         const deleteSql = 'DELETE FROM Series WHERE Series.id = $seriesId';
//         const deleteValues = {$seriesId: req.params.seriesId};
  
//         db.run(deleteSql, deleteValues, (error) => {
//           if (error) {
//             next(error);
//           } else {
//             res.sendStatus(204);
//           }
//         });
//       }
//     });
//   });

module.exports = seriesRouter;