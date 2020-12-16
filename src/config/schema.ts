import Joi from "@hapi/joi";

export const schema = Joi.object({
	/**
	 * The value of the "access-control-max-age" header.
	 */
	maxAge: Joi.number()
		.integer()
		.default(60 * 10),
});
