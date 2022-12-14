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
app.register(cookie, { secret: process.env.COOKIE_SECRET })
// 跨域
app.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true,
})

// 若傳給 await 的值並非一個 Promise 物件，
// 它會將該值轉換為 resolved Promise，並等待之

const COMMENT_SELECT_FILEDS = {
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
    }
}
const CURRENT_USER_ID = (await prisma.user.findFirst({ where: { name: "Sally" } })).id
// addHook 可以注册钩子。你必须在事件被触发之前注册相应的钩子，否则，事件将得不到处理。 類似中間件
// 偽造cookie假裝登入才能取得使用者資料, 正規需透過登錄系統取得資料
app.addHook("onRequest", (req, res, done) => {
    console.log(req.cookies)
    if (req.cookies.userId !== CURRENT_USER_ID) {
        // console.log(req.cookies.userId, CURRENT_USER_ID)
        req.cookies.userId = CURRENT_USER_ID
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
                        ...COMMENT_SELECT_FILEDS,
                        _count: {
                            select: {
                                likes: true
                            }
                        }
                    }
                }
            }
        }).then(async post => {
            // 得到當前登入用戶喜歡的所有評論
            const likes = await prisma.like.findMany({
                where: {
                    userId: req.cookies.userId,
                    commentId: { in: post.comments.map(comment => comment.id) }
                }
            })

            // 加工評論與登入者是否喜歡這則評論
            const processComments = post.comments.map(comment => {
                return {
                    ...comment,
                    likedByMe: likes.filter(like => like.commentId === comment.id).length > 0,
                    likedCount: comment._count.likes
                }
            })

            return {
                ...post,
                comments: processComments
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
            },
            select: COMMENT_SELECT_FILEDS
        })
    ).then(comment => {
        // 預設喜歡與喜歡總數為0
        return {
            ...comment,
            likedByMe: false,
            likedCount: 0
        }
    })
})


app.put("/posts/:postId/comments/:commetId", async (req, res) => {
    if (req.body.message === "" || req.body.message == null) {
        return res.send(app.httpErrors.badRequest("留言必須不可為空"))
    }
    // 檢查評論的userId是否跟cookie一樣, 只能編輯自己的評論
    const { userId } = await prisma.comment.findUnique({
        where: { id: req.params.commetId },
        select: { userId: true }
    })

    if (userId !== req.cookies.userId) {
        return res.send(app.httpErrors.unauthorized("你沒有權限編輯這則評論"))
    }

    return await commitToDb(
        prisma.comment.update({
            where: { id: req.params.commetId },
            data: { message: req.body.message },
            select: { message: true }
        })
    )
})

app.delete("/posts/:postId/comments/:commetId", async (req, res) => {
    const { userId } = await prisma.comment.findUnique({
        where: { id: req.params.commetId },
        select: { userId: true }
    })
    if (userId !== req.cookies.userId) {
        return res.send(app.httpErrors.unauthorized("你沒有權限刪除這則評論"))
    }

    return await commitToDb(
        prisma.comment.delete({
            where: { id: req.params.commetId },
            select: { id: true }
        })
    )
})

app.post("/posts/:postId/comments/:commetId/toggleLike", async (req, res) => {

    const data = {
        userId: req.cookies.userId,
        commentId: req.params.commetId
    }

    const like = await prisma.like.findUnique({
        // 因為是複合鍵所以where寫成這樣
        where: {
            userId_commentId: data
        }
    })

    if (like == null) {
        return await commitToDb(
            prisma.like.create({
                data: data
            })
            .then(() => ({ isLike: true }))
        )
    } else {
        return await commitToDb(
            prisma.like.delete({
                where: { userId_commentId: data }
            }).then(() => ({ isLike: false }))
        )
    }
})

// 幫助處理error的資料
async function commitToDb(promise) {
    // fastify.to接收一個promise返回包含有err,data的資料
    const [err, data] = await app.to(promise)
    if (err) return err
    return data
}

app.listen({ port: process.env.PORT })