import { useNavigate } from "react-router-dom"

export default function Header() {
  const navigate = useNavigate()

  const handleNavigate = () => {
    navigate('/')
  }

  return (
    <header>
      <img 
        src="/images/logo.png" 
        alt="logo"
        className="w-[350px] h-[100px] ml-10 cursor-pointer" 
        onClick={handleNavigate}
      />
    </header>
  )
}