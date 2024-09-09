const { Router } = require("express");
const { uploadMiddleware } = require("../config/upload.config");
const authentication = require("../middlewares/authentication.js");
const { retrieveExcelFile, fetchAllUploadedFiles, updateChatMessage, fetchFileById, analyzeReports, retrieveExcelData, createSampleReports,fetchAllSampleReports } = require("../controller/upload.controller");
const { promptRetriever, promptUpdater, regenerateSummary } = require("../controller/prompt.controller");
const { searchHistory } = require("../controller/search.controller.js");
const router = Router();

router.post("/upload", authentication, uploadMiddleware, retrieveExcelFile)
router.get("/file-retrieve",authentication, uploadMiddleware, fetchAllUploadedFiles);
router.get("/retrieveById/:id", authentication, uploadMiddleware, fetchFileById);
router.put("/update-message", authentication, updateChatMessage)
router.get("/prompt-retrieve",authentication, promptRetriever)
router.post("/prompt-updater",authentication, promptUpdater)
router.post("/regenerate-response",authentication, regenerateSummary)
router.post("/analyze-report",authentication, analyzeReports)
router.post("/searchHistory", searchHistory)
router.post("/retrieveExcelData",authentication,uploadMiddleware, retrieveExcelData);
router.post("/sample-reports",authentication,uploadMiddleware, createSampleReports);
router.get("/all-sample-reports",authentication,fetchAllSampleReports);
module.exports = router
