import React from 'react';
import SignupForm from '../components/SignupForm';

const Signup: React.FC = () => {
  return (
    <div className="relative h-screen w-full">
      {/* -------------------- TOP (60%) -------------------- */}
      <div className="h-[60%] grid grid-cols-3">
        <div className="relative bg-cover bg-center" style={{ backgroundImage: "url('/src/img/4.jpg')" }}></div><div className="absolute inset-0 bg-black/50"></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/src/img/5.jpg')" }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/src/img/3.jpg')" }}></div>
      </div>

      {/* -------------------- BOTTOM (40%) -------------------- */}
      <div className="h-[40%] grid grid-cols-5">
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/src/img/10.jpg')" }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/src/img/7.jpg')" }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/src/img/6.jpg')" }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/src/img/9.jpg')" }}></div>
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/src/img/8.jpg')" }}></div>
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
