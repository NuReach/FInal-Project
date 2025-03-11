const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 md:p-12 relative mt-3 md:mt-24">
      <div className="max-w-7xl mx-auto p-3 md:p-9">
        <div className="bg-[#A8BBA3] p-3 rounded-lg flex flex-wrap md:flex-row justify-between items-center md:absolute -top-14 xl:w-[1200px]">
          <div className="flex flex-col">
            <h2 className="text-lg md:text-3xl font-bold text-white leading-loose">
              PROMOTION
            </h2>
            <h2 className="text-lg md:text-3xl font-bold text-white">
              EXCHANGE 10$ GOT 1500 COINS
            </h2>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-gray-900 py-2 rounded-full shadow text-xs px-9">
            CLICK HERE TO EXCHANGE
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div>
            <h3 className="text-lg font-bold">ECOSWAP</h3>
            <p className="text-sm">
              SWAP EVERYTHING IN HERE FIND THE BEST SECOND HAND ITEM IN OUR
              WEBSITE
            </p>
            <div className="flex space-x-4 mt-2">
              <span className="text-xl">🔵</span>
              <span className="text-xl">⚫</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold">COMPANY</h3>
            <ul className="text-sm space-y-1">
              <li>About</li>
              <li>Features</li>
              <li>Works</li>
              <li>Career</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">HELP</h3>
            <ul className="text-sm space-y-1">
              <li>Customer Support</li>
              <li>Delivery Details</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">FAQ</h3>
            <ul className="text-sm space-y-1">
              <li>Account</li>
              <li>Manage Deliveries</li>
              <li>Orders</li>
              <li>Payments</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold">RESOURCES</h3>
            <ul className="text-sm space-y-1">
              <li>Free eBooks</li>
              <li>Development Tutorial</li>
              <li>How to - Blog</li>
              <li>Youtube Playlist</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-center mt-8">
          ECOSWAP © 2000-2023, All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
