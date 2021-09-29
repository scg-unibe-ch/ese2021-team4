import express from 'express';
import { Router, Request, Response } from 'express';
import { TodoList } from '../models/todolist.model';

const todoListController: Router = express.Router();

todoListController.post('/', (req: Request, res: Response) => {
    TodoList.create(req.body).then(created => {
        res.status(201).send(created);
    })
        .catch(err => res.status(500).send(err));
});

todoListController.put('/:id', (req: Request, res: Response) => {
    TodoList.findByPk(req.params.id)
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

todoListController.delete('/:id', (req: Request, res: Response) => {
    TodoList.findByPk(req.params.id)
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

todoListController.get('/', (req: Request, res: Response) => {
    // this automatically fills each todolist with the according todoitems
    TodoList.findAll({ include: [TodoList.associations.todoItems] })
        .then(list => res.status(200).send(list))
        .catch(err => res.status(500).send(err));
});

export const TodoListController: Router = todoListController;
