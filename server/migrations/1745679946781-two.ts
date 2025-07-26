import { MigrationInterface, QueryRunner } from "typeorm";

export class Two1745679946781 implements MigrationInterface {
    name = 'Two1745679946781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9eaa3ac4cb028bdebf079ec3e2c"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "archiveId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "archiveId" uuid`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9eaa3ac4cb028bdebf079ec3e2c" FOREIGN KEY ("archiveId") REFERENCES "archives"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
