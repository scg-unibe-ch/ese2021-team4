import express, { Router, Request, Response } from 'express';
import { UserPostVote } from '../models/user-post-vote.model';


const userPostVoteController: Router = express.Router();

// read
userPostVoteController.get('/', (req: Request, res: Response) => {
    UserPostVote.findAll({ })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

userPostVoteController.get('/votedBy/:userId', (req, res) => {
    const { Op } = require('sequelize');
    UserPostVote.findAll({
        where: {
            userId: req.params.userId,
            vote: {[Op.not]: 0}
        }
    })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

userPostVoteController.get('/:userId/:postId', (req, res) => {
    const paramUserId = +req.params.userId;
    const paramPostId = +req.params.postId;
    const { Op } = require('sequelize');
    return UserPostVote.findOne({
        where: {
            [Op.and]: [
                {userId: paramUserId},
                {postId: paramPostId}
            ]
        }
    })
    .then(found => {
        res.status(200).send(found);
    })
    .catch(err => res.status(500).send(err));
});

// create
userPostVoteController.post('/', (req: Request, res: Response) => {
    UserPostVote.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
});

// delete
userPostVoteController.delete('/single/:userId/:postId', (req, res) => {
    const paramUserId = +req.params.userId;
    const paramPostId = +req.params.postId;
    const { Op } = require('sequelize');
    UserPostVote.findOne({
        where: {
            [Op.and]: [
                {userId: paramUserId},
                {postId: paramPostId}
            ]
        }
    })
    .then(found => {
        if (found != null) {
            found.destroy()
                .then(item => res.status(200).send({ deleted: item }))
                .catch(err => res.status(500).send(err));
        } else {
            res.sendStatus(404);
        }
    })
    .catch(err => res.status(500).send(err));
});

userPostVoteController.delete('/unflag/:postId', (req, res) => {
    console.log('here we are');
    console.log(req.params.postId);
    const paramPostId = +req.params.postId;
    console.log('postid: ', paramPostId);
    const promises = [];
    const { Op } = require('sequelize');
    UserPostVote.findAll({
        where: {
            postId: paramPostId
        }
    })
        .then(found => {
            console.log(found);
            found.forEach(entry => {
                if (entry.vote != null) {
                    entry.flag = null;
                    const newEntry = entry.toJSON();
                    promises.push(entry.update(newEntry)
                        .then(deleted => deleted)
                        .catch(err => res.status(500).send(err)));
                } else {
                    promises.push(entry.destroy()
                        .then(deleted => deleted)
                        .catch(err => {
                            console.log('delete error');
                            res.status(500).send(err);
                        }));
                }
        });
        })
        .catch(err => res.status(500).send(err));
    Promise.all(promises).then(deleted => res.status(200).send(deleted));
});

// update
userPostVoteController.put('/:userId/:postId', (req: Request, res: Response) => {
    const paramUserId = +req.params.userId;
    const paramPostId = +req.params.postId;
    const { Op } = require('sequelize');
    UserPostVote.findOne({
        where: {
            [Op.and]: [
                {userId: paramUserId},
                {postId: paramPostId}
            ]
        }
    })
        .then(found => {
            if (found != null) {
                found.update(req.body).then(updated => {
                    res.status(200).send(updated);
                });
            } else {
                res.sendStatus(404);
            }
        })
        .catch(err => res.status(500).send(err));
});


export const UserPostVoteController: Router = userPostVoteController;
