# 嵌套系統練習

## 使用技術

### node.js 後端 (fastify)


### vite 腳手架 + react.js
### prisma orm node.js與數據庫(本專案使用postgresql)的操作


## 開發步驟
1. 建立model
2. model migrate to database
3. prisma/seed.js
    * 用应用程序启动所需的数据填充你的数据库 - 例如，默认语言或默认货币。

    * 为在开发环境中验证和使用你的应用程序提供基本数据。对于使用 Prisma Migrate 的情景尤其有用，因为其需要经常重置开发时的数据库环境。s

4. 搭建server.js
    * fastify
    * dotenv
    * @fastify/cookie
    * @fastify/cors
    * @fastify/sensible: 助於處理error to  user
5. 測試能與資料庫連結拿取資料api搭建
6. 安裝react 路由, icons
7. 定義async hook助於使用cal api promise在react