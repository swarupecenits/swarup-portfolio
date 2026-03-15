import React, { Suspense } from "react";
import Spline from "@splinetool/react-spline";

const NotFoundPage = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#050505' }}>
      <Suspense fallback={<div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Loading Error Page...</div>}>
        <Spline scene="/assets/404.spline" style={{ height: "100vh", width: "100%" }} />
      </Suspense>
    </div>
  );
};

export default NotFoundPage;
