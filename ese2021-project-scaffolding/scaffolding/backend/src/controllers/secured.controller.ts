import express, { Router, Request, Response } from 'express';
import { verifyToken } from '../middlewares/checkAuth';

const securedEndpoint: Router = express.Router();

// This is a middleware function that validates the token in the authorization-header for any incoming request
securedEndpoint.use(verifyToken);

securedEndpoint.get('/', (req: Request, res: Response) => {
    // for demonstration purposes the content of the token and a message is returned
    res.send({message: `This is a secured  Endpoint, ${req.body.tokenPayload.userName}` , decodedToken: req.body.tokenPayload });
});

export const SecuredController: Router = securedEndpoint;
