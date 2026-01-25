import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("Auth API", () => {
    let tenantId;

    beforeAll(async () => {
        // Clean up before tests
        await pool.query("DELETE FROM users WHERE email = 'testuser@example.com'");
        await pool.query("DELETE FROM tenants WHERE subdomain = 'testtenant'");
    });

    afterAll(async () => {
        // Clean up after tests
        await pool.query("DELETE FROM users WHERE email = 'testuser@example.com'");
        await pool.query("DELETE FROM tenants WHERE subdomain = 'testtenant'");
    });

    it("should register a new tenant", async () => {
        const res = await request(app)
            .post("/api/auth/register-tenant")
            .send({
                tenantName: "Test Tenant",
                subdomain: "testtenant",
                adminEmail: "testadmin@testtenant.com",
                adminPassword: "password123",
                adminFullName: "Test Admin"
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        tenantId = res.body.data.tenantId;
    });

    it("should login as tenant admin", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testadmin@testtenant.com",
                password: "password123",
                tenantSubdomain: "testtenant"
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
    });

    it("should fail validation with missing fields", async () => {
        const res = await request(app)
            .post("/api/auth/register-tenant")
            .send({
                tenantName: "Test"
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Validation Error");
    });
});
