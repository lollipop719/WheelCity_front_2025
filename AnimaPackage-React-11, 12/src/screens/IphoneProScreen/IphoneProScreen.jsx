import React from "react";
import { Link } from "react-router-dom";

export const IphoneProScreen = () => {
  const galleryImages = [
    {
      id: 1,
      src: "/img/image-4-1.png",
      alt: "Store front view",
      className: "absolute top-px left-0 w-[225px] h-[147px] aspect-[1.53]",
    },
    {
      id: 2,
      src: "/img/image-6-1.png",
      alt: "Store interior",
      className:
        "absolute top-0 left-[229px] w-[125px] h-[150px] aspect-[0.83] object-cover",
    },
    {
      id: 3,
      src: "/img/image-7-1.png",
      alt: "Store entrance",
      className:
        "absolute top-px left-[358px] w-[212px] h-[150px] aspect-[1.42]",
    },
  ];

  const accessibilityFeatures = [
    { id: 1, icon: "🚪", text: "입구 폭이 넉넉해요" },
    { id: 2, icon: "🛗", text: "장애인용 엘레베이터가 있어요" },
    { id: 3, icon: "♿", text: "휠체어가 편하게 들어갈 만큼 폭이 넓어요" },
  ];

  const navigationTabs = [
    { id: 1, label: "홈", path: null, isActive: false },
    { id: 2, label: "사진", path: "/iphone-16-pro-u45-11", isActive: false },
    { id: 3, label: "리뷰", path: null, isActive: true },
    { id: 4, label: "블로그", path: null, isActive: false },
  ];

  return (
    <div
      className="bg-white overflow-hidden w-full min-w-[402px] h-[874px] relative"
      data-model-id="180:1388"
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
          aria-label="Voice search"
        >
          <img
            className="w-full h-full aspect-[1] object-cover"
            alt="Voice search icon"
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
          <h1 className="absolute top-[117px] left-[23px] font-semibold text-black text-lg [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            트레이더스 홀세일클럽 월평점
          </h1>

          <div className="absolute top-[142px] left-[23px] w-[143px] h-[21px] flex gap-[3px]">
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

          <div
            className="flex w-[354px] items-center gap-[3px] absolute top-[174px] left-[23px] overflow-hidden overflow-x-scroll"
            role="region"
            aria-label="Store image gallery"
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
          </div>

          <div className="absolute top-[335px] left-[23px] flex items-center gap-[3px]">
            <img
              className="w-4 h-5"
              alt="Wheelchair accessible icon"
              src="/img/physical-disability-05-1.svg"
            />
            <span className="font-medium text-[#000000b2] text-[15px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              낮은 문턱‧주차장‧화장실
            </span>
          </div>

          <div className="absolute top-[335px] left-[200px] flex items-center gap-[3px]">
            <img
              className="w-6 h-6 aspect-[1] object-cover"
              alt="Wheelchair icon"
              src="/img/image-17-1.png"
            />

            <span className="w-[5px] h-[21px] flex items-center justify-center font-medium text-[#00000099] text-[17px] text-center [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              ‧
            </span>

            <span className="font-medium text-[#77bb77] text-[15px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
              내 휠체어로 접근 가능
            </span>
          </div>
        </section>

        <nav
          className="absolute top-[372px] left-0 w-full"
          aria-label="Content navigation"
        >
          <img
            className="absolute top-0 left-px w-[401px] h-px object-cover"
            alt=""
            src="/img/line-4.svg"
          />

          <div className="absolute top-[11px] left-0 w-full flex">
            {navigationTabs.map((tab, index) => {
              const positions = [
                "left-8",
                "left-[119px]",
                "left-[222px]",
                "left-[325px]",
              ];
              const TabElement = tab.path ? Link : "div";
              const tabProps = tab.path ? { to: tab.path } : {};

              return (
                <TabElement
                  key={tab.id}
                  className={`absolute top-0 ${positions[index]} ${
                    tab.isActive ? "font-bold" : "font-normal"
                  } text-black text-[17px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal] ${
                    tab.path ? "block" : ""
                  }`}
                  {...tabProps}
                >
                  {tab.label}
                </TabElement>
              );
            })}
          </div>

          <img
            className="absolute top-[41px] left-px w-[401px] h-px object-cover"
            alt=""
            src="/img/line-4.svg"
          />
        </nav>

        <section
          className="absolute top-[437px] left-[23px]"
          aria-label="Positive features"
        >
          <h2 className="font-semibold text-black text-lg [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            이런 점이 좋았어요
          </h2>

          <ul className="mt-[36px] w-[334px] flex flex-col gap-[5px]">
            {accessibilityFeatures.map((feature) => (
              <li
                key={feature.id}
                className="font-medium text-[#000000b2] text-[17px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]"
              >
                {feature.icon} &quot;{feature.text}&quot;
              </li>
            ))}
          </ul>
        </section>

        <img
          className="absolute top-[575px] left-px w-[401px] h-px object-cover"
          alt=""
          src="/img/line-4.svg"
        />

        <article
          className="absolute top-[597px] left-[23px]"
          aria-label="User review"
        >
          <div className="flex items-center gap-[10px]">
            <img
              className="w-[30px] h-[30px] aspect-[1] object-cover rounded-full"
              alt="User profile"
              src="/img/ellipse-7.png"
            />

            <div>
              <h3 className="font-semibold text-black text-lg [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                월평동불주먹
              </h3>
              <p className="absolute top-[7px] left-[154px] font-medium text-[#00000066] text-[15px] [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
                나와 비슷한 휠체어 이용자
              </p>
            </div>
          </div>

          <img
            className="mt-[13px] w-[118px] h-[147px] aspect-[0.8] object-cover"
            alt="Review image"
            src="/img/image-33.png"
          />

          <p className="mt-[17px] font-normal text-black text-[15px] whitespace-nowrap [font-family:'Inter',Helvetica] tracking-[0] leading-[normal]">
            휠체어용 쇼핑카트가 있어서 편해요
          </p>

          <div className="mt-[7px] flex gap-[12.5px]">
            <button aria-label="Like review">
              <img
                className="w-[35.55px] h-[38px] aspect-[0.94]"
                alt="Like button"
                src="/img/image-48.png"
              />
            </button>

            <button aria-label="Dislike review">
              <img
                className="w-[35.55px] h-[38px] aspect-[0.94]"
                alt="Dislike button"
                src="/img/image-47.png"
              />
            </button>
          </div>
        </article>

        <img
          className="absolute top-[848px] left-px w-[401px] h-px object-cover"
          alt=""
          src="/img/line-4.svg"
        />
      </main>
    </div>
  );
};
