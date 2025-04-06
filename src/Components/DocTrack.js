import React, { useState, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";

const DocTrack = () => {
  const [searchCode, setSearchCode] = useState("");
  const [documentDetails, setDocumentDetails] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setError("Please enter a document code.");
      return;
    }

    setLoading(true);
    setError(null);
    setDocumentDetails(null);
    setHistory(null);
    setShowHistory(false);

    try {
      const response = await fetch(
        `http://localhost:5208/api/RcodeFiles/${searchCode}`
      );

      if (!response.ok) {
        throw new Error("Document not found or an error occurred.");
      }

      const data = await response.json();
      setDocumentDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistory = async () => {
    if (!documentDetails) {
      setError("Please search for a document first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5208/api/RcodeFiles/${searchCode}/history`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch document history.");
      }

      const historyData = await response.json();

      if (!Array.isArray(historyData)) {
        throw new Error("Invalid history data format.");
      }

      setHistory(historyData);
      setShowHistory(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setShowHistory(false);
    setHistory(null);
  };

  const handleSearchHistory = (e) => {
    setSearchHistory(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredHistory = history
    ? history.filter(
        (entry) =>
          entry.newEpfNo.toLowerCase().includes(searchHistory.toLowerCase()) ||
          entry.newEName.toLowerCase().includes(searchHistory.toLowerCase())
      )
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-start w-full h-screen bg-center bg-cover"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50 pointer-events-none"></div>

      {!showHistory ? (
        <div className="relative flex flex-col items-center w-full h-full justify-center">
          {/* Heading */}
          <p className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center text-white mt-24 mb-4">
            Track your document here!
          </p>

          {/* Arrow */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12 text-[#00a2cd] animate-bounce mb-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3"
            />
          </svg>

          {/* Search Bar */}
          <div className="relative flex items-center w-4/5 sm:w-2/3 md:w-1/3 mt-2">
            <input
              className="w-full p-3 pr-10 text-center border rounded-full text-secondaryText border-borderColor bg-white focus:ring-2 focus:ring-[#00a2cd] transition duration-200 truncate placeholder:text-sm placeholder:font-bold"
              placeholder="Enter Document Code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00a2cd] hover:text-[#0080a0]"
              onClick={handleSearch}
            >
              <AiOutlineSearch className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          {loading && <p className="text-white mt-4">Loading...</p>}
          {error && <p className="text-center text-red-500 mt-4">{error}</p>}

          {/* Document Result */}
          {documentDetails && (
            <div
              className={`mt-6 p-4 text-white rounded-lg text-center shadow-lg w-4/5 sm:w-2/3 lg:w-1/2 ${
                documentDetails.eName === "Library"
                  ? "bg-[#296c74] bg-opacity-70"
                  : "bg-red-800 bg-opacity-70"
              }`}
            >
              <p className="text-sm sm:text-lg mb-4">
                <strong>{documentDetails.rcode} → </strong>
                <strong> {documentDetails.epfNo}</strong> -{" "}
                <strong>{documentDetails.eName}</strong> -{" "}
                <strong>{documentDetails.status}</strong> -{" "}
                <strong>
                  {new Date(documentDetails.getDate).toLocaleDateString()}
                </strong>{" "}
                -{" "}
                <strong>
                  {new Date(documentDetails.getDate).toLocaleTimeString()}
                </strong>
              </p>

              {/* File History Button */}
              <button
                onClick={handleHistory}
                className="px-6 py-2 mt-2 border rounded-full bg-[#00a2cd] text-white border-borderColor hover:opacity-90"
              >
                <strong>View File History</strong>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-center h-full px-4 py-6">
          {/* File History Title */}
          <div className="text-white bg-[#0b4b61] opacity-90 text-xl font-bold py-3 px-6 text-center rounded-lg shadow-lg w-full max-w-2xl">
            File History - {documentDetails?.rcode}
          </div>

          {/* Search Bar for History */}
          <div className="mt-4 mb-4 w-full max-w-2xl">
            <input
              className="w-full p-3 pr-10 text-center border rounded-full text-secondaryText border-borderColor bg-white opacity-90 focus:ring-2 focus:ring-[#00a2cd] transition duration-200 truncate placeholder:text-sm placeholder:font-bold"
              placeholder="Search History"
              value={searchHistory}
              onChange={handleSearchHistory}
            />
          </div>

          {/* History Rows */}
          <div className="shadow-lg mt-4 p-2 w-full max-w-2xl overflow-y-auto max-h-64 space-y-2">
            {currentItems.map((entry, index) => (
              <div
                key={index}
                className={`py-2 px-4 rounded-md text-center text-base sm:text-lg font-semibold bg-[#0b4b61] opacity-80 text-white`}
              >
                {entry.newEpfNo} - {entry.newEName} -{" "}
                {new Date(entry.transferDate).toLocaleDateString()} -{" "}
                {new Date(entry.transferDate).toLocaleTimeString()}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex space-x-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className="px-4 py-2 bg-[#00a2cd] opacity-80 text-white rounded-full"
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Back Button */}
          <button
            onClick={handleBackToSearch}
            className="px-6 py-2 mt-6 border rounded-full bg-[#00a2cd] text-white hover:opacity-90"
          >
            <strong>Back to Search</strong>
          </button>
        </div>
      )}
    </div>
  );
};

export default DocTrack;

// import React, { useState } from "react";
// import { AiOutlineSearch } from "react-icons/ai";

// const DocTrack = () => {
//   const [searchCode, setSearchCode] = useState("");
//   const [documentDetails, setDocumentDetails] = useState(null);
//   const [history, setHistory] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showHistory, setShowHistory] = useState(false);

//   const handleSearch = async () => {
//     if (!searchCode.trim()) {
//       setError("Please enter a document code.");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setDocumentDetails(null);
//     setHistory(null);
//     setShowHistory(false);

//     try {
//       const response = await fetch(
//         `http://localhost:5208/api/RcodeFiles/${searchCode}`
//       );

//       if (!response.ok) {
//         throw new Error("Document not found or an error occurred.");
//       }

//       const data = await response.json();
//       setDocumentDetails(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleHistory = async () => {
//     if (!documentDetails) {
//       setError("Please search for a document first.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(
//         `http://localhost:5208/api/RcodeFiles/${searchCode}/history`
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch document history.");
//       }

//       const historyData = await response.json();

//       // Sort by transfer date descending
//       historyData.sort(
//         (a, b) => new Date(b.transferDate) - new Date(a.transferDate)
//       );

//       setHistory(historyData);
//       setShowHistory(true);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="relative flex flex-col items-center justify-end w-full h-screen space-y-6 bg-center bg-cover"
//       style={{ backgroundImage: "url('/bg.jpg')" }}
//     >
//       <div className="absolute inset-0 bg-black opacity-50 pointer-events-none"></div>

//       {!showHistory ? (
//         <div className="relative flex flex-col items-center w-full h-1/2">
//           <p className="text-3xl font-bold text-center text-white sm:text-5xl lg:text-6xl">
//             Track your document here!
//           </p>

//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={1.5}
//             stroke="currentColor"
//             className="w-1/2 sm:w-1/3 lg:w-1/4 h-auto max-w-xs text-[#00a2cd] animate-bounce"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3"
//             />
//           </svg>

//           <div className="relative flex items-center w-2/3 mt-8 sm:w-1/3 m-10">
//             <input
//               className="w-full min-w-[150px] p-3 pr-10 text-center border rounded-full text-secondaryText border-borderColor bg-primaryBg focus:ring-2 focus:ring-[#00a2cd] transition duration-200 truncate overflow-hidden placeholder:text-sm sm:placeholder:text-xs"
//               placeholder="Enter Document Code"
//               value={searchCode}
//               onChange={(e) => setSearchCode(e.target.value)}
//             />
//             <button
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#00a2cd] hover:text-[#0080a0]"
//               onClick={handleSearch}
//             >
//               <AiOutlineSearch className="w-6 h-6" />
//             </button>
//           </div>

//           {loading && <p className="text-center mt-4">Loading...</p>}
//           {error && <p className="text-center text-red-500 mt-4">{error}</p>}

//           {documentDetails && (
//             <div
//               className={`mt-4 p-4 text-white rounded-lg text-center shadow-lg ${
//                 documentDetails.eName === "Library"
//                   ? "bg-green-500"
//                   : "bg-red-700 opacity-90"
//               }`}
//             >
//               <p className="text-sm sm:text-lg mb-4">
//                 <strong>{documentDetails.rcode} → </strong>
//                 <strong> {documentDetails.epfNo}</strong> -{" "}
//                 <strong>{documentDetails.eName}</strong> -
//                 <strong>{documentDetails.status}</strong> -{" "}
//                 <strong>
//                   {new Date(documentDetails.getDate).toLocaleDateString()}
//                 </strong>
//                 -{" "}
//                 <strong>
//                   {new Date(documentDetails.getDate).toLocaleTimeString()}
//                 </strong>
//               </p>

//               <button
//                 onClick={handleHistory}
//                 className="w-full sm:w-1/3 md:w-1/2 lg:w-1/3 xl:w-1/4 py-2 border rounded-full bg-[#00a2cd] text-white border-borderColor hover:opacity-90"
//               >
//                 <strong>File History</strong>
//               </button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="w-full flex flex-col items-center justify-center mt-10">
//           <div className="text-white bg-blue-600 text-xl font-bold p-3 w-3/4 text-center rounded-lg mb-4">
//             File History - {documentDetails?.rcode}
//           </div>

//           <div className="bg-white p-4 rounded-lg shadow-md w-3/4 overflow-x-auto">
//             <table className="w-full text-left table-auto border-collapse">
//               <thead>
//                 <tr className="bg-gray-200 text-gray-800 font-semibold text-lg">
//                   <th className="px-4 py-2 border">Name</th>
//                   <th className="px-4 py-2 border">EPF No</th>
//                   <th className="px-4 py-2 border">Date</th>
//                   <th className="px-4 py-2 border">Time</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {history.map((entry, index) => (
//                   <tr
//                     key={index}
//                     className="text-center text-blue-700 border-b"
//                   >
//                     <td className="px-4 py-2 border">{entry.newEName}</td>
//                     <td className="px-4 py-2 border">{entry.newEpfNo}</td>
//                     <td className="px-4 py-2 border">
//                       {new Date(entry.transferDate).toLocaleDateString()}
//                     </td>
//                     <td className="px-4 py-2 border">
//                       {new Date(entry.transferDate).toLocaleTimeString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocTrack;
