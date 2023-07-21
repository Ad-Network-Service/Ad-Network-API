import bcrypt from "bcrypt";

export const securePass = async (password: string) => {
    try {
        const hashPass: string = await bcrypt.hash(password.toString(), 10);

        return hashPass;
    } catch (error: any) {
        console.log(error.message);
    }
};