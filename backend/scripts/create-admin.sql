-- Insert admin user and organization
INSERT INTO Organization (id, name) VALUES ('org-admin', 'Admin Organization') ON CONFLICT DO NOTHING;

-- Password hash for 'admin123' using bcrypt with salt rounds 10
INSERT INTO User (id, email, passwordHash, isActive, organizationId) VALUES ('user-admin', 'admin@example.com', '$2a$10$1upg.RFrrD/Iym1bLlaf1OOaufFHilyCLH1MQ9/bEebOyHA2m/TRO', 1, 'org-admin') ON CONFLICT DO NOTHING;

INSERT INTO Role (id, name, organizationId) VALUES ('role-admin', 'admin', 'org-admin') ON CONFLICT DO NOTHING;

INSERT INTO Role (id, name, organizationId) VALUES ('role-employee', 'employee', 'org-admin') ON CONFLICT DO NOTHING;

INSERT INTO UserRole (id, userId, roleId) VALUES ('ur-admin', 'user-admin', 'role-admin') ON CONFLICT DO NOTHING;