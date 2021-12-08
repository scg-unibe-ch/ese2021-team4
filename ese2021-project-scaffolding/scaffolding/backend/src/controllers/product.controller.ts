import express, { Router, Request, Response } from 'express';
import { MulterRequest } from '../models/multerRequest.model';
import { Product } from '../models/product.model';
import { Image } from '../models/image.model';
import { ImageService } from '../services/image.service';

const productController: Router = express.Router();
const imageService = new ImageService();

// read
productController.get('/', (req: Request, res: Response) => {
    Product.findAll({ })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

productController.get('/:id', (req, res) => {
    Product.findByPk(req.params.id)
        .then(found => {
                res.status(200).send(found);
        })
        .catch(err => res.status(500).send(err));
});

// get imageIds to specific post
productController.get('/:id/getImageIds', (req: Request, res: Response) => {
    imageService.getImageIds('product', +req.params.id)
        .then(ids => res.send(ids))
        .catch(err => res.status(500).send(err));
});

// get specific image
productController.get('/getSingleImage/:id', (req: Request, res: Response) => {
    imageService.getSpecificImage(+req.params.id)
        .then(image => res.send(image))
        .catch(err => res.status(500).send(err));
});

// create
productController.post('/', (req: Request, res: Response) => {
    Product.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
});

// upload image and add to a product
productController.post('/:id/image', (req: MulterRequest, res: Response) => {
    imageService.postImage(req, 'product')
        .then(created => res.send(created))
        .catch(err => res.status(500).send(err));
});

// delete
productController.delete('/:id', (req: Request, res: Response) => {
    Product.findByPk(req.params.id)
        .then(found => {
            if (found != null) {
                Image.findAll({where: {productId: found.productId}}).then(foundImgs => {
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
productController.put('/:id', (req: Request, res: Response) => {
    Product.findByPk(req.params.id)
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


export const ProductController: Router = productController;
