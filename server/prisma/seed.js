import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()
  // 創建兩筆user資料
  const kyle = await prisma.user.create({ data: { name: 'Kyle' } })
  const sally = await prisma.user.create({ data: { name: 'Sally' } })
  // 創建兩筆post資料
  const post1 = await prisma.post.create({
    data: {
      title: 'post1',
      body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
    }
  })
  const post2 = await prisma.post.create({
    data: {
      title: 'post2',
      body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
    }
  })
  // 創建三個評論
  const comment1 = await prisma.comment.create({
    data: {
      message: 'I am a root comment',
      userId: kyle.id,
      postId: post1.id
    }
  })
  const comment2 = await prisma.comment.create({
    data: {
      parentId: comment1.id,
      message: 'I am a nested comment',
      userId: kyle.id,
      postId: post1.id
    }
  })
  const comment3 = await prisma.comment.create({
    data: {
      message: 'I am another  root comment',
      userId: sally.id,
      postId: post1.id
    }
  })

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })