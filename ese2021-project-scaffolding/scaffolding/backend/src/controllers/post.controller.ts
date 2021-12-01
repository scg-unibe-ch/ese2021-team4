import express, { Router, Request, Response } from 'express';
import { upload } from '../middlewares/fileFilter';
import { MulterRequest } from '../models/multerRequest.model';
import { Post } from '../models/post.model';
import { Image } from '../models/image.model';

const postController: Router = express.Router();

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
    Image.findAll({where: {postId: req.params.id}}).then(found => {
        if (found != null) {
            let imgIds = '';
            found.forEach(element => {
               imgIds = imgIds + String(element.imageId) + ',';
            });
            imgIds = imgIds.substring(0, imgIds.length - 1);
            res.status(200).send(imgIds);
        } else {
            res.status(500).send('no imageIds found');
        }
    });
});

// get specific image
postController.get('/getSingleImage/:id', (req: Request, res: Response) => {
    Image.findByPk(req.params.id).then(found => {
        if (found != null) {
            res.status(200).send(found.file);
        } else {
            res.status(200).send('');
        }
    });
});

// create
postController.post('/', (req: Request, res: Response) => {
    Post.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
});

// upload image and add to a post
postController.post('/:id/image', upload.any(), (req: MulterRequest, res: Response) => {
    let i = 0;
    while (i < req.files.length) {

        Image.create({file: req.files[i].buffer, postId: +req.params.id}).then(created => {
        res.status(201).send(created);
        }).catch(err => res.status(500).send(err));

        i = i + 1;
    }

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
