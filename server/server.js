import fastify from "fastify"
import sensible from '@fastify/sensible'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()
const app = fastify()
// 註冊sensible
app.register(sensible)
// 跨域
app.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true,
})

// 若傳給 await 的值並非一個 Promise 物件，
// 它會將該值轉換為 resolved Promise，並等待之

app.get('/posts', async (req, res) => {
    return await commitToDb(
        prisma.post.findMany({
            select: {
                id: true,
                title: true
            }
        }))
})

app.get('/posts/:id', async (req, res) => {
    return await commitToDb(
        prisma.post.findUnique({
            where: {
                id: req.params.id
            },
            select: {
                title: true,
                body: true,
                comments: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    select: {
                        id: true,
                        parentId: true,
                        message: true,
                        createdAt: true,
                        updatedAt: true,
                        user: {
                            select:{
                                id: true,
                                name: true,
                            }
                        },
                    },
                }
            }
        })
    )
})



// 幫助處理error的資料
async function commitToDb(promise) {
    // fastify.to接收一個promise返回包含有err,data的資料
    const [err, data] = await app.to(promise)
    if (err) return err
    return data
}

app.listen({ port: process.env.PORT })