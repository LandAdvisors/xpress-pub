const express = require('express');
artistRouter = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const bodyParser = require('body-parser');
artistRouter.use(bodyParser.json());

artistRouter.get('/', (req, res, next) => {
    db.all('Select * from Artist where is_currently_employed = 1', (err, rows) => {
        res.status(200).json({artists: rows});
    });
});

artistRouter.get('/:id', (req, res, next) => {
    const artistID = req.params.id;
    db.get(`Select * from Artist where id = ${artistID}`, (err, row) => {
        if (err) {
            console.log(err);
            return res.status(404);
        } else if (row) {
            res.status(200).json({artist: row});
        } else {
            res.sendStatus(404);
        }
    });
});

const validateArtist = (req, res, next) => {
    const inputArtist = req.body.artist;
    if (!inputArtist.name || !inputArtist.dateOfBirth || !inputArtist.biography) {
        return res.sendStatus(400);
    }
    next();
}

artistRouter.post('/', validateArtist, (req, res, next) => {
    const inputArtist = req.body.artist;
    //console.log(inputArtist);
    db.run('INSERT INTO Artist (name, date_of_birth, biography) VALUES ($name, $dob, $bio)',
        {$name: inputArtist.name, 
        $dob: inputArtist.dateOfBirth, 
        $bio: inputArtist.biography}, 
        function(err) {
            if (err){
                return res.sendStatus(500);
            }
            db.get(`Select * from Artist where id = ${this.lastID}`, (err, row) => {
                if (!row) {
                    return res.sendStatus(500);
                }
                res.status(201).send({artist: row});
            });
    });
});

artistRouter.put('/:id', validateArtist, (req, res, next) => {
    const artistID = req.params.id;
    const updateArtist = req.body.artist;
    // if (!updateArtist.name || !updateArtist.dateOfBirth || !updateArtist.biography){
    //     return res.sendStatus(400);
    // }
    const qs = `UPDATE Artist SET name = '${updateArtist.name}', date_of_birth = '${updateArtist.dateOfBirth}', biography = '${updateArtist.biography}' WHERE id = ${artistID}`;
    // console.log(artistID);
    // console.log(updateArtist);
    // console.log(qs);
    db.run(qs, (err) => {
        if (err){
            console.log(err)
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${artistID}`, (err, row) => {
                if (!row){
                    return res.sendStatus(500);
                }
                res.status(200).json({artist: row});
            })
        }
    });
});

artistRouter.delete('/:id', (req, res, next) => {
    const artistID = req.params.id;
    const qs = `UPDATE Artist SET is_currently_employed = 0 WHERE id = ${artistID}`;
    db.run(qs, (err) => {
        if (err) {
            console.log(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${artistID}`, (err, row) => {
                if (!row){
                    return res.sendStatus(500);
                }
                res.status(200).json({artist: row});
            })
        }
    });
});

module.exports = artistRouter;