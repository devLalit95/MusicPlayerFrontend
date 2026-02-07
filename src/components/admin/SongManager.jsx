import axios from "axios";
import { toast } from "react-toastify";

class SongManager {
  constructor(baseURL, token) {
    this.BASE_URL = "https://musicplayer-rc7u.onrender.com";
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async fetchSongs() {
    try {
      const res = await axios.get(`${this.BASE_URL}/api/admin/songs`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return res.data;
    } catch (err) {
      this.handleError(err, "Fetch songs error");
      throw err;
    }
  }

  async uploadSong(formData) {
    try {
      const res = await axios.post(`${this.BASE_URL}/api/admin/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${this.token}`,
        },
      });
      return res.data;
    } catch (err) {
      this.handleError(err, "Upload error");
      throw err;
    }
  }

  async updateSong(id, updateData) {
    try {
        console.log(updateData);
        
      const res = await axios.put(
        `${this.BASE_URL}/api/admin/songs/${id}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      return res.data;
    } catch (err) {
      this.handleError(err, "Update error");
      throw err;
    }
  }

  async deleteSong(id) {
    try {
      await axios.delete(`${this.BASE_URL}/api/admin/songs/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
    } catch (err) {
      this.handleError(err, "Delete error");
      throw err;
    }
  }

  handleError(err, context) {
    console.error(`${context}:`, err);
    
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error("SESSION_EXPIRED");
    }
    
    const message = err.response?.data?.message || `${context} failed!`;
    toast.error(message);
  }
}

export default SongManager;