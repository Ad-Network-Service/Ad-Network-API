import { Table, Model, Column, DataType, AllowNull, AutoIncrement, PrimaryKey, CreatedAt, UpdatedAt, BelongsTo, ForeignKey } from "sequelize-typescript";
import { User } from "./User";

@Table({
    timestamps: true,
    tableName: "advertiser"
})

export class Advertiser extends Model {
    @AllowNull(false)
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    id!: number;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    userId!: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    website!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    category!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    country!: string

    @BelongsTo(() => User)
    user!: User

    @CreatedAt
    createdAt?: Date;

    @UpdatedAt
    updatedAt?: Date;
}