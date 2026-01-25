## **Multi-Tenant SaaS Platform – Research Document**

## 1. Multi-Tenancy Analysis

Multi-tenancy is a software architecture pattern where a single instance of software runs on a server and serves multiple tenants. A tenant is a group of users who share a common access with specific privileges to the software instance. In a multi-tenant architecture, the application represents a shared resource, but each tenant is logically isolated, perceiving the application as if it were dedicated solely to them. This model is the backbone of modern SaaS (Software as a Service) applications, allowing providers to achieve economies of scale, centralized maintenance, and rapid updates.

When designing a multi-tenant application, the most critical decision is the database architecture. How we choose to isolate data determines not only security and compliance but also the scalability, cost-efficiency, and operational complexity of the system.

We analyzed three primary models for multi-tenancy:

### **Approach 1: Shared Database, Shared Schema (The "Pool" Model)**

**Description:**
In this approach, all tenants share the same database and the same schema. Every table that contains tenant-specific data must have a discriminator column, typically named `tenant_id`. Queries must always include a filter for this column (e.g., `WHERE tenant_id = ?`) to ensure tenants only see their own data. This is the most "integrated" approach.

**Pros:**
*   **Cost Efficiency:** This is the most cost-effective model. You pay for one database instance, one set of backups, and one infrastructure footprint, regardless of having 10 or 10,000 tenants.
*   **Scalability (Tenant Count):** Onboarding a new tenant is trivial—it just involves inserting a row into a `tenants` table. There are no new schemas to create or databases to provision.
*   **Development Agility:** Schema changes (migrations) are applied once and instantly reflected for all tenants. This simplifies the CI/CD pipeline significantly.
*   **Resource Utilization:** Connections are pooled efficiently. You don't suffer from the overhead of managing thousands of open connections to different databases.

**Cons:**
*   **Isolation Risk:** This is the biggest drawback. Isolation is purely logical, enforced by software code. A developer forgetting a `WHERE` clause can lead to data leaking between tenants.
*   **Noisy Neighbor Effect:** If one tenant runs resource-intensive queries, they can degrade performance for all other tenants sharing the same tables.
*   **Backup/Restore Granularity:** Restoring a single tenant's data from a backup is difficult because the data is commingled. You usually have to restore the whole DB and extract the specific records.

**Verdict:** This is the industry standard for most B2B SaaS applications aiming for high growth and low initial cost.

---

### **Approach 2: Shared Database, Separate Schemas (The "Bridge" Model)**

**Description:**
Here, multiple tenants share the same database server, but each tenant gets their own schema (namespace). For example, `tenant_a.users` vs `tenant_b.users`.

**Pros:**
*   **Better Isolation:** It provides a degree of physical isolation. You can't accidentally query another tenant's data just by missing a `WHERE` clause.
*   **Customization:** It allows for some tenants to have slightly different schema versions if absolutely necessary (though not recommended).
*   **Backup Granularity:** Tools like `pg_dump` can easily dump a specific schema, making single-tenant restores easier than the shared schema approach.

**Cons:**
*   **Operational Complexity:** Running migrations is harder. You must iterate through every schema and apply updates. If you have 5,000 tenants, a migration script might take hours to complete.
*   **Connection Overhead:** While they share the DB server, the metadata overhead for the database engine increases with thousands of schemas.
*   **Tooling Support:** Many ORMs have partial or complex support for dynamic schema switching.

**Verdict:** A middle ground, often used when tenants require stronger isolation guarantees but dedicated hardware is too expensive.

---

### **Approach 3: Separate Databases (The "Silo" Model)**

**Description:**
Each tenant has their own completely separate database instance. This is the ultimate isolation.

**Pros:**
*   **Maximum Isolation:** Data leakage is virtually impossible. Security breaches in one DB do not affect others.
*   **Performance Isolation:** A heavy tenant does not impact others. You can scale resources (CPU/RAM) specifically for high-value enterprise tenants.
*   **Compliance:** Easiest to meet strict regulatory requirements (like HIPAA or GDPR) that might mandate physical separation.

**Cons:**
*   **Extremely High Cost:** You pay for a minimum footprint for *every* tenant. For a specific cloud provider, this could mean minimum $15-50/month per tenant.
*   **Maintenance Nightmare:** Managing backups, upgrades, and monitoring for thousands of databases requires a massive DevOps team and sophisticated automation.
*   **Limited Aggregation:** Running analytics across all tenants (e.g., "Total platform revenue") is very hard, requiring ETL pipelines to a data warehouse.

**Verdict:** Best reserved for Enterprise-tier tenants who pay a premium for isolation, or for highly regulated industries.

---

### **Chosen Approach & Justification**

✅ **Chosen Model: Shared Database + Shared Schema (`tenant_id`)**

