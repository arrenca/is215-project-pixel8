import { useState, useEffect } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js"

export default function ArticlePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state

  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(location.state?.imageUrl || "/images/image_1.png");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (location.state?.fromUpload) {
      setIsLoading(false);
      setProgress(0);
      setShowConsent(false);
      setFile(null);
      setIsConsentChecked(false);
    }
  }, [location.state]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    const validFormats = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (uploadedFile) {
      if (!validFormats.includes(uploadedFile.type)) {
        setError("Invalid file format. Please upload a JPG, JPEG, or PNG file.");
        setFile(null);
        return;
      }

      if (uploadedFile.size > maxSize) {
        setError("File size exceeds 5 MB. Please upload a smaller file.");
        setFile(null);
        return;
      }

      setError("");
      setFile(uploadedFile);
      setShowConsent(true);
      setIsConsentChecked(false);
    }
  };

  const handleConsentChange = (event) => {
    setIsConsentChecked(event.target.checked);
  };

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("image", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://project.vrsevilla.is215.upou.io/api/upload");

    let uploadComplete = false;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setProgress(Math.min(Math.round(percentComplete), 95)); // Cap at 95% for upload
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        uploadComplete = true;

        // Animate progress from 95 to 100 while "processing"
        let fakeProgress = 95;
        const processingInterval = setInterval(() => {
          fakeProgress += 1;
          setProgress(fakeProgress);

          if (fakeProgress >= 100) {
            clearInterval(processingInterval);
            setTimeout(() => {
              setIsLoading(false);
              setProgress(0);
              navigate("/article-page", {
                state: {
                  imageUrl: URL.createObjectURL(file),
                  fromUpload: true,
                  ...result?.analysis,
                },
              });
            }, 500);
          }
        }, 50);
      } else {
        setIsLoading(false);
        console.error("Upload failed:", xhr.responseText);
      }
    };

    xhr.onerror = () => {
      setIsLoading(false);
      console.error("Upload error");
    };

    xhr.send(formData);
  };

  console.log(data)

  const handleStartLoading = () => {
    if (file && isConsentChecked) {
      setIsLoading(true);
      uploadImage()
    }
  };

  const getProgressText = () => {
    if (progress < 25) return "Crafting your article...";
    if (progress < 50) return "Unlocking the story...";
    if (progress < 75) return "Spilling the digital ink...";
    if (progress < 100) return "Hold tight! Your article is almost here...";
    return "Complete!";
  };

  function downloadPdf(){
    const generatedBy = document.getElementById('generated-by');
    const element = document.getElementById("article-div");
    const opt = {
      margin:       [0.75, 0.5, 0.75, 0.5],
      filename:     'Article.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'A4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };
    generatedBy.style.display = 'block';
  
    html2pdf()
      .from(element)
      .set(opt)
      .save()
      .then(() => {
        generatedBy.style.display = 'none';
      });
  }

  useEffect(() => {
    setImageUrl(data.imageUrl)
  }, [data])

  return (
    <div className="landing-container bg-white min-h-screen font-inter">
      <Header />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-lg z-50 flex flex-col items-center justify-center">
          <div className="w-2/3 max-w-xl px-4 flex flex-col items-center justify-center">
            <img src="/images/logo.png" alt="logo" className="w-[300px] h-[100px] mb-6 mx-auto" />
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

      <div className="mb-5"></div>

      <div className="flex flex-row justify-center w-full" id="article-div">
        <div className="flex flex-col px-4">
            {/* <div className="content-container max-w-3xl sm:max-w-4xl md:max-w-5xl mx-auto py-6 sm:py-8 md:py-10 md:px-4"> */}
          <div className="max-w-4xl text-lg flex flex-col gap-3">
            <h1 className="text-3xl md:px-0 sm:text-4xl md:text-[55px] font-[700] text-gray-900 mb-2 sm:mb-6 md:mb-8 text-start" style={{ lineHeight: '1' }}>
              {data?.article_title ?? ""}
            </h1>
            <p className="m-0 bg-gray-800 text-white px-3 py-2 rounded-2xl w-fit text-sm">{data.article_category ?? ""}</p>
            <p className="text-base md:px-0 sm:text-md md:text-[18px] text-gray-500 mb-2 sm:mb-2 md:mb-4x text-left">
              {data?.article_subtitle ?? ""}
            </p>
          </div>

          {/* Article Image */}
          <div className="relative w-full overflow-hidden mt-3 mb-3">
            <img
              src={imageUrl}
              alt="Post visual"
              className="w-full max-w-[895px] h-auto object-contain"
            />
          </div>

          <div className="max-w-4xl text-lg text-justify mb-4 w-full flex flex-row gap-2 justify-start">
            {(data.celebrities ?? []).map((celeb, index) => (
              <span key={index} className="text-sm italic bg-opacity-25 text-gray-800">{celeb.name}{index === (data.celebrities.length - 1) ? "" : ","}</span>
            ))}
          </div>

          {/* Article Body */}
          <div className="max-w-4xl text-lg margin-y-6 text-justify">
            {/* <p>Body text for your whole article or post. We'll put in some lorem ipsum to show how a filled-out page might look:</p>
            <p>Excepteur efficient emerging, minim veniam anim aute carefully curated Ginza conversation exquisite perfect nostrud nisi intricate Content. Qui international first-class nulla ut.</p>
            <p>Exquisite sophisticated iconic cutting-edge laborum deserunt Addis Ababa esse bureaux cupidatat id minim.</p> */}
            <p>{data.article_content ?? ""}</p>
          </div>

          {/* Show only when printing PDF */}
          <div className="w-full my-8 text-center hidden print:block" id="generated-by">
            <hr className="border-t border-gray-300 my-6" />
            <p className="m-0">Generated by</p>
            <img 
                src="/images/logo.png" 
                alt="logo"
                className="w-[200px] mx-auto" 
              />
          </div>
        </div>


      </div>

      {/* Download Button */}
      <div className="max-w-4xl mx-auto px-6 mt-12 flex justify-center">
        <button className="bg-red-200 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-md text-lg font-medium flex items-center justify-center gap-3" onClick={downloadPdf}>
          <FontAwesomeIcon icon={faFilePdf} size="lg" className="" />
          DOWNLOAD
        </button>
      </div>

      {/* Upload Another Image */}
      <div
        className="relative bg-gray-100 py-8 mt-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/pixel-bg_1.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

        <div className="relative z-10 pl-10 p-4 rounded-md">
          <h1 className="text-3xl sm:text-4xl md:text-[65px] font-[700] tracking-[0.06em] text-gray-100 mb-4 font-[inconsolata]">
            Let the pixels speak again.
          </h1>
          <h3 className="text-xl sm:text-2xl md:text-[30px] font-[400] tracking-[0.05em] text-gray-300 mb-8">
            Upload another image to generate a new story.
          </h3>

          <div className="upload-file flex justify-start">
            <label 
              className={`relative bg-[#113f67cc] text-white py-2 px-4 w-full sm:max-w-[44rem] cursor-pointer
                ${windowWidth === 375 
                  ? 'rounded-lg border-white border-opacity-80 [border-style:dashed] [border-width:1px] [border-spacing:2px]'
                  : 'rounded-2xl border-white border-opacity-90 [border-style:dashed] [border-width:2px] [border-spacing:4px]'
                }`}
              style={{
                borderStyle: 'dashed',
                borderWidth: windowWidth === 375 ? '1px' : '2px',
                borderColor: 'white',
                backgroundClip: 'padding-box'
              }}
            >
              <p className="text-xl sm:text-2xl md:text-[30px] mb-0.5 font-[100] tracking-[0.06em] text-left">
                Drop your image here or click to upload.
              </p>
              <p className="text-sm sm:text-base text-left mt-1">
                Format: jpg, jpeg, png & Max file size: 5 MB
              </p>

              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Detailed Consent Checkbox */}
          {showConsent && file && !isLoading && (
            <div className="flex flex-col gap-3 mt-2">
              <label className="flex items-start text-white space-x-2 max-w-3xl">
  <input
    type="checkbox"
    checked={isConsentChecked}
    onChange={handleConsentChange}
    className="mt-1"
  />
  <span>
    I hereby consent to the collection, processing, and temporary storage of the image I upload.
    I understand that the image will be used solely for the purpose of generating a personalized article using AI technology.
    The uploaded file will not be shared with third parties and will be automatically deleted after processing is complete.
    I acknowledge that no personally identifiable information (PII) will be extracted or stored from the image,
    and I retain full rights and ownership over the original content. 
  </span>
</label>

{isConsentChecked && (
              <button
                onClick={handleStartLoading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg max-w-xs"
              >
                Start Processing Image
              </button>
)}
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>

      <Footer />
    </div>
  );
}
