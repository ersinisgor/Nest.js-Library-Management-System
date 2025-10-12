import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFineEntity1760105892620 implements MigrationInterface {
  name = 'CreateFineEntity1760105892620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "fine" ("id" SERIAL NOT NULL, "amount" numeric(10,2) NOT NULL, "isPaid" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL, "userId" integer, "borrowId" integer, CONSTRAINT "PK_13acc5a2e27270b02717cfa9b30" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "fine" ADD CONSTRAINT "FK_4510640288d31f0d0dd7143a8d6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fine" ADD CONSTRAINT "FK_0d42be40e5bb2ff00c8f0594e25" FOREIGN KEY ("borrowId") REFERENCES "borrow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fine" DROP CONSTRAINT "FK_0d42be40e5bb2ff00c8f0594e25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fine" DROP CONSTRAINT "FK_4510640288d31f0d0dd7143a8d6"`,
    );
    await queryRunner.query(`DROP TABLE "fine"`);
  }
}
