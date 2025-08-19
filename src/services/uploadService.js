import httpRequest from "@/utils/httpRequest";

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await httpRequest.post("/upload/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

export const uploadCover = async (file) => {
  const formData = new FormData();
  formData.append("cover_image", file);
  const response = await httpRequest.post("/upload/cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await httpRequest.post("/upload/post-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};
