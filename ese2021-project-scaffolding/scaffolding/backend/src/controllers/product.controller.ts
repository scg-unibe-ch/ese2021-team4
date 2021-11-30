import express, { Router, Request, Response } from 'express';
import { Product } from '../models/product.model';


const productController: Router = express.Router();

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

// create
productController.post('/', (req: Request, res: Response) => {
    Product.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
});

// delete
productController.delete('/:id', (req: Request, res: Response) => {
    Product.findByPk(req.params.id)
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
