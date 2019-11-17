/**
 * Description.
 *
 * @author zhengchengc <z@chenzhengcheng.com>
 * @since 19:50 11 Nov 2019
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');

// Load Input Validation
const validateProfileInput = require('../../validation/profile');

// @route  GET api/profile/test
// @desc   Tests profile route
// @access Public
router.get('/test', (req, res) => res.json({msg: "Profile router works!"}));

// @route  GET api/profile
// @desc   Get current users profile
// @access Private
router.get('/', passport.authenticate('jwt', { session: false}), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        }).catch(err => res.status(400).json(err));
});

// @route  POST api/profile/all
// @desc   Get all profiles
// @access Public
router.get('/all', (req, res) => {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = 'There are no profiles';
                return res.status(404).json(errors);
            }
            res.json(profiles);
        }).catch(err => {
            errors.
            res.status(404).json({ profile: 'There are no profiles' })
    })
});

// @route  POST api/profile/handle/:handle
// @desc   Get profile by handle
// @access Public
router.get('/handle/:handle', (req, res) => {
   Profile.findOne({ handle: req.params.handle })
       .populate('user', ['name', 'avatar'])
       .then(profile => {
           if (!profile) {
               errors.noprofile = 'There is no profile for this user';
               res.status(404).json(errors);
           }
           res.json(profile);
       })
       .catch(err => res.status(404).json(err));
});

// @route  POST api/profile/user/:user_id
// @desc   Get profile by user id
// @access Public
router.get('/user/:user_id', (req, res) => {
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({ profile: 'There is no profile for this user' }));
});

// @route  POST api/profile
// @desc   Create or Edit user profile
// @access Private
router.get('/', passport.authenticate('jwt', { session: false}), (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.user.handle;
    if (req.body.company) profileFields.company = req.user.company;
    if (req.body.website) profileFields.website = req.user.website;
    if (req.body.location) profileFields.location = req.user.location;
    if (req.body.bio) profileFields.bio = req.user.bio;
    if (req.body.status) profileFields.status = req.user.status;
    if (req.body.githubusername) profileFields.githubusername = req.user.githubusername;
    // Skills split into array
    if (typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');
    }
    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.body.id }).then(profile => {
        if (profile) {
            // Update
            Profile.findOneAndUpdate(
                { user: req.body.id },
                { $set: profileFields },
                { new: true }
            ).then(profile => res.json(profile));
        } else {
            // Create

            // Check if handle  exists
            Profile.findOne({ handle: profileFields.handle }).then(profile => {
                if (profile) {
                    errors.handle = 'That handles already exists';
                    res.status(400).json(errors);
                }

                // Save profile
                new Profile(profileFields).save()
                    .then(profile => res.json(profile)
                );
            });
        }
    })
});

module.exports = router;