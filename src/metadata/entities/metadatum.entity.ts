import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity({ name: 'metadata' })
export class Metadatum extends BaseEntity{

    @Column({ unique: true })
    key: string; // The key of the metadata, unique for each entry

    @Column({ nullable: true })
    value: string;

    @Column({ nullable: true })
    description?: string; // Optional description of the metadata

    @Column({ nullable: true })
    type: string; // Optional type of the metadata (e.g., string, number, boolean, etc.)

}
