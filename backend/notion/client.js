const { Client } = require('@notionhq/client');
require('dotenv').config();

// Initialize Notion client
const notion = new Client({ 
  auth: process.env.NOTION_API_KEY 
});

const LANDMARKS_DATABASE_ID = process.env.LANDMARKS_DATABASE_ID;
const VISITED_DATABASE_ID = process.env.VISITED_DATABASE_ID;

module.exports = {
  notion,
  LANDMARKS_DATABASE_ID,
  VISITED_DATABASE_ID
};