import "reflect-metadata";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import * as fs from "fs";
import "dotenv/config";

const configService = new ConfigService();

const migrationsFolder = process.cwd() + "/migrations";

if (!fs.existsSync(migrationsFolder)) {
  fs.mkdirSync(migrationsFolder);
}

const files = fs.readdirSync(migrationsFolder);

const migrations = files.map((file) => `./migrations/${file}`);

const dataSource = new DataSource({
  type: "postgres",
  url: configService.getOrThrow<string>("DATABASE_URL"),
  entities: ["src/**/*.entity{.ts,.js}"],
  migrations,
  migrationsTableName: "migrations",
  logging: true,
});

export default dataSource;
