import express, { Router, Request, Response } from 'express';
import { Image } from '../models/image.model';
import { MulterRequest } from '../models/multerRequest.model';


const imageController: Router = express.Router();

// read
imageController.get('/', (req: Request, res: Response) => {
    Image.findAll({ })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

// create
imageController.post('/', (req: MulterRequest, res: Response) => {
    console.log('Now trying to receive image');
    console.log(req.file);
    const image = req.get('image0');
    console.log(image);
});

export const ImageController: Router = imageController;
