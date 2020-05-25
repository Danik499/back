import { MongoClient, ObjectID } from 'mongodb';
import students from "./models/studModel";
import mongoose, { ConnectionStates } from "mongoose";

mongoose.set('useFindAndModify', false);

const url = 'mongodb://localhost:27017';
const dbName = 'taskDB';
mongoose.connect(url + '/' + dbName);

const Controler = {
    get: function (request, response) {
        students.find()
            .then(inf => {
                response.send(inf);
            })
            .catch(
                error => {
                    response.status(500).send(error);
                }
            );
    },

    post: function (request, response) {
        const newItem = new students(request.body);
        let check = true;
        students.find().then((inf) => {
            for (let i = 0; i < inf.length; i++) {
                if (newItem.email == inf[i].email) { check = false; break; }
            }
            if (!newItem.email) return response.status(401).send("You did not enter an email!");
            if (!newItem.password) return response.status(401).send("You did not enter a password!");
            if (newItem.grade) {
                if (typeof (newItem.grade) != "number") return response.status(401).send("A grade must be a number!");
                if (newItem.grade > 11 || newItem.grade < 1) return response.status(401).send("A grade must be between 1 and 12!");
            }
            if (!newItem.fullName) return response.status(401).send("You did not enter your name!");
            if (inf.length == 0) newItem.role = "admin";
            if (check)
                newItem.save().then(user => {
                    return response.send(user)
                })
            else return response.status(401).send("This email has already been taken!!!")
        });
    },

    logIn: function (req, res) {
        // let user = new students(request.body);
        // students.findOne({ email: user.email, password: user.password }).then(inf => {
        //     if (!inf) return response.status(401).send("Check your password or email!!!");
        //     const updatedUser = { email: user.email, password: user.password, isLoggedIn: true };
        //     students.findOneAndUpdate({ email: user.email, password: user.password }, updatedUser, { new: true }, function (error, user) {
        //         if (error) return res.send(error)
        //     });
        // });
        //
        let item = req.body;
        if (!item.email) return res.status(400).send("You did not enter an email!");
        if (!item.password) return res.status(400).send("You did not enter an password!");
        students.findOne({ email: item.email, password: item.password }).then(inf => {
            if (!inf) return response.status(400).send("Check your password or email!!!");
            if (inf.role == "") return res.status(400).send("You haven't got the role yet!");
            if (inf.role == "student") return res.send(inf.subjects);
            else res.send(inf)
        })

    },

    logOut: function (request, response) {
        let user = new students(request.body);
        students.findOne({ email: user.email, password: user.password }).then(inf => {
            if (!inf) return response.status(401).send("Check your password or login!!!").status(401);
            const updatedUser = { email: user.email, password: user.password, isLoggedIn: false };
            students.findOneAndUpdate({ email: user.email, password: user.password }, updatedUser, { new: true }, function (error, user) {
                if (error) return response.send(error);
                else {
                    return response.send(user);
                }
            });
        });
    },

    addSubjects: function (req, res) {
        let item = req.body;
        let grade = item.grade;
        if (!grade) return res.status(401).send("You did not enter a grade!");
        if (typeof (grade) != "number") return res.status(401).send("A grade must be a number!");
        if (grade < 1 || grade > 11) return res.status(401).send("A grade must be between 1 and 11!");
        if (!item.subjects) return res.status(401).send("You did not enter subjects!");
        students.find({ grade: item.grade }).then(inf => {
            for (let student of inf) {
                for (let s of item.subjects) {
                    if (!student.subjects.hasOwnProperty(s))
                        student.subjects[`${s}`] = { topic1: 0 };
                }
                const updatedUser = { subjects: student.subjects };
                students.findOneAndUpdate({ email: student.email }, updatedUser, { new: true }, function (error, user) {
                    if (error) return res.send(error)
                })
            }
            return res.send(inf)
        })
    },

    removeSubjects: function (req, res) {
        let item = req.body;
        let grade = item.grade;
        if (!grade) return res.status(401).send("You did not enter a grade!");
        if (typeof (grade) != "number") return res.status(401).send("A grade must be a number!");
        if (grade < 1 || grade > 11) return res.status(401).send("A grade must be between 1 and 11!");
        if (!item.subjects) return res.status(401).send("You did not enter subjects!");
        students.find({ grade: item.grade }).then(inf => {
            for (let student of inf) {
                for (let s of item.subjects) {
                    if (student.subjects.hasOwnProperty(s))
                        delete student.subjects[`${s}`];
                }
                const updatedUser = { subjects: student.subjects };
                students.findOneAndUpdate({ email: student.email }, updatedUser, { new: true }, function (error, user) {
                    if (error) return res.send(error)
                })
                delete student.password;
            }
            return res.send(inf)
        });
    },

    addTopics: function (req, res) {
        let item = req.body;
        let grade = item.grade;
        if (!grade) return res.status(401).send("You did not enter a grade!");
        if (typeof (grade) != "number") return res.status(401).send("A grade must be a number!");
        if (grade < 1 || grade > 11) return res.status(401).send("A grade must be between 1 and 11!");
        if (!item.subject) return res.status(401).send("You did not enter a subject!");
        if (!item.topics) return res.status(401).send("You did not enter topics!");
        students.find({ grade: item.grade }).then(inf => {
            for (let student of inf) {
                for (let topic of item.topics) {
                    if (!student.subjects[`${item.subject}`].hasOwnProperty(topic))
                        student.subjects[`${item.subject}`][`${topic}`] = 0;
                }
                delete student.subjects[`${item.subject}`]["topic1"]
                const updatedUser = { subjects: student.subjects };
                students.findByIdAndUpdate(student._id, updatedUser, { new: true }, function (error, user) {
                    if (error) return res.send(error);
                })
                delete student.password;
            }
            return res.send(inf);
        })
    },

    removeTopics: function (req, res) {
        let item = req.body;
        let grade = item.grade;
        if (!grade) return res.status(401).send("You did not enter a grade!");
        if (typeof (grade) != "number") return res.status(401).send("A grade must be a number!");
        if (grade < 1 || grade > 11) return res.status(401).send("A grade must be between 1 and 11!");
        if (!subject) return res.status(401).send("You did not enter a subject!");
        if (!topics) return res.status(401).send("You did not enter topics!");
        students.find({ grade: item.grade }).then(inf => {
            for (let student of inf) {
                for (let topic of item.topics) {
                    if (student.subjects[`${item.subject}`].hasOwnProperty(topic))
                        delete student.subjects[`${item.subject}`][`${topic}`];
                }
                if (Object.keys(student.subjects[`${item.subject}`]).length == 0)
                    student.subjects[`${item.subject}`]["topic1"] = 0;
                const updatedUser = { subjects: student.subjects };
                students.findByIdAndUpdate(student._id, updatedUser, { new: true }, function (error, user) {
                    if (error) return res.send(error);
                })
            }
            return res.send(inf);
        })
    },

    editAssessments: function (req, res) {
        let item = req.body;
        students.findOne({ email: item.email }).then(inf => {
            if (!inf) return res.status(400).send("Such student does not exist!");
            if (!inf.subjects.hasOwnProperty(item.subject))
                return res.status(400).send("This subject does not exist!");
            for (let topic in item.topics) {
                if (!inf.subjects[`${item.subject}`].hasOwnProperty(topic))
                    return res.status(400).send(`Topic '${topic}' does not exist!`);
                let assessnt = item.topics[`${topic}`];
                if (typeof (assessnt) != "number")
                    return res.status(400).send("An assessment must be a number!")
                if (assessnt > 12 || assessnt < 1)
                    return res.status(400).send("An assessment must be between 1 and 12!")
                inf.subjects[`${item.subject}`][`${topic}`] = item.topics[`${topic}`];
            }
            const updatedUser = { subjects: inf.subjects };
            students.findByIdAndUpdate(inf._id, updatedUser, { new: true }, function (error, user) {
                if (error) return res.send(error);
                else {
                    res.send(inf)
                }
            })
        });
    },

    editRoles: function (req, res) {
        let item = req.body;
        students.find().then(users => {
            if (item.students) {
                for (let student of item.students) {
                    const updatedUser = { role: "student" };
                    students.findOneAndUpdate({ email: student }, updatedUser, { new: true }, function (error, user) {
                        if (error) return res.send(error);
                    })
                }
            }
            if (item.teachers) {
                for (let teacher of item.teachers) {
                    const updatedUser = { role: "teacher" };
                    students.findOneAndUpdate({ email: teacher }, updatedUser, { new: true }, function (error, user) {
                        if (error) return res.send(error);
                    })
                }
            }
            return res.send(users)
        });
    },

    editGrade: function (req, res) {
        let item = req.body;
        students.find({ email: item.email }).then(inf => {
            const updatedUser = { grade: item.grade };
            students.findOneAndUpdate({ email: item.email }, updatedUser, { new: true }, function (error, user) {
                if (error) return res.send(error);
                else return res.send(user)
            })
        })
    },

    deleteById: function (req, res) {
        if (req.query.id) {
            students.findByIdAndDelete(req.query.id).then((deleted) => {
                return res.send(deleted);
            });
        }
    }
}

export default Controler;