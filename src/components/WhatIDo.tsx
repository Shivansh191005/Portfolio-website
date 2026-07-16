import React, { useEffect, useRef } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";
import { MdArrowOutward } from "react-icons/md";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }
    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Set CSS variables for the flashlight effect
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            &nbsp;I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      
      <div className="what-box">
        <div className="what-box-in">
          {/* Card 1 */}
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 0)}
            onMouseMove={handleMouseMove}
          >
            <div className="what-content-in">
              <div className="what-header-flex">
                <h3>{config.skills.develop.title}</h3>
                <div className="what-arrow-modern">
                  <MdArrowOutward />
                </div>
              </div>
              <h4>{config.skills.develop.description}</h4>
              <p>{config.skills.develop.details}</p>
              
              <div className="what-tags-container">
                <h5>Skillset & tools</h5>
                <div className="what-content-flex">
                  {config.skills.develop.tools.map((tool, index) => (
                    <div key={index} className="what-tags">{tool}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="what-content what-noTouch"
            ref={(el) => setRef(el, 1)}
            onMouseMove={handleMouseMove}
          >
            <div className="what-content-in">
              <div className="what-header-flex">
                <h3>{config.skills.design.title}</h3>
                <div className="what-arrow-modern">
                  <MdArrowOutward />
                </div>
              </div>
              <h4>{config.skills.design.description}</h4>
              <p>{config.skills.design.details}</p>
              
              <div className="what-tags-container">
                <h5>Skillset & tools</h5>
                <div className="what-content-flex">
                  {config.skills.design.tools.map((tool, index) => (
                    <div key={index} className="what-tags">{tool}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
