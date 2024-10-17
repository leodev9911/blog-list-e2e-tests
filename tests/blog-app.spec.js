const { test, expect, describe, beforeEach } = require('@playwright/test')
const blogHelpers = require('../helpers/blog-helper')
const { after } = require('node:test')

describe('Blog app', () => {
    beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        await expect(page.getByText('log in to application')).toBeVisible()
        await expect(page.getByLabel('Username')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
    })

    describe('login', () => {
        beforeEach(async ({ request }) => {
            await request.post('http://localhost:8080/api/testing/reset')
            await request.post('http://localhost:8080/api/users', {
                data: {
                    name: 'Leonardo',
                    username: 'leodev9911',
                    password: 'H&l210520*'
                }
            })
            await request.post('http://localhost:8080/api/users', {
                data: {
                    name: 'Helena',
                    username: 'hele9912',
                    password: 'H&l210520*'
                }
            })
        })

        test('succeeds with correct credentials', async ({ page }) => {
            await blogHelpers.login(page, 'leodev9911', 'H&l210520*')

            await expect(page.getByRole('heading', { name: 'blogs' })).toBeVisible()
        })

        test('fails with wrongs credentials', async ({ page }) => {
            await blogHelpers.login(page, 'leodev9911', 'wrong')

            await expect(page.getByText('incorrect username or password')).toBeVisible()
        })
    })

    describe('when logged in', () => {
        beforeEach(async ({ page }) => {
            await blogHelpers.login(page, 'leodev9911', 'H&l210520*')
        })

        test('a new blog can be created', async ({ page }) => {
            const newBlog = {
                title: 'This is a blog created by E2E testing',
                author: 'Leo',
                url: 'http://localhost:5173/'
            }

            const newBlog2 = {
                title: 'This is another blog created by E2E testing',
                author: 'Leo',
                url: 'http://localhost:5173/'
            }

            const newBlog3 = {
                title: 'This is the third blog created by E2E testing',
                author: 'Leo',
                url: 'http://localhost:5173/'
            }

            await blogHelpers.createNewBlog(page, newBlog)
            await blogHelpers.createNewBlog(page, newBlog2)
            await blogHelpers.createNewBlog(page, newBlog3)

            await expect(page.getByRole('listitem').filter({ hasText: 'This is a blog created by E2E testing Leo' })).toBeVisible()
            await expect(page.getByRole('listitem').filter({ hasText: 'This is another blog created by E2E testing Leo' })).toBeVisible()
            await expect(page.getByRole('listitem').filter({ hasText: 'This is the third blog created by E2E testing Leo' })).toBeVisible()
        })

        test('a blog can be liked', async ({ page }) => {
            await blogHelpers.likeBlog(page, 'This is the third blog created by E2E testing', 1)

            await blogHelpers.openBlogDetails(page, 'This is the third blog created by E2E testing')
            
            await expect(page
                .getByRole('listitem')
                .filter({ hasText: 'This is the third blog created by E2E testing' })
                .getByText('likes 1')
            ).toBeVisible()

            await blogHelpers.closeBlogDetails(page, 'This is the third blog created by E2E testing')
        })

        test('the blogs are arranged in the order according to the likes', async ({ page }) => {
            await blogHelpers.likeBlog(page, 'This is the third blog created by E2E testing', 2)
            await blogHelpers.likeBlog(page, 'This is the third blog created by E2E testing', 3)

            await blogHelpers.likeBlog(page, 'This is another blog created by E2E testing', 1)
            await blogHelpers.likeBlog(page, 'This is another blog created by E2E testing', 2)

            await blogHelpers.likeBlog(page, 'This is a blog created by E2E testing', 1)

            await expect(page
                .getByRole('listitem')
                .nth(0)
            ).toHaveText('This is the third blog created by E2E testing Leoview')
            await expect(page
                .getByRole('listitem')
                .nth(1)
            ).toHaveText('This is another blog created by E2E testing Leoview')
            await expect(page
                .getByRole('listitem')
                .nth(2)
            ).toHaveText('This is a blog created by E2E testing Leoview')
        })

        test('a blog can be deleted', async ({ page }) => {
            page.on('dialog', async dialog => {
                if (dialog.type() === 'confirm') {
                    await dialog.accept()
                }
            })

            await page
                .getByRole('listitem')
                .filter({ hasText: 'This is another blog created by E2E testing' })
                .getByRole('button', { name: 'view' })
                .click()

            await page
                .getByRole('listitem')
                .filter({ hasText: 'This is another blog created by E2E testing' })
                .getByRole('button', { name: 'remove' })
                .click()

            await expect(page.getByText('This is another blog created by E2E testing')).toBeVisible()
        })
    })

    describe('Delete function', () => {
        test('only the user who added the blog sees the blog\'s delete button', async ({ page }) => {
            await blogHelpers.login(page, 'hele9912', 'H&l210520*')

            await page
                .getByRole('listitem')
                .filter({ hasText: 'This is a blog created by E2E testing Leo' })
                .getByRole('button', { name: 'view' })
                .click()

            await expect(page
                .getByRole('listitem')
                .filter({ hasText: 'This is a blog created by E2E testing Leo' })
                .getByRole('button', { name: 'remove' })
            ).not.toBeVisible()

            await page
                .getByRole('button', { name: 'logout' })
                .click()

            await blogHelpers.login(page, 'leodev9911', 'H&l210520*')

            await page
                .getByRole('listitem')
                .filter({ hasText: 'This is a blog created by E2E testing Leo' })
                .getByRole('button', { name: 'view' })
                .click()

            await expect(page
                .getByRole('listitem')
                .filter({ hasText: 'This is a blog created by E2E testing Leo' })
                .getByRole('button', { name: 'remove' })
            ).toBeVisible()
        })
    })
})
