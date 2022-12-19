import fastify from "fastify"
import sensible from '@fastify/sensible'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const prisma = new PrismaClient()
const app = fastify()
// 註冊sensible
app.register(sensible)
// 註冊cookie
app.register(cookie, { secret: "132123132" })
// 跨域
app.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true,
})

// 若傳給 await 的值並非一個 Promise 物件，
// 它會將該值轉換為 resolved Promise，並等待之

const CURRENT_USER_ID = (await prisma.user.findFirst({ where: { name: "Kyle" } })).id
console.log(CURRENT_USER_ID)
// addHook 可以注册钩子。你必须在事件被触发之前注册相应的钩子，否则，事件将得不到处理。 類似中間件
// 偽造cookie假裝登入才能取得使用者資料, 正規需透過登錄系統取得資料
app.addHook("onRequest", (req, res, done) => {
    console.log(CURRENT_USER_ID)
    if (req.cookies.userId !== CURRENT_USER_ID) {
        req.cookies.userId = CURRENT_USER_ID
        // 重置與清除cookie
        res.clearCookie("userId")
        res.setCookie("userId", CURRENT_USER_ID)
    }
    done()
})

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
                            select: {
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

app.post(`/posts/:id/comments`, async (req, res) => {
    // 確認message不為空
    if (req.body.message === "" || req.body.message == null) {
        return res.send(app.httpErrors.badRequest("留言必須不可為空"))
    }

    return await commitToDb(
        prisma.comment.create({
            data: {
                message: req.body.message,
                // 偽造登入使用cookie取得userId
                userId: req.cookies.userId,
                parentId: req.body.parentId,
                postId: req.params.id
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