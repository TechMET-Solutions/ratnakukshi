import { useState } from "react";

const AssistanceCheckboxes = ({
    assistanceTypes,
    relationDetails,
    rel,
    selectedRelation,
    selectedAssistance,
    handleAssistanceCategory
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [deselectInfo, setDeselectInfo] = useState({}); // { relation, type, reason }

    const handleCheckboxClick = (relation, type, isChecked) => {
        const selectedCategories = (relationDetails[relation]?.assistanceCategories || []).map(item =>
            item.toLowerCase()
        );

        const defaultAssist = (selectedAssistance || []).map(item => item.toLowerCase());
        const isSameRelation = relation?.toLowerCase() === selectedRelation?.toLowerCase();

        const isDefaultChecked = selectedCategories.includes(type.toLowerCase()) ||
            (isSameRelation && defaultAssist.includes(type.toLowerCase()));

        if (isDefaultChecked && isChecked) {
            // Trying to uncheck a default assistance
            setDeselectInfo({ relation, type, reason: "" });
            setModalOpen(true);
        } else {
            handleAssistanceCategory(relation, type);
        }
    };

    const handleReasonSubmit = () => {
        console.log("Deselected Reason:", deselectInfo);
        // Here you can send this to your backend if needed
        handleAssistanceCategory(deselectInfo.relation, deselectInfo.type); // now actually deselect
        setModalOpen(false);
    };

    return (
        <>
            <div className="flex flex-wrap gap-4">
                {assistanceTypes.map((type) => {
                    const selectedCategories = (relationDetails[rel]?.assistanceCategories || []).map(item =>
                        item.toLowerCase()
                    );
                    const defaultAssist = (selectedAssistance || []).map(item => item.toLowerCase());
                    const isSameRelation = rel?.toLowerCase() === selectedRelation?.toLowerCase();

                    const isChecked =
                        selectedCategories.includes(type.toLowerCase()) ||
                        (isSameRelation && defaultAssist.includes(type.toLowerCase()));

                    return (
                        <label key={type} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCheckboxClick(rel, type, e.target.checked)}
                                className="w-4 h-4 border-slate-400 rounded"
                            />
                            <span>{type}</span>
                        </label>
                    );
                })}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h2 className="text-lg font-semibold mb-4">Reason for Deselecting</h2>
                        <p className="mb-2">
                            Relation: <strong>{deselectInfo.relation}</strong>
                        </p>
                        <p className="mb-4">
                            Assistance: <strong>{deselectInfo.type}</strong>
                        </p>
                        <textarea
                            placeholder="Enter reason"
                            value={deselectInfo.reason}
                            onChange={(e) =>
                                setDeselectInfo({ ...deselectInfo, reason: e.target.value })
                            }
                            className="w-full p-2 border rounded mb-4"
                        ></textarea>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReasonSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                disabled={!deselectInfo.reason.trim()}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssistanceCheckboxes;