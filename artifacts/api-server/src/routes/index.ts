import { Router, type IRouter } from "express";
import healthRouter from "./health";
import registrationsRouter from "./registrations";
import minicoursesRouter from "./minicourses";
import enrollmentsRouter from "./enrollments";
import adminRouter from "./admin";
import speakersRouter from "./speakers";
import homepageRouter from "./homepage";
import sponsorsRouter from "./sponsors";
import galleryRouter from "./gallery";
import certificatesRouter from "./certificates";
import configRouter from "./config";

const router: IRouter = Router();

router.use(healthRouter);
router.use(registrationsRouter);
router.use(minicoursesRouter);
router.use(enrollmentsRouter);
router.use(adminRouter);
router.use(speakersRouter);
router.use(homepageRouter);
router.use(sponsorsRouter);
router.use(galleryRouter);
router.use(certificatesRouter);
router.use(configRouter);

export default router;
