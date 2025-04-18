import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

export default function ArticlePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [imageUrl, setImageUrl] = useState(location.state?.imageUrl || "/images/image_1.png");

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (location.state?.fromUpload) {
      setIsLoading(false);
      setProgress(0);
    }
  }, [location.state]);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    const validFormats = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 10 * 1024 * 1024;

    if (uploadedFile) {
      if (!validFormats.includes(uploadedFile.type)) {
        setError("Invalid file format. Please upload a JPG, JPEG, or PNG file.");
        setFile(null);
        setFileName("");
        return;
      }

      if (uploadedFile.size > maxSize) {
        setError("File size exceeds 10 MB. Please upload a smaller file.");
        setFile(null);
        setFileName("");
        return;
      }

      setError("");
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      setIsLoading(true);
    }
  };

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsLoading(false);
              setProgress(0);
              setImageUrl(URL.createObjectURL(file));
            }, 500);
            return 100;
          }
          return prevProgress + 5;
        });
      }, 150);
    }
  }, [isLoading, file]);

  const getProgressText = () => {
    if (progress < 25) return "Crafting your article...";
    if (progress < 50) return "Unlocking the story...";
    if (progress < 75) return "Spilling the digital ink...";
    if (progress < 100) return "Hold tight! Your article is almost here...";
    return "Complete!";
  };

  return (
    <div className="landing-container bg-white min-h-screen font-inter">
      <Header />

      {/* Styled loader only */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-lg z-50 flex flex-col items-center justify-center">
          <div className="w-2/3 max-w-xl px-4 flex flex-col items-center justify-center">
            <img
              src="/images/logo.png"
              alt="logo"
              className="w-[300px] h-[100px] mb-6 mx-auto"
            />
            <div className="bg-white rounded-full h-4 w-full mb-4 overflow-hidden shadow-lg">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-800 text-xl font-semibold text-center animate-pulse">
              {getProgressText()}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-12 px-6 text-left">
        <h1 className="text-6xl font-bold mb-4 mx-auto max-w-2xl">
          Article or post title
        </h1>
        <p className="text-xl mb-8 mx-auto max-w-2xl">
          Subheading that sets up context, shares more info about the author, or generally gets people psyched to keep reading
        </p>
      </div>

      <div className="relative w-full overflow-hidden mb-10 flex justify-center">
        <img
          src={imageUrl}
          alt="Post visual"
          className="w-full max-w-[1100px] h-auto object-contain rounded-lg"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 text-lg space-y-6">
        <p>
          Body text for your whole article or post. We'll put in some lorem ipsum to show how a filled-out page might look:
        </p>
        <p>
          Excepteur efficient emerging, minim veniam anim aute carefully curated Ginza conversation exquisite perfect nostrud nisi intricate Content. Qui international first-class nulla ut. Punctual adipisicing, essential lovely queen tempor eiusmod irure. Exclusive izakaya charming Scandinavian impeccable aute quality of life soft power pariatur Melbourne occaecat discerning. Qui wardrobe aliquip, et Porter destination Toto remarkable officia Helsinki excepteur Basset hound. Zürich sleepy perfect consectetur.
        </p>
        <p>
          Exquisite sophisticated iconic cutting-edge laborum deserunt Addis Ababa esse bureaux cupidatat id minim. Sharp classic the best commodo nostrud delightful. Conversation aute Rochester id. Qui sunt remarkable deserunt intricate airport handsome K-pop excepteur classic esse Asia-Pacific laboris.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 flex justify-center">
        <button className="bg-red-200 hover:bg-red-600 text-black px-4 py-2 rounded-md text-lg font-medium flex items-center justify-center gap-3">
          <FontAwesomeIcon icon={faFilePdf} size="lg" className="text-red-600" />
          DOWNLOAD
        </button>
      </div>

      {/* Upload Section (UNCHANGED) */}
      <div
        className="relative bg-gray-100 py-8 mt-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/pixel-bg_1.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

        <div className="relative z-10 pl-10 p-4 rounded-md">
          <h1 className="text-[65px] font-[700] tracking-[0.06em] text-gray-100 mb-2 font-[inconsolata]">
            Let the pixels speak again.
          </h1>
          <h3 className="text-[30px] font-[400] tracking-[0.05em] text-gray-300 mb-6">
            Upload another image to generate a new story.
          </h3>

          <div className="upload-file flex justify-start w-full mb-8">
            <label 
              className="relative bg-[#113f67cc] text-white rounded-[20px] py-2 px-4 max-w-[44rem] w-full cursor-pointer" 
              style={{ 
                background: '#113f67cc',
                borderRadius: '10px',
                borderStyle: 'dashed',
                borderWidth: '1px',
                borderColor: 'white',
                backgroundClip: 'padding-box',
                borderImageSource: 'url("data:image/svg+xml,%3csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3e%3crect width=\'100%25\' height=\'100%25\' rx=\'20\' ry=\'20\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-dasharray=\'20%2c 14\' stroke-linecap=\'round\'/%3e%3c/svg%3e")',
                borderImageSlice: 1,
                borderImageRepeat: 'round',
                minHeight: 'calc(100% - 14px)'
              }}
            >
              <p className="text-[30px] font-medium mb-0.5 font-[100] tracking-[0.06em]">
                Drop your image here or click to upload.
              </p>
              <p className="text-base">Format: jpg, jpeg, png & Max file size: 10 MB</p>

              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </label>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}