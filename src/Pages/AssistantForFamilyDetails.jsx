import React from "react";

import {
  useLocation,
} from "react-router-dom";

import Family_Details_Staff
  from "./Family_Details_Staff";

const AssistantForFamilyDetails = () => {

  const location =
    useLocation();

  // =====================================
  // GET NAVIGATION DATA
  // =====================================

  const selectedMember =
    location?.state?.selectedMember;

  const isEditMode =
    location?.state?.isEditMode;

  console.log(
    "selectedMember",
    selectedMember
  );

  return (

    <div>

      {selectedMember && (

        <Family_Details_Staff

          diksarthiid={
            selectedMember?.diksharthi_id
          }

          newdiksarthi={
            selectedMember?.diksharthi_id
          }

          savedMainDiksarthi={
            selectedMember
          }

          isEdit={
            isEditMode
          }

          memberData={
            selectedMember
          }

          mode={
            isEditMode
              ? "edit"
              : "view"
          }
          
          isEdit={"edit"}

        />

      )}

    </div>

  );

};

export default
AssistantForFamilyDetails;