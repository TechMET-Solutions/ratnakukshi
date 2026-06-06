import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API } from "../api/BaseURL";

const DiksarthiAllDoc = () => {
  const location = useLocation();
  const diksharthiId = location.state?.diksharthiId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API}/api/diksharthi/${diksharthiId}/assistance-documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diksharthiId) {
      fetchDocuments();
    }
  }, [diksharthiId]);

  if (loading) {
    return (
      <div className="p-5 text-center font-semibold">
        Loading Documents...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">
        Diksharthi Documents
      </h1>

      {/* --------------------- */}
      {/* Basic Information */}
      {/* --------------------- */}

      {data?.diksharthi && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={data.diksharthi.photo}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover border"
            />

            <div>
              <h2 className="text-lg font-semibold">
                {data.diksharthi.name}
              </h2>

              <p className="text-gray-500">
                ID : {data.diksharthi.id}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --------------------- */}
      {/* Diksharthi Documents */}
      {/* --------------------- */}

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-xl font-semibold mb-4">
           Summary Documents
        </h2>

        {data?.diksharthi?.documents?.length > 0 ? (
          data.diksharthi.documents.map((doc, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 mb-4"
            >
              <h3 className="font-semibold text-blue-600">
                {doc.title}
              </h3>

              {doc.files?.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  className="flex justify-between items-center mt-3 bg-gray-100 p-3 rounded"
                >
                  <div>
                    <p className="font-medium">
                      {file.original_name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {file.file_type}
                    </p>
                  </div>

                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>No documents found.</p>
        )}
      </div>
{/* --------------------- */}
{/* Karyakarta Documents */}
{/* --------------------- */}

<div className="bg-white rounded-xl shadow p-5 mb-6">
  <h2 className="text-xl font-semibold mb-4">
    Karyakarta Documents
  </h2>

  {data?.diksharthi?.karyakarta_documents?.length > 0 ? (
    data.diksharthi.karyakarta_documents.map((file, index) => {
      const fileName = file.file_path?.split("/").pop();

      return (
        <div
          key={index}
          className="flex justify-between items-center bg-gray-100 p-3 rounded mb-3"
        >
          <div>
            <p className="font-medium">{fileName}</p>
          </div>

          <a
            href={file.file_url}
            target="_blank"
            rel="noreferrer"
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            View
          </a>
        </div>
      );
    })
  ) : (
    <p>No karyakarta documents found.</p>
  )}
</div>
      {/* --------------------- */}
      {/* Assistance Documents */}
      {/* --------------------- */}

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-xl font-semibold mb-4">
          Assistance Documents
        </h2>

        {data?.assistance?.length > 0 ? (
          data.assistance.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 mb-5"
            >
              <div className="flex justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {item.assistance_type}
                  </h3>

                  <p className="text-sm text-gray-500">
                    Relation : {item.relation_key}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                  {item.status}
                </span>
              </div>

              {item.documents?.length > 0 ? (
                item.documents.map((doc, docIndex) => (
                  <div
                    key={docIndex}
                    className="bg-gray-100 rounded p-3 mb-3"
                  >
                    <h4 className="font-medium mb-2">
                      {doc.documentName}
                    </h4>

                    {doc.uploadedFiles?.map((file, fileIndex) => (
                      <div
                        key={fileIndex}
                        className="flex justify-between items-center bg-white rounded p-3 mb-2"
                      >
                        <span>{file.fileName}</span>

                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No documents uploaded.
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No assistance documents found.</p>
        )}
      </div>
    </div>
  );
};

export default DiksarthiAllDoc;