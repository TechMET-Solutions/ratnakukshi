// export const formatIndianDate = (dateString) => {
//     if (!dateString) return "";

//     const date = new Date(dateString);

//     // Options for Indian locale formatting
//     const options = {
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         timeZone: "Asia/Kolkata", // India Standard Time
//     };

//     return new Intl.DateTimeFormat("en-IN", options).format(date);
// };

export const formatIndianDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};