/**
 * 이미지에서 대표 색상을 자동 추출하는 유틸
 * Canvas API를 이용해 픽셀을 샘플링하고 k-means 클러스터링으로 주요 색상 추출
 */

interface RGB { r: number; g: number; b: number; }

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function isGray(rgb: RGB, threshold = 30): boolean {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  return max - min < threshold;
}

function isTooLight(rgb: RGB): boolean {
  return (rgb.r + rgb.g + rgb.b) / 3 > 230;
}

function isTooDAark(rgb: RGB): boolean {
  return (rgb.r + rgb.g + rgb.b) / 3 < 25;
}

export async function extractDominantColors(
  imageUrl: string,
  count = 5
): Promise<string[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = 100; // 리사이즈해서 처리
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size).data;

        // 픽셀 샘플링
        const pixels: RGB[] = [];
        for (let i = 0; i < imageData.length; i += 4 * 3) { // 3픽셀마다 1개 샘플
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const rgb = { r, g, b };
          if (!isTooLight(rgb) && !isTooDAark(rgb) && !isGray(rgb)) {
            pixels.push(rgb);
          }
        }

        if (pixels.length === 0) {
          resolve([]);
          return;
        }

        // 간단한 클러스터링: 랜덤 초기 중심 선택 후 반복
        const k = Math.min(count, pixels.length);
        let centers: RGB[] = pixels
          .sort(() => Math.random() - 0.5)
          .slice(0, k);

        for (let iter = 0; iter < 10; iter++) {
          const clusters: RGB[][] = Array.from({ length: k }, () => []);
          for (const pixel of pixels) {
            let minDist = Infinity;
            let nearest = 0;
            for (let j = 0; j < k; j++) {
              const d = colorDistance(pixel, centers[j]);
              if (d < minDist) { minDist = d; nearest = j; }
            }
            clusters[nearest].push(pixel);
          }
          centers = clusters.map((cluster) => {
            if (cluster.length === 0) return centers[0];
            const r = Math.round(cluster.reduce((s, p) => s + p.r, 0) / cluster.length);
            const g = Math.round(cluster.reduce((s, p) => s + p.g, 0) / cluster.length);
            const b = Math.round(cluster.reduce((s, p) => s + p.b, 0) / cluster.length);
            return { r, g, b };
          });
        }

        // 중복 제거 및 상위 색상 반환
        const colors = centers
          .filter(c => !isGray(c, 20))
          .map(c => rgbToHex(c.r, c.g, c.b));

        resolve([...new Set(colors)].slice(0, count));
      } catch (e) {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}

export function extractColorsFromFile(file: File, count = 5): Promise<string[]> {
  const url = URL.createObjectURL(file);
  return extractDominantColors(url, count).finally(() => URL.revokeObjectURL(url));
}
