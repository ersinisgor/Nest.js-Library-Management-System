import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDueDateNotNull1760080013754 implements MigrationInterface {
  name = 'MakeDueDateNotNull1760080013754';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "borrow" ALTER COLUMN "dueDate" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "borrow" ALTER COLUMN "dueDate" DROP NOT NULL`,
    );
  }
}
