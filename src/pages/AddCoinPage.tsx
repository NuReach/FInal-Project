import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";

const stripePromise = loadStripe(
  "pk_test_51MDXbkL5zRzBFa27OFK9e8iXK6QyOYWcOgv6ULDda178UtgEUWMJ1laSxZAp5sfA1bmpzmMEoiW2wpUBZX7ZgL5200q67kWJRo"
); // Replace with your Stripe Publishable Key

const CheckoutForm: React.FC<{ amount: number; onSuccess: () => void }> = ({
  amount,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Request client secret from backend
      const response = await fetch(
        "http://localhost:5000/api/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      );

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: elements.getElement(CardElement)! },
        }
      );

      if (error) {
        console.error("Payment failed:", error);
        toast.error("Payment failed. Please try again.");
      } else if (paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onSuccess();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ToastContainer />
      <CardElement className="p-2 border rounded-lg" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="text-white bg-green-500 py-2 rounded-lg flex items-center justify-center w-full"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

const BuyCoinSection: React.FC = () => {
  const [money, setMoney] = useState(0);
  const [coins, setCoins] = useState(0);
  const exchangeRate = 100;

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value) || 0;
    if (value < 1) value = 1;
    setMoney(value);
    setCoins(value * exchangeRate);
  };

  const handleCoinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value) || 0;
    if (value < 100) value = 100;
    setCoins(value);
    setMoney(value / exchangeRate);
  };

  const handleSuccess = () => {
    setMoney(0);
    setCoins(0);
  };

  return (
    <>
      <Navbar />
      <section className="p-3 md:p-12">
        <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl mx-auto">
          <div className="flex-1 flex justify-center items-center">
            <img
              src="https://img.freepik.com/premium-photo/young-asian-woman-holding-phone-hand-holding-it-forward-pink_296537-1878.jpg"
              alt="Smiling woman with phone"
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 flex flex-col space-y-4 p-4">
            <h2 className="text-xl font-semibold">Buy</h2>
            <div className="space-y-2">
              <label className="block text-gray-700">Spend</label>
              <input
                type="number"
                value={money}
                onChange={handleMoneyChange}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Receive</label>
              <input
                type="number"
                value={coins}
                onChange={handleCoinChange}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700">Pay With</label>
              <img
                src="https://logowik.com/content/uploads/images/219_visa.jpg"
                className="w-24"
                alt=""
              />
            </div>
            <Elements stripe={stripePromise}>
              <CheckoutForm amount={money} onSuccess={handleSuccess} />
            </Elements>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default BuyCoinSection;
