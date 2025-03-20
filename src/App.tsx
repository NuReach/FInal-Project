import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SingUp from "./pages/SingUp";
import SignInPage from "./pages/SignIn";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import UserProfile from "./pages/UserProfile";
import AddCoinPage from "./pages/AddCoinPage";
import DashboardPage from "./pages/DashboardPage";
import { Bounce, ToastContainer } from "react-toastify";
import DashboardProductPage from "./pages/DashboardProductPage";
import CreateProductPage from "./pages/CreateProductPage";
import UpdateProductPage from "./pages/UpdateProductPage";
import CollectionsTablePage from "./pages/DashboardCollectionPage";
import CollecctionDetail from "./pages/CollectionDetail";

function App() {
  return (
    <Router>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:product_id" element={<ProductDetail />} />
        <Route path="/collection/:product_id" element={<CollecctionDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/user/profile/:id" element={<UserProfile />} />
        <Route path="/dashboard/products" element={<DashboardProductPage />} />
        <Route
          path="/dashboard/collections"
          element={<CollectionsTablePage />}
        />
        <Route
          path="/dashboard/create/product"
          element={<CreateProductPage />}
        />
        <Route
          path="/dashboard/product/edit/:id"
          element={<UpdateProductPage />}
        />
        <Route path="/add_coint" element={<AddCoinPage />} />
        <Route path="/dashboard/:user_id" element={<DashboardPage />} />
        <Route path="/signup" element={<SingUp />} />
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
    </Router>
  );
}

export default App;
