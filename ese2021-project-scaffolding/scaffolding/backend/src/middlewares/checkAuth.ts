import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// this way you can just define a function and export it instead of a whole class
export function verifyToken(req: Request, res: Response, next: any) {
    try {
        // get secret key from environment (defined in nodemon.json)
        const secret = process.env.JWT_SECRET;
        // since the authorization header consists of "Bearer <token>" where <token> is a JWT token
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, secret);
        if (decoded == null) {
            res.status(403).send({ message: 'Unauthorized' });
        }
        // adds the field "tokenPayload" to the request enabling following functions to use data from the token
        req.body.tokenPayload = decoded;
        next();
    } catch (err) {
        res.status(403).send({ message: 'Unauthorized' });
    }
}
