import { MigrationInterface, QueryRunner } from "typeorm";

export class Seven1752122918651 implements MigrationInterface {
    name = 'Seven1752122918651'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_attachments" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_2a0280fbafa7b94c89ce6744d87" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_2a0280fbafa7b94c89ce6744d87"`);
        await queryRunner.query(`ALTER TABLE "task_attachments" DROP COLUMN "userId"`);
    }

}
