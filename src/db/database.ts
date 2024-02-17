import { CONFIG } from '@/config';
import { Connection, createConnection } from 'mongoose';
import { schemas } from '.';

class Database {
  private static instance: Database;
  private connection: Connection;

  private constructor() {
    // Connect to the database
    this.connection = createConnection(
      `mongodb://${CONFIG.MONGO_HOST}:${CONFIG.MONGO_PORT}/${CONFIG.MONGO_DB}`,
      {
        authSource: 'admin',
        user: CONFIG.MONGO_USER,
        pass: CONFIG.MONGO_PASS,
      }
    );

    // Log errors
    this.connection.on('error', console.error.bind(console, 'connection error:'));

    // Log success
    this.connection.once('open', function () {
      console.log('Connected to the database');
    });

    // Load all schemas
    Object.entries(schemas).forEach(([schemaName, schema]) => {
      this.connection.model(schemaName, schema.schema);
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getConnection(): Connection {
    return this.connection;
  }
}

export { Database };
