import express, { Router, Request, Response } from 'express';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';


const orderController: Router = express.Router();


// read
orderController.get('/', (req: Request, res: Response) => {
    Order.findAll()
        .then(list => {
            getAllOrders(list).then((orders: any ) => {
                res.status(200).send(orders);
            });
        })
        .catch(err => res.status(500).send(err));
});

orderController.get('/createdBy/:id', (req, res) => {
    Order.findAll({
        where: {
            userId: req.params.id
        }
    })
        .then(list => {
            getAllOrders(list).then((orders: any ) => {
                res.status(200).send(orders);
            });
    })
        .catch(err => res.status(500).send(err));
});

// collects all promises from every checkBillingStatus call into a single promise
function getAllOrders(list) {
    const promises = [];
    const orders = [];
    list.forEach((order: any) => {
        promises.push(
            checkBillingStatus(order, orders)
        );
    });
    return Promise.all(promises).then(() => orders );
}

// deletes order if it was created from an unpaid stripe session.
// otherwise updates billingStatus if necessary and pushes order to the given orders list
async function checkBillingStatus(order, orders) {
    if (order.billingStatus === '') {
        const path = require('path');
        require('dotenv').config({ path: path.resolve(__dirname, '../../src/.env') });

        // Stripe private key should never be published
        const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
        const session = await stripe.checkout.sessions.retrieve(order.sessionId);
        if (session.payment_status === 'unpaid') {
            Order.findByPk(order.orderId)
                .then((toDelete) => toDelete.destroy());
        } else {
            order.billingStatus = 'paid with stripe';
            orders.push(order);
            const updatedOrder = order.toJSON();
            Order.findByPk(order.orderId).then(found => found.update(updatedOrder));
        }
    } else {
        orders.push(order);
    }
}

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
orderController.post('/invoice', (req: Request, res: Response) => {
    Order.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
    }
);

// create
orderController.post('/stripe', async (req: Request, res: Response) => {

    const path = require('path'); // dotenv requires absolute path to file.
    require('dotenv').config({ path: path.resolve(__dirname, '../../src/.env') });

    // Stripe private key should never be published
    const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

    // this await means: Wait for the Promise to resolve and then set prod accordingly. Do not
    // execute more lines.
    const prod: any = await Product.findByPk(req.body.productId)
        .then(found => {
            if (found != null) {
                return found;
            } else {
                res.sendStatus(404);
            }

        })
        .catch(err => res.status(500).send(err));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],

        line_items: [{
            price_data: {
                currency: 'chf',
                product_data: {
                  name: prod.title,
                },
                unit_amount: prod.price * 100,
            },
            quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: process.env.SITE + '/success',
        cancel_url: process.env.SITE + '/payment_cancelled/' + prod.productId,
    });

    const newBody = req.body;
    newBody['sessionId'] = session.id;

    Order.create(newBody).then(created => {
        const obj = created.toJSON();
        obj['id'] = session.id;

        res.status(201).send(obj);
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
