import React from "react";
import { Link } from "react-router-dom";

export const IphonePro = () => {
  const galleryImages = [
    {
      id: 1,
      src: "/img/image-4-1.png",
      alt: "Store front view",
      className: "absolute top-px left-0 w-[225px] h-[147px] aspect-[1.53]",
    },
    {
      id: 2,
      src: "/img/image-6.png",
      alt: "Store interior",
      className:
        "absolute top-0 left-[229px] w-[125px] h-[150px] aspect-[0.83] object-cover",
    },
    {
      id: 3,
      src: "/img/image-7-1.png",
      alt: "Store parking area",
      className:
        "absolute top-px left-[358px] w-[212px] h-[150px] aspect-[1.42]",
    },
  ];

  const navigationTabs = [
    { id: 1, label: "홈", position: "left-8", isBold: false, link: null },
    {
      id: 2,
      label: "사진",
      position: "left-[119px]",
      isBold: true,
      link: null,
    },
    {
      id: 3,
      label: "리뷰",
      position: "left-[222px]",
      isBold: false,
      link: "/iphone-16-pro-u45-12",
    },
    {
      id: 4,
      label: "블로그",
      position: "left-[325px]",
      isBold: false,
      link: null,
    },
  ];

  const accessibilityFeatures = [
    {
      id: 1,
      text: "낮은 문턱‧주차장‧화장실",
      color: "text-[#000000b2]",
      left: "left-[46px]",
    },
    {
      id: 2,
      text: "내 휠체어로 접근 가능",
      color: "text-[#77bb77]",
      left: "left-[238px]",
    },
  ];

  return (
    <div
      className="bg-white overflow-hidden w-full min-w-[402px] h-[874px] relative"
      data-model-id="180:1345"
    >
      <img
        className="absolute top-0 left-0 w-[402px] h-[810px] aspect-[2.39] object-cover"
        alt="Background image"
        src="/img/image-27-1.png"
      />

      <header className="absolute top-0 left-[calc(50.00%_-_201px)] w-[404px] h-28">
        <div className="top-0 left-[calc(50.00%_-_202px)] h-28 absolute w-[402px] bg-white shadow-[0px_4px_4px_#00000040]" />

        <button
          className="absolute top-[75px] left-[368px] w-3.5 h-[21px] flex items-center justify-center font-light text-[#00000099] text-[27px] whitespace-nowrap [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]"
          aria-label="Close"
        >
          ×
        </button>

        <button
          className="absolute top-[71px] left-[327px] w-[34px] h-[34px]"
          aria-label="Share"
        >
          <img
            className="w-full h-full aspect-[1] object-cover"
            alt="Share icon"
            src="/img/image-26-1.png"
          />
        </button>

        <button
          className="absolute top-[76px] left-[18px] w-[19px] h-[19px]"
          aria-label="Back"
        >
          <img
            className="w-full h-full aspect-[1] object-cover"
            alt="Back arrow"
            src="/img/image-25-1.png"
          />
        </button>
      </header>

      <main className="top-[105px] left-0 h-[792px] rounded-[10px] absolute w-[402px] bg-white shadow-[0px_4px_4px_#00000040]">
        <section aria-label="Store information">
          <h1 className="absolute top-[12px] left-[23px] font-semibold text-black text-lg [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            트레이더스 홀세일클럽 월평점
          </h1>

          <div className="absolute top-[37px] left-[23px] w-[143px] h-[21px] flex gap-[3px]">
            <span className="mt-[3px] w-14 h-[18px] font-normal text-[#00000066] text-[15px] whitespace-nowrap [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              대형마트
            </span>

            <span className="flex items-center justify-center w-[5px] h-[21px] font-medium text-[#00000099] text-[17px] text-center [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              ‧
            </span>

            <span className="mt-[3px] w-[70px] h-[18px] font-normal text-black text-[15px] whitespace-nowrap [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              리뷰 999+
            </span>
          </div>
        </section>

        <section
          className="flex items-center gap-[3px] top-[69px] overflow-hidden overflow-x-scroll w-[354px] absolute left-[23px]"
          aria-label="Photo gallery"
        >
          <div className="relative w-[569.64px] h-[150px]">
            {galleryImages.map((image) => (
              <img
                key={image.id}
                className={image.className}
                alt={image.alt}
                src={image.src}
              />
            ))}
          </div>
        </section>

        <section
          className="absolute top-[231px] left-[23px] w-[354px]"
          aria-label="Accessibility information"
        >
          <img
            className="absolute w-[3.98%] h-[2.29%] top-[38.67%] left-[5.97%]"
            alt="Physical disability icon"
            src="/img/physical-disability-05-1.svg"
          />

          <span className="absolute top-[234px] left-[23px] w-[255px] font-medium text-[#000000b2] text-[15px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            낮은 문턱‧주차장‧화장실
          </span>

          <img
            className="absolute top-[231px] left-[178px] w-6 h-6 aspect-[1] object-cover"
            alt="Checkmark icon"
            src="/img/image-17-1.png"
          />

          <span className="absolute top-[231px] left-[206px] w-[5px] h-[21px] flex items-center justify-center font-medium text-[#00000099] text-[17px] text-center [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            ‧
          </span>

          <span className="absolute top-[234px] left-[215px] w-[255px] font-medium text-[#77bb77] text-[15px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            내 휠체어로 접근 가능
          </span>
        </section>

        <nav
          className="absolute top-[267px] left-0 w-full"
          aria-label="Main navigation"
        >
          <img
            className="absolute top-0 left-px w-[401px] h-px object-cover"
            alt=""
            src="/img/line-4.svg"
          />

          <div className="absolute top-[11px] left-0 w-full flex">
            {navigationTabs.map((tab) =>
              tab.link ? (
                <Link
                  key={tab.id}
                  className={`absolute top-0 ${tab.position} ${tab.isBold ? "font-bold" : "font-normal"} text-black text-[17px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal] block`}
                  to={tab.link}
                >
                  {tab.label}
                </Link>
              ) : (
                <span
                  key={tab.id}
                  className={`absolute top-0 ${tab.position} ${tab.isBold ? "font-bold" : "font-normal"} text-black text-[17px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]`}
                >
                  {tab.label}
                </span>
              ),
            )}
          </div>

          <img
            className="absolute top-[41px] left-px w-[401px] h-px object-cover"
            alt=""
            src="/img/line-4.svg"
          />
        </nav>

        <section
          className="absolute top-[323px] left-[23px] w-[354px] h-[446px]"
          aria-label="Photo grid"
        >
          <img
            className="w-full h-full"
            alt="Photo grid layout"
            src="/img/frame-38.svg"
          />
        </section>
      </main>
    </div>
  );
};
