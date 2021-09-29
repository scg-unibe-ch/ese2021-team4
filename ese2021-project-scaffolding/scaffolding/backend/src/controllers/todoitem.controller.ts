import express from 'express';
import {Router, Request, Response} from 'express';
import {TodoItem} from '../models/todoitem.model';
import {ItemService} from '../services/item.service';
import {MulterRequest} from '../models/multerRequest.model';



const todoItemController: Router = express.Router();
const itemService = new ItemService();


todoItemController.post('/', (req: Request, res: Response) => {
    TodoItem.create(req.body)
        .then(inserted => res.send(inserted))
        .catch(err => res.status(500).send(err));
});

// add image to a todoItem
todoItemController.post('/:id/image', (req: MulterRequest, res: Response) => {
    itemService.addImage(req).then(created => res.send(created)).catch(err => res.status(500).send(err));
});

// get the filename of an image
todoItemController.get('/:id/image', (req: Request, res: Response) => {
    itemService.getImageItem(Number(req.params.id)).then(products => res.send(products))
        .catch(err => res.status(500).send(err));
});


todoItemController.put('/:id', (req: Request, res: Response) => {
    TodoItem.findByPk(req.params.id)
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

todoItemController.delete('/:id', (req: Request, res: Response) => {
    TodoItem.findByPk(req.params.id)
        .then(found => {
            if (found != null) {
                found.destroy().then(() => res.status(200).send());
            } else {
                res.sendStatus(404);
            }
        })
        .catch(err => res.status(500).send(err));
});

export const TodoItemController: Router = todoItemController;
