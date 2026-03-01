CREATE TABLE acquired (
    serial_no INTEGER NOT NULL,
    acquired_date DATE NOT NULL,
    msg_received_from TEXT NOT NULL,
    hl_received_from CHARACTER VARYING(255) NOT NULL,
    eng_subject TEXT NOT NULL,
    hi_subject TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (acquired_pkey),
    INDEX idx_acquired_date BTREE (acquired_date),
    INDEX idx_acquired_serial_no BTREE (serial_no),
    INDEX idx_user_id BTREE (user_id),
    FOREIGN KEY (acquired_user_id_fkey) REFERENCES users(user_id)
);
