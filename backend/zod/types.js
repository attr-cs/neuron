const {z} = require('zod');

const userZod = z.object({
    email: z.string().email().max(30),
    username: z.string().max(30),
    firstname: z.string().max(50),
    lastname: z.string().max(50),
    password: z.string().min(6)
})

const userOAuthZod = z.object({
    email: z.string().email().max(30),
    firstname: z.string().max(50),
    lastname: z.string().max(50),
    profileImageUrl: z.string().max(2048)
})

module.exports = { userZod, userOAuthZod };