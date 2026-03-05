import { BrowserRouter, Route, Routes } from "react-router-dom";
import Sidebar from "./Component/Sidebar";
import { default as DiksharthiListing } from "./pages/DiksharthiDetails";
import DiksharthiDetailsAdd from "./Pages/DiksharthiDetailsAdd";
import FamilyDetailsForm from "./pages/FamilyDetailsForm";

// A simple wrapper to keep the Sidebar visible
const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen ">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Default path redirects to Diksharthi Details as per your design */}
          {/* <Route path="/" element={<Navigate to="/diksharthi-details" />} /> */}

          <Route path="/" element={<DashboardPlaceholder />} />
          <Route path="/diksharthi-details" element={<DiksharthiListing />} />
          <Route
            path="/diksharthi-details-add"
            element={<DiksharthiDetailsAdd />}
          />
          <Route
            path="/family-details"
            element={<FamilyDetailsForm />}
          />

          {/* Add other routes here */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

// Simple placeholders for other pages
const DashboardPlaceholder = () => <div className="p-8">Dashboard Content</div>;

export default App;
