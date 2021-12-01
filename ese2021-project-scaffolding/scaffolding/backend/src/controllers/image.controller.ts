import express, { Router, Request, Response } from 'express';
// import { Post } from '../models/post.model';
import { Image } from '../models/image.model';
import { MulterRequest } from '../models/multerRequest.model';


const imageController: Router = express.Router();

// read
imageController.get('/', (req: Request, res: Response) => {
    Image.findAll({ })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

// postController.get('/createdBy/:id', (req, res) => {
//     console.log('createdby');
//     Post.findAll({
//         where: {
//             userId: req.params.id
//         }
//     }).then((posts) => {
//         res.status(200).send(posts);
//     }).catch(err => {
//         res.sendStatus(500);
//     });
// });

/*
imageController.get('/:id', (req, res) => {
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
*/

// create
imageController.post('/', (req: MulterRequest, res: Response) => {


    console.log('Now trying to receive image');
    console.log(req.file);
    // let image = req['image1'];
    const image = req.get('image0');
    console.log(image);
    // console.log(image);
    // Image.create(req.body).then(created => {
    //     res.status(201).send(created);
    // })
    //     .catch(err => res.status(500).send(err));
});


// delete
/*
imageController.delete('/:id', (req: Request, res: Response) => {
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
*/


export const ImageController: Router = imageController;
