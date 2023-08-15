import React, { Component, ReactNode, RefObject } from 'react';


interface IconComponentCowProps {
  onClick?: () => void;
  size?: number;
  style?: React.CSSProperties;
  color?: string;

}

const CowIcon: React.FC<IconComponentCowProps & { innerRef: RefObject<SVGSVGElement> }> = ({ color, size, onClick, innerRef }) => {
  return (
    <svg
      ref={innerRef}
      stroke={color}
      fill={color}
      strokeWidth='0'
      width={size} height={size}
      viewBox="0 0 496 512"
      style={{ color, cursor: 'pointer' }}
      onClick={onClick}
    >

      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
        fill={color} stroke="none">
        <path d="M4532 4194 l-142 -104 -177 0 -176 0 -114 70 c-62 38 -119 68 -125
      66 -7 -3 -25 -7 -40 -10 -25 -6 -28 -11 -28 -46 0 -35 8 -49 73 -122 l73 -83
      -10 -42 c-7 -34 -13 -43 -30 -43 -12 0 -390 -40 -841 -88 l-820 -89 -862 25
      -862 24 -92 -38 c-88 -36 -94 -41 -156 -118 -36 -45 -69 -90 -74 -101 -22 -54
      -72 -393 -79 -545 -5 -91 -18 -226 -30 -300 -17 -112 -20 -158 -14 -265 4 -76
      11 -133 18 -137 22 -15 42 -7 74 32 27 32 37 61 61 166 l29 126 -24 176 c-21
      159 -23 194 -10 181 2 -2 28 -125 58 -274 l54 -270 -37 -232 -37 -233 37 -520
      37 -520 29 -30 29 -30 148 0 c142 0 238 12 238 31 0 5 -54 96 -120 203 -66
      106 -122 201 -126 209 -3 9 23 136 58 282 l63 266 34 -3 34 -3 118 -354 c102
      -306 125 -365 171 -439 30 -48 70 -97 92 -113 l39 -29 157 0 c154 0 157 0 180
      25 13 14 20 28 17 31 -4 4 -66 43 -139 88 l-132 81 -94 289 -94 289 23 49 c24
      51 30 53 101 42 35 -6 37 -9 68 -90 37 -94 29 -96 94 13 21 35 39 63 41 63 3
      0 25 -36 51 -81 l47 -80 41 91 41 91 124 94 c68 52 128 95 133 95 6 0 199 18
      431 40 231 22 423 37 427 33 3 -5 36 -44 72 -88 l65 -80 62 -433 c58 -403 64
      -438 94 -498 l31 -64 147 0 c145 0 147 0 163 25 16 24 15 27 -73 148 l-88 123
      -7 145 c-3 79 -9 186 -12 237 l-6 94 49 -25 49 -25 72 -224 c39 -122 92 -286
      116 -362 59 -188 56 -186 234 -186 l132 0 11 27 c9 24 6 31 -30 67 -26 27 -80
      121 -162 280 l-122 239 27 251 c31 291 8 246 194 381 l110 80 205 379 204 378
      234 108 234 109 213 24 c160 18 217 28 231 41 10 9 33 56 50 105 30 82 31 90
      17 122 -8 20 -132 157 -291 323 l-276 288 120 76 120 76 7 52 c3 29 3 57 -1
      63 -3 6 -30 11 -58 10 -50 0 -58 -5 -195 -105z"/>
      </g>
    </svg>
  );
}

class IconComponentCow extends Component<IconComponentCowProps> {
  svgRef = React.createRef<SVGSVGElement>();

  getSVGData = (): string | null => {
    return this.svgRef.current ? this.svgRef.current.outerHTML : null;
  };

  render(): ReactNode {
    const { onClick, size = 52, color = 'black' } = this.props;

    return (
      <CowIcon innerRef={this.svgRef} color={color} size={size} onClick={onClick} />
    );
  }

  componentDidUpdate(prevProps: IconComponentCowProps) {
    console.log("this.props.color", this.props.color)
    if (prevProps.color !== this.props.color && this.svgRef.current) {
      const myString: string | undefined = this.props.color;
      const validString = myString || "";
      console.log("old", this.svgRef)
      this.svgRef.current.setAttribute("stroke", validString);
      this.svgRef.current.setAttribute("fill", validString);
      console.log("new", this.svgRef)

    }
  }
}

export default IconComponentCow;
