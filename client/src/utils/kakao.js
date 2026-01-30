// client/src/utils/kakao.js
// Utility to wait until Kakao Maps SDK is available on window.kakao

export function waitForKakao(timeout = 10000) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined")
      return reject(new Error("No window object"));

    if (window.kakao && window.kakao.maps) {
      return resolve(window.kakao);
    }

    const interval = 100;
    let elapsed = 0;
    const timer = setInterval(() => {
      if (window.kakao && window.kakao.maps) {
        clearInterval(timer);
        return resolve(window.kakao);
      }
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(timer);
        return reject(new Error("Kakao SDK load timeout"));
      }
    }, interval);
  });
}
