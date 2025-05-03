import { useNavigate } from "react-router-dom"

export default function Header() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/');
  };

  return (
    <header className="w-full px-4 sm:px-6 md:px-8">
      <img 
        src="/images/logo.png" 
        alt="logo"
        className="w-[200px] sm:w-[250px] md:w-[300px] h-auto ml-0 sm:ml-4 md:ml-10 cursor-pointer" 
        onClick={handleNavigate}
      />
    </header>
  );
}
