import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const articleId = query.articleId as string

  try {
    const filePath = path.resolve(process.cwd(), 'server/api/MockData/comments.json')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    let comments = JSON.parse(fileContent)

    if (articleId) {
      comments = comments.filter((c: any) => String(c.articleId) === String(articleId))
    }

    return comments
  } catch (error) {
    console.error('Error reading comments.json:', error)
    return []
  }
})