**Justification:**
For this Multi-Tenant SaaS platform, we selected the **Shared Database, Shared Schema** approach. The primary drivers for this decision were **development velocity, ease of deployment, and evaluation requirements**.

1.  **Alignment with Requirements:** The project requirements prioritize a dockerized solution with easy setup. Managing dynamic schema creation or multiple DB containers would complicate the `docker-compose` setup and make evaluation fragile.
2.  **Implementation Simplicity:** Using a single `tenant_id` column allows us to use standard ORM patterns and simple SQL queries. We mitigate the "Isolation Risk" by implementing a robust Middleware (`tenantMiddleware`) and RLS-like patterns in our controllers to strictly mandate `tenant_id` checks.
3.  **Performance:** Since we are building a task management system, we expect many small interactions. The shared model allows efficient caching and connection pooling, ensuring the API remains responsive.
4.  **Security Measures:** We address the security concerns by:
    *   Never accepting `tenant_id` from the request body for sensitive operations; always deriving it from the JWT.
    *   Implementing Audit Logging to track access.
    *   Using Postgres Row Level Security (RLS) is an option for the future, but software-level enforcement is sufficient for this scope.

This architecture delivers a production-ready foundation that is easy to maintain, cost-effective to host, and simple to scale to thousands of free-tier users.

---

## 2. Technology Stack Justification

Selecting the right technology stack is pivotal for the long-term success of a SaaS platform. Our choices prioritize ecosystem maturity, performance, developer experience, and suitability for multi-tenant architectures.

### **Backend: Node.js + Express.js**

**Selection:**
We chose **Node.js** with the **Express.js** framework.

**Justification:**
*   **Asynchronous I/O:** Node.js's non-blocking, event-driven architecture is ideal for I/O-heavy applications like task management systems where many concurrent requests (CRUD operations) occur.
*   **Unified Language:** Using JavaScript for both frontend and backend ("Universal JavaScript") reduces context switching for developers and allows code sharing (e.g., validation logic, types).
*   **Rich Ecosystem:** The npm registry provides robust libraries for every requirement of this project, including `jsonwebtoken` for auth, `pg` for database interaction, and `bcrypt` for security.
*   **Express.js Flexibility:** Express is unopinionated, allowing us to structure our multi-tenant middleware exactly as needed without fighting against framework conventions.

**Alternatives Considered:**
*   **Python (Django/FastAPI):** Django is excellent but heavier. Its built-in ORM makes multi-tenancy implementation specific to its paradigms, which can be restrictive. FastAPI is great but has a smaller ecosystem than Express.
*   **Java (Spring Boot):** Spring Boot offers robust enterprise features but introduces significant boilerplate and startup time overhead, making it less ideal for a rapid-development containerized evaluation.

---

### **Frontend: React.js**

**Selection:**
We chose **React.js** (bootstrapped with Vite).

**Justification:**
*   **Component-Driven Architecture:** React's component model is perfect for building complex dashboards (Projects, Tasks, Users) where UI elements are reused frequently.
*   **Virtual DOM Performance:** React efficiently updates the DOM, providing a snappy user experience even when managing large lists of tasks or projects.
*   **State Management:** React's hooks (`useState`, `useContext`) provide a clean way to manage authentication state and tenant contexts without needing heavy external libraries like Redux for this scope.
*   **Vite Build Tool:** Vite was chosen over Create-React-App for its superior development server speed and optimized production builds.

**Alternatives Considered:**
*   **Angular:** Offers a "batteries-included" framework but comes with a steep learning curve and verbose boilerplate.
*   **Vue.js:** A strong contender, but React's job market dominance and ecosystem for SaaS UI components (like Lucide React) made it the safer choice.

---

### **Database: PostgreSQL**

**Selection:**
We chose **PostgreSQL 15**.

**Justification:**
*   **Advanced Relational Features:** Postgres offers robust support for complex relationships (Tenants -> Users -> Projects -> Tasks) and enforces referential integrity with cascading deletes, which is critical for data consistency.
*   **JSONB Support:** Unlike MySQL, Postgres has first-class JSON support. This future-proofs our application, allowing us to store flexible tenant configuration or settings without changing the schema.
*   **Row Level Security (RLS):** While we implemented isolation in the application layer for this project, Postgres offers native RLS, providing a path to defense-in-depth security in the future.
*   **ACID Compliance:** Essential for handling subscriptions and critical user data safely.

**Alternatives Considered:**
*   **MongoDB:** While easy to scale, its non-relational nature makes enforcing strict multi-tenant boundaries and complex joins (e.g., "Get all tasks for this tenant assigned to this user") more complex and error-prone.
*   **MySQL:** A solid choice, but Postgres is generally preferred in the Node.js community for its stricter SQL standards and feature set.

---

### **Authentication: JWT (JSON Web Tokens)**

