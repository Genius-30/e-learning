export default function getCroppedImg(
  imageSrc,
  croppedAreaPixels,
  aspectRatio
) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const width = croppedAreaPixels.width;
      const height = croppedAreaPixels.height;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      canvas.toBlob((blob) => {
        if (!blob) return reject("Canvas is empty");
        resolve(blob);
      }, "image/jpeg");
    };
    image.onerror = (err) => reject(err);
  });
}
