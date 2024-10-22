import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;
  const url = process.env.REDIS_URL;

  console.log('Redis Host:', host);
  console.log('Redis Port:', port);
  console.log('Redis User:', username);
  console.log('Redis Password:', password);
  console.log('Redis URL:', url);

  return {
    host,
    port,
    username,
    password,
    url,
  };
});
