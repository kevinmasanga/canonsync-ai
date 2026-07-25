/**
 * Returns an Express middleware that validates req.body (or req.query)
 * against the provided Joi schema.
 *
 * Usage:
 *   import { validateBody, validateQuery } from "../middleware/validate.js";
 *   router.post("/", validateBody(createShowSchema), controller.create);
 */

function makeValidator(source) {
    return function validate(schema) {
        return (req, res, next) => {
            const { error, value } = schema.validate(req[source], {
                abortEarly: false,   // collect all errors, not just the first
                stripUnknown: true   // silently drop extra fields
            });

            if (error) {
                return res.status(400).json({
                    error: "Validation failed.",
                    details: error.details.map(d => d.message)
                });
            }

            // Replace the source with the sanitised, coerced value
            req[source] = value;
            next();
        };
    };
}

export const validateBody  = makeValidator("body");
export const validateQuery = makeValidator("query");
