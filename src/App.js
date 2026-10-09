import './App.css';
import React, { useEffect } from 'react';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';

import Home from './components/Home';
import Profile from './components/Profile';
import Login from './components/Login';
import Planning from './components/Planning';
import Machine from './components/Machine';
import Customer from './components/Customer';
import Vendor from './components/Vendor';
import Fabric from './components/Fabric';
import Construction from './components/Construction';
import Process from './components/Process';
import Width from './components/Width';
import Finishing from './components/Finishing';
import Edit from './components/Edit';
import Greyentry from './components/Greyentry';
import Batch from './components/Batch';
import Batchdetails from './components/Batchdetails';
import Labentry from './components/Labentry';
import Mrs from './components/Mrs';
import Processroute from './components/Processroute';
import Unauthorized from './components/Unauthorized';
import Storeentry from './components/Storeentry'
import Role from './components/Role';
import Pstock from './components/Pstock'
import Bstock from './components/Bstock'
import Batchfinishing from './components/Bathchfinishing';
import Delivery from './components/Delivery';
import Invoice from './components/Invoice';
import InvoiceList from './components/InvoiceList';
import PO from './components/PurchaseOrder';
import EditPO from './components/EditPurchaeOrder';
import PrintPO from './components/PrintPurchaseOrder';
import POList from './components/PurchaseOrderList';
import Return from './components/Return';
import Reports from './components/Reports';
import BatchEdit from './components/BatchEdit';
import UsersList from './components/UsersList';
import UserAccessManagement from './components/UserAccessManagement';
import { PERMISSIONS } from './constants/permissions';

