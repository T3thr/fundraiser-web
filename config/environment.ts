// @/config/environment.ts
export const validateEnv = () => {
    const requiredEnvVars = [
      'MONGODB_URI',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'NEXT_PUBLIC_BASE_URL',
      'GOOGLE_SHEET_ID',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_PRIVATE_KEY',
    ];
  
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }
  };