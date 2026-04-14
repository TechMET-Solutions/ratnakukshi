import React, { useState } from "react";

function FamilyBasicInfo() {
  const [step, setStep] = useState(1);

  const steps = [
    "M.S Details",
    "Family Details",
    "Address & House Details",
    "Mediclaim & NGO Details",
    "Summary",
  ];

  const nextStep = () => {
    if (step < steps.length) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white shadow rounded-xl p-6">

        {/* 🔵 Stepper Header */}
        <div className="flex justify-between mb-8">
          {steps.map((label, index) => (
            <div key={index} className="flex-1 text-center relative">
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold 
                ${step >= index + 1 ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-600"}`}
              >
                {index + 1}
              </div>
              <p className="text-xs mt-2">{label}</p>

              {/* line */}
              {index < steps.length - 1 && (
                <div className="absolute top-4 left-full w-full h-[2px] bg-gray-300 -z-10"></div>
              )}
            </div>
          ))}
        </div>

        {/* 🟢 Step Content */}
        <div className="min-h-[200px]">

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">M.S Details</h2>
              <input placeholder="Enter Name" className="border p-2 w-full rounded mb-3" />
              <input placeholder="Enter Age" className="border p-2 w-full rounded" />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Family Details</h2>
              <input placeholder="Father Name" className="border p-2 w-full rounded mb-3" />
              <input placeholder="Mother Name" className="border p-2 w-full rounded" />
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Address & House Details</h2>
              <input placeholder="Address" className="border p-2 w-full rounded mb-3" />
              <input placeholder="House Type" className="border p-2 w-full rounded" />
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Mediclaim & NGO Details</h2>
              <input placeholder="Mediclaim Amount" className="border p-2 w-full rounded mb-3" />
              <input placeholder="NGO Name" className="border p-2 w-full rounded" />
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <textarea placeholder="Enter summary..." className="border p-2 w-full rounded"></textarea>
            </div>
          )}

        </div>

        {/* 🔘 Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={step === steps.length}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            {step === steps.length ? "Finish" : "Next"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default FamilyBasicInfo;