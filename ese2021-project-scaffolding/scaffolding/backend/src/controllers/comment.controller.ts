import express from 'express';
import {Router, Request, Response} from 'express';
import {Comment} from '../models/comment.model';
// import {MulterRequest} from '../models/multerRequest.model';

const commentController: Router = express.Router();

commentController.post('/', (req: Request, res: Response) => {
    Comment.create(req.body)
        .then(inserted => res.send(inserted))
        .catch(err => res.status(500).send(err));
});


// get the filename of an image
commentController.get('/:id', (req: Request, res: Response) => {
  Comment.findByPk(Number(req.params.id)).then(products => res.send(products))
        .catch(err => res.status(500).send(err));
});

commentController.get('/createdBy/:userId', (req, res) => {
    return Comment.findAll({
        where: {
            userId: req.params.userId
        }
    })
        .then(comments => res.status(200).send(comments))
        .catch(err => res.status(500).send(err));
});


commentController.put('/:id', (req: Request, res: Response) => {
    Comment.findByPk(req.params.id)
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

commentController.delete('/:id', (req: Request, res: Response) => {
    Comment.findByPk(req.params.id)
        .then(found => {
            if (found != null) {
                found.destroy().then(() => res.status(200).send());
            } else {
                res.sendStatus(404);
            }
        })
        .catch(err => res.status(500).send(err));
});

commentController.get('/forPost/:id', (req: Request, res: Response) => {
    Comment.findAll({
        where: {
            postId: req.params.id
        }
    }).then(found => {
            if (found != null) {
                res.status(200).send(found);
            } else {
                res.sendStatus(404).send();
            }
        })
        .catch(err => res.status(500).send(err));
});

export const CommentController: Router = commentController;
