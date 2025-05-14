import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaPen, 
  FaCommentDots, 
  FaPaperPlane,
  FaMapMarkerAlt,
  FaHeadset
} from "react-icons/fa";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const navigateTo = useNavigate();
  const handleContactForm = (e) => {
    e.preventDefault();
    setLoading(true);

    const templateParams = {
      name,
      email,
      phone,
      subject,
      message,
    };

    emailjs
      .send(
        "service_mkmyrol",
        "template_qrq6gel",
        templateParams,
        "TWSuKVyJAySVF9SQL"
      )
      .then(() => {
        toast.success("Thank You! Your message has been sent successfully.");
        setLoading(false);
        navigateTo("/");
      })
      .catch((err) => {
        toast.error("Failed to send message.");
        setLoading(false);
      });
  };

  const contactInfo = [
    {
      icon: <FaHeadset className="text-2xl" />,
      title: "Customer Support",
      info: "gabrielsubtirica24@gmail.com",
      color: "from-[#00B3B3] to-[#2bd6bf]"
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl" />,
      title: "Address",
      info: "Bucharest, Romania",
      color: "from-[#2bd6bf] to-[#4ecca3]"
    },
    {
      icon: <FaPhone className="text-2xl" />,
      title: "Phone",
      info: "+40 721 726 748",
      color: "from-[#4ecca3] to-[#00B3B3]"
    }
  ];

  return (
    <section className="w-full h-auto px-5 pt-20 lg:pl-[320px] flex flex-col min-h-screen bg-gradient-to-b from-[#f0f9f9] to-[#e0f7fa] relative overflow-hidden">
      {/* Background Elements */}
      {/* <div className="absolute top-20 right-0 w-72 h-72 bg-[#2bd6bf] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-[#00B3B3] opacity-5 rounded-full blur-3xl"></div> */}

      <div className={`max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Contact Info Column */}
        <div className="w-full lg:w-1/3 mb-8 lg:mb-0">
          <div className="sticky top-28">
            <div className="flex flex-col gap-6">
              <div className="text-center mb-8">
                <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-3xl font-extrabold mb-4 drop-shadow-lg">
                  Get in Touch
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] mx-auto mb-4 rounded-full"></div>
                <p className="text-gray-700">We'd love to hear from you. Please fill out the form or contact us directly.</p>
              </div>

              {contactInfo.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 transform hover:-translate-y-1"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className={`bg-gradient-to-r ${item.color} text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-md`}>
                    {item.icon}
                  </div>
                  <h4 className="text-lg font-bold text-[#134e5e] mb-1">{item.title}</h4>
                  <p className="text-gray-700">{item.info}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-[#00B3B3]/10 to-[#2bd6bf]/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-r from-[#2bd6bf]/10 to-[#00B3B3]/10 rounded-full blur-xl"></div>

            <div className="relative z-10">
              <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
                Send Us a Message
              </h3>

              <form
                className="flex flex-col gap-6 w-full"
                onSubmit={handleContactForm}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="flex flex-col gap-2 group">
                    <label className="text-lg text-gray-600 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaUser className="text-[#00B3B3]" /> Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full mt-1 p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2 group">
                    <label className="text-lg text-gray-600 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaEnvelope className="text-[#00B3B3]" /> Your Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mt-1 p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex flex-col gap-2 group">
                    <label className="text-lg text-gray-600 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaPhone className="text-[#00B3B3]" /> Your Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full mt-1 p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                      placeholder="+40 712 345 678"
                    />
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-2 group">
                    <label className="text-lg text-gray-600 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                      <FaPen className="text-[#00B3B3]" /> Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full mt-1 p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                      required
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="flex flex-col gap-2 group">
                  <label className="text-lg text-gray-600 flex items-center gap-2 group-focus-within:text-[#00B3B3] transition-colors duration-300">
                    <FaCommentDots className="text-[#00B3B3]" /> Message
                  </label>
                  <textarea
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full mt-1 p-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00B3B3] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300"
                    required
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  className="relative overflow-hidden bg-gradient-to-r from-[#00B3B3] to-[#2bd6bf] hover:from-[#2bd6bf] hover:to-[#00B3B3] text-white font-semibold text-xl py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-3 w-full sm:w-auto mx-auto mt-4"
                  type="submit"
                  disabled={loading}
                >
                  <span className="relative z-10">{loading ? "Sending Message..." : "Send Message"}</span>
                  {!loading && <FaPaperPlane className="relative z-10 animate-pulse" />}
                  <div className="absolute top-0 left-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full transition-transform duration-1000 group-hover:translate-x-0"></div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;