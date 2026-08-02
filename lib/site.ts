export const site = {
  name: "iknowainhoa",
  url: "https://iknowainhoa.com",
  description: "Writing, projects, and ideas.",
  email: "hola@iknowainhoa.com",
  socials: {
    linkedin: "https://www.linkedin.com/in/iknowa/",
    instagram: "https://instagram.com/ainhoaferrandisperea",
  },
};

/**
 * Flip these to re-enable routes without restoring deleted code.
 * Blog + contact stay on; everything else renders blank for now.
 * Home is always empty until content is added intentionally.
 */
export const publicPages = {
  blog: true,
  contact: true,
  gallery: true,
  work: true,
  about: false,
  apps: false,
  offers: false,
  shop: false,
  products: false,
  projects: false,
  support: false,
  thanks: false,
  shortcuts: false,
  photoarc: false,
  listeneasy: false,
  landings: false,
} as const;
