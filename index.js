const express = require('express')
const mysql = require('mysql2/promise')
const path = require("path")
const cors = require('cors')
const app = express()
app.use(express.static(path.join(__dirname,"./public/")))
// 数据库配置（需在宝塔面板创建）

const pool = mysql.createPool({
  host: 'edgedb-sky-dog--vercel-rgsrx7fsrwkv5uhwbte6xdu2.c-05.i.aws.edgedb.cloud',
  port:5656,
  user: 'sql',
  password: '3d2GiYJ5MGAGHKat',
  database: 'main',
  waitForConnections: true,
})
pool.on('connection', (conn) => {
    console.log(`🔄 新连接建立 ID:${conn.threadId}`);
    });

    pool.on('acquire', (conn) => {
      console.log(`🔗 连接获取 ID:${conn.threadId}`);
      });

      pool.on('release', (conn) => {
        console.log(`🔄 连接释放 ID:${conn.threadId}`);
        });

        pool.on('enqueue', () => {
          console.log('⏳ 等待可用连接...');
          });

app.use(cors())
app.use(express.json())

// 数据库表结构
/*
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
*/

// API 路由
app.get('/api/items', async (req, res) => {
  const { q } = req.query
  const conn = await pool.getConnection()
  let sql = 'SELECT * FROM items'
  if(q) sql += ` WHERE name LIKE '%${q}%'`
  const [rows] = await conn.query(sql)
  conn.release()
  res.json(rows)
})

app.post('/api/items', async (req, res) => {
  const { name, content } = req.body
  const conn = await pool.getConnection()
  await conn.query('INSERT INTO items (name, content) VALUES (?, ?)', [name, content])
  conn.release()
  res.status(201).send()
})

app.delete('/api/items/:id', async (req, res) => {
  const conn = await pool.getConnection()
  await conn.query('DELETE FROM items WHERE id = ?', [req.params.id])
  conn.release()
  res.status(204).send()
})

app.listen(3000, () => console.log('Server running on port 3000'))
