var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Playlist = require('../models/playlist')

var helperFunc = require('../config/passport')


router.get('/profile', isLoggedIn, function(req, res, next) {
    // console.log(helperFunc.isAdmin())
    res.render('profile');
});

router.get('/library', isLoggedIn, function(req, res, next) {
    User.findOne({
            username: req.user.username
        })
        .populate('library')
        .exec(function(err, user) {
            if (err) return handleError(err)
            Playlist.find({
                owner: user._id
            }, function(err, playlist) {
                if (err) return handleError(err)
                res.render('library', {
                    songs: user.library,
                    playlistLibrary: playlist
                })
            })
        })
})

router.post('/library', function(req, res, next) {
    var name = req.body.name
    var song_id = req.body.id
    Playlist.findOne({
            owner: req.user._id,
            name: name
        })
        .populate('owner')
        .exec(function(err, playlist) {
            var newPlaylist
            if (err) return handleErro(err)
            if (playlist) {
                console.log('playlist exist')
                    // var pl = return userHasThePlaylist.map((a) => a.playlistLibrary.map((b) => b.filter((c) => c.playlistName == name)))
                    // console.log(pl)
                playlist.songs.push(song_id)
                playlist.save(function(err) {
                    if (err) {
                        res.status(400).send('failed ' + err)
                    } else {
                        res.send({
                            url: '/user/library'
                        })
                    }
                })
            } else {
                console.log(playlist)
                var newPlaylist = new Playlist({
                    owner: req.user._id,
                    name: name
                })
                newPlaylist.songs.push(song_id)
                newPlaylist.save(function(err) {
                    if (err) {
                        res.status(400).send('failed ' + err)
                    } else {
                        res.send({
                            url: '/user/library'
                        })
                    }
                })
            }
        })
})

router.get('/playlist', function(req, res, next){
  Playlist.find({owner: req.user._id})
  .populate('songs')
  .exec(function(err, playlists){
      if (err) return handleError(err)
      // console.log(playlists)
      res.render('playlist', {playlists: playlists})
  })
})

router.post('/playlist', function(req, res, next){
  var name = req.body.name
  Playlist.findOne({owner: req.user._id, name: name})
  .populate('songs')
  .exec(function(err, playlist){
    // console.log(JSON.stringify(playlist)
    if (err) return handleError(err)
    // var titles = playlist.songs.map((s) => s.title)
    // var songs = playlist.map((s) => s.songs)
    // console.log(songsTitle)
    res.send({songs: playlist.songs})
  })
})

router.get('/logout', isLoggedIn, function(req, res, next) {
    helperFunc.adminLogout()
        // console.log(helperFunc.isAdmin())
    req.logout();
    res.redirect('/')
})

router.use('/', notLoggedIn, function(req, res, next) {
    next()
})

router.get('/signup', function(req, res, next) {
    res.render('signup', {})
});

router.post('/signup', function(req, res, next) {
    //Validation Checks
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        //if there are errors in input
        res.render('signup', {
            errors: errors
        })
    } else {
        User.findOne({
            username: req.body.username
        }, function(err, userbyusername) {
            User.findOne({
                email: req.body.email
            }, function(err, userbyemail) {
                if (err) {
                    //if there is error
                    res.status(400).send('error adding new user ' + err)
                } else if (userbyusername) {
                    //console.log('user exists')
                    //if the user exists, display the msg
                    res.render('signup', {
                        errors: [{
                            msg: 'Username is already used'
                        }]
                    })
                } else if (userbyemail) {
                    res.render('signup', {
                        errors: [{
                            msg: 'Email is already used'
                        }]
                    })
                } else {
                    User.findOne()
                        //if the user doesnt exist, create it
                    var newUser = new User();
                    newUser.username = req.body.username;
                    newUser.email = req.body.email;
                    newUser.password = newUser.generateHash(req.body.password);
                    newUser.save(function(err, user, count) {
                        if (err) {
                            res.status(400).send('error adding new user ' + err)
                        } else {
                            res.redirect('/')
                        }
                    })
                }
            })
        })
    }
})

router.get('/login', function(req, res, next) {
    var messages = req.flash('error')
    res.render('login', {
        messages: messages,
        hasErrors: messages.length > 0
    })
})

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/login',
    failureFlash: true //turn the flag to true to enable flash message
}))


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/')
    }
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        next()
    } else {
        res.redirect('/')
    }
}
// router.post('/login', passport.authenticate('local.login', {
//     successRedirect: '/user/profile'
//     failureRedirect: '/user/login'
//
// })function(req, res, next) {
//     //Validation Checks
//     req.checkBody('email', 'Email is required').notEmpty();
//     req.checkBody('password', 'Password is required').notEmpty();
//     var errors = req.validationErrors();
//
//     if (errors) {
//         //if there are errors in input
//         res.render('login', {
//             errors: errors
//         })
//     } else {}
// })


// function(req, res, next) {
//     passport.authenticate('local.signup', function(err, user, info) {
//         if (err) {
//             res.redirect('/user/signup')
//         }
//         res.redirect('/user/profile')
//     })(req, res, next);
// })


// router.get('/signin', function(req, res, next) {
//     var messages = req.flash('error');
//     res.render('user/signin', {hasErrors: messages.length > 0, messages: messages});
// });
//
// router.post('/signin', passport.authenticate('local.signin', {
//     successRedirect: '/profile',
//     failureRedirect: '/signin',
//     failureFlash: true
// }));
//
// router.get('/logout', function(req, res, next) {
//     req.logout();
//     return res.redirect('/');
// });



// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/');
// }

// });
//
// router.post('/signin', passport.authenticate('local.signin', {
//     successRedirect: '/profile',
//     failureRedirect: '/signin',
//     failureFlash: true
// }));
//
// router.get('/logout', function(req, res, next) {
//     req.logout();
//     return res.redirect('/');
// });



// function isLoggedIn(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/');
// }
// }