import commentsData from './MockData/comments.json'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const articleId = query.articleId as string

  try {
    let comments = Array.isArray(commentsData) ? commentsData : []

    if (articleId) {
      comments = comments.filter((c: any) => String(c.articleId) === String(articleId))
    }

    return comments
  } catch (error) {
    console.error('Error reading comments.json:', error)
    return []
  }
})
