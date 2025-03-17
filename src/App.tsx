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
import { ToastContainer } from "react-toastify";
import DashboardProductPage from "./pages/DashboardProductPage";
import CreateProductPage from "./pages/CreateProductPage";
import UpdateProductPage from "./pages/UpdateProductPage";

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:product_id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/user/profile/:user_id" element={<UserProfile />} />
        <Route path="/dashboard/products" element={<DashboardProductPage />} />
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
