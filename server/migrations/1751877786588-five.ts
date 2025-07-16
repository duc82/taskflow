import { MigrationInterface, QueryRunner } from "typeorm";

export class Five1751877786588 implements MigrationInterface {
    name = 'Five1751877786588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "FK_f37c909383623c89ee5816ca2cb"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "FK_f0de9adb4b618c2dcda41b40ac9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f37c909383623c89ee5816ca2c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f0de9adb4b618c2dcda41b40ac"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "PK_8c440f83b3c1194969c6ec64061"`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "PK_f37c909383623c89ee5816ca2cb" PRIMARY KEY ("tasksId")`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP COLUMN "usersId"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "PK_f37c909383623c89ee5816ca2cb"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP COLUMN "tasksId"`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD "taskId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "PK_3b774326c6e528ab729054ad6f3" PRIMARY KEY ("taskId")`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "PK_3b774326c6e528ab729054ad6f3"`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "PK_a98caeae94115b9ed3add078f07" PRIMARY KEY ("taskId", "userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_3b774326c6e528ab729054ad6f" ON "task_members" ("taskId") `);
        await queryRunner.query(`CREATE INDEX "IDX_420ffe725a3d0af4ffb77942df" ON "task_members" ("userId") `);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "FK_3b774326c6e528ab729054ad6f3" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "FK_420ffe725a3d0af4ffb77942dfb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "FK_420ffe725a3d0af4ffb77942dfb"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "FK_3b774326c6e528ab729054ad6f3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_420ffe725a3d0af4ffb77942df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b774326c6e528ab729054ad6f"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "PK_a98caeae94115b9ed3add078f07"`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "PK_3b774326c6e528ab729054ad6f3" PRIMARY KEY ("taskId")`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "PK_3b774326c6e528ab729054ad6f3"`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP COLUMN "taskId"`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD "tasksId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "PK_f37c909383623c89ee5816ca2cb" PRIMARY KEY ("tasksId")`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD "usersId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_members" DROP CONSTRAINT "PK_f37c909383623c89ee5816ca2cb"`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "PK_8c440f83b3c1194969c6ec64061" PRIMARY KEY ("usersId", "tasksId")`);
        await queryRunner.query(`CREATE INDEX "IDX_f0de9adb4b618c2dcda41b40ac" ON "task_members" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f37c909383623c89ee5816ca2c" ON "task_members" ("tasksId") `);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "FK_f0de9adb4b618c2dcda41b40ac9" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_members" ADD CONSTRAINT "FK_f37c909383623c89ee5816ca2cb" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
