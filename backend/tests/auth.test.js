import request from "supertest";
import app from "../src/app.js";
import pool from "../src/config/db.js";

describe("Auth API", () => {
    const testTenant = {
        tenantName: "Test Corp",
        subdomain: "testcorp" + Date.now(),
        adminEmail: `admin${Date.now()}@testcorp.com`,
        adminPassword: "password123",
        adminFullName: "Test Admin",
    };

    afterAll(async () => {
        // Cleanup
        await pool.query("DELETE FROM tenants WHERE subdomain = $1", [
            testTenant.subdomain,
        ]);
        await pool.end();
    });

    it("should register a new tenant", async () => {
        const res = await request(app)
            .post("/api/auth/register-tenant")
            .send(testTenant);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("tenantId");
    });

    it("should login with valid credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: testTenant.adminEmail,
            password: testTenant.adminPassword,
            tenantSubdomain: testTenant.subdomain,
        });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("token");
    });

    it("should fail login with invalid password", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: testTenant.adminEmail,
            password: "wrongpassword",
            tenantSubdomain: testTenant.subdomain,
        });

        expect(res.statusCode).toEqual(401);
    });
});
