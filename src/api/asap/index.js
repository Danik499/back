import Router from "express";
import Controller from "./controller";

const studRouter = new Router();
//main
studRouter.post("/registration", Controller.post);
studRouter.put("/logIn", Controller.logIn)
studRouter.get("/", Controller.get);



//teacher
studRouter.put("/addSubjects", Controller.addSubjects);
studRouter.put("/removeSubjects", Controller.removeSubjects)
studRouter.put("/addTopics", Controller.addTopics)
studRouter.put("/removeTopics", Controller.removeTopics)
studRouter.put("/editAssessments", Controller.editAssessments)
studRouter.put("/editGrade", Controller.editGrade)


studRouter.put("/editRoles", Controller.editRoles)
studRouter.delete("/delete", Controller.deleteById)

export default studRouter;