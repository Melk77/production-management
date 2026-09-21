USE production_management;
INSERT INTO departments (name)
VALUES ('Administration'),
    ('Production'),
    ('Quality Control'),
    ('Procurement'),
    ('Warehouse');
INSERT INTO shifts (name, start_time, end_time)
VALUES ('Morning Shift', '06:00:00', '14:00:00'),
    ('Day Shift', '08:00:00', '16:00:00'),
    ('Evening Shift', '14:00:00', '22:00:00'),
    ('Night Shift', '22:00:00', '06:00:00');
INSERT INTO users (name, email, password_hash, role, phone)
VALUES (
        'System Administrator',
        'admin@production.local',
        '$2b$10$BLkALVJahzMxau35blPX7OG/oJxAB50LEIatt50SqRsVbEy0i1bim',
        'admin',
        '0911000001'
    ),
    (
        'Production Manager',
        'manager@production.local',
        '$2b$10$Op2u0rjeuhF7B8xCYQ57EuT157Mzq5bOHDXVAzkziyXqwrJbxzD72',
        'manager',
        '0911000002'
    ),
    (
        'Production Operator',
        'operator@production.local',
        '$2b$10$ycQ0/L9lWKL4WYItrLkvV.1yWsQGruIeuVqMbLQdENBIyvWOIUVhe',
        'operator',
        '0911000003'
    ),
    (
        'Quality Inspector',
        'inspector@production.local',
        '$2b$10$KPeTlPZ/2JRWY291v34uAOu6yDGldrYsycxUvfyU/PrgU.Jn6GSu2',
        'inspector',
        '0911000004'
    ),
    (
        'Procurement Officer',
        'procurement@production.local',
        '$2b$10$KJkze9VOOVjnGXXTGWYDN.jO3RqaknofCsOVwjTPIJR.S7FtBh4yq',
        'procurement',
        '0911000005'
    ),
    (
        'Warehouse Staff',
        'warehouse@production.local',
        '$2b$10$ImUpnwFXoy6yvxxk9SROYOVsH/EWiz/Ehx80ZpyLeDXELXglT2cc.',
        'warehouse',
        '0911000006'
    );
INSERT INTO employees (
        user_id,
        department_id,
        shift_id,
        position,
        hire_date
    )
VALUES (
        1,
        1,
        2,
        'System Administrator',
        '2026-01-01'
    ),
    (
        2,
        2,
        2,
        'Production Manager',
        '2026-01-02'
    ),
    (
        3,
        2,
        1,
        'Production Operator',
        '2026-01-03'
    ),
    (
        4,
        3,
        1,
        'Quality Inspector',
        '2026-01-04'
    ),
    (
        5,
        4,
        2,
        'Procurement Officer',
        '2026-01-05'
    ),
    (
        6,
        5,
        1,
        'Warehouse Staff',
        '2026-01-06'
    );
UPDATE departments
SET manager_id = 2
WHERE department_id = 2;
SELECT u.user_id,
    u.name,
    u.email,
    u.role,
    e.employee_id,
    d.name AS department,
    s.name AS shift,
    e.position
FROM users u
    JOIN employees e ON u.user_id = e.user_id
    JOIN departments d ON e.department_id = d.department_id
    LEFT JOIN shifts s ON e.shift_id = s.shift_id
ORDER BY u.user_id;