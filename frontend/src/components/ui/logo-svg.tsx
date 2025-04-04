type HeartLogoProps = {
  className?: string;
  size?: number;
};

export function LogoSVG({ className = "", size = 80 }: HeartLogoProps) {
  return (
    <div
      className={`${className} relative`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 38 47"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_i_1_19)">
          <path
            d="M16.2088 3.28166C17.672 1.56136 20.328 1.56135 21.7912 3.28166L27.541 10.0418C27.6687 10.1918 27.8082 10.3314 27.9582 10.459L34.7183 16.2088C36.4386 17.672 36.4386 20.328 34.7183 21.7912L27.9582 27.541C27.8082 27.6687 27.6687 27.8082 27.541 27.9582L21.7912 34.7183C20.328 36.4386 17.672 36.4386 16.2088 34.7183L10.459 27.9582C10.3314 27.8082 10.1918 27.6687 10.0418 27.541L3.28166 21.7912C1.56136 20.328 1.56135 17.672 3.28166 16.2088L10.0418 10.459C10.1918 10.3314 10.3314 10.1918 10.459 10.0418L16.2088 3.28166Z"
            fill="url(#paint0_linear_1_19)"
          />
        </g>
        <g filter="url(#filter1_i_1_19)">
          <path
            d="M16.5404 13.4131C17.5151 11.3245 20.4849 11.3245 21.4596 13.413L24.6284 20.2028C24.898 20.7805 25.3624 21.2449 25.9401 21.5145L32.7298 24.6832C34.8183 25.658 34.8183 28.6278 32.7298 29.6025L25.9401 32.7712C25.3624 33.0409 24.898 33.5052 24.6284 34.0829L21.4596 40.8727C20.4849 42.9612 17.5151 42.9612 16.5404 40.8727L13.3716 34.0829C13.102 33.5052 12.6376 33.0409 12.0599 32.7712L5.2702 29.6025C3.18169 28.6278 3.18168 25.658 5.27019 24.6832L12.0599 21.5145C12.6376 21.2449 13.102 20.7805 13.3716 20.2028L16.5404 13.4131Z"
            fill="url(#paint1_linear_1_19)"
          />
        </g>
        <defs>
          <filter
            id="filter0_i_1_19"
            x="1.99143"
            y="1.99143"
            width="34.0171"
            height="39.4457"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="5.42857" />
            <feGaussianBlur stdDeviation="2.71429" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_1_19"
            />
          </filter>
          <filter
            id="filter1_i_1_19"
            x="3.70381"
            y="11.8467"
            width="30.5924"
            height="36.0209"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="5.42857" />
            <feGaussianBlur stdDeviation="2.71429" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_1_19"
            />
          </filter>
          <linearGradient
            id="paint0_linear_1_19"
            x1="19"
            y1="0"
            x2="19"
            y2="38"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1290FF" />
            <stop offset="1" stopColor="#1236FF" />
          </linearGradient>
          <linearGradient
            id="paint1_linear_1_19"
            x1="19"
            y1="8.14286"
            x2="19"
            y2="46.1429"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1290FF" />
            <stop offset="1" stopColor="#1236FF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
