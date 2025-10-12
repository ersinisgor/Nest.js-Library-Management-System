import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDueDateToBorrow1760063585764 implements MigrationInterface {
  name = 'AddDueDateToBorrow1760063585764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "borrow" ADD "dueDate" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "borrow" DROP COLUMN "dueDate"`);
  }
}
