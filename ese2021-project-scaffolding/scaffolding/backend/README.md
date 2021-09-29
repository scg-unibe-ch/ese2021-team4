# ESE2021 Scaffolding Backend

## Prerequisite
You should have installed [NodeJS and npm](https://nodejs.org/en/download/) (they come as one) in order to start the backend server.

## Start
- you should already have cloned the ese2021-project-scaffolding repository.
- navigate to the backend folder `cd ese2021-project-scaffolding/backend`
- run `npm install`
- run `npm run dev`
- open your browser with the url [http://localhost:3000](http://localhost:3000/)

## About
This part of the repository serves as a template for common problems you will face as a backend developer during your project. It is by no means complete but should give you a broad overview over the frameworks, libraries and technologies used. Please refer to the [reading list](https://github.com/scg-unibe-ch/ese2021/wiki/Reading-list) for links and tutorials.

We tried to show you different approaches how your backend may be structured, however you are free to follow your own principles.
Notice the differences between the [UserController](./src/controllers/user.controller.ts) and e.g. [TodoItemController](./src/controllers/todoitem.controller.ts). 

1. The logic is split up:
	- authorizing a request is done via middleware
	- logic e.g. creating/authentication is done via [UserService](./src/services/user.service.ts)
2. The controller itself is structured as a class.

Note that the `UserController`-approach is more suited for bigger architectures and for typescript applications. You may choose any aproach you wish, but make sure your code is well structured.

Here are more resources you can read: 

- [tsconfig](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
- [alternative example repo](https://github.com/maximegris/typescript-express-sequelize)
- [alternative example repo](https://developer.okta.com/blog/2018/11/15/node-express-typescript)

## Quick Links
These are links to some of the files that we have implemented/modified when developing the backend:

- Middleware
	- [the function](./src/middlewares/checkAuth.ts)
	- [how to use in express](./src/controllers/secured.controller.ts)
- Login: 
	- [service](./src/services/user.service.ts)
	- [controller](./src/controllers/user.controller.ts)
- Registration:
	- [service](./src/services/user.service.ts)
	- [controller](./src/controllers/user.controller.ts)
- [crud](./src/controllers/todolist.controller.ts)
- [typescript config](./src/tsconfig.json)
- [routing](./src/controllers)
- [API construction](./src/server.ts)

## Endpoints
Some endpoints can be called in a [browser](http://localhost:3000), others have to be called by a REST Client. [Here](./postman_collection) you can find a collection that contains all requests, which you can import into Postman. [Postman](https://www.postman.com/) is a REST Client.

### `/todoitem`
- POST

	<details>
		<summary>Request</summary>

	```json
		{
			"name": "string",
			"done": "boolean",
			"todoListId":"number"
		}
	```

	</details>


	<details>
		<summary>Response</summary>

		Code: 200
		Body:

	```json
	{
		"todoItemId": "number",
		"name": "string",
		"done": "boolean",
		"todoListId":"number"
	}
	```
</details>

- PUT `/:id`

	<details>
		<summary>Request</summary>

	```json
		{
			"name": "string",
			"done": "boolean",
			"todoListId":"number"
		}
	```

	</details>


	<details>
		<summary>Response</summary>

		Code: 200
		Body:

	```json
	{
		"todoItemId": "number",
		"name": "string",
		"done": "boolean",
		"todoListId":"number"
	}
	```
</details>

- POST `/:id/image`

	<details>
		<summary>Request</summary>

	```json
		{
			"filename": "File",
		}
	```

	</details>


	<details>
		<summary>Response</summary>

		Code: 200
		Body:

	```json
	{
		"imageId": "number"
		"fileName": "string",
		"todoItem": "number",
		"updatedAt": "string",
		"createdAt": "string"
	}
	```
</details>

- GET `/:id/image`

	<details>
		<summary>Request</summary>

	```json
		{}
	```

	</details>


	<details>
		<summary>Response</summary>

		Code: 200
		Body:

	```json
	{
		"imageId": "number"
		"fileName": "string",
		"todoItem": "number",
		"updatedAt": "string",
		"createdAt": "string"
	}
	```
</details>

- DELETE `/:id`<br/>
	Response: Status: 200

### `/todolist`
- POST
	<details>
		<summary>Request</summary>

		Code: 200
		Body:
	```json
	{
		"name":"string"
	}

	```
	</details>
	<details>
		<summary>Response</summary>

		Code: 200
		Body:
	```json
	{
		"todoListId": "number",
		"name":"string"
	}

	```
	</details>

- PUT `/:id`
	<details>
		<summary>Request</summary>

		Code: 200
		Body:
	```json
	{
		"name":"string"
	}

	```
	</details>
	<details>
		<summary>Response</summary>

		Code: 200
		Body:
	```json
	{
		"todoListId": "number",
		"name":"string"
	}

	```
	</details>

- DELETE `/:id`<br>
	Response: Status: 200

- GET
	<details>
		<summary>Response</summary>

		Code: 200
		Body:
	```json
	{
		"todoListId": "number",
		"name":"string",
		"todoItems":"TodoItem[]"
	}
	```
	</details>

### `/user`
- POST `/register`
	<details>
		<summary>Request</summary>

		Code: 200
		Body:
	```json
	{
		"userName":"string",
		"password":"stiring"
	}

	```
	</details>
	<details>
		<summary>Response</summary>

		Code: 200
		Body:
	```json
	{
		"userId": "number",
		"userName":"string",
		"password":"string(hashed)"
	}

	```
	</details>

- POST `/login`
	<details>
		<summary>Request</summary>

		Code: 200
		Body:
	```json
	{
		"userName":"string",
		"password":"string"
	}

	```
	</details>
	<details>
		<summary>Response</summary>

		Code: 200 || 403
		Body:
	```json
	{
		"user": {
			"userId":"string",
			"userName":"string",
			"password":"string(hashed)"
		},
		"token":"string"
	}

	```
	</details>

- GET
	<details>
		<summary>Response</summary>

		Code: 200
		Body:
	```json
	[
		{
			"userId":"string",
			"userName":"string",
			"password":"stirng(hashed)"
		},
		{
			"userId":"string",
			"userName":"string",
			"password":"stirng(hashed)"
		},
		...
	]

	```
	</details>

### `/secured`
- GET
	<details>
		<summary>Request</summary>


	Header: Authorization: Bearer  + `token`
	</details>

	<details>
		<summary>Response</summary>

		Code: 200 | 403
		Body:
	```json
	{
		"message":"string"
	}

	```
	</details>
	
### `/admin`
- GET
	<details>
		<summary>Request</summary>


	Header: Authorization: Bearer  + `token`
	</details>

	<details>
		<summary>Response</summary>

		Code: 200 | 403
		Body:
	```json
	{
		"message":"string"
	}

	```
	</details>

### `/`
- GET
	<details>
		<summary>Response</summary>

		Code: 200
		Body:
	```text
	<h1>Welcome to the ESE-2021 Course</h1><span style=\"font-size:100px;\">&#127881;</span>
	```
	</details>
