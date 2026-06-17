export default {
  // SPA mode - no server-side rendering
  ssr: false,
  basename: process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
    : "/",
};
