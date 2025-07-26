import { MigrationInterface, QueryRunner } from "typeorm";

export class Nine1752485088836 implements MigrationInterface {
    name = 'Nine1752485088836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_labels" DROP CONSTRAINT "FK_15b49c6d217788aae8198ac22fd"`);
        await queryRunner.query(`ALTER TABLE "task_labels" DROP COLUMN "boardId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_labels" ADD "boardId" uuid`);
        await queryRunner.query(`ALTER TABLE "task_labels" ADD CONSTRAINT "FK_15b49c6d217788aae8198ac22fd" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
