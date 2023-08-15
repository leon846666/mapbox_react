import React, { Component, ReactNode, RefObject } from 'react';


interface IconComponentSheepProps {
  onClick?: () => void;
  size?: number;
  style?: React.CSSProperties;
  color?: string;
}

const SheepIcon: React.FC<IconComponentSheepProps & { innerRef: RefObject<SVGSVGElement> }> = ({ color, size, onClick, innerRef }) => {
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
        <path d="M3942 4468 c-18 -18 -14 -81 8 -129 11 -24 20 -51 19 -59 0 -8 -34
-35 -77 -59 -166 -94 -331 -212 -467 -335 -194 -175 -185 -171 -425 -170 -107
1 -431 13 -720 27 -831 42 -1040 49 -1285 45 l-230 -4 -117 -51 c-224 -97
-360 -203 -468 -365 -96 -144 -150 -267 -172 -399 -18 -103 -1 -200 63 -357
l52 -127 7 -320 c7 -365 7 -360 96 -509 32 -53 54 -101 54 -118 0 -16 -9 -64
-20 -106 -18 -71 -20 -104 -18 -368 l3 -289 24 -3 c23 -4 23 -6 18 -68 -2 -35
-1 -64 3 -64 33 0 165 32 194 47 l36 18 -25 37 c-14 20 -34 40 -46 43 -19 6
-20 12 -14 83 18 207 47 445 57 468 16 34 171 146 192 138 19 -7 17 3 61 -244
20 -107 48 -244 63 -304 l27 -109 40 -12 c39 -10 40 -12 58 -81 l19 -70 51 6
c59 8 107 28 107 45 0 27 -23 76 -41 86 -10 5 -19 20 -19 32 0 12 -13 88 -30
168 -26 130 -29 167 -31 355 -2 176 0 216 14 253 25 64 64 110 111 132 53 24
99 24 171 -1 72 -25 274 -64 441 -86 192 -26 627 -26 790 0 67 10 133 16 147
12 37 -9 153 -132 184 -194 30 -61 29 -91 -13 -288 -14 -65 -28 -173 -31 -240
l-6 -121 30 -11 c29 -9 31 -14 35 -71 2 -33 7 -63 10 -66 3 -3 31 -11 62 -17
61 -13 87 -5 145 43 l23 19 -42 90 -43 89 6 98 c10 166 76 406 128 461 23 25
78 56 86 48 7 -7 22 -351 23 -522 0 -138 3 -147 51 -176 14 -9 36 -37 48 -62
l21 -46 105 0 c120 0 114 -6 88 98 -12 48 -29 83 -61 123 l-44 57 11 113 c6
63 15 177 21 254 15 218 40 277 137 326 62 31 183 111 227 149 44 39 143 184
191 280 73 144 164 396 209 577 45 176 58 258 75 464 10 122 27 162 72 178 57
20 62 19 319 -65 136 -44 166 -44 220 1 23 19 59 39 81 45 42 12 77 42 85 76
9 35 -23 141 -58 192 -122 180 -316 403 -437 505 -130 108 -300 185 -387 175
-33 -4 -34 -2 -50 46 -12 36 -33 66 -73 105 -88 85 -139 109 -169 79z"/>
      </g>
    </svg>
  );
}

class IconComponentSheep extends Component<IconComponentSheepProps> {
  svgRef = React.createRef<SVGSVGElement>();

  getSVGData = (): string | null => {
    return this.svgRef.current ? this.svgRef.current.outerHTML : null;
  };

  render(): ReactNode {
    const { onClick, size = 52, color = 'black' } = this.props;

    return (
      <SheepIcon innerRef={this.svgRef} color={color} size={size} onClick={onClick} />
    );
  }

  componentDidUpdate(prevProps: IconComponentSheepProps) {
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
export default IconComponentSheep;
