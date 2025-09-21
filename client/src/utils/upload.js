import axios from "axios";

const upload = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "SkillAble");
  data.append("folder","SkillAble");

  try {
    // Determine if the file is a video or image based on its type
    const isVideo = file.type.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';
    
    // Use the appropriate endpoint based on resource type
    const res = await axios.post(`https://api.cloudinary.com/v1_1/deb5enowt/${resourceType}/upload`, data);

    const { url } = res.data;
    return { url, resourceType };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export default upload;
