import { MigrationInterface, QueryRunner } from "typeorm";

export class Eight1752224671105 implements MigrationInterface {
    name = 'Eight1752224671105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_labels" DROP CONSTRAINT "FK_b148c8d5eb7df0b134cab11ad2e"`);
        await queryRunner.query(`ALTER TABLE "task_labels" ADD "boardId" uuid`);
        await queryRunner.query(`ALTER TABLE "task_labels" ADD CONSTRAINT "FK_b148c8d5eb7df0b134cab11ad2e" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_labels" ADD CONSTRAINT "FK_15b49c6d217788aae8198ac22fd" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_labels" DROP CONSTRAINT "FK_15b49c6d217788aae8198ac22fd"`);
        await queryRunner.query(`ALTER TABLE "task_labels" DROP CONSTRAINT "FK_b148c8d5eb7df0b134cab11ad2e"`);
        await queryRunner.query(`ALTER TABLE "task_labels" DROP COLUMN "boardId"`);
        await queryRunner.query(`ALTER TABLE "task_labels" ADD CONSTRAINT "FK_b148c8d5eb7df0b134cab11ad2e" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
