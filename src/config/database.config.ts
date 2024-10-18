import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  const uri = process.env.MONGO_URI;
  const username = process.env.MONGO_INITDB_ROOT_USERNAME;
  const password = process.env.MONGO_INITDB_ROOT_PASSWORD;

  console.log('MongoDB URI:', uri);
  console.log('MongoDB Username:', username);
  console.log('MongoDB Password:', password);

  return {
    uri,
    username,
    password,
  };
});
