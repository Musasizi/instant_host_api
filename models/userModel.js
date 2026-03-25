/**/**

 * models / userModel.js – Data Access Layer for Users(Ostello) * models / userModel.js – Data Access Layer for Users

  * *

 * Supports three roles: STUDENT, CUSTODIAN, ADMIN * KEY CONCEPT – Model / Data Access Layer

  * Fields: full_name, email, phone, password_hash, role, institution, * The model is the only place in the application that talks to the database.

 * is_verified, verification_token, reset_token, reset_token_expires * Controllers call model methods; they never write SQL themselves.

 */ * This separation makes it easy to swap databases later (e.g. MySQL → PostgreSQL).

  *

const db = require('../config/db'); * KEY CONCEPT – Parameterised Queries(?placeholders)

const bcrypt = require('bcryptjs'); * We NEVER build SQL strings by concatenating user input.

 * Bad: `SELECT * FROM users WHERE id = ${id}`  ← SQL injection risk!

const User = {
  * Good: `SELECT * FROM users WHERE id = ?`  with  [id] as the second argument.

  /** * mysql2 escapes the values safely before sending the query to MySQL.

   * Create a new user with role support. *

   */ * KEY CONCEPT – async/ await with mysql2 pool

create: async ({ full_name, email, phone, password, role, institution, verification_token }) => { * db.query() returns a Promise that resolves to[rows, fields].

  const password_hash = await bcrypt.hash(password, 10); * We destructure it: const [rows] = await db.query(...)

  const sql = `INSERT INTO users */

      (full_name, email, phone, password_hash, role, institution, is_verified, verification_token)

      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`; const db = require('../config/db');

  return db.query(sql, [const bcrypt = require('bcryptjs');

  full_name,

    email,const User = {

      phone || null,  /**

      password_hash,   * Create a new user.

      role || 'STUDENT',   * The password is hashed with bcrypt before storing – NEVER store plain text!

      institution || null,   * bcrypt.hash(password, 10) uses a "salt rounds" value of 10.

      false,   * Higher = slower to crack but also slower to compute.

      verification_token || null,   */

    ]); create: async (username, password, email) => {

  },    const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';

  /**    return db.query(sql, [username, hashedPassword, email]);

   * Find user by email (used during login).  },

   */

  findByEmail: (email) => {  /**

    const sql = 'SELECT * FROM users WHERE email = ?';   * Look up a user by username (used during login).

    return db.query(sql, [email]);   * Returns the full row including the hashed password so we can compare it.

  },   */

    findByUsername: (username) => {

  /**    const sql = 'SELECT * FROM users WHERE username = ?';

   * Find user by id (excludes password_hash).    return db.query(sql, [username]);

   */  },

      findById: (id) => {

        const sql = `SELECT id, full_name, email, phone, role, institution,  /**

                        is_verified, created_at   * Look up a single user by their primary key.

                 FROM users WHERE id = ?`;   * Used in the GET / users /:id route.

        return db.query(sql, [id]);   * We exclude the password from the result for security.

  },   */

    findById: (id) => {

  /**    const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';

   * Find user by id (includes password_hash for internal use).    return db.query(sql, [id]);

   */  },

      findByIdFull: (id) => {

        const sql = 'SELECT * FROM users WHERE id = ?';  /**

    return db.query(sql, [id]);   * Return all users (password excluded for security).

  },   */

        getAll: () => {

  /**    const sql = 'SELECT id, username, email, created_at FROM users';

   * Find user by verification token.    return db.query(sql);

   */  },

          findByVerificationToken: (token) => {

            const sql = 'SELECT * FROM users WHERE verification_token = ?';  /**

    return db.query(sql, [token]);   * Update a user's username and email.

  },   * id is the WHERE condition so we only change one row.

   */

  /**  update: (id, username, email) => {

   * Mark user as verified.    const sql = 'UPDATE users SET username = ?, email = ? WHERE id = ?';

   */    return db.query(sql, [username, email, id]);

            verify: (id) => { },

    const sql = 'UPDATE users SET is_verified = true, verification_token = NULL WHERE id = ?';

            return db.query(sql, [id]);  /**

  },   * Permanently delete a user by id.

   * The user_chapters join-table rows are removed automatically via

  /**   * the ON DELETE CASCADE foreign key constraint in the schema.

   * Store password reset token.   */

   */  delete: (id) => {

            setResetToken: (id, reset_token, expires) => {
              const sql = 'DELETE FROM users WHERE id = ?';

              const sql = 'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?'; return db.query(sql, [id]);

              return db.query(sql, [reset_token, expires, id]);
            },

  },};



    /**module.exports = User;
  
     * Find user by valid (non-expired) reset token.
     */
    findByResetToken: (token) => {
      const sql = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()';
      return db.query(sql, [token]);
    },

      /**
       * Update password and clear reset token.
       */
      updatePassword: async (id, newPassword) => {
        const password_hash = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?';
        return db.query(sql, [password_hash, id]);
      },

        /**
         * Return all users (password excluded).
         */
        getAll: (role = null) => {
          let sql = 'SELECT id, full_name, email, phone, role, institution, is_verified, created_at FROM users';
          const params = [];
          if (role) {
            sql += ' WHERE role = ?';
            params.push(role);
          }
          sql += ' ORDER BY created_at DESC';
          return db.query(sql, params);
        },

          /**
           * Update user profile.
           */
          update: (id, { full_name, email, phone, institution }) => {
            const sql = 'UPDATE users SET full_name = ?, email = ?, phone = ?, institution = ? WHERE id = ?';
            return db.query(sql, [full_name, email, phone, institution, id]);
          },

            /**
             * Delete a user.
             */
            delete: (id) => {
              const sql = 'DELETE FROM users WHERE id = ?';
              return db.query(sql, [id]);
            },
};

  module.exports = User;
