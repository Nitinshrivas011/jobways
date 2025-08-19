const express = require('express')
const { register, login, isLogin, me, changePassword, updateProfile, deleteAccount } = require('../controllers/UserControllers')
const {isAuthenticated, authorizeRoles} = require('../middlewares/auth');
const { registerValidator, validateHandler,loginValidator ,changePasswordValidator ,updateProfileValidator,deleteAccountValidator} = require('../middlewares/validators');
const router = express.Router() 
const { uploadDocument, deleteDocument, getDocuments } = require('../controllers/DocumentController');
const User = require('../models/UserModel');

router.route("/register").post(registerValidator(),validateHandler,register) ;
router.route("/login").post(loginValidator(),validateHandler,login) ;
router.route("/isLogin").get(isAuthenticated, isLogin) ; 
router.route("/me").get(isAuthenticated,me) ; 
router.route("/changePassword").put(isAuthenticated,changePasswordValidator(),validateHandler, changePassword) ; 
router.route("/updateProfile").put(isAuthenticated,updateProfileValidator(),validateHandler, updateProfile) ; 
router.route("/deleteAccount").put(isAuthenticated,deleteAccountValidator(),validateHandler, deleteAccount) ; 
router.get('/documents', isAuthenticated, getDocuments);

router.get('/users', isAuthenticated, authorizeRoles('admin', 'hr'), async (req, res) => {
  try {
    const users = await User.find({}, '_id name').lean();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(
  '/documents',
  isAuthenticated,
  authorizeRoles('hr', 'admin'),
  uploadDocument
);

router.delete('/documents/:docId', isAuthenticated, deleteDocument);
router.delete('/employee/:employeeId/documents/:docId', isAuthenticated, deleteDocument);

router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Invalid token');

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).send('Token expired or invalid');

  user.emailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  res.send('Email verified successfully! You can now log in.');
});

module.exports = router