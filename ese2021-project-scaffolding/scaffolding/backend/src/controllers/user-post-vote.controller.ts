import express, { Router, Request, Response } from 'express';
import { Post } from '../models/post.model';
import { UserPostVote } from '../models/user-post-vote.model';


const userPostVoteController: Router = express.Router();

// read
userPostVoteController.get('/', (req: Request, res: Response) => {
    UserPostVote.findAll({ })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

userPostVoteController.get('/votedBy/:userId', (req, res) => {
    UserPostVote.findAll({
        where: {
            userId: req.params.userId
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
        if (found != null) {
            res.status(200).send(found);
        } else {
            res.sendStatus(404);
        }
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
userPostVoteController.delete('/:userId/:postId', (req, res) => {
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

// // update
// userPostVoteController.put('/:id', (req: Request, res: Response) => {
//     Post.findByPk(req.params.id)
//         .then(found => {
//             if (found != null) {
//                 found.update(req.body).then(updated => {
//                     res.status(200).send(updated);
//                 });
//             } else {
//                 res.sendStatus(404);
//             }

//         })
//         .catch(err => res.status(500).send(err));
// });


export const UserPostVoteController: Router = userPostVoteController;
