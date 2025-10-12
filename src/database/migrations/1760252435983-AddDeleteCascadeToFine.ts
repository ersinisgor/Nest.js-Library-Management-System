import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeleteCascadeToFine1760252435983 implements MigrationInterface {
    name = 'AddDeleteCascadeToFine1760252435983'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fine" DROP CONSTRAINT "FK_0d42be40e5bb2ff00c8f0594e25"`);
        await queryRunner.query(`ALTER TABLE "fine" ADD CONSTRAINT "FK_0d42be40e5bb2ff00c8f0594e25" FOREIGN KEY ("borrowId") REFERENCES "borrow"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fine" DROP CONSTRAINT "FK_0d42be40e5bb2ff00c8f0594e25"`);
        await queryRunner.query(`ALTER TABLE "fine" ADD CONSTRAINT "FK_0d42be40e5bb2ff00c8f0594e25" FOREIGN KEY ("borrowId") REFERENCES "borrow"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
