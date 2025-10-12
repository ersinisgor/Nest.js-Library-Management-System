import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaidAtToFine1760169842351 implements MigrationInterface {
  name = 'AddPaidAtToFine1760169842351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fine" ADD "paidAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fine" DROP COLUMN "paidAt"`);
  }
}
