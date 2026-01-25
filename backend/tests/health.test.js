import request from "supertest";
import app from "../src/app.js";

// Mock the database pool
jest.mock("../src/config/db.js", () => ({
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 1 }),
    end: jest.fn(),
}));

describe("Health Check API", () => {
    it("should return 200 OK", async () => {
        const res = await request(app).get("/api/health");
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("status", "ok");
    });
});
