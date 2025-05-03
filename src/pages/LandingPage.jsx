import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
// import axios from "axios";

export default function LandingPage() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isConsentChecked, setIsConsentChecked] = useState(false) // State for consent checkbox
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const navigate = useNavigate()

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0]
    const validFormats = ["image/jpeg", "image/jpg", "image/png"]
    const maxSize = 10 * 1024 * 1024 // 10 MB

    if (uploadedFile) {
      if (!validFormats.includes(uploadedFile.type)) {
        setError("Invalid file format. Please upload a JPG, JPEG, or PNG file.")
        setFile(null)
        return
      }

      if (uploadedFile.size > maxSize) {
        setError("File size exceeds 10 MB. Please upload a smaller file.")
        setFile(null)
        return
      }

      setError("")
      setFile(uploadedFile)
    }
  }

  useEffect(() => {
    if (isLoading && isConsentChecked) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval)

            // Upload the image here
            const uploadImage = async () => {
              const formData = new FormData()
              formData.append("image", file)

              try {
                const response = await fetch(
                  "https://project.vrsevilla.is215.upou.io:5000/api/upload",
                  {
                    method: "POST",
                    body: formData,
                  }
                )

                if (!response.ok) {
                  throw new Error("Upload failed")
                }

                const result = await response.json()
                console.log("Upload result:", result)

                // After successful upload, navigate
                setTimeout(() => {
                  setIsLoading(false)
                  setProgress(0)
                  navigate("/article-page", {
                    state: {
                      imageUrl: URL.createObjectURL(file),
                      fromUpload: true,
                    },
                  })
                }, 500)
              } catch (error) {
                console.error("Error uploading image:", error)
                setIsLoading(false)
              }
            }

            uploadImage()

            return 100
          }

          return prevProgress + 5
        })
      }, 150)

      return () => clearInterval(interval)
    }
  }, [isLoading, navigate, file, isConsentChecked])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const getProgressText = () => {
    if (progress < 25) return "Crafting your article..."
    if (progress < 50) return "Unlocking the story..."
    if (progress < 75) return "Spilling the digital ink..."
    if (progress < 100) return "Hold tight! Your article is almost here..."
    return "Complete!"
  }

  const handleConsentChange = (event) => {
    setIsConsentChecked(event.target.checked) // Update consent state
  }

  const handleStartLoading = () => {
    if (isConsentChecked && file) {
      setIsLoading(true) // Start the loading process after consent is given
    }
  }

  return (
    <div className="landing-container min-h-screen flex flex-col font-inter">
      <Header />

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

      <div
        className="relative flex-1 bg-gray-100 bg-cover bg-center mt-2.5"
        style={{ backgroundImage: "url('/images/background-landing_1.png')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

        <div className="relative z-10 ml-4 sm:ml-8 md:ml-16 pl-2 sm:pl-4 md:pl-6 p-4 rounded-md h-full flex flex-col justify-between">
          <div className="mt-[35px] sm:mt-[45px] md:mt-[65px] text-left">
            <h1 className="text-4xl sm:text-5xl md:text-[70px] font-[600] leading-[100%] tracking-[0.02em] text-white mb-4 font-inconsolata [text-shadow:_2px_2px_6px_rgba(0,0,0,0.4)]">
              Unlock the story in every pixel.
            </h1>
            <p className="text-3xl text-white mb-1 font-thin tracking-[0.065em]">
              Upload a photo and let AI uncover the story behind it — one pixel
              at a time.
            </p>
            <p className="text-xl sm:text-xl md:text-2xl text-white mb-12 sm:mb-18 md:mb-22 font-thin tracking-[0.07em]">
              Drop your image here or click to upload.
            </p>
          </div>

          <div className="upload-file flex justify-start w-full mb-4 sm:mb-6 md:mb-8 mt-[18px]">
            <label
              className={`relative bg-[#113f67cc] text-white py-2 px-4 w-full sm:max-w-[44rem] cursor-pointer
                ${
                  windowWidth === 375
                    ? "rounded-lg border border-dashed border-white border-opacity-80 [border-style:dashed] [border-width:1px] [border-spacing:2px]"
                    : "rounded-2xl border-2 border-dashed border-white border-opacity-90 [border-style:dashed] [border-width:2px] [border-spacing:4px]"
                }`}
              style={{
                borderStyle: "dashed",
                borderWidth: windowWidth === 375 ? "1px" : "2px",
                borderColor: "white",
                backgroundClip: "padding-box",
              }}
            >
              <p className="text-xl sm:text-2xl md:text-[30px] font-medium mb-0.5 font-[100] tracking-[0.06em] text-left">
                Drop your image here or click to upload.
              </p>
              <p className="text-sm sm:text-base text-left mt-1">
                Format: jpg, jpeg, png & Max file size: 10 MB
              </p>

              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              />

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </label>
          </div>
          {/* Detailed Consent Checkbox */}
          {file && !isLoading && (
            <label className="flex items-start text-white space-x-2 mt-4 max-w-3xl">
              <input
                type="checkbox"
                checked={isConsentChecked}
                onChange={handleConsentChange}
                className="mt-1"
              />
              <span>
                I hereby consent to the collection, processing, and temporary
                storage of the image I upload. I understand that the image will
                be used solely for the purpose of generating a personalized
                article using AI technology. The uploaded file will not be
                shared with third parties and will be automatically deleted
                after processing is complete. I acknowledge that no personally
                identifiable information (PII) will be extracted or stored from
                the image, and I retain full rights and ownership over the
                original content.
              </span>
            </label>
          )}

          {/* Button to start loading if consent is given */}
          {file && isConsentChecked && !isLoading && (
            <button
              onClick={handleStartLoading}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-lg font-medium flex items-center justify-center gap-3 max-w-xs"
            >
              Start Processing Image
            </button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
