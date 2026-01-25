import Joi from "joi";

/* ===============================
   VALIDATION MIDDLEWARE
================================ */
export const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errorMessages,
        });
    }

    next();
};

/* ===============================
   VALIDATION SCHEMAS
================================ */

// Schema for Tenant Registration
export const registerTenantSchema = Joi.object({
    tenantName: Joi.string().min(3).required(),
    subdomain: Joi.string().alphanum().min(3).required(),
    adminEmail: Joi.string().email().required(),
    adminPassword: Joi.string().min(6).required(),
    adminFullName: Joi.string().min(3).required(),
});

// Schema for Login
export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    tenantSubdomain: Joi.string().required(),
});

// Schema for Project Creation
export const createProjectSchema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().allow("").optional(),
    status: Joi.string().valid("active", "archived", "completed").default("active"),
});

// Schema for Task Creation
export const createTaskSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().allow("").optional(),
    assignedTo: Joi.string().uuid().optional().allow(null),
    priority: Joi.string().valid("low", "medium", "high").default("medium"),
    dueDate: Joi.date().iso().optional().allow(null),
});

// Schema for User Creation
export const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    fullName: Joi.string().min(3).required(),
    role: Joi.string().valid("user", "tenant_admin").default("user"),
});

// Schema for User Update
export const updateUserSchema = Joi.object({
    fullName: Joi.string().min(3).optional(),
    role: Joi.string().valid("user", "tenant_admin").optional(),
    isActive: Joi.boolean().optional(),
});
