// import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Sidebar from "./components/Sidebar";
// import Login from "./components/Login";
// import Assisatncedetailspage from "./Pages/Assisatncedetailspage";
// import AssistancePage from "./Pages/assistancepage";
// import { default as DiksharthiListing } from "./pages/DiksharthiDetails";
// import DiksharthiDetailsAdd from "./Pages/DiksharthiDetailsAdd";
// import FamilyDetailsForm from "./pages/FamilyDetailsForm";

// // A simple wrapper to keep the Sidebar visible
// const Layout = ({ children }) => {
//   return (
//     <div className="flex min-h-screen ">
//       <Sidebar />
//       <main className="flex-1">{children}</main>
//     </div>
//   );
// };

// function App() {
//   return (
//     <BrowserRouter>
//       <Layout>
//         <Routes>
//           {/* <Route path="/" element={<Navigate to="/diksharthi-details" />} /> */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/" element={<DashboardPlaceholder />} />
//           <Route path="/diksharthi-details" element={<DiksharthiListing />} />
//           <Route
//             path="/diksharthi-details-add"
//             element={<DiksharthiDetailsAdd />}
//           />
//           <Route path="/family-details" element={<FamilyDetailsForm />} />
//           <Route path="/assistance" element={<AssistancePage />} />
//           <Route
//             path="/assistance-details"
//             element={<Assisatncedetailspage />}
//           />
//           {/* Add other routes here */}
//         </Routes>
//       </Layout>
//     </BrowserRouter>
//   );
// }

// // Simple placeholders for other pages
// const DashboardPlaceholder = () => <div className="p-8">Dashboard Content</div>;

// export default App;


import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Assisatncedetailspage from "./Pages/Assisatncedetailspage";
import AssistancePage from "./Pages/assistancepage";
import { default as DiksharthiListing } from "./pages/DiksharthiDetails";
import DiksharthiDetailsAdd from "./Pages/DiksharthiDetailsAdd";
import FamilyDetailsForm from "./pages/FamilyDetailsForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import Settings from "./pages/Settings";
import DonorList from "./pages/DonorList";
import AddDoner from "./pages/AddDoner";
import RequestDetails from "./pages/RequestDetails";

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPlaceholder />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/diksharthi-details"
          element={
            <ProtectedRoute>
              <Layout>
                <DiksharthiListing />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/diksharthi-details-add"
          element={
            <ProtectedRoute>
              <Layout>
                <DiksharthiDetailsAdd />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/family-details"
          element={
            <ProtectedRoute>
              <Layout>
                <FamilyDetailsForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistance"
          element={
            <ProtectedRoute>
              <Layout>
                <AssistancePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/assistance-details"
          element={
            <ProtectedRoute>
              <Layout>
                <Assisatncedetailspage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-details"
          element={
            <ProtectedRoute>
              <Layout>
                <RequestDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor"
          element={
            <ProtectedRoute>
              <Layout>
                <DonorList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/add"
          element={
            <ProtectedRoute>
              <Layout>
                <AddDoner />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

const DashboardPlaceholder = () => (
  <div className="p-8">Dashboard Content</div>
);

export default App;