import express, { Router, Request, Response } from 'express';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';


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
orderController.post('/', async (req: Request, res: Response) => {

    const path = require('path'); // dotenv requires absolute path to file.
    require('dotenv').config({ path: path.resolve(__dirname, '../../src/.env') });

    // Stripe private key should never be published
    const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

    // let prod: Product = null;
    console.log('Product id' + req.body.productId);
    console.log('product title' + req.body.title);

    Product.findByPk(req.body.productId)
    .then(found => {
        if (found != null) {
            const session = stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [ // price is calculated in cents, 1.- (CHF) == unit_amout=100
                    {
                        price_data: {
                            currency: 'chf',
                            product_data: {
                                name: found.title,
                            },
                            unit_amount: (found.price * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: process.env.SITE + '/success',
                cancel_url: process.env.SITE + '/payment_cancelled',
            });

            Order.create(req.body).then(created => {
                const obj = created.toJSON();
                obj['id'] = session.id;

                res.status(201).send(obj);
            })
                .catch(err => res.status(500).send(err));
        } else {
            res.sendStatus(404);
        }
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
