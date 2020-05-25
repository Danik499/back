import { Schema, model } from "mongoose";

const ProfileSchema = new Schema({
    email: String,
    password: String,
    fullName: String,
    grade: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        default: ""
    },
    subjects: {
        type: Object,
        default: {
            type: Object
        }
    }
})

const students = model("task", ProfileSchema);

export default students;