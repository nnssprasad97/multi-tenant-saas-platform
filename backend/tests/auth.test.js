import request from "supertest";
import app from "../src/app.js";

// Mock the database
jest.mock("../src/config/db.js", () => {
    const mockQuery = jest.fn();
    return {
        query: mockQuery,
        connect: jest.fn().mockResolvedValue({
            query: mockQuery,
            release: jest.fn(),
        }),
        end: jest.fn(),
    };
});

import pool from "../src/config/db.js";

describe("Auth API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should register a new tenant", async () => {
        // Mock Transaction: BEGIN, INSERT, INSERT, COMMIT
        pool.query
            .mockResolvedValueOnce({}) // BEGIN
            .mockResolvedValueOnce({ rows: [{ id: "tenant-123", subdomain: "test" }] }) // INSERT tenant
            .mockResolvedValueOnce({ rows: [{ id: "user-123", email: "admin@test.com", role: "tenant_admin" }] }) // INSERT user
            .mockResolvedValueOnce({}); // COMMIT

        const res = await request(app)
            .post("/api/auth/register-tenant")
            .send({
                tenantName: "Test Corp",
                subdomain: "testcorp",
                adminEmail: "admin@testcorp.com",
                adminPassword: "password123",
                adminFullName: "Test Admin",
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
