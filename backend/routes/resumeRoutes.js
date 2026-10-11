const router = require("express").Router();
const ctrl = require("../controllers/resumeController");
const auth = require("../middleware/devAuth");
const requireRole = require("../middleware/roleMiddleware");
const wrap = require("../utils/asyncHandler");

router.use(auth);

router.get("/me", requireRole("STUDENT"), wrap(ctrl.getMyResume));
router.post("/", requireRole("STUDENT"), wrap(ctrl.createResume));
router.put("/me", requireRole("STUDENT"), wrap(ctrl.updateMyResume));
router.delete("/me", requireRole("STUDENT"), wrap(ctrl.deleteMyResume));
router.get("/student/:id", requireRole("ADMIN"), wrap(ctrl.getResumeByStudentId));

module.exports = router;