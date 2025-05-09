// Placeholder for application configuration
// You can use @nestjs/config here
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  // Add other configurations
});
