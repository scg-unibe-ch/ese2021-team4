import express, { Application , Request, Response } from 'express';
import morgan from 'morgan';
import { UserController } from './controllers/user.controller';
import { SecuredController } from './controllers/secured.controller';
import { CommentController } from './controllers/comment.controller';
import { Sequelize } from 'sequelize';
import { User } from './models/user.model';
import { Image } from './models/image.model';

import cors from 'cors';
import {AdminController} from './controllers/admin.controller';
import { Post } from './models/post.model';
import { Comment } from './models/comment.model';
import { PostController } from './controllers/post.controller';
import { UserPostVote } from './models/user-post-vote.model';
import { UserPostVoteController} from './controllers/user-post-vote.controller';
import { Product } from './models/product.model';
import { ProductController } from './controllers/product.controller';
import { OrderController } from './controllers/order.controller';
import { Order } from './models/order.model';

export class Server {
    private server: Application;
    private sequelize: Sequelize;
    private port = process.env.PORT || 3000;

    constructor() {
        this.server = this.configureServer();
        this.sequelize = this.configureSequelize();

        User.initialize(this.sequelize); // creates the tables if they dont exist
        Post.initialize(this.sequelize);
        Product.initialize(this.sequelize);
        Order.initialize(this.sequelize);
        Comment.initialize(this.sequelize);
        UserPostVote.initialize(this.sequelize);
        Image.initialize(this.sequelize);
        UserPostVote.createAssociations();
        Post.createAssociations();
        Comment.createAssociations();




        this.sequelize.sync().then(() => {                           // create connection to the database
            this.server.listen(this.port, () => {                                   // start server on specified port
                console.log(`server listening at http://localhost:${this.port}`);   // indicate that the server has started
            });
        });
    }

    private configureServer(): Application {
        // options for cors middleware
        const options: cors.CorsOptions = {
            allowedHeaders: [
                'Origin',
                'X-Requested-With',
                'Content-Type',
                'Accept',
                'X-Access-Token',
            ],
            credentials: true,
            methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
            origin: `http://localhost:${this.port}`,
            preflightContinue: false,

        };

        return express()
            .use(cors())
            .options('*', cors(options))
            .use(express.json())                    // parses an incoming json to an object
            .use(morgan('tiny'))                    // logs incoming requests
            .use('/user', UserController)
            .use('/secured', SecuredController)
            .use('/admin', AdminController)
            .use('/post', PostController)
            .use('/comment', CommentController)
            .use('/product', ProductController)
            .use('/order', OrderController)
            .use('/userpostvote', UserPostVoteController)
            .use(express.static('./src/public'))
            // this is the message you get if you open http://localhost:3000/ when the server is running
            .get('/', (req, res) => res.send('<h1>Welcome to the ESE-2021 Backend Scaffolding <span style="font-size:50px">&#127881;</span></h1>'));
    }

    private configureSequelize(): Sequelize {
        return new Sequelize({
            dialect: 'sqlite',
            storage: 'db.sqlite',
            logging: false // can be set to true for debugging
        });
    }
}

const server = new Server(); // starts the server
