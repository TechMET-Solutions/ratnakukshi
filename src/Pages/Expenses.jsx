import { useEffect, useState } from "react";

const Expenses = () => {
  const [showModal, setShowModal] = useState(false);
const [selectedBankData, setSelectedBankData] = useState(null);
  const [expenseData, setExpenseData] = useState({
    expenseName: "",
    amount: "",
    Payee_Name: "",
    bank: "",
     bank_id: "",
  });

  const [expenses, setExpenses] = useState([]);

  // BANK STATES
  const [bankOptions, setBankOptions] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
console.log(bankOptions,"bankOptions")
  // ==========================================
  // PAGE LOAD
  // ==========================================
  useEffect(() => {
    getBanks();
    getExpenses();
  }, []);

  // ==========================================
  // GET BANK LIST
  // ==========================================
  const getBanks = async () => {
    try {
      setLoadingBanks(true);

      const response = await fetch("https://uat.ratnakukshi.org/api/demat/debit");

      const data = await response.json();

       if (data.success) {

      setBankOptions(data.data || []);

    }

    } catch (error) {
      console.log("Bank Fetch Error", error);
    } finally {
      setLoadingBanks(false);
    }
  };

  // ==========================================
  // GET EXPENSES
  // ==========================================
  const getExpenses = async () => {
    try {
      const response = await fetch(
        "https://uat.ratnakukshi.org/api/Expenses/get-expenses",
      );

      const data = await response.json();

      console.log("Expenses", data);

      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.log("Get Expense Error", error);
    }
  };

  // ==========================================
  // HANDLE INPUT
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setExpenseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD EXPENSE
  // ==========================================
const handleAddExpense = async () => {
  try {
    // =========================================
    // BASIC VALIDATION
    // =========================================

    if (
      !expenseData.expenseName ||
      !expenseData.amount ||
      !expenseData.Payee_Name ||
      !expenseData.bank_id
    ) {
      alert("Please fill all fields");
      return;
    }

    // =========================================
    // CHECK SELECTED BANK
    // =========================================

    if (!selectedBankData) {
      alert("Please select bank");
      return;
    }

    // =========================================
    // BALANCE VALIDATION
    // =========================================

    const expenseAmount = Number(expenseData.amount);
    const currentBalance = Number(selectedBankData.balance);

    // INVALID AMOUNT
    if (expenseAmount <= 0) {
      alert("Please enter valid amount");
      return;
    }

    // INSUFFICIENT BALANCE
    if (expenseAmount > currentBalance) {
      alert(
        `Insufficient Balance!\n\nCurrent Balance: ₹${currentBalance}\nExpense Amount: ₹${expenseAmount}`
      );
      return;
    }

    // =========================================
    // PAYLOAD
    // =========================================

    const payload = {
  expense_name: expenseData.expenseName,
  amount: expenseAmount,
  payee_name: expenseData.Payee_Name,

  bank_name: selectedBankData.bank_name,
  bank_id: selectedBankData.id,

  account_no: selectedBankData.account_no,
  branch_name: selectedBankData.branch_name,
  ifsc_code: selectedBankData.ifsc_code,
  account_holder_name:
    selectedBankData.account_holder_name,
};

    console.log("Payload =>", payload);

    // =========================================
    // API CALL
    // =========================================

    const response = await fetch(
      "https://uat.ratnakukshi.org/api/Expenses/add-expense",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("Add Expense Response =>", data);

    // =========================================
    // SUCCESS
    // =========================================

   if (data.success) {
  // SUCCESS MESSAGE
  alert("Expense Added Successfully");

  // CLOSE MODAL FIRST
  setShowModal(false);

  // RESET FORM
  setExpenseData({
    expenseName: "",
    amount: "",
    Payee_Name: "",
    bank: "",
    bank_id: "",
  });

  // RESET BANK
  setSelectedBankData(null);

  // REFRESH DATA
  await getExpenses();
  // await getAllBanks();
} else {
  alert(data.message || "Failed to add expense");
}
  } catch (error) {
    console.log("Add Expense Error =>", error);

    // alert("Something went wrong");
  }
};

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Expense Management</h1>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-black px-5 py-2 text-white transition hover:bg-gray-800"
        >
          + Add Expense
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-md">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Sr No
              </th>
               <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
               Payee Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
               Description
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Bank
              </th>
            </tr>
          </thead>

          <tbody>
            {expenses.length > 0 ? (
              expenses.map((item, index) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{index + 1}</td>

                  <td className="px-6 py-4">{item.payee_name}</td>

                  <td className="px-6 py-4">{item.expense_name}</td>

                  <td className="px-6 py-4">₹ {item.amount}</td>

                 <td className="px-6 py-4">
  <div className="space-y-1">
    <p className="font-semibold text-gray-800">
      {item.bank_name}
    </p>

    <p className="text-sm text-gray-500">
      Acc No: {item.account_no || "-"}
    </p>

    <p className="text-sm text-gray-500">
      IFSC: {item.ifsc_code || "-"}
    </p>
  </div>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-500">
                  No Expenses Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl  overflow-auto ">
            {/* TITLE */}
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Expense</h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-xl text-gray-500 hover:text-black"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-2">
              {/* EXPENSE NAME */}
             <div>
  <label className=" block text-sm font-medium text-gray-700">
    Payee Name
  </label>

  <input
    type="text"
    name="Payee_Name"
    value={expenseData.Payee_Name}
    onChange={handleChange}
    placeholder="Enter Payee Name"
    className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
  />
              </div>

              {/* AMOUNT */}
              <div>
                <label className=" block text-sm font-medium text-gray-700">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={expenseData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                />
              </div>

               <div>
                <label className=" block text-sm font-medium text-gray-700">
                   Description
                </label>

                <input
                  type="text"
                  name="expenseName"
                  value={expenseData.expenseName}
                  onChange={handleChange}
                  placeholder="Enter expense name"
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
                />
              </div>
              {/* BANK DROPDOWN */}
              <div>
                <label className=" block text-sm font-medium text-gray-700">
                  Select Bank
                </label>

               <select
  name="bank"
  value={expenseData.bank_id}
  onChange={(e) => {
    const selectedBank = bankOptions.find(
      (bank) => bank.id == e.target.value
    );

    setExpenseData({
      ...expenseData,
      bank_id: selectedBank.id,
      bank: selectedBank.bank_name,
    });
    setSelectedBankData(selectedBank || null);
  }}
  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-black"
>
  <option value="">
    {loadingBanks ? "Loading Banks..." : "Select Bank"}
  </option>

  {bankOptions?.map((bank) => (
    <option key={bank.id} value={bank.id}>
       {bank.bank_name} {bank.account_no} {bank.branch_name}
    </option>
  ))}
</select>
              </div>

            
{selectedBankData && (
  <div className="rounded-xl border border-gray-200 bg-gray-100 p-4">

    <h3 className="mb-2 text-lg font-semibold text-blue-600">
      Selected Bank Details
    </h3>

    <div className="space-y-2 text-sm">

      <div className="flex justify-between gap-3">
        <span className="font-medium text-gray-600">
          Bank Name
        </span>

        <span className="text-right font-semibold">
          {selectedBankData.bank_name}
        </span>
      </div>

      <div className="flex justify-between gap-3">
        <span className="font-medium text-gray-600">
          Account Holder
        </span>

        <span className="text-right font-semibold">
          {selectedBankData.account_holder_name}
        </span>
      </div>

      <div className="flex justify-between gap-3">
        <span className="font-medium text-gray-600">
          Account Number
        </span>

        <span className="text-right font-semibold">
          {selectedBankData.account_no}
        </span>
      </div>

      <div className="flex justify-between gap-3">
        <span className="font-medium text-gray-600">
          Branch Name
        </span>

        <span className="text-right font-semibold">
          {selectedBankData.branch_name}
        </span>
      </div>

      <div className="flex justify-between gap-3">
        <span className="font-medium text-gray-600">
          IFSC Code
        </span>

        <span className="text-right font-semibold">
          {selectedBankData.ifsc_code}
        </span>
      </div>

  

      <div className="flex justify-between gap-3  pt-2">
        <span className="font-medium text-gray-600">
          Current Balance
        </span>

        <span
          className={`text-right text-lg font-bold ${
            Number(selectedBankData.balance) < 0
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          ₹{selectedBankData.balance}
        </span>
      </div>

      {expenseData.amount && (
  <>
    {/* BALANCE AFTER TRANSACTION */}
    <div className="flex justify-between gap-3 border-t pt-3">
      <span className="font-medium text-gray-700">
        Balance After Transaction
      </span>

      <span
        className={`text-right text-lg font-bold ${
          Number(selectedBankData.balance) -
            Number(expenseData.amount) <
          0
            ? "text-red-600"
            : "text-orange-600"
        }`}
      >
        ₹
        {Math.max(
          Number(selectedBankData.balance) -
            Number(expenseData.amount),
          0
        ).toFixed(2)}
      </span>
    </div>

    {/* INSUFFICIENT BALANCE MESSAGE */}
    {Number(selectedBankData.balance) -
      Number(expenseData.amount) <
      0 && (
      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
        Insufficient Balance! Expense amount is greater than current bank balance.
      </div>
    )}
  </>
)}

    </div>

  </div>
)}

              {/* BUTTON */}
              <button
                onClick={handleAddExpense}
                className="mt-1 w-full rounded-lg bg-black py-3 text-white transition hover:bg-gray-800"
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
