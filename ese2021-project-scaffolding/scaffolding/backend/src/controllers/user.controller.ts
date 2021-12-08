import express, { Router, Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { verifyToken } from '../middlewares/checkAuth';
import {User} from '../models/user.model';

const userController: Router = express.Router();
const userService = new UserService();

userController.post('/register',
    (req: Request, res: Response) => {
            userService.register(req.body).then(registered => res.send(registered)).catch(err => res.status(500).send(err));
    }
);

userController.post('/login',
    (req: Request, res: Response) => {
        userService.login(req.body).then(login => res.send(login)).catch(err => res.status(500).send(err));
    }
);

userController.get('/', verifyToken, // you can add middleware on specific requests like that
    (req: Request, res: Response) => {
        userService.getAll().then(users => res.send(users)).catch(err => res.status(500).send(err));
    }
);

userController.get('/:param',

    (req, res) => {
        if (isNaN(+req.params.param)) {
            userService.get(req.params.param, null)
                .then(user => res.send(user))
                .catch(err => res.status(500).send(err));
        } else if (typeof +req.params.param === 'number') {
            userService.get(null, +req.params.param)
                .then(user => res.send(user))
                .catch(err => res.status(500).send(err));
        } else {
            res.status(500).send('faulty request');
        }

    }
);

userController.put('/:id', (req: Request, res: Response) => {
    User.findByPk(req.params.id)
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

export const UserController: Router = userController;
