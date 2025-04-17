import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
              setIsLoading(false);
              setProgress(0);
              navigate("/article-page", {
                state: {
                  imageUrl: URL.createObjectURL(file),
                  fromUpload: true,
                },
              });
            }, 500);
            return 100;
          }
          return prevProgress + 5;
        });
      }, 150);
    }
  }, [isLoading, navigate, file]);

  const getProgressText = () => {
    if (progress < 50) return "Loading...";
    if (progress < 100) return "Almost ready...";
    return "Complete!";
  };

  return (
    <div className="landing-container h-screen overflow-hidden font-inter">
      <Header />

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
          <div className="w-2/3 max-w-xl px-4">
            <div className="bg-white rounded-full h-4 w-full mb-4 overflow-hidden shadow-lg">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-white text-xl font-semibold text-center animate-pulse">
              {getProgressText()}
            </p>
          </div>
        </div>
      )}

      <div
        className="relative h-[calc(100vh-88px)] bg-gray-100 bg-cover bg-center mt-2.5"
        style={{ backgroundImage: "url('/images/background-landing_1.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

        <div className="relative z-10 ml-16 pl-6 p-4 rounded-md h-full flex flex-col justify-between">
          <div className="mt-[50px]">
            <h1 className="text-[70px] font-[700] leading-[100%] tracking-[-0.02em] text-white mb-4 font-inconsolata">
              Unlock the story in every pixel.
            </h1>
            <p className="text-3xl text-white mb-4">
              Upload a photo and let AI uncover the story behind it — one pixel at a time.
            </p>
            <p className="text-3xl text-white mb-6 -mt-4">
              Drop your image here or click to upload.
            </p>
          </div>

          <div className="upload-file flex justify-start w-full mb-16">
            <label className="relative bg-[#113f67cc] border-2 border-dashed border-white text-white rounded-lg p-6 max-w-2xl w-full cursor-pointer">
              <p className="text-2xl font-semibold mb-2">
                Drop your image here or click to upload.
              </p>
              <p className="text-base">Format: jpg, jpeg, png • Max file size: 10 MB</p>

              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {file && <p className="text-white mt-2">Selected file: {file.name}</p>}
            </label>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
