var express = require('express'),
    router = express.Router(),
    Song = require('../models/song'),
    User = require('../models/user'),
    passportFunction = require('../lib/passport'),
    Language = require('../models/language'),
    createDefaultSong = require('../lib/createDefaultSong'),
    copyrightTypes = require('../lib/copyrightTypes'),
    _ = require('lodash');


router.get('/', passportFunction.adminLoggedIn, function(req, res, next) {
    Song.find({})
        .populate('lang')
        .exec(function(err, songs) {
            if (err) return next(err);
            res.render('songs/songlist-db', {
                songs: songs
            });
        });
})

router.delete('/:song_id', passportFunction.adminLoggedIn, function(req, res, next) {
    Song.remove({
        _id: req.params.song_id
    }, function(err) {
        if (err) return next(err);
        res.send();
    });
})


router.route('/add')
    .all(passportFunction.loggedIn)
    .get(function(req, res, next) {
        Language.find(function(err, languages) {
            if (err) next(err);
            createDefaultSong(function(defaultSong) {
                res.render('songs/addSong', {
                    song: defaultSong,
                    availableLanguages: languages,
                    copyrightTypes: _.values(copyrightTypes)
                });
            });
        });
    })
    //add the song to database
    .post(function(req, res, next) {
        req.checkBody('title', 'Title is empty').notEmpty();
        req.checkBody('author', 'Author is empty').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send({
                errorMessages: errors.map((error) => error.msg)
            });
        } else {
            var data = req.body;
            Song.findOne({
                title: data.title
            }, function(err, song) {
                if (err) {
                    res.status(400).send('error ' + err);
                }
                if (song) {
                    res.send({
                        errorMessages: ['Song Exists']
                    });
                } else {
                    if (err) next(err);
                    var newSong = new Song({
                        title: data.title,
                        author: data.author,
                        translator: data.translator,
                        year: data.year,
                        lang: data.lang,
                        youtubeLink: data.youtubeLink,
                        lyrics: data.lyrics,
                        contributor: req.user.username,
                        copyright: data.copyright,
                        timeAdded: Date.now()
                    });
                    newSong.save(function(err) {
                        if (err) {
                            res.status(400).send('error saving new song ' + err);
                        } else if (data.copyright === 'private') {
                            User.findById(req.user._id, function(err, user) {
                                user.library.push(newSong._id);
                                user.save(function(err) {
                                    if (err) next(err)
                                    res.send({
                                        url: '/song/' + newSong._id
                                    });
                                });
                            });
                        } else {
                            res.send({
                                url: '/song/' + newSong._id
                            });
                        }
                    });
                }
            });
        }
    });

module.exports = router;
