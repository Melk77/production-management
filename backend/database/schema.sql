
CREATE DATABASE IF NOT EXISTS production_management;
USE production_management;


CREATE TABLE departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    manager_id BIGINT NULL
);

CREATE TABLE shifts (
    shift_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);


CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'admin',
        'manager',
        'operator',
        'inspector',
        'procurement',
        'warehouse'
    ) NOT NULL,

    phone VARCHAR(20) NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL,

    token_hash VARCHAR(255) NOT NULL UNIQUE,

    expires_at DATETIME NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    user_id BIGINT NOT NULL UNIQUE,

    department_id INT NOT NULL,

    shift_id INT NULL,

    position VARCHAR(100) NOT NULL,

    hire_date DATE NOT NULL,

    CONSTRAINT fk_employee_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_employee_shift
        FOREIGN KEY (shift_id)
        REFERENCES shifts(shift_id)
        ON DELETE SET NULL
);


-- Department manager relationship
ALTER TABLE departments
ADD CONSTRAINT fk_department_manager
FOREIGN KEY (manager_id)
REFERENCES employees(employee_id)
ON DELETE SET NULL;


CREATE TABLE suppliers (
    supplier_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    contact_person VARCHAR(100) NULL,

    phone VARCHAR(20) NULL,

    email VARCHAR(150) NULL,

    address TEXT NULL
);


CREATE TABLE products (
    product_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    sku VARCHAR(50) NOT NULL UNIQUE,

    category VARCHAR(100) NULL,

    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_product_price
        CHECK (unit_price >= 0)
);


CREATE TABLE raw_materials (
    material_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    unit VARCHAR(20) NOT NULL,

    stock_qty DECIMAL(12,2) NOT NULL DEFAULT 0,

    reorder_level DECIMAL(12,2) NOT NULL DEFAULT 0,

    supplier_id BIGINT NOT NULL,

    CONSTRAINT fk_material_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_material_stock
        CHECK (stock_qty >= 0),

    CONSTRAINT chk_material_reorder
        CHECK (reorder_level >= 0)
);


