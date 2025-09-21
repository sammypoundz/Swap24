import { useState } from "react";
import lockImg1 from "./assets/amico.svg";
import lockImg2 from "./assets/bro.svg";
import lockImg3 from "./assets/Compass 2 Streamline Cyber Duotone - Free.svg";

interface Slide {
  image: string;
  title: string;
  text: string;
}

interface OnboardingCarouselProps {
  onFinish: () => void; // 👈 prop to move to signup
}

const slides: Slide[] = [
  {
    image: lockImg1,
    title: "Secure USDT Trading",
    text: "Trade with confidence knowing your assets are protected by top-tier security measures.",
  },
  {
    image: lockImg2,
    title: "Transparent Marketplace",
    text: "Experience fair and clear trading with real-time data and honest pricing.",
  },
  {
    image: lockImg3,
    title: "Easy Navigation",
    text: "Enjoy a seamless trading journey with an intuitive interface designed for everyone.",
  },
];

export default function OnboardingCarousel({ onFinish }: OnboardingCarouselProps) {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      onFinish(); // 👈 call parent to go to signup
    }
  };

  return (
    <div className="onboarding">
      {/* Progress Dots */}
      <div className="progress">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`dot ${idx === current ? "active" : ""}`}
          ></div>
        ))}
      </div>

      {/* Slide Image */}
      <img
        src={slides[current].image}
        alt={slides[current].title}
        className={`onboarding-img ${current === 0 ? "first-img" : ""}`}
      />

      {/* Text + Button */}
      <div className="SlideContWrap">
        <div className="SlidetextWrap">
          <h2>{slides[current].title}</h2>
          <p>{slides[current].text}</p>
        </div>

        <button className="onboarding-btn" onClick={nextSlide}>
          {current === slides.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
