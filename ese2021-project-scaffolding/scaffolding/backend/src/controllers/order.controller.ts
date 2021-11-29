import express, { Router, Request, Response } from 'express';
import { Order } from '../models/order.model';


const orderController: Router = express.Router();

// read
orderController.get('/', (req: Request, res: Response) => {
    Order.findAll({ })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

orderController.get('/createdBy/:id', (req, res) => {
    Order.findAll({
        where: {
            userId: req.params.id
        }
    }).then((orders) => {
        res.status(200).send(orders);
    }).catch(err => {
        res.sendStatus(500);
    });
});

orderController.get('/:id', (req, res) => {
    Order.findByPk(req.params.id)
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
orderController.post('/', (req: Request, res: Response) => {
    Order.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
});

// update
orderController.put('/:id', (req: Request, res: Response) => {
    Order.findByPk(req.params.id)
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


export const OrderController: Router = orderController;