CREATE TABLE bill_of_materials (
    bom_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    product_id BIGINT NOT NULL,

    material_id BIGINT NOT NULL,

    quantity_required DECIMAL(10,2) NOT NULL,

    unit VARCHAR(20) NOT NULL,

    CONSTRAINT fk_bom_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bom_material
        FOREIGN KEY (material_id)
        REFERENCES raw_materials(material_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_product_material
        UNIQUE (product_id, material_id),

    CONSTRAINT chk_bom_quantity
        CHECK (quantity_required > 0)
);

CREATE TABLE material_receipts (
    receipt_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    material_id BIGINT NOT NULL,
    supplier_id BIGINT NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,

    reference_number VARCHAR(100),
    notes TEXT,

    status ENUM('pending', 'checked', 'accepted', 'rejected')
        NOT NULL DEFAULT 'pending',

    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    checked_by BIGINT NULL,
    checked_at DATETIME NULL,

    accepted_by BIGINT NULL,
    accepted_at DATETIME NULL,

    rejection_reason VARCHAR(255),

    CONSTRAINT fk_receipt_material
        FOREIGN KEY (material_id)
        REFERENCES raw_materials(material_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_receipt_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_receipt_checked_by
        FOREIGN KEY (checked_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_receipt_accepted_by
        FOREIGN KEY (accepted_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_receipt_quantity
        CHECK (quantity > 0)
);

CREATE TABLE inventory_movements (
    movement_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    material_id BIGINT NOT NULL,

    movement_type ENUM('IN', 'OUT', 'ADJUSTMENT')
        NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    reference_type VARCHAR(50),
    reference_id BIGINT,

    notes TEXT,

    created_by BIGINT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_movement_material
        FOREIGN KEY (material_id)
        REFERENCES raw_materials(material_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_movement_user
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_movement_quantity
        CHECK (quantity > 0)
);


CREATE TABLE machines (
    machine_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    type VARCHAR(100) NOT NULL,

    status ENUM(
        'available',
        'in_use',
        'under_maintenance'
    ) NOT NULL DEFAULT 'available',

    location VARCHAR(100) NULL,

    purchase_date DATE NULL
);

CREATE TABLE maintenance_logs (
    maintenance_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    machine_id BIGINT NOT NULL,

    employee_id BIGINT NOT NULL,

    type ENUM(
        'preventive',
        'corrective'
    ) NOT NULL,

    cost DECIMAL(10,2) NOT NULL DEFAULT 0,

    maintenance_date DATE NOT NULL,

    status ENUM(
        'scheduled',
        'completed'
    ) NOT NULL DEFAULT 'scheduled',

    description TEXT NULL,

    CONSTRAINT fk_maintenance_machine
        FOREIGN KEY (machine_id)
        REFERENCES machines(machine_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_maintenance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_maintenance_cost
        CHECK (cost >= 0)
);


CREATE TABLE work_orders (
    work_order_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    order_number VARCHAR(50) NOT NULL UNIQUE,

    product_id BIGINT NOT NULL,

    machine_id BIGINT NOT NULL,

    employee_id BIGINT NOT NULL,

    created_by BIGINT NOT NULL,

    quantity_to_produce INT NOT NULL,

    priority ENUM(
        'low',
        'normal',
        'high',
        'urgent'
    ) NOT NULL DEFAULT 'normal',

    status ENUM(
        'planned',
        'in_progress',
        'completed',
        'cancelled'
    ) NOT NULL DEFAULT 'planned',

    start_date DATETIME NULL,

    end_date DATETIME NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_work_order_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_work_order_machine
        FOREIGN KEY (machine_id)
        REFERENCES machines(machine_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_work_order_operator
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_work_order_creator
        FOREIGN KEY (created_by)
        REFERENCES employees(employee_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_work_order_quantity
        CHECK (quantity_to_produce > 0)
);

CREATE TABLE production_records (
    production_record_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    work_order_id BIGINT NOT NULL,

    employee_id BIGINT NOT NULL,

    quantity_produced INT NOT NULL,

    quantity_defective INT NOT NULL DEFAULT 0,

    production_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    notes TEXT NULL,

    CONSTRAINT fk_production_record_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(work_order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_production_record_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_production_quantity
        CHECK (quantity_produced > 0),

    CONSTRAINT chk_defective_quantity
        CHECK (quantity_defective >= 0),

    CONSTRAINT chk_defective_not_greater
        CHECK (quantity_defective <= quantity_produced)
);


CREATE TABLE material_consumption (
    consumption_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    work_order_id BIGINT NOT NULL,

    material_id BIGINT NOT NULL,

    employee_id BIGINT NOT NULL,

    quantity_used DECIMAL(12,2) NOT NULL,

    consumption_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    notes TEXT NULL,

    CONSTRAINT fk_consumption_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(work_order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_consumption_material
        FOREIGN KEY (material_id)
        REFERENCES raw_materials(material_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_consumption_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(employee_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_consumption_quantity
        CHECK (quantity_used > 0)
);

CREATE TABLE downtime_records (
    downtime_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    work_order_id BIGINT NOT NULL,

    machine_id BIGINT NOT NULL,

    start_time DATETIME NOT NULL,

    end_time DATETIME NULL,

    reason ENUM(
        'machine_breakdown',
        'maintenance',
        'material_shortage',
        'power_outage',
        'employee_shortage',
        'other'
    ) NOT NULL,

    description TEXT NULL,

    CONSTRAINT fk_downtime_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(work_order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_downtime_machine
        FOREIGN KEY (machine_id)
        REFERENCES machines(machine_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_downtime_time
        CHECK (
            end_time IS NULL
            OR end_time >= start_time
        )
);

CREATE TABLE quality_inspections (
    inspection_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    work_order_id BIGINT NOT NULL,

    inspector_id BIGINT NOT NULL,

    result ENUM(
        'pass',
        'fail',
        'rework'
    ) NOT NULL,

    defects_found TEXT NULL,

    inspection_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inspection_work_order
        FOREIGN KEY (work_order_id)
        REFERENCES work_orders(work_order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inspection_inspector
        FOREIGN KEY (inspector_id)
        REFERENCES employees(employee_id)
        ON DELETE RESTRICT
);


CREATE TABLE inventory (
    inventory_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    material_id BIGINT NULL,

    product_id BIGINT NULL,

    warehouse_location VARCHAR(100) NOT NULL,

    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,

    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_inventory_material
        FOREIGN KEY (material_id)
        REFERENCES raw_materials(material_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventory_item
        CHECK (
            (material_id IS NOT NULL AND product_id IS NULL)
            OR
            (material_id IS NULL AND product_id IS NOT NULL)
        ),

    CONSTRAINT chk_inventory_quantity
        CHECK (quantity >= 0)
);


CREATE TABLE purchase_orders (
    purchase_order_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    supplier_id BIGINT NOT NULL,

    created_by BIGINT NULL,

    status ENUM(
        'draft',
        'ordered',
        'received',
        'cancelled'
    ) NOT NULL DEFAULT 'draft',

    order_date DATE NOT NULL,

    expected_delivery DATE NULL,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_purchase_order_supplier
        FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_purchase_order_creator
        FOREIGN KEY (created_by)
        REFERENCES employees(employee_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_purchase_total
        CHECK (total_amount >= 0)
);

CREATE TABLE purchase_order_items (
    po_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    purchase_order_id BIGINT NOT NULL,

    material_id BIGINT NOT NULL,

    quantity DECIMAL(12,2) NOT NULL,

    unit_price DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_po_item_order
        FOREIGN KEY (purchase_order_id)
        REFERENCES purchase_orders(purchase_order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_po_item_material
        FOREIGN KEY (material_id)
        REFERENCES raw_materials(material_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_po_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_po_unit_price
        CHECK (unit_price >= 0)
);

CREATE TABLE customers (
    customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    contact_person VARCHAR(100) NULL,

    phone VARCHAR(20) NULL,

    email VARCHAR(150) NULL,

    address TEXT NULL
);

CREATE TABLE sales_orders (
    sales_order_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    customer_id BIGINT NOT NULL,

    created_by BIGINT NULL,

    status ENUM(
        'pending',
        'confirmed',
        'fulfilled',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',

    order_date DATE NOT NULL,

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_sales_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_sales_order_creator
        FOREIGN KEY (created_by)
        REFERENCES employees(employee_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_sales_total
        CHECK (total_amount >= 0)
);

CREATE TABLE sales_order_items (
    so_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,

    sales_order_id BIGINT NOT NULL,

    product_id BIGINT NOT NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_so_item_order
        FOREIGN KEY (sales_order_id)
        REFERENCES sales_orders(sales_order_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_so_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_so_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_so_unit_price
        CHECK (unit_price >= 0)
);


CREATE INDEX idx_employees_department
ON employees(department_id);

CREATE INDEX idx_employees_shift
ON employees(shift_id);

CREATE INDEX idx_raw_materials_supplier
ON raw_materials(supplier_id);

CREATE INDEX idx_bom_product
ON bill_of_materials(product_id);

CREATE INDEX idx_bom_material
ON bill_of_materials(material_id);

CREATE INDEX idx_work_orders_product
ON work_orders(product_id);

CREATE INDEX idx_work_orders_machine
ON work_orders(machine_id);

CREATE INDEX idx_work_orders_employee
ON work_orders(employee_id);

CREATE INDEX idx_work_orders_status
ON work_orders(status);

CREATE INDEX idx_production_records_work_order
ON production_records(work_order_id);

CREATE INDEX idx_material_consumption_work_order
ON material_consumption(work_order_id);

CREATE INDEX idx_material_consumption_material
ON material_consumption(material_id);

CREATE INDEX idx_downtime_work_order
ON downtime_records(work_order_id);

CREATE INDEX idx_downtime_machine
ON downtime_records(machine_id);

CREATE INDEX idx_quality_work_order
ON quality_inspections(work_order_id);

CREATE INDEX idx_inventory_material
ON inventory(material_id);

CREATE INDEX idx_inventory_product
ON inventory(product_id);

CREATE INDEX idx_purchase_orders_supplier
ON purchase_orders(supplier_id);

CREATE INDEX idx_purchase_order_items_order
ON purchase_order_items(purchase_order_id);

CREATE INDEX idx_sales_orders_customer
ON sales_orders(customer_id);

CREATE INDEX idx_sales_order_items_order
ON sales_order_items(sales_order_id);

