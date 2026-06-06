import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import AccontAssistncePage from "./pages/AccontAssistncePage";
import AddDoner from "./pages/AddDoner";
import Assisatncedetailspage from "./Pages/Assisatncedetailspage";
import AssistancePage from "./Pages/assistancepage";
import AssistantForFamilyDetails from "./Pages/AssistantForFamilyDetails";
import AssistantpageForCeo from "./Pages/assistantpageForCeo";
import CreditPage from "./pages/CreditPage";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import DebitAccountPage from "./pages/DebitAccountPage";
import { default as DiksharthiListing } from "./pages/DiksharthiDetails";
import DiksharthiDetailsAdd from "./Pages/DiksharthiDetailsAdd";
import DonorList from "./pages/DonorList";
import DonorPaymentHistory from "./pages/DonorPaymentHistory";
import Expenses from "./Pages/Expenses";
import FamilyBasicInfo from "./pages/FamilyBasicInfo";
import FamilyDetailsForm from "./pages/FamilyDetailsForm";
import InComing from "./Pages/InComing";
import KaryakartaDetails from "./pages/KaryakartaDetails";
import KaryakartaDetailsAdd from "./pages/KaryakartaDetailsAdd";
import KaryakartaList from "./pages/KaryakartaList";
import Language from "./pages/Language";
import MedicalIssueType from "./Pages/MedicalIssueType";
import MeetingSchedule from "./pages/MeetingSchedule";
import MeetingScheduleDetails from "./pages/MeetingScheduleDetails";
import Pofile from "./pages/Pofile";
import RBFBankDetails from "./pages/RBFBankDetails";
import RBFDematDetails from "./pages/RBFDematDetails";
import RequestDetails from "./pages/RequestDetails";
import ResProof from "./pages/ResProof";
import Settings from "./pages/Settings";
import UserList from "./pages/UserList";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import DiksarthiAllDoc from "./Pages/DiksarthiAllDoc";
import QueriesAssistant from "./Pages/QueriesAssistant";

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
                <StaffDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/xyz"
          element={
            <ProtectedRoute>
              <Layout>
                <FamilyBasicInfo />
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
          path="/meeting-schedule"
          element={
            <ProtectedRoute>
              <Layout>
                <MeetingSchedule />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting-schedule/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <MeetingScheduleDetails />
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
          path="/diksarthi-all-doc"
          element={
            <ProtectedRoute>
              <Layout>
                <DiksarthiAllDoc />
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
          path="/family-Assistance-details"
          element={
            <ProtectedRoute>
              <Layout>
                <AssistantForFamilyDetails />
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
          path="/queries-assistance"
          element={
            <ProtectedRoute>
              <Layout>
                <QueriesAssistant />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/CEO/assistance"
          element={
            <ProtectedRoute>
              <Layout>
                <AssistantpageForCeo />
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
        <Route
          path="/bank-details"
          element={
            <ProtectedRoute>
              <Layout>
                <RBFBankDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demat-account"
          element={
            <ProtectedRoute>
              <Layout>
                <RBFDematDetails />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Expenses"
          element={
            <ProtectedRoute>
              <Layout>
                <Expenses />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/InComing"
          element={
            <ProtectedRoute>
              <Layout>
                <InComing />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/Medical-Issue-Type"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicalIssueType />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-assistnce"
          element={
            <ProtectedRoute>
              <Layout>
                <AccontAssistncePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <CreditPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/debit-account"
          element={
            <ProtectedRoute>
              <Layout>
                <DebitAccountPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
