import { MigrationInterface, QueryRunner } from "typeorm";

export class Three1745959783798 implements MigrationInterface {
    name = 'Three1745959783798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_f13eef6b2a45019e1df9cfe9963"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "workspaceId"`);
        await queryRunner.query(`ALTER TYPE "public"."boards_visibility_enum" RENAME TO "boards_visibility_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."boards_visibility_enum" AS ENUM('private', 'public')`);
        await queryRunner.query(`ALTER TABLE "boards" ALTER COLUMN "visibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "boards" ALTER COLUMN "visibility" TYPE "public"."boards_visibility_enum" USING "visibility"::"text"::"public"."boards_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "boards" ALTER COLUMN "visibility" SET DEFAULT 'private'`);
        await queryRunner.query(`DROP TYPE "public"."boards_visibility_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."boards_visibility_enum_old" AS ENUM('private', 'workspace', 'public')`);
        await queryRunner.query(`ALTER TABLE "boards" ALTER COLUMN "visibility" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "boards" ALTER COLUMN "visibility" TYPE "public"."boards_visibility_enum_old" USING "visibility"::"text"::"public"."boards_visibility_enum_old"`);
        await queryRunner.query(`ALTER TABLE "boards" ALTER COLUMN "visibility" SET DEFAULT 'workspace'`);
        await queryRunner.query(`DROP TYPE "public"."boards_visibility_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."boards_visibility_enum_old" RENAME TO "boards_visibility_enum"`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "workspaceId" uuid`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_f13eef6b2a45019e1df9cfe9963" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
