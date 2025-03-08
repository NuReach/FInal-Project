import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SingUp from "./pages/SingUp";
import SignInPage from "./pages/SignIn";
import ProductDetail from "./pages/ProductDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:product_id" element={<ProductDetail />} />
        <Route path="/signup" element={<SingUp />} />
        <Route path="/signin" element={<SignInPage />} />
      </Routes>
    </Router>
  );
}

export default App;
