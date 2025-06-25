import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container } from "../components/index";
import axios from "axios";
import Slider from "react-slick";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ArrowLeft, ArrowRight, Heart, MapPin, UserRound, Home, Landmark, Send } from "lucide-react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import Payment from "../components/Payment";

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [buyOffer, setBuyOffer] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isChatHovered, setIsChatHovered] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}`;
        const response = await axios.get(`${apiUrl}/property/fetch/${id}`, {
          withCredentials: true,
        });
        setProperty(response.data.data[0]);
        setIsFavorite(response.data.data[0].isFavorite || false);
      } catch (error) {
        console.error("Error fetching property details:", error);
      }
    };

    fetchProperty();

    const newSocket = io(`${import.meta.env.VITE_BACKEND_URL}`);
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [id]);

  useEffect(() => {
    if (socket && property) {
      socket.emit("joinPropertyChat", property._id);
      socket.on("newMessage", handleNewMessage);
    }
  }, [socket, property]);

  const handleNewMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !property) return;

    try {
      const messageData = {
        propertyId: property._id,
        text: newMessage,
        sender: "currentUserId",
        receiver: property.owner._id,
      };
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/chat/send`, messageData);
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      socket.emit("sendMessage", response.data);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleFavorite = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/favorite/${property._id}`,
        {},
        { withCredentials: true }
      );
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleBuyRequest = async () => {
    if (!buyOffer.trim()) {
      alert("Please enter an offer amount.");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/notifications/`,
        {
          type: "BUY_OFFER",
          recipient: property.owner._id,
          property: property._id,
          message: `New buy offer of ₹${buyOffer} for ${property.title}`,
        },
        { withCredentials: true }
      );
      
      setBuyOffer("");
      alert("Your offer has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting offer:", error);
    }
  };

  const NextArrow = ({ onClick }) => (
    <div
      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer bg-black/50 rounded-full p-2 backdrop-blur-sm hover:bg-black/70 transition-all"
      onClick={onClick}
    >
      <ArrowRight size={24} color="white" />
    </div>
  );

  const PrevArrow = ({ onClick }) => (
    <div
      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 cursor-pointer bg-black/50 rounded-full p-2 backdrop-blur-sm hover:bg-black/70 transition-all"
      onClick={onClick}
    >
      <ArrowLeft size={24} color="white" />
    </div>
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const handleUserClick = (user) => {
    navigate("/chat", { state: { selectedUser: user } });
  };

  if (!property) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white shadow-xl rounded-3xl p-6 overflow-hidden"
      >
        {/* Floating Chat Button */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsChatHovered(true)}
            onHoverEnd={() => setIsChatHovered(false)}
            onClick={() => handleUserClick(property.owner)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <motion.div
              animate={{
                rotate: isChatHovered ? [0, 15, -15, 0] : 0,
                transition: { duration: 0.6 }
              }}
            >
              <MessageCircle
                size={24}
                className="fill-current text-white"
              />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: isChatHovered ? 1 : 0,
                width: isChatHovered ? 'auto' : 0,
                transition: { duration: 0.3 }
              }}
              className="whitespace-nowrap overflow-hidden font-medium"
            >
              Chat with Owner
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleFavorite}
          className="absolute top-6 right-6 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Heart
            size={28}
            className={isFavorite ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-500 transition-colors"}
          />
        </motion.button>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Property Header Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Image Slider */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl shadow-lg"
            >
              {property.images?.length > 1 ? (
                <Slider {...sliderSettings}>
                  {property.images.map((img, index) => (
                    <div key={index}>
                      <img
                        src={img}
                        alt={`${property.title} - ${index + 1}`}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                  ))}
                </Slider>
              ) : property.images?.length === 1 ? (
                <div className="h-96">
                  <img
                    src={property.images[0]}
                    className="w-full h-96 object-cover"
                    alt="Property"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </motion.div>

            {/* Property Info */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-3xl font-semibold text-blue-600 mb-4">
                  ₹{property.price.toLocaleString()}
                </p>
                
                <div className="flex items-center gap-3 text-gray-600 mb-4">
                  <MapPin size={20} className="flex-shrink-0" />
                  <span className="text-lg">{property.address}</span>
                </div>

                {/* Buy Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPayment(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                >
                  Buy Now
                </motion.button>

                {showPayment && (
                  <Payment
                    amount={property.price}
                    propertyId={property._id}
                    sellerId={property.owner._id}
                    onClose={() => setShowPayment(false)}
                  />
                )}
              </div>

              {/* Owner Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-blue-50 p-4 rounded-xl border border-blue-100 hover:shadow-sm transition-all"
              >
                <Link 
                  to={`/profile/${property.owner._id}`}
                  className="flex items-center gap-4 hover:no-underline"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden shadow-inner">
                    {property.owner.avatar ? (
                      <img 
                        src={property.owner.avatar} 
                        className="w-full h-full object-cover"
                        alt="Owner"
                      />
                    ) : (
                      <UserRound size={24} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Property Owner</h3>
                    <p className="text-blue-600">{property.owner.fullname}</p>
                  </div>
                </Link>
              </motion.div>

              {/* Quick Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors">
                  <Home size={20} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-medium capitalize">{property.propertyType}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors">
                  <Landmark size={20} className="text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize">{property.status || "Available"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-8 mb-12"
          >
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Map */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 p-4">Location</h2>
              {property.location.latitude && property.location.longitude ? (
                <iframe
                  width="100%"
                  height="300"
                  className="border-0"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${property.location.longitude - 0.01},${property.location.latitude - 0.01},${property.location.longitude + 0.01},${property.location.latitude + 0.01}&marker=${property.location.latitude},${property.location.longitude}&layer=mapnik`}
                ></iframe>
              ) : (
                <div className="h-64 bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Location not available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Buy Request Section */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Interested in this Property?
              </h2>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="number"
                  value={buyOffer}
                  onChange={(e) => setBuyOffer(e.target.value)}
                  placeholder="Enter your offer amount"
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 hover:border-blue-300 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyRequest}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Submit Offer
                </motion.button>
              </div>
              <p className="text-center text-gray-600 mt-4 text-sm">
                Your offer will be directly sent to the property owner
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Container>
  );
};

export default PropertyDetailsPage;