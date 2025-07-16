import { MigrationInterface, QueryRunner } from "typeorm";

export class Four1751876434961 implements MigrationInterface {
    name = 'Four1751876434961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "isCompleted" TO "completedAt"`);
        await queryRunner.query(`CREATE TABLE "task_members" ("tasksId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_8c440f83b3c1194969c6ec64061" PRIMARY KEY ("tasksId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f37c909383623c89ee5816ca2c" ON "task_members" ("tasksId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f0de9adb4b618c2dcda41b40ac" ON "task_members" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "completedAt"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "completedAt" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "FK_f37c909383623c89ee5816ca2cb" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "FK_f0de9adb4b618c2dcda41b40ac9" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "FK_f0de9adb4b618c2dcda41b40ac9"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "FK_f37c909383623c89ee5816ca2cb"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "completedAt"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "completedAt" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0de9adb4b618c2dcda41b40ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f37c909383623c89ee5816ca2c"`);
        await queryRunner.query(`DROP TABLE "task_members"`);
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "completedAt" TO "isCompleted"`);
    }

}
