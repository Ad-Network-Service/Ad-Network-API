import { AllowNull, AutoIncrement, Column, CreatedAt, DataType, Default, HasOne, Model, PrimaryKey, Table, Unique, UpdatedAt } from "sequelize-typescript";
import { Publisher } from "./Publisher";
import { Advertiser } from "./Advertiser";

@Table({
    timestamps: true,
    tableName: "user"
})

export class User extends Model {
    @AllowNull(false)
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    id!: number;

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

    @Unique
    @Column({
        type: DataType.STRING
    })
    phone!: string

    @Column({
        type: DataType.STRING
    })
    type!: string

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

    @Default(false)
    @Column({
        type: DataType.BOOLEAN
    })
    isPhoneVerified!: number

    @Column({
        type: DataType.STRING
    })
    signedToken!: string

    @HasOne(() => Publisher)
    publisherDetails!: Publisher;

    @HasOne(() => Advertiser)
    advertiserDetails!: Advertiser;

    @CreatedAt
    createdAt?: Date;

    @UpdatedAt
    updatedAt?: Date;
}