function App() {
  useEffect(() => {
    document.title = 'Sri Shiva Designs';
  }, []);

  return (
   
    <AuthProvider>
      <Router>
        <div className="flex h-screen overflow-hidden">
          <Navigation />
          <main className="flex-1 overflow-x-hidden">
            <Routes>
              <Route
                path="/"
                element={
                  <Role>
                    <Home />
                  </Role>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                path="/profile"
                element={
                  <Role requiredPermission={PERMISSIONS.PROFILE_VIEW}>
                    <Profile />
                  </Role>
                }
              />
              <Route
                path="/planning"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.PLANNING_VIEW}
                    allowedRoles={["admin", "batch", "SP1", "SP2", "PA", 'PM']}
                  >
                    <Planning />
                  </Role>
                }
              />
              <Route
                path="/finishing"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.FINISHING_VIEW}
                    allowedRoles={["admin", "finishing", "SP1", "SP2", "PA", 'PM']}
                  >
                    <Batchfinishing />
                  </Role>
                }
              />
              <Route
                path="/profile/:planid"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.PROFILE_VIEW}
                    allowedRoles={["admin", "batch", "SP1", "SP2", "PA", 'PM']}
                  >
                    <Edit />
                  </Role>
                }
              />
              <Route
                path="/machine"
                element={
                  <Role requiredPermission={PERMISSIONS.MACHINE_VIEW} allowedRoles={["admin", "PA"]}>
                    <Machine />
                  </Role>
                }
              />
              <Route
                path="/customer"
                element={
                  <Role requiredPermission={PERMISSIONS.CUSTOMER_VIEW} allowedRoles={["admin", "PA", "SP1"]}>
                    <Customer />
                  </Role>
                }
              />
              <Route
                path="/vendor"
                element={
                  <Role requiredPermission={PERMISSIONS.VENDOR_VIEW} allowedRoles={["admin", "purchase", "PA"]}>
                    <Vendor />
                  </Role>
                }
              />
              <Route
                path="/fabric"
                element={
                  <Role requiredPermission={PERMISSIONS.FABRIC_VIEW} allowedRoles={["admin", "PA", "SP1"]}>
                    <Fabric />
                  </Role>
                }
              />
              <Route
                path="/construction"
                element={
                  <Role requiredPermission={PERMISSIONS.CONSTRUCTION_VIEW} allowedRoles={["admin", "PA", "SP1"]}>
                    <Construction />
                  </Role>
                }
              />
              <Route
                path="/process"
                element={
                  <Role requiredPermission={PERMISSIONS.PROCESS_VIEW} allowedRoles={["admin", "production", "PA", 'PM']}>
                    <Process />
                  </Role>
                }
              />
              <Route
                path="/width"
                element={
                  <Role requiredPermission={PERMISSIONS.WIDTH_VIEW} allowedRoles={["admin", "PA", "SP1"]}>
                    <Width />
                  </Role>
                }
              />
              <Route
                path="/sfinishing"
                element={
                  <Role requiredPermission={PERMISSIONS.SFINISHING_VIEW} allowedRoles={["admin", "PA", 'PM']}>
                    <Finishing />
                  </Role>
                }
              />
              <Route
                path="/greyentry"
                element={
                  <Role requiredPermission={PERMISSIONS.GREYENTRY_VIEW} allowedRoles={["admin", "grey", "SP1", "SP2", "PA"]}>
                    <Greyentry />
                  </Role>
                }
              />
              <Route
                path="/batch"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.BATCH_VIEW}
                    allowedRoles={["admin", "production", "batch", "batchcomplete", "grey", "SP2", "SP1", "PA", 'PM']}
                  >
                    <Batch />
                  </Role>
                }
              />
              <Route
                path="/pstock"
                element={
                  <Role requiredPermission={PERMISSIONS.PSTOCK_VIEW} allowedRoles={["admin", "SP1", "SP2", "PA", 'PM']}>
                    <Pstock />
                  </Role>
                }
              />
              <Route
                path="/bstock"
                element={
                  <Role requiredPermission={PERMISSIONS.BSTOCK_VIEW} allowedRoles={["admin", "PA"]}>
                    <Bstock />
                  </Role>
                }
              />
              <Route
                path="/batch/:batchid"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.BATCH_DETAILS_VIEW}
                    allowedRoles={["admin", "production", "batch", "batchcomplete", "grey", "SP2", "SP1", "PA", 'PM']}
                  >
                    <Batchdetails />
                  </Role>
                }
              />
              <Route
                path="/labentry"
                element={
                  <Role requiredPermission={PERMISSIONS.LABENTRY_VIEW} allowedRoles={["admin", "SP2", 'lab', 'PM']}>
                    <Labentry />
                  </Role>
                }
              />

              <Route
                path="/storeentry"
                element={
                  <Role requiredPermission={PERMISSIONS.STOREENTRY_VIEW} allowedRoles={["admin", "store", "PA", 'PM']}>
                    <Storeentry />
                  </Role>
                }
              />

              <Route
                path="/delivery"
                element={
                  <Role requiredPermission={PERMISSIONS.DELIVERY_VIEW} allowedRoles={["admin", "delivery", "SP1", "finishing", "PA"]}>
                    <Delivery />
                  </Role>
                }
              />
              <Route
                path="/invoice"
                element={
                  <Role requiredPermission={PERMISSIONS.INVOICE_CREATE_VIEW} allowedRoles={["admin", "delivery", "PA"]}>
                    <Invoice />
                  </Role>
                }
              />

              <Route
                path="/invoices"
                element={
                  <Role requiredPermission={PERMISSIONS.INVOICE_LIST_VIEW} allowedRoles={["admin", "delivery", "PA"]}>
                    <InvoiceList />
                  </Role>
                }
              />

              <Route
                path="/return"
                element={
                  <Role requiredPermission={PERMISSIONS.RETURN_VIEW} allowedRoles={["admin", "delivery", "SP1", "SP3", "PA"]}>
                    <Return />
                  </Role>
                }
              />

              <Route
                path="/reports"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.REPORTS_VIEW}
                    allowedRoles={["admin", "delivery", "SP1", "SP2", "finishing", "PA"]}
                  >
                    <Reports />
                  </Role>
                }
              />

              <Route
                path="/purchaseOrder"
                element={
                  <Role requiredPermission={PERMISSIONS.PURCHASE_ORDER_VIEW} allowedRoles={["admin", "purchase", "PA"]}>
                    <PO />
                  </Role>
                }
              />

              <Route
                path="/users"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.USER_MANAGEMENT_VIEW}
                    allowedRoles={["admin"]}
                  >
                    <UsersList />
                  </Role>
                }
              />

              <Route
                path="/users/access"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.USER_MANAGEMENT_VIEW}
                    allowedRoles={["admin"]}
                  >
                    <UserAccessManagement />
                  </Role>
                }
              />

              <Route
                path="/mrs/:batchid"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.MRS_VIEW}
                    allowedRoles={["admin", "production", "batch", "batchcomplete", "grey", "SP2", "SP1", "PA", 'PM']}
                  >
                    <Mrs />
                  </Role>
                }
              />
              <Route
                path="/process/:pid"
                element={
                  <Role requiredPermission={PERMISSIONS.PROCESS_ROUTE_VIEW} allowedRoles={["admin", "production", "PA", 'PM']}>
                    <Processroute />
                  </Role>
                }
              />
              <Route
                path="/editpo/:id"
                element={
                  <Role requiredPermission={PERMISSIONS.PURCHASE_ORDER_EDIT_VIEW} allowedRoles={["admin", "purchase", "PA"]}>
                    <EditPO />
                  </Role>
                }
              />
              <Route
                path="/printpo/:id"
                element={
                  <Role requiredPermission={PERMISSIONS.PURCHASE_ORDER_PRINT_VIEW} allowedRoles={["admin", "purchase", "PA"]}>
                    <PrintPO />
                  </Role>
                }
              />
              <Route
                path="/polist"
                element={
                  <Role requiredPermission={PERMISSIONS.PURCHASE_ORDER_LIST_VIEW} allowedRoles={["admin", "purchase", "PA"]}>
                    <POList />
                  </Role>
                }
              />

              <Route
                path="/batchedit/:planid"
                element={
                  <Role
                    requiredPermission={PERMISSIONS.BATCH_EDIT_VIEW}
                    allowedRoles={["admin", "production", "batch", "batchcomplete", "grey", "SP2", "SP1", "PA", 'PM']}
                  >
                    <BatchEdit />
                  </Role>
                }
              />
  
          </Routes>
          </main>
        </div>
    </Router>
  </AuthProvider>
    
  );
}

export default App;
