import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// 샌드박스 헤드리스 브라우저는 외부 폰트 CDN 접속이 차단되므로
// public/fonts 에 받아둔 woff2 파일을 로컬에서 직접 로드한다.

export const playfair = "Playfair Display";
export const notoKR = "Noto Sans KR";

loadFont({ family: playfair, url: staticFile("fonts/playfair-400.woff2"), weight: "400" });
loadFont({ family: playfair, url: staticFile("fonts/playfair-600.woff2"), weight: "600" });
loadFont({
  family: playfair,
  url: staticFile("fonts/playfair-600i.woff2"),
  weight: "600",
  style: "italic",
});

loadFont({ family: notoKR, url: staticFile("fonts/noto-kr-300.woff2"), weight: "300" });
loadFont({ family: notoKR, url: staticFile("fonts/noto-kr-400.woff2"), weight: "400" });
loadFont({ family: notoKR, url: staticFile("fonts/noto-kr-500.woff2"), weight: "500" });
loadFont({ family: notoKR, url: staticFile("fonts/noto-kr-700.woff2"), weight: "700" });
