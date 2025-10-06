// Configuration template
import databaseConfig from './database.config';
import s3Config from './s3.config';

export default () => ({
  database: databaseConfig(),
  s3: s3Config(),
});
