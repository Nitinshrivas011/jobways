const express = require("express")
const {getAllJobs, getAllUsers, getAllApp, updateApplication, deleteApplication, updateUser, deleteUser, getApplication, getUser, getJob, updateJob, deleteJob} = require('../controllers/AdminControllers')
const {isAuthenticated, authorizeRoles} = require('../middlewares/auth')
const {applicationIdValidator,validateHandler , userIdValidator, JobIdValidator} = require('../middlewares/validators');
const router = express.Router() ;
const { getDocuments, deleteDocument } = require('../controllers/DocumentController');

router.route("/admin/allJobs").get(isAuthenticated ,authorizeRoles("admin", "hr") , getAllJobs)
router.route("/admin/allUsers").get(isAuthenticated ,authorizeRoles("admin", "hr") , getAllUsers)
router.route("/admin/allApp").get(isAuthenticated ,authorizeRoles("admin", "hr") , getAllApp)

router.route("/admin/getApplication/:id").get(isAuthenticated ,authorizeRoles("admin", "hr") ,applicationIdValidator(),validateHandler, getApplication)
router.route("/admin/updateApplication/:id").put(isAuthenticated ,authorizeRoles("admin", "hr") ,applicationIdValidator(),validateHandler, updateApplication)
router.route("/admin/deleteApplication/:id").delete(isAuthenticated ,authorizeRoles("admin", "hr") ,applicationIdValidator(),validateHandler, deleteApplication)

router.route("/admin/getUser/:id").get(isAuthenticated ,authorizeRoles("admin", "hr") ,userIdValidator(),validateHandler, getUser)
router.route("/admin/updateUser/:id").put(isAuthenticated ,authorizeRoles("admin", "hr") ,userIdValidator(),validateHandler, updateUser)
router.route("/admin/deleteUser/:id").delete(isAuthenticated ,authorizeRoles("admin") ,userIdValidator(),validateHandler, deleteUser)

router.route("/admin/getJob/:id").get(isAuthenticated ,authorizeRoles("admin", "hr") ,JobIdValidator(),validateHandler, getJob)
router.route("/admin/updateJob/:id").put(isAuthenticated ,authorizeRoles("admin", "hr") ,JobIdValidator(),validateHandler, updateJob)
router.route("/admin/deleteJob/:id").delete(isAuthenticated ,authorizeRoles("admin") ,JobIdValidator(),validateHandler, deleteJob)

router.get('/employee/:employeeId/documents', 
  isAuthenticated, authorizeRoles('admin', 'hr'), getDocuments);

router.delete('/employee/:employeeId/documents/:docId', 
  isAuthenticated, authorizeRoles('admin', 'hr'), deleteDocument);

module.exports = router ;