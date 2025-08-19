const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const mime = require('mime-types');
const User = require('../models/UserModel');

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
];

exports.uploadDocument = async (req, res) => {
  try {
    const { category, employeeId } = req.body; // employeeId optional: target user for admin/hr

    if (!req.files || !req.files.document) {
      return res.status(400).json({ message: "No document uploaded" });
    }

    const docFile = req.files.document;

    if (!allowedTypes.includes(docFile.mimetype)) {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    const ext = mime.extension(docFile.mimetype);
    if (!['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'].includes(ext)) {
      return res.status(400).json({ message: "File extension not allowed" });
    }

    if (docFile.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "File size exceeds 5MB limit" });
    }

    // RBAC upload check
    // Candidates can only upload 'resume' to self
    if (
      !(req.user.role === 'admin' ||
        req.user.role === 'hr' ||
        (req.user.role === 'candidate' && category === 'resume'))
    ) {
      return res.status(403).json({ message: 'You are not allowed to upload this document' });
    }

    // Determine to which user this document belongs: 
    // Admin/HR can specify employeeId, else defaults to self
    let targetUserId;
    if ((req.user.role === 'admin' || req.user.role === 'hr') && employeeId) {
      targetUserId = employeeId;
    } else {
      targetUserId = req.user._id;
    }

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "documents",
        resource_type: docFile.mimetype.startsWith("image/") ? "image" : "raw"
      },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "Cloudinary upload failed" });
        }

        // Save document metadata in the target user's documents
        user.documents.push({
          fileName: docFile.name,
          fileType: docFile.mimetype,
          category,
          public_id: result.public_id,
          url: result.secure_url,
          uploadedBy: req.user._id, // uploader user ID
          uploadedAt: new Date(),
        });

        await user.save();

        res.status(200).json({ message: "Document uploaded successfully", url: result.secure_url });
      }
    );

    streamifier.createReadStream(docFile.data).pipe(uploadStream);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during upload" });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      // Admin or HR gets all users’ documents with uploader info
      const users = await User.find({}, 'documents name email').lean();

      const allDocuments = [];
      users.forEach(user => {
        user.documents.forEach(doc => {
          allDocuments.push({
            ...doc,
            uploadedBy: {
              name: user.name,
              email: user.email,
            },
          });
        });
      });

      return res.json({ success: true, documents: allDocuments });
    }

    // Employee or candidate gets only their own documents + resume
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ success: true, documents: user.documents, resume: user.resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error retrieving documents" });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { docId, employeeId } = req.params;

    let user;

    // Admin/HR can delete documents of any employee if employeeId provided otherwise delete own
    if (employeeId) {
      if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden to delete others’ documents" });
      }
      user = await User.findById(employeeId);
      if (!user) return res.status(404).json({ message: "Employee not found" });
    } else {
      // Delete own document
      user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ message: "User not found" });
    }

    console.log(`User ${user._id} has documents:`, user.documents.map(d => d._id.toString()));
    console.log('Looking for document with ID:', docId);
    console.log('Deleting Document:', { docId, employeeId });


    const doc = user.documents.id(docId);

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete file from Cloudinary, catch errors separately
    try {
      await cloudinary.uploader.destroy(doc.public_id, { resource_type: 'raw' });
      console.log(`Deleted file in Cloudinary: ${doc.public_id}`);
    } catch (cloudErr) {
      console.error('Cloudinary delete error:', cloudErr);
      return res.status(500).json({ message: "Failed to delete document file from cloud storage" });
    }

    // Remove document from user's documents array
    doc.remove();
    await user.save();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error('Server error while deleting document:', error);
    res.status(500).json({ message: "Server error while deleting document" });
  }
};
