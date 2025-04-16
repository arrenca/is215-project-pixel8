import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function LandingPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    const validFormats = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10 MB

    if (uploadedFile) {
      if (!validFormats.includes(uploadedFile.type)) {
        setError("Invalid file format. Please upload a JPG, JPEG, or PNG file.");
        setFile(null);
        return;
      }

      if (uploadedFile.size > maxSize) {
        setError("File size exceeds 10 MB. Please upload a smaller file.");
        setFile(null);
        return;
      }

      setError("");
      setFile(uploadedFile);
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
              navigate("/article-page");
            }, 500); // wait half a second before redirect
            return 100;
          }
          return prevProgress + 5; // Speed of progress
        });
      }, 150); // Interval timing
    }
  }, [isLoading, navigate]);

  const getProgressText = () => {
    if (progress < 50) return "Loading...";
    if (progress < 100) return "Almost ready...";
    return "Complete!";
  };

  return (
    <div className="landing-container min-h-screen font-inter">
      <Header />

      {/* Fullscreen Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center transition-all duration-300 ease-in-out">
          <div className="w-2/3 max-w-xl px-4">
            <div className="bg-white rounded-full h-4 w-full mb-4 overflow-hidden shadow-lg">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-white text-xl font-semibold text-center animate-pulse tracking-wide">
              {getProgressText()}
            </p>
          </div>
        </div>
      )}

      {/* Background Section */}
      <div
        className="relative bg-gray-100 py-8 mt-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/background-landing_1.png')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

        {/* Content */}
        <div className="relative z-10 ml-16 pl-6 p-4 rounded-md">
          <h1 className="text-5xl font-bold text-white mb-4 font-inter tracking-wide leading-tight">
            Unlock the story in every pixel.
          </h1>
          <p className="text-3xl text-white mb-6 font-inter">
            Upload a photo and let AI uncover the story behind it — one pixel at a time.<br />
            Drop your image here or click to upload.
          </p>

          <div className="upload-file flex justify-start">
            <label className="bg-[#113f67cc] border-2 border-dashed border-white text-white rounded-lg p-6 max-w-md w-full">
              <p className="text-2xl font-semibold mb-2">
                Drop your image here or click to upload.
              </p>
              <p className="text-base">
                Format: jpg, jpeg, png • Max file size: 10 MB
              </p>
              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
                className="mt-4 p-2 bg-white text-black rounded-md border border-gray-300 w-full opacity-0 cursor-pointer"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {file && <p className="text-white mt-2">Selected file: {file.name}</p>}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
