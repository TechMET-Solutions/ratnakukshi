
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, RefreshCcw } from "lucide-react";
import { API } from "../api/BaseURL";

const MedicalIssueType = () => {

  const [issueType, setIssueType] = useState("");

  const [issueTypes, setIssueTypes] = useState([]);

  const [loading, setLoading] = useState(false);

 
  const BASE_URL =
    `${API}/api/medicalissuetype`;

  // ===============================================
  // GET ALL ISSUE TYPES
  // ===============================================
  const getIssueTypes = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/all`
      );

      if (response.data.success) {
        setIssueTypes(response.data.data);
      }
    } catch (error) {
      console.log(error);

      alert("Failed to fetch issue types");
    } finally {
      setLoading(false);
    }
  };

  // ===============================================
  // ADD ISSUE TYPE
  // ===============================================
  const handleAddIssueType = async () => {
    try {
      // VALIDATION
      if (!issueType.trim()) {
        alert("Please enter medical issue type");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/add`,
        {
          issue_type: issueType,
        }
      );

      if (response.data.success) {
        alert(response.data.message);

        setIssueType("");

        getIssueTypes();
      }
    } catch (error) {
      console.log(error);

      alert(
        error?.response?.data?.message ||
          "Failed to add issue type"
      );
    }
  };

  // ===============================================
  // DELETE ISSUE TYPE
  // ===============================================
  const handleDelete = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete?"
      );

      if (!confirmDelete) return;

      const response = await axios.delete(
        `${BASE_URL}/delete/${id}`
      );

      if (response.data.success) {
        alert(response.data.message);

        getIssueTypes();
      }
    } catch (error) {
      console.log(error);

      alert("Failed to delete issue type");
    }
  };

  // ===============================================
  // USE EFFECT
  // ===============================================
  useEffect(() => {
    getIssueTypes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ========================================= */}
      {/* PAGE CONTAINER */}
      {/* ========================================= */}
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Medical Issue Type Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Add and manage medical issue types
            </p>
          </div>

          <button
            onClick={getIssueTypes}
            className="flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        {/* ========================================= */}
        {/* ADD FORM */}
        {/* ========================================= */}
        <div className="mb-8 rounded-xl border bg-gray-50 p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">
            Add Medical Issue Type
          </h2>

          <div className="flex flex-col gap-4 md:flex-row">
            {/* INPUT */}
            <input
              type="text"
              placeholder="Enter medical issue type"
              value={issueType}
              onChange={(e) =>
                setIssueType(e.target.value)
              }
              className="flex-1 rounded-lg border bg-white p-3 outline-none focus:border-blue-500"
            />

            {/* BUTTON */}
            <button
              onClick={handleAddIssueType}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Add Type
            </button>
          </div>
        </div>

        {/* ========================================= */}
        {/* TABLE */}
        {/* ========================================= */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full">
            {/* TABLE HEADER */}
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-gray-600">
                  #
                </th>

                <th className="px-6 py-4 text-left text-sm font-bold uppercase text-gray-600">
                  Medical Issue Type
                </th>

                <th className="px-6 py-4 text-center text-sm font-bold uppercase text-gray-600">
                  Created Date
                </th>

                <th className="px-6 py-4 text-center text-sm font-bold uppercase text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : issueTypes.length > 0 ? (
                issueTypes.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {item.issue_type}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-10 text-center text-gray-500"
                  >
                    No Medical Issue Types Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="mt-5 text-right text-sm font-medium text-gray-600">
          Total Types :{" "}
          <span className="font-bold">
            {issueTypes.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MedicalIssueType;