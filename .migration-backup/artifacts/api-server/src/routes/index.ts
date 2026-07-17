import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import minicoursesRouter from "./minicourses";
import enrollmentsRouter from "./enrollments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(registrationsRouter);
router.use(minicoursesRouter);
router.use(enrollmentsRouter);
router.use(adminRouter);

export default router;
