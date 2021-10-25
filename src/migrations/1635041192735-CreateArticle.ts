import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateArticle1635041192735 implements MigrationInterface {
    name = 'CreateArticle1635041192735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE 'article' ('id' SERIAL NOT NULL, 'title' character varying NOT NULL, 'body' character varying NOT NULL, 'createdAt' TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 'updatedAt' TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT 'PK_40808690eb7b915046558c0f81b' PRIMARY KEY ('id'))`);
        await queryRunner.query(`CREATE INDEX 'IDX_fca3cb9ba4963678f564f22e7a' ON 'article' ('title') `);
        await queryRunner.query(`CREATE INDEX 'IDX_8b69c034798885f5761cc54a9c' ON 'article' ('createdAt') `);
        await queryRunner.query(`CREATE INDEX 'IDX_a7bda33f448037ee10279e8919' ON 'article' ('updatedAt') `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX 'public'.'IDX_a7bda33f448037ee10279e8919'`);
        await queryRunner.query(`DROP INDEX 'public'.'IDX_8b69c034798885f5761cc54a9c'`);
        await queryRunner.query(`DROP INDEX 'public'.'IDX_fca3cb9ba4963678f564f22e7a'`);
        await queryRunner.query(`DROP TABLE 'article'`);
    }

}
