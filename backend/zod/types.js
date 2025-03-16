const { z } = require('zod');

const imageSchema = z.object({
  imageId: z.string(),
  url: z.string().url(),
  thumbUrl: z.string().url(),
  displayUrl: z.string().url()
}).optional();

const userZod = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  firstname: z.string().min(1).max(50),
  lastname: z.string().min(1).max(50)
});

const userOAuthZod = z.object({
  email: z.string().email(),
  firstname: z.string().min(1).max(50),
  lastname: z.string().min(1).max(50),
  profileImage: imageSchema
});

const userUpdateZod = z.object({
  firstname: z.string().min(1).max(50).optional(),
  lastname: z.string().min(1).max(50).optional(),
  bio: z.string().max(150).optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  location: z.string().max(60).optional(),
  birthdate: z.date().optional(),
  profileImage: imageSchema,
  bannerImage: imageSchema
});

module.exports = {
  userZod,
  userOAuthZod,
  userUpdateZod
};

