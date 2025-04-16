import { useState } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilePdf } from "@fortawesome/free-solid-svg-icons"

export default function ArticlePage() {
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("") // State to hold file name

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0]
    const validFormats = ["image/jpeg", "image/jpg", "image/png"]
    const maxSize = 10 * 1024 * 1024 // 10 MB

    if (uploadedFile) {
      if (!validFormats.includes(uploadedFile.type)) {
        setError("Invalid file format. Please upload a JPG, JPEG, or PNG file.")
        setFile(null)
        setFileName("")
        return
      }

      if (uploadedFile.size > maxSize) {
        setError("File size exceeds 10 MB. Please upload a smaller file.")
        setFile(null)
        setFileName("")
        return
      }

      setError("")
      setFile(uploadedFile)
      setFileName(uploadedFile.name)
    }
  }

  return (
    <div className="landing-container bg-white min-h-screen">
      <Header />

      <div className="content-container max-w-2xl mx-auto py-10 px-4">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Article or post title
        </h1>

        {/* Subheading */}
        <p className="text-gray-600 text-base mb-6 text-center">
          Subheading that sets up context, shares more info about the author, or generally gets people psyched to keep reading
        </p>

        {/* Image */}
        <div className="article_image mb-8 -mx-8">
          <img
            src="/images/image_1.png"
            alt="Post visual"
            className="w-full h-[500px] object-cover rounded-md"
          />
        </div>

        {/* Body Text */}
        <div className="flex flex-col items-center text-gray-700 text-base space-y-6">
          <p className="text-left max-w-xl">
            Body text for your whole article or post. We’ll put in some lorem ipsum to show how a filled-out page might look:
          </p>

          <p className="text-left max-w-xl">
            Excepteur efficient emerging, minim veniam anim aute carefully curated Ginza conversation exquisite perfect nostrud nisi intricate Content. Qui international first-class nulla ut. Punctual adipisicing, essential lovely queen tempor eiusmod irure. Exclusive izakaya charming Scandinavian impeccable aute quality of life soft power pariatur Melbourne occaecat discerning. Qui wardrobe aliquip, et Porter destination Toto remarkable officia Helsinki excepteur Basset hound. Zürich sleepy perfect consectetur.
          </p>

          <p className="text-left max-w-xl">
            Exquisite sophisticated iconic cutting-edge laborum deserunt Addis Ababa esse bureaux cupidatat id minim. Sharp classic the best commodo nostrud delightful. Conversation aute Rochester id. Qui sunt remarkable deserunt intricate airport handsome K-pop excepteur classic esse Asia-Pacific laboris.
          </p>
        </div>

        {/* Download Button */}
        <div className="mt-10 flex justify-center">
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full text-sm font-medium transition flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faFilePdf} />
            Download
          </button>
        </div>
        
      </div>

      {/* Footer with Dark Background Overlay */}
      <footer
        className="relative bg-gray-100 py-8 mt-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/pixel-bg_1.png')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

        {/* Footer Content */}
        <div className="relative z-10 pl-10 p-4 rounded-md">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">
            Let the pixels speak again.
          </h1>
          <h3 className="text-lg text-gray-300 mb-6">
            Upload another image to generate a new story.
          </h3>

          <div className="upload-file flex justify-start">
            <label className="bg-[#113f67cc] border-2 border-dashed border-white text-white rounded-lg p-6 max-w-md w-full">
              <p className="text-xl font-medium mb-2">
                Drop your image here or click to upload.
              </p>
              <p className="text-sm">
                Format: jpg, jpeg, png • Max file size: 10 MB
              </p>
              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                onChange={handleFileChange}
                className="mt-4 p-2 bg-white text-black rounded-md border border-gray-300 w-full opacity-0 cursor-pointer"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {fileName && <p className="text-white mt-2">Selected file: {fileName}</p>}
            </label>

          </div>
          
          
      </div>
          
      </footer>
      <Footer />
  </div>
  
  )
}