**Selection:**
We chose **Stateless JWT Authentication**.

**Justification:**
*   **Stateless Scalability:** JWTs require no server-side session storage. This means we can horizontally scale our backend API simply by adding more containers, without needing a shared Redis session store.
*   **Mobile Ready:** JWTs are standard for mobile API authentication, giving us flexibility for future client expansion.
*   **Decentralized Verification:** The token itself contains the user's role and tenant ID. This allow us to make authorization decisions in middleware immediately without hitting the database for every single permission check (though we do validate existence).

**Alternatives Considered:**
*   **Server-Side Sessions:** Secure, but requires sticky sessions or a shared session store (Redis), adding infrastructure complexity (another container to manage).
*   **OAuth2 / Auth0:** integrating a third-party provider was deemed out of scope and introduces external dependencies that complicate the self-contained Docker requirement.

---

### **Containerization: Docker & Docker Compose**

**Selection:**
We chose **Docker** for containerization and **Docker Compose** for orchestration.

**Justification:**
*   **Reproducibility:** "It works on my machine" is solved. The environment is defined as code.
*   **Isolation:** The database, backend, and frontend run in isolated environments with defined networking, simulating a production microservices cluster.
*   **Ease of Evaluation:** Instructors can start the entire stack with a single command (`docker-compose up -d`), guaranteeing that dependencies (Node version, Postgres version) are exactly as intended.

---

## 3. Security Considerations

## 3. Security Considerations

Security is paramount in multi-tenant systems. A breach in one tenant's isolation can catastrophically affect all organizations on the platform. We have implemented a defense-in-depth strategy covering data, authentication, and infrastructure.

### **1. Data Isolation Strategy**

The most critical security requirement is preventing cross-tenant data leakage. We enforce this through:

*   **Logical Isolation:** Every query to a tenant-specific table *must* include a `WHERE tenant_id = $1` clause. This is not left to chance; our `tenantMiddleware` ensures request context is populated, and controllers extract the tenant ID directly from the validated JWT token, never from the client request body (which could be spoofed).
*   **Token-Based Authority:** The tenant ID in the JWT `payload` is the single source of truth. Even if a user tries to modify the frontend code to send a different `tenantId`, the backend will ignore it and use the one signed in the token.
*   **Super Admin Exception:** The Super Admin role bypasses these checks but is implemented with explicit branching logic (`if (role === 'super_admin')`), ensuring that this "god mode" is intentionally invoked and not an accidental default.

### **2. Authentication & Authorization (AuthN/AuthZ)**

*   **Argon2/Bcrypt Hashing:** We do not rely on simple hashing. All passwords are salted and hashed using `bcrypt` (with a work factor of 10) before storage. This renders rainbow table attacks ineffective.
*   **JWT Security:**
    *   **Short Expiry:** Access tokens expire in 24 hours, limiting the window of opportunity if a token is stolen.
    *   **Signature Verification:** Tokens are signed with a strong 256-bit secret key (`HS256`).
    *   **Minimal Claims:** We only store `userId`, `tenantId`, and `role` in the token. No PII or sensitive state is exposed in the payload.
*   **Role-Based Access Control (RBAC):** We implemented three strict tiers:
    *   `super_admin`: System-wide access.
    *   `tenant_admin`: Full control within their tenant organization.
    *   `user`: Read/Write access to assigned resources only.
    *   Middleware functions (`authorize(['tenant_admin'])`) protect every sensitive route.

### **3. API & Network Security**

*   **Input Validation:** We validate all incoming data. For instance, subdomains must be alphanumeric, preventing SQL injection via the tenant registry endpoint.
*   **CORS Policy:** The backend is configured to accept requests *only* from the frontend URL defined in environment variables. This prevents malicious sites from triggering actions on behalf of logged-in users.
*   **Docker Networking:** The database container is not exposed to the host machine's public interface (in production configuration) or the outside world. Only the backend container can communicate with the database via the internal Docker network on port 5432.

### **4. Audit Logging & Compliance**

*   **Immutable Logs:** We maintained a separate `audit_logs` table.
*   **Comprehensive Tracking:** Every critical action—creating a user, deleting a project, updating a tenant's subscription—is logged with:
    *   **Who:** User ID and IP Address.
    *   **What:** Action type (e.g., `DELETE_PROJECT`) and Entity ID.
    *   **Where:** Tenant ID.
*   **Non-Repudiation:** This log allows administrators to reconstruct events during a security incident and attribute actions to specific compromised accounts.

### **5. Subscription Enforcement**

*   **Resource Quotas:** Security is also about availability. A single tenant attempting to create 1 million users could DOS the system. We enforce strict `max_users` and `max_projects` limits at the database read level before allowing writes, protecting the system from abuse and ensuring fair resource usage ("Noisy Neighbor" mitigation).
