import express, { Router, Request, Response } from 'express';
import { MulterRequest } from '../models/multerRequest.model';
import { Post } from '../models/post.model';
import { Image } from '../models/image.model';
import { ImageService } from '../services/image.service';
import {Op} from 'sequelize';

const postController: Router = express.Router();
const imageService = new ImageService();

// read
postController.get('/', (req: Request, res: Response) => {
    Post.findAll({ })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

postController.get('/createdBy/:id', (req, res) => {
    console.log('createdby');
    Post.findAll({
        where: {
            userId: req.params.id
        }
    }).then((posts) => {
        res.status(200).send(posts);
    }).catch(err => {
        res.sendStatus(500);
    });
});

postController.get('/flagged', (req, res) => {
    console.log('createdby');
    Post.findAll({
        where: {
            flags: {[Op.gt]: 0}
        }
    }).then((posts) => {
        res.status(200).send(posts);
    }).catch(err => {
        res.sendStatus(500);
    });
});

postController.get('/:id', (req, res) => {
    Post.findByPk(req.params.id)
        .then(found => {
            if (found != null) {
                res.status(200).send(found);
            } else {
                res.sendStatus(404);
            }
    }).catch(err => res.status(500).send(err));
});

// get imageIds to specific post
postController.get('/:id/getImageIds', (req: Request, res: Response) => {
    imageService.getImageIds('post', +req.params.id).then(ids => res.send(ids)).catch(err => res.status(500).send(err));
});

// get specific image
postController.get('/getSingleImage/:id', (req: Request, res: Response) => {
    imageService.getSpecificImage(+req.params.id).then(image => res.send(image)).catch(err => res.status(500).send(err));
});

// create
postController.post('/', (req: Request, res: Response) => {
    Post.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
});

// upload image and add to a post
postController.post('/:id/image', (req: MulterRequest, res: Response) => {
    imageService.postImage(req, 'post').then(created => res.send(created)).catch(err => res.status(500).send(err));
});

// delete
postController.delete('/:id', (req: Request, res: Response) => {
    Post.findByPk(req.params.id)
        .then(found => {
            if (found != null) {
                Image.findAll({where: {postId: found.postId}}).then(foundImgs => {
                    if (foundImgs != null) {
                        foundImgs.forEach(image => {
                           image.destroy();
                        });
                    }
                });
                found.destroy()
                    .then(item => res.status(200).send({ deleted: item }))
                    .catch(err => res.status(500).send(err));
            } else {
                res.sendStatus(404);
            }
        })
        .catch(err => res.status(500).send(err));
});

postController.delete('/images/:id', (req: Request, res: Response) => {
    imageService.deleteSingleImage(+req.params.id).then(destroyed => res.send(destroyed)).catch(err => res.status(500).send(err));
});

// update
postController.put('/:id', (req: Request, res: Response) => {
    Post.findByPk(req.params.id)
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

export const PostController: Router = postController;
