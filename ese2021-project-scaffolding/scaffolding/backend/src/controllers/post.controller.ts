import express, { Router, Request, Response } from 'express';
import { upload } from '../middlewares/fileFilter';
import { MulterRequest } from '../models/multerRequest.model';
import { Post } from '../models/post.model';
import { ItemService } from '../services/item.service';


const postController: Router = express.Router();
const itemService = new ItemService();

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
        })
        .catch(err => res.status(500).send(err));
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
    console.log(req.files[0]);
    // itemService.addImage(req).then(created => res.send(created)).catch(err => res.status(500).send(err));
});


// delete
postController.delete('/:id', (req: Request, res: Response) => {
    Post.findByPk(req.params.id)
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
