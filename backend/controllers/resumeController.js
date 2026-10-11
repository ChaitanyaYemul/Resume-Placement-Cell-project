const service = require("../services/resumeService");
const { ok, fail } = require("../utils/response");

exports.getMyResume = async (req, res) =>
  ok(res, await service.getByStudentId(req.user.student_id));

exports.createResume = async (req, res) =>
  ok(res, await service.create(req.user.student_id, req.body), "Resume created", 201);

exports.updateMyResume = async (req, res) =>
  ok(res, await service.update(req.user.student_id, req.body), "Resume updated");

exports.deleteMyResume = async (req, res) => {
  await service.remove(req.user.student_id);
  ok(res, null, "Resume deleted");
};

exports.getResumeByStudentId = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return fail(res, "Invalid student id", 400);
  ok(res, await service.getByStudentId(id));
};