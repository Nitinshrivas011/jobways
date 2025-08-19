import React, { useEffect, useState } from 'react';
import axios from 'axios';

const allowedFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

axios.defaults.baseURL = 'http://localhost:3000/api/v1';

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [resume, setResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('resume');
  const [viewUrl, setViewUrl] = useState(null);
  const [userList, setUserList] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  // Retrieve token and role from local storage
  const token = localStorage.getItem('userToken');
  const userRole = localStorage.getItem('role') || ''; // 'admin', 'hr', 'employee', 'candidate'

  useEffect(() => {
    if (token) {
      fetchDocuments();
      if (['admin', 'hr'].includes(userRole)) {
        fetchAllUsers(); // Fetch employees for HR/Admin
      }
    }
  }, [token]);

  const fetchAllUsers = async () => {
    try {
      const { data } = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserList(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const getUploaderInfo = (doc) => {
    if (!doc.uploadedBy) return null;
    if (typeof doc.uploadedBy === 'string') return doc.uploadedBy;
    if (doc.uploadedBy.name) return doc.uploadedBy.name;
    if (doc.uploadedBy.email) return doc.uploadedBy.email;
    return null;
  };

  const fetchDocuments = async () => {
    try {
      const { data } = await axios.get('/documents', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocuments(data.documents || []);
      setResume(data.resume || null);
    } catch (error) {
      console.error('Error fetching documents', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !allowedFileTypes.includes(file.type)) {
      alert('File type not allowed');
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const uploadDocument = async () => {
    if (!selectedFile) return alert('Choose a file first');

    if (
      !(
        userRole === 'admin' ||
        userRole === 'hr' ||
        (userRole === 'candidate' && category === 'resume')
      )
    ) {
      alert('You are not allowed to upload this document');
      return;
    }

    if (['admin', 'hr'].includes(userRole) && !selectedEmployeeId) {
      alert('Please select an employee to upload document for');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('category', category);
    if (['admin', 'hr'].includes(userRole)) {
      formData.append('employeeId', selectedEmployeeId);
    }

    try {
      await axios.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Uploaded successfully');
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed');
    }
  };

  const viewDocument = (url) => {
    setViewUrl(url);
  };

  // Updated deleteDocument to accept docId and employeeId
  const deleteDocument = async (docId, employeeId) => {
    try {
      const url = employeeId
        ? `/employee/${employeeId}/documents/${docId}`
        : `/documents/${docId}`;

      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Delete failed', error);
      alert('Delete failed');
    }
  };

  const canUpload = ['admin', 'hr', 'candidate'].includes(userRole);

  const uploadCategories =
    userRole === 'candidate'
      ? [{ value: 'resume', label: 'Resume' }]
      : [
          { value: 'resume', label: 'Resume' },
          { value: 'contract', label: 'Contract' },
          { value: 'offer', label: 'Offer Letter' },
        ];

  const canDelete = ['admin', 'hr'].includes(userRole);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        My Documents
      </h2>

      {/* Resume Section */}
      {resume && (
        <div className="mb-6">
          <strong className="text-lg mr-2">Resume:</strong>{' '}
          {resume.url ? (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
              onClick={() => viewDocument(resume.url)}
            >
              View Resume
            </button>
          ) : (
            <span className="text-gray-500">No resume uploaded</span>
          )}
        </div>
      )}

      {/* Upload Section */}
      {canUpload && (
        <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
          {/* Employee selector for admin/hr */}
          {['admin', 'hr'].includes(userRole) && (
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              <option value="" disabled>
                Select Employee
              </option>
              {userList.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            disabled={userRole === 'candidate'}
          >
            {uploadCategories.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="file"
            onChange={handleFileChange}
            className="file-input file-input-bordered file-input-sm w-full max-w-xs dark:bg-gray-800 dark:text-gray-100"
          />

          <button
            onClick={uploadDocument}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            Upload Document
          </button>
        </div>
      )}

      {/* Document List */}
      <ul className="space-y-4">
        {documents.length === 0 ? (
          <li className="text-gray-500 italic">No documents uploaded yet.</li>
        ) : (
          documents.map((doc) => (
            <li
              key={doc._id}
              className="flex flex-col md:flex-row md:justify-between md:items-center bg-gray-100 dark:bg-gray-900 p-4 rounded shadow"
            >
              <div className="text-gray-800 dark:text-gray-200">
                <span className="font-medium">{doc.fileName}</span> ({doc.category}) -{' '}
                {new Date(doc.uploadedAt).toLocaleDateString()}
                {['admin', 'hr'].includes(userRole) && doc.uploadedBy && (
                  <span className="ml-2 text-sm text-gray-500">
                    (by {getUploaderInfo(doc)})
                  </span>
                )}
              </div>
              <div className="mt-2 md:mt-0 flex gap-3">
                <button
                  onClick={() =>
                    // Pass employeeId if uploadedBy is user object with _id
                    deleteDocument(
                      doc._id,
                      doc.uploadedBy && typeof doc.uploadedBy === 'object' ? doc.uploadedBy._id : null
                    )
                  }
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow"
                >
                  Delete
                </button>
                <button
                  onClick={() => viewDocument(doc.url)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
                >
                  View
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Modal for preview */}
      {viewUrl && (
        <div
          onClick={() => setViewUrl(null)}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 cursor-pointer"
        >
          {viewUrl.endsWith('.pdf') || viewUrl.includes('pdf') ? (
            <iframe
              src={viewUrl}
              width="80%"
              height="80%"
              title="Document Preview"
              className="pointer-events-auto"
            />
          ) : (
            <img
              src={viewUrl}
              alt="Document Preview"
              className="max-h-[80vh] max-w-[80vw]"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentList;
