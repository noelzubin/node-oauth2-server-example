import { ClientCredentialsModel, RequestAuthenticationModel, Token, Client, User, PasswordModel, RefreshTokenModel, RefreshToken } from "oauth2-server";

/**
 * Configuration.
 */

interface Config {
	clients: Client[],
	confidentialClients: Client[],
	tokens: Token[],
	users: User[],
}

const config: Config = {
	clients: [{
		id: 'application',
		clientSecret: 'secret',
		grants: [
			'password',
			'refresh_token'
		],
		redirectUris: []  
	}],
	confidentialClients: [{
		id: 'confidentialApplication',
		clientSecret: 'topSecret',
		grants: [
			'password',
			'client_credentials'
		],
		redirectUris: []
	}],
	tokens: [],
	users: [{
		username: 'pedroetb',
		password: 'password'
	}]
};

/**
 * Dump the memory storage content (for debug).
 */

const dump = function() {

	console.log('clients', config.clients);
	console.log('confidentialClients', config.confidentialClients);
	console.log('tokens', config.tokens);
	console.log('users', config.users);
};

/*
 * Methods used by all grant types.
 */

const getAccessToken = async (token: string) => {
	return config.tokens.find(
		savedToken => savedToken.accessToken === token
	);
};

const getClient = async (clientId: string,  clientSecret: string) => {

	const clients = config.clients.filter((client: Client) => {

		return client.id === clientId && client.clientSecret === clientSecret;
	});

	const confidentialClients = config.confidentialClients.filter((client: Client) => {

		return client.id === clientId && client.clientSecret === clientSecret;
	});

	return clients[0] || confidentialClients[0];
};

const saveToken = async (token: Token, client: Client, user: User) => {

	token.client = {
		id: client.id,
		grants: [],
	};

	token.user = {
		username: user.username
	};

	config.tokens.push(token);

	return token;
};

/*
 * Method used only by password grant type.
 */

const getUser = async (username: string, password: string) => {

	var users = config.users.filter(function(user: User) {

		return user.username === username && user.password === password;
	});

	return users[0];
};

/*
 * Method used only by client_credentials grant type.
 */

const getUserFromClient = async (client: Client) => {

	return config.confidentialClients.find((savedClient: Client) =>
		savedClient.id === client.id && savedClient.clientSecret === client.clientSecret
	);
};

/*
 * Methods used only by refresh_token grant type.
 */

const getRefreshToken = async (refreshToken: string) => {

	const tokens = config.tokens.filter((savedToken: Token) => {

		return savedToken.refreshToken === refreshToken;
	});

	if (!tokens.length) {
		return;
	}

	return tokens[0] as RefreshToken;
};

const revokeToken = async (token: Token) => {

	config.tokens = config.tokens.filter(function(savedToken) {

		return savedToken.refreshToken !== token.refreshToken;
	});

	var revokedTokensFound = config.tokens.filter(function(savedToken) {

		return savedToken.refreshToken === token.refreshToken;
	});

	return !revokedTokensFound.length;
};

/**
 * Verify the scope of the token
 */
const verifyScope = async (token: Token, scope: string | string[]) => {
	return true
} ;

/**
 * Export model definition object.
 */

interface Model extends ClientCredentialsModel, RequestAuthenticationModel, PasswordModel, RefreshTokenModel { };

const model: Model = {
	getAccessToken: getAccessToken,
	getClient: getClient,
	saveToken: saveToken,
	getUser: getUser,
	getUserFromClient: getUserFromClient,
	getRefreshToken: getRefreshToken,
	revokeToken: revokeToken,
	verifyScope: verifyScope,
}

export default model;
