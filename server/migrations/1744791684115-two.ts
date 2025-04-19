import { MigrationInterface, QueryRunner } from "typeorm";

export class Two1744791684115 implements MigrationInterface {
    name = 'Two1744791684115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "wallpaper"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "wallpaperColor"`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "cover" text`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "coverColor" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "coverColor"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP COLUMN "cover"`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "wallpaperColor" text`);
        await queryRunner.query(`ALTER TABLE "boards" ADD "wallpaper" text`);
    }

}
