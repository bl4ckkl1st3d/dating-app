import React from 'react';
import SignupForm from '../components/SignupForm';
import image6 from '../img/6.jpg';
import image7 from '../img/7.jpg';
import image8 from '../img/8.jpg';
import image9 from '../img/9.jpg';
import image10 from '../img/10.jpg';
import image4 from '../img/4.jpg';
import image5 from '../img/5.jpg';
import image3 from '../img/3.jpg';
const Signup: React.FC = () => {
  return (
    <div className="relative h-screen w-full">
      {/* -------------------- TOP (60%) -------------------- */}
      <div className="h-[60%] grid grid-cols-3">
        <div className="relative bg-cover bg-center" style={{ backgroundImage: `url(${image4})` }}></div><div className="absolute inset-0 bg-black/50"></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${image5})` }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${image3})` }}></div>
      </div>

      {/* -------------------- BOTTOM (40%) -------------------- */}
      <div className="h-[40%] grid grid-cols-5">
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${image10})`}}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${image7})` }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${image6})` }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${image9})` }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: `url(${image8})` }}></div>
      </div>

      {/* -------------------- CENTERED FORM -------------------- */}
      <div className="absolute inset-0 flex items-center justify-center px-4">
  <div className="w-full max-w-sm md:max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
    <SignupForm />
  </div>
</div>
    </div>
  );
};

export default Signup;
