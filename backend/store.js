// Central in-memory store for all data
// Data resets when server restarts - no database needed

const { v4: uuidv4 } = require('uuid');

const users = [];
const expenses = [];
const incomes = [];
const budgets = {}; // keyed by userId

module.exports = { users, expenses, incomes, budgets, uuidv4 };
