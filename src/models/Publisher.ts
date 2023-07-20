import { Table, Model, Column, DataType, AllowNull, AutoIncrement, PrimaryKey, Unique, Default, CreatedAt, UpdatedAt, DeletedAt } from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "publisher"
})

export class Publisher extends Model {
    @AllowNull(false)
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    id!: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    firstName!: string

    @Column({
        type: DataType.STRING
    })
    lastName!: string

    @Unique
    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    email!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    password!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    token!: string

    @Default(false)
    @Column({
        type: DataType.BOOLEAN
    })
    isVerified!: number

    @Column({
        type: DataType.STRING
    })
    signedToken!: string

    @CreatedAt
    createdAt?: Date;

    @UpdatedAt
    updatedAt?: Date;

    @DeletedAt
    deletedAt?: Date;
}