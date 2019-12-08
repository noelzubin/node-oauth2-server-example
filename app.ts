import BodyParser from "body-parser";
import express from "express";
import OAuth2Server, { Request, Response } from "oauth2-server";
import model from "./model.js";

const app = express();

app.use(BodyParser.urlencoded({ extended: true }));

app.use(BodyParser.json());

const oauth = new OAuth2Server({
	accessTokenLifetime: 60 * 60,
	allowBearerTokensInQueryString: true,
	model,
});

app.all("/oauth/token", obtainToken);

app.get("/", authenticateRequest, (req, res) => {

	res.send("Congratulations, you are in a secret area!");
});

app.listen(3000);

function obtainToken(req: express.Request, res: express.Response) {

	const request = new Request(req);
	const response = new Response(res);

	return oauth.token(request, response)
		.then((token) => {

			res.json(token);
		}).catch((err) => {

			res.status(err.code || 500).json(err);
		});
}

function authenticateRequest(req: express.Request, res: express.Response, next: express.NextFunction) {

	const request = new Request(req);
	const response = new Response(res);

	return oauth.authenticate(request, response)
		.then((token) => {

			next();
		}).catch((err) => {

			res.status(err.code || 500).json(err);
		});
}
