export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Розбирає поле image з БД (JSON-масив або рядок) і повертає масив повних URL зображень
 */
export function getImageList(imageField) {
  if (!imageField) return [];
  let list = [];
  try {
    const parsed =
      typeof imageField === "string" && imageField.startsWith("[")
        ? JSON.parse(imageField)
        : imageField;
    list = Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    list = [imageField];
  }

  return list
    .filter(Boolean)
    .map((img) => {
      if (typeof img !== "string") return "";
      if (img.startsWith("http") || img.startsWith("/images")) return img;
      return `${API_URL}${img}`;
    })
    .filter(Boolean);
}

/**
 * Повертає головне (перше) зображення техніки або слайдера
 */
export function getPrimaryImageUrl(imageField) {
  const list = getImageList(imageField);
  return list.length > 0 ? list[0] : null;
}

/**
 * Форматує дату у локальний український формат
 */
export function formatDateUk(dateString, includeTime = true) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return String(dateString);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return date.toLocaleDateString("uk-UA", options);
}
