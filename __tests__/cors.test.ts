import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import { plugin } from "../src";

let server: Hapi.Server;

const sendGetRequest = (url: string, headers = {}) => server.inject({ method: "GET", url, headers });
const sendOptionsRequest = (url: string, headers = {}) => server.inject({ method: "OPTIONS", url, headers });

beforeAll(async () => {
	server = new Hapi.Server({ debug: { request: ["*"] } });

	await server.register({ plugin });

	server.route({
		method: "GET",
		path: "/",
		handler: () => [],
	});

	server.route({
		method: "GET",
		path: "/boom",
		handler: () => Boom.teapot(),
	});

	server.route({
		method: "OPTIONS",
		path: "/options",
		handler: () => Boom.teapot(),
	});
});

describe("CORS", () => {
	it("should not set headers if the origin is undefined", async () => {
		const response = await sendGetRequest("/");

		expect(response.statusCode).toBe(200);
		expect(Object.keys(response.request.headers)).toEqual(["user-agent", "host"]);
	});

	it("should set the headers for a boom response", async () => {
		const response = await sendGetRequest("/boom", {
			origin: "example.com",
		});

		expect(response.statusCode).toBe(418);
		expect(response.headers["access-control-allow-origin"]).toBe("example.com");
		expect(response.headers["access-control-allow-credentials"]).toBe("true");
	});

	it("should set the headers for an options request", async () => {
		const response = await sendOptionsRequest("/options", {
			origin: "example.com",
			"access-control-request-headers": "x-header",
			"access-control-request-method": "GET",
		});

		expect(response.statusCode).toBe(418);
		expect(response.headers["access-control-allow-origin"]).toBe("example.com");
		expect(response.headers["access-control-allow-credentials"]).toBe("true");
		expect(response.headers["access-control-allow-headers"]).toBe("x-header");
		expect(response.headers["access-control-allow-methods"]).toBe("GET");
	});

	it("should set the headers for an options request without acces-control-request headers", async () => {
		const response = await sendOptionsRequest("/options", {
			origin: "example.com",
		});

		expect(response.statusCode).toBe(418);
		expect(response.headers["access-control-allow-origin"]).toBe("example.com");
		expect(response.headers["access-control-allow-credentials"]).toBe("true");
		expect(response.headers["access-control-allow-headers"]).toBeUndefined();
		expect(response.headers["access-control-allow-methods"]).toBeUndefined();
	});
});
