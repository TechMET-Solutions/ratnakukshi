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
import KaryakartaList from "./pages/KaryakartaList";
import KaryakartaDetails from "./pages/KaryakartaDetails";
import DonorPaymentHistory from "./pages/DonorPaymentHistory";
import UserList from "./pages/UserList";
import KaryakartaDetailsAdd from "./pages/KaryakartaDetailsAdd";
import Pofile from "./pages/Pofile";
import Language from "./pages/Language";
import ResProof from "./pages/ResProof";

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
          path="/user"
          element={
            <ProtectedRoute>
              <Layout>
                <UserList />
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
          path="/members-contributions"
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
          path="/donor/payment-history"
          element={
            <ProtectedRoute>
              <Layout>
                <DonorPaymentHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/karyakarta"
          element={
            <ProtectedRoute>
              <Layout>
                <KaryakartaList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/karyakarta-add"
          element={
            <ProtectedRoute>
              <Layout>
                <KaryakartaDetailsAdd />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Pofile />
              </Layout>
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/karyakarta/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <KaryakartaDetails />
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
        <Route
          path="/mother-tongue"
          element={
            <ProtectedRoute>
              <Layout>
                <Language />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/res-proof"
          element={
            <ProtectedRoute>
              <Layout>
                <ResProof />
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
