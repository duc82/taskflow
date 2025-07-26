import { MigrationInterface, QueryRunner } from "typeorm";

export class One1745678340892 implements MigrationInterface {
    name = 'One1745678340892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, "userId" uuid, CONSTRAINT "PK_83b99b0b03db29d4cafcb579b77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resetToken" character varying, "resetTokenExpires" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_63764db9d9aaa4af33e07b2f4bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."board_members_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "board_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."board_members_role_enum" NOT NULL DEFAULT 'member', "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "boardId" uuid, CONSTRAINT "PK_6994cea1393b5fa3a0dd827a9f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, "userId" uuid, CONSTRAINT "PK_b7b39b92ce3a5cd42cf81a0dd3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."workspaces_visibility_enum" AS ENUM('PUBLIC', 'PRIVATE')`);
        await queryRunner.query(`CREATE TABLE "workspaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "logo" character varying NOT NULL, "visibility" "public"."workspaces_visibility_enum" NOT NULL DEFAULT 'PRIVATE', CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."workspace_members_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "workspace_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."workspace_members_role_enum" NOT NULL DEFAULT 'member', "joinedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "workspaceId" uuid, CONSTRAINT "PK_22ab43ac5865cd62769121d2bc4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "avatar" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tokenId" uuid, CONSTRAINT "REL_d98a275f8bc6cd986fcbe2eab0" UNIQUE ("tokenId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "task_attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" text NOT NULL, "name" character varying, "type" character varying NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "taskId" uuid, CONSTRAINT "PK_34eb9e5133310a488eaba0be28a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_labels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL, "taskId" uuid, CONSTRAINT "PK_72402f2c22ceabc2e73b718c321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "archives" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_c3ec7997b37170870ed028fe0e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "position" double precision NOT NULL, "description" text, "isCompleted" boolean NOT NULL DEFAULT false, "isWatching" boolean NOT NULL DEFAULT false, "cover" character varying, "coverColor" character varying, "startDate" TIMESTAMP WITH TIME ZONE, "dueDate" TIMESTAMP WITH TIME ZONE, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "columnId" uuid, "archiveId" uuid, "boardId" uuid, "userInboxId" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."boards_visibility_enum" AS ENUM('private', 'workspace', 'public')`);
        await queryRunner.query(`CREATE TABLE "boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "cover" character varying DEFAULT 'rgb(220, 234, 254)', "coverColor" character varying, "visibility" "public"."boards_visibility_enum" NOT NULL DEFAULT 'workspace', "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "ownerId" uuid, "workspaceId" uuid, CONSTRAINT "PK_606923b0b068ef262dfdcd18f44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "columns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "position" double precision NOT NULL, "description" text, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "boardId" uuid, CONSTRAINT "PK_4ac339ccbbfed1dcd96812abbd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_comments" ADD CONSTRAINT "FK_ba265816ca1d93f51083e06c520" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_comments" ADD CONSTRAINT "FK_be77588a6727c9a27075b590048" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board_members" ADD CONSTRAINT "FK_2af5912734e7fbedc23afd07adc" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "board_members" ADD CONSTRAINT "FK_8dfe924ec592792320086ebb692" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_activities" ADD CONSTRAINT "FK_7ecc3aa36f9f641e05c65842157" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_activities" ADD CONSTRAINT "FK_92bb45529d40941b5e7ac7bc2d8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_22176b38813258c2aadaae32448" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workspace_members" ADD CONSTRAINT "FK_0dd45cb52108d0664df4e7e33e6" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_d98a275f8bc6cd986fcbe2eab01" FOREIGN KEY ("tokenId") REFERENCES "user_tokens"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_attachments" ADD CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_labels" ADD CONSTRAINT "FK_b148c8d5eb7df0b134cab11ad2e" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_166bd96559cb38595d392f75a35" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_0ecfe75e5bd731e00e634d70e5f" FOREIGN KEY ("columnId") REFERENCES "columns"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9eaa3ac4cb028bdebf079ec3e2c" FOREIGN KEY ("archiveId") REFERENCES "archives"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_8a75fdea98c72c539a0879cb0d1" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_faa8e70c195778535770a00982c" FOREIGN KEY ("userInboxId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_dcdf669d9c6727190556702de56" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "boards" ADD CONSTRAINT "FK_f13eef6b2a45019e1df9cfe9963" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "columns" ADD CONSTRAINT "FK_43dea26ad518ea50c5a45c17724" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "columns" ADD CONSTRAINT "FK_ac92bfd7ba33174aabef610f361" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "columns" DROP CONSTRAINT "FK_ac92bfd7ba33174aabef610f361"`);
        await queryRunner.query(`ALTER TABLE "columns" DROP CONSTRAINT "FK_43dea26ad518ea50c5a45c17724"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_f13eef6b2a45019e1df9cfe9963"`);
        await queryRunner.query(`ALTER TABLE "boards" DROP CONSTRAINT "FK_dcdf669d9c6727190556702de56"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_faa8e70c195778535770a00982c"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_8a75fdea98c72c539a0879cb0d1"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9eaa3ac4cb028bdebf079ec3e2c"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_0ecfe75e5bd731e00e634d70e5f"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_166bd96559cb38595d392f75a35"`);
        await queryRunner.query(`ALTER TABLE "task_labels" DROP CONSTRAINT "FK_b148c8d5eb7df0b134cab11ad2e"`);
        await queryRunner.query(`ALTER TABLE "task_attachments" DROP CONSTRAINT "FK_47d3c46e4edb30cdaf97ccdb8d8"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d98a275f8bc6cd986fcbe2eab01"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_0dd45cb52108d0664df4e7e33e6"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_22176b38813258c2aadaae32448"`);
        await queryRunner.query(`ALTER TABLE "task_activities" DROP CONSTRAINT "FK_92bb45529d40941b5e7ac7bc2d8"`);
        await queryRunner.query(`ALTER TABLE "task_activities" DROP CONSTRAINT "FK_7ecc3aa36f9f641e05c65842157"`);
        await queryRunner.query(`ALTER TABLE "board_members" DROP CONSTRAINT "FK_8dfe924ec592792320086ebb692"`);
        await queryRunner.query(`ALTER TABLE "board_members" DROP CONSTRAINT "FK_2af5912734e7fbedc23afd07adc"`);
        await queryRunner.query(`ALTER TABLE "task_comments" DROP CONSTRAINT "FK_be77588a6727c9a27075b590048"`);
        await queryRunner.query(`ALTER TABLE "task_comments" DROP CONSTRAINT "FK_ba265816ca1d93f51083e06c520"`);
        await queryRunner.query(`DROP TABLE "columns"`);
        await queryRunner.query(`DROP TABLE "boards"`);
        await queryRunner.query(`DROP TYPE "public"."boards_visibility_enum"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "archives"`);
        await queryRunner.query(`DROP TABLE "task_labels"`);
        await queryRunner.query(`DROP TABLE "task_attachments"`);
        await queryRunner.query(`DROP INDEX "public"."idx_users_email"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "workspace_members"`);
        await queryRunner.query(`DROP TYPE "public"."workspace_members_role_enum"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
        await queryRunner.query(`DROP TYPE "public"."workspaces_visibility_enum"`);
        await queryRunner.query(`DROP TABLE "task_activities"`);
        await queryRunner.query(`DROP TABLE "board_members"`);
        await queryRunner.query(`DROP TYPE "public"."board_members_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_tokens"`);
        await queryRunner.query(`DROP TABLE "task_comments"`);
    }

}
