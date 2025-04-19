import { MigrationInterface, QueryRunner } from "typeorm";

export class Two1744978062146 implements MigrationInterface {
    name = 'Two1744978062146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "userInboxId" uuid`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "cover"`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "cover" character varying`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "coverColor"`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "coverColor" character varying`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "cover"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "cover" character varying`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "coverColor"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "coverColor" character varying`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_faa8e70c195778535770a00982c" FOREIGN KEY ("userInboxId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_faa8e70c195778535770a00982c"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "coverColor"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "coverColor" text`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "cover"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "cover" text`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "coverColor"`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "coverColor" text`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "cover"`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "cover" text`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "userInboxId"`);
    }

}
