import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateDueDates1760079735197 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "borrow" SET "dueDate" = "borrowDate" + INTERVAL '14 days' WHERE "dueDate" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "borrow" SET "dueDate" = NULL WHERE "dueDate" IS NOT NULL`,
    );
  }
}
