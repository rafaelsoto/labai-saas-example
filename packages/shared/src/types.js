/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [avatar_url]
 * @property {string} plan
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string} [url]
 * @property {string} api_key
 * @property {boolean} is_active
 * @property {Object} settings
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Feedback
 * @property {string} id
 * @property {string} project_id
 * @property {number} rating
 * @property {string} [message]
 * @property {string} page_url
 * @property {string} user_agent
 * @property {string} ip_address
 * @property {Object} metadata
 * @property {boolean} is_read
 * @property {string} created_at
 */

module.exports = {};
