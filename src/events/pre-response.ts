import Hapi from "@hapi/hapi";

import { config } from "../config";

export const onPreResponse = (
	request: Hapi.Request,
	h: Hapi.ResponseToolkit
) => {
	if (!request.headers.origin) {
		return h.continue;
	}

	let response: any = request.response;

	if (response.isBoom) {
		response = response.output;
	}

	response.headers["access-control-allow-origin"] = request.headers.origin;
	response.headers["access-control-allow-credentials"] = "true";

	if (request.method !== "options") {
		return h.continue;
	}

	response.headers["access-control-expose-headers"] =
		"content-type, content-length, etag";
	response.headers["access-control-max-age"] = config.get("maxAge");

	if (request.headers["access-control-request-headers"]) {
		response.headers["access-control-allow-headers"] =
			request.headers["access-control-request-headers"];
	}

	if (request.headers["access-control-request-method"]) {
		response.headers["access-control-allow-methods"] =
			request.headers["access-control-request-method"];
	}

	return h.continue;
};
