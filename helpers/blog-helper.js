const login = async (page, username, password) => {
    await page.getByLabel('Username').fill(username)
    await page.getByLabel('Password').fill(password)

    await page.getByRole('button', { name: 'login' }).click()
}

const createNewBlog = async (page, newBlog) => {
    await page.getByRole('button', { name: 'new note' }).click()

    await page.getByLabel('Title').fill(newBlog.title)
    await page.getByLabel('Author').fill(newBlog.author)
    await page.getByLabel('Url').fill(newBlog.url)

    await page.getByRole('button', { name: 'create' }).click()
    await page.getByText(`${newBlog.title} ${newBlog.author}`).waitFor()
}

const openBlogDetails = async (page, blogTitle) => {
    await page
        .getByRole('listitem')
        .filter({ hasText: blogTitle })
        .getByRole('button', { name: 'view' })
        .click()
}

const closeBlogDetails = async (page, blogTitle) => {
    await page
        .getByRole('listitem')
        .filter({ hasText: blogTitle })
        .getByRole('button', { name: 'hide' })
        .click()
}

const likeBlog = async (page, blogTitle, number) => {
    await openBlogDetails(page, blogTitle)

    await page
        .getByRole('listitem')
        .filter({ hasText: blogTitle })
        .getByRole('button', { name: 'like' })
        .click()

    await page.getByText(`likes ${number}`).waitFor()

    await closeBlogDetails(page, blogTitle)
}

module.exports = {
    login,
    createNewBlog,
    likeBlog,
    openBlogDetails,
    closeBlogDetails
}