// API service cho Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
// Sử dụng API: https://provinces.open-api.vn/

// Nếu gặp lỗi ERR_CERT_DATE_INVALID, thử đổi sang http hoặc dùng proxy
// Sửa lỗi SSL: đổi sang http nếu https bị lỗi certificate
const PROVINCE_API_BASE = 'http://provinces.open-api.vn/api';

// Nếu http không hoạt động, có thể dùng https với proxy hoặc API khác:
// const PROVINCE_API_BASE = 'https://provinces.open-api.vn/api';
// const PROVINCE_API_BASE = 'https://vapi.vnappmob.com/api/province';

const provinceApi = {
  // Lấy danh sách tất cả tỉnh/thành phố
  getProvinces: async () => {
    try {
      const response = await fetch(`${PROVINCE_API_BASE}/?depth=1`);
      if (!response.ok) {
        throw new Error('Failed to fetch provinces');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching provinces:', error);
      // Fallback: thử với endpoint khác
      try {
        const response = await fetch(`${PROVINCE_API_BASE}/p/`);
        if (!response.ok) {
          throw new Error('Failed to fetch provinces');
        }
        return await response.json();
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Lấy thông tin chi tiết tỉnh và danh sách quận/huyện
  getProvinceWithDistricts: async (provinceCode) => {
    try {
      const response = await fetch(`${PROVINCE_API_BASE}/p/${provinceCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch districts');
      }
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết quận/huyện và danh sách phường/xã
  getDistrictWithWards: async (districtCode) => {
    try {
      const response = await fetch(`${PROVINCE_API_BASE}/d/${districtCode}?depth=2`);
      if (!response.ok) {
        throw new Error('Failed to fetch wards');
      }
      const data = await response.json();
      return data.wards || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  },
};

export default provinceApi;

