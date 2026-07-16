import "./styles/Certifications.css";
import { config } from "../config";
import { MdArrowOutward } from "react-icons/md";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const Certifications = () => {
  const [stars, setStars] = useState<{left: string, top: string, delay: string, duration: string}[]>([]);

  useEffect(() => {
    // Generate random positions and timings for the starfield
    const generatedStars = Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${15 + Math.random() * 20}s`
    }));
    setStars(generatedStars);

    const certTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".cert-section",
        start: "top 70%",
        end: "bottom center",
        toggleActions: "play none none reverse",
      },
    });

    certTimeline.fromTo(
      ".cert-card",
      { opacity: 0, y: 150, scale: 0.9 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        duration: 1.2, 
        stagger: 0.2, 
        ease: "expo.out" 
      }
    );

    return () => {
      certTimeline.kill();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set CSS variables for the flashlight effect
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleMagnetMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Move the button slightly towards the cursor
    btn.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
  };

  const handleMagnetLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const btn = e.currentTarget;
    btn.style.transform = `translate(0px, 0px)`;
  };

  return (
    <div className="cert-section" id="certifications">
      <div className="cert-ambient-bg">
        {stars.map((star, i) => (
          <div 
            key={i} 
            className="cert-star"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration
            }}
          ></div>
        ))}
      </div>
      
      <h2>
        My <span>Certifications</span>
      </h2>
      <div className="cert-container" id="cert-cards">
        {config.certifications.map((cert, index) => (
          <a 
            key={index} 
            href={cert.link}
            target="_blank" 
            rel="noopener noreferrer"
            className={`cert-card ${index === 1 ? 'cert-staggered' : ''}`}
            data-cursor="disable"
            onMouseMove={handleMouseMove}
          >
            <div className="cert-bg-number">0{index + 1}</div>
            
            <div className="cert-content">
              <div className="cert-header">
                <span className="cert-issuer">{cert.issuer}</span>
              </div>
              <h3 className="cert-title">{cert.title}</h3>
              <p className="cert-description">{cert.description}</p>
            </div>
            
            <div className="cert-footer">
              <div 
                className="cert-btn"
                onMouseMove={handleMagnetMove}
                onMouseLeave={handleMagnetLeave}
                style={{ transition: 'transform 0.1s ease-out' }}
              >
                <span>Certificate</span>
                <MdArrowOutward className="cert-icon" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Certifications;
