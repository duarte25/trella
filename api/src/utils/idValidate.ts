import mongoose from "mongoose";

export default function idValidate(id: string): boolean {
    if (mongoose.Types.ObjectId.isValid(id)) {
        if (String(new mongoose.Types.ObjectId(id)) === id) {
            return true;
        }
        return false;
    }
    return false;
}
