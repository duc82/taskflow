import { MigrationInterface, QueryRunner } from "typeorm";

export class Siz1751888444032 implements MigrationInterface {
    name = 'Siz1751888444032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "isWatching"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "isWatching" boolean NOT NULL DEFAULT false`);
    }

}
