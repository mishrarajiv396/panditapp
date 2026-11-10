/* Vedic Pooja — catalogue & content data */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------------------
     CITY DATABASE — every Indian state and union territory, plus NRI hubs.
     lat/lon are decimal degrees (WGS-84). tz is an IANA zone, so the engine can
     resolve DST correctly for London, New York, Sydney and Toronto.
     `hot: true` marks the cities shown on the home-page strip.
     Names are unique because the UI stores a city by name in localStorage.
     --------------------------------------------------------------------------- */
  var CITIES = [
    /* Haryana / NCR — default service area */
    { name: 'Gurugram', state: 'Haryana', lat: 28.4595, lon: 77.0266, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Faridabad', state: 'Haryana', lat: 28.4089, lon: 77.3178, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Panipat', state: 'Haryana', lat: 29.3909, lon: 76.9635, tz: 'Asia/Kolkata', district: true },
    { name: 'Ambala', state: 'Haryana', lat: 30.3753, lon: 76.7821, tz: 'Asia/Kolkata', district: true },
    { name: 'Yamunanagar', state: 'Haryana', lat: 30.1290, lon: 77.2674, tz: 'Asia/Kolkata', district: true },
    { name: 'Rohtak', state: 'Haryana', lat: 28.8955, lon: 76.6066, tz: 'Asia/Kolkata', district: true },
    { name: 'Hisar', state: 'Haryana', lat: 29.1492, lon: 75.7217, tz: 'Asia/Kolkata', district: true },
    { name: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905, tz: 'Asia/Kolkata', district: true },
    { name: 'Sonipat', state: 'Haryana', lat: 28.9931, lon: 77.0151, tz: 'Asia/Kolkata', district: true },
    { name: 'Kurukshetra', state: 'Haryana', lat: 29.9695, lon: 76.8783, tz: 'Asia/Kolkata', district: true },
    { name: 'Rewari', state: 'Haryana', lat: 28.1920, lon: 76.6170, tz: 'Asia/Kolkata', district: true },
    { name: 'Palwal', state: 'Haryana', lat: 28.1487, lon: 77.3320, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhiwani', state: 'Haryana', lat: 28.7930, lon: 76.1320, tz: 'Asia/Kolkata', district: true },
    { name: 'Sirsa', state: 'Haryana', lat: 29.5349, lon: 75.0280, tz: 'Asia/Kolkata', district: true },
    { name: 'Jind', state: 'Haryana', lat: 29.3157, lon: 76.3151, tz: 'Asia/Kolkata', district: true },
    { name: 'Kaithal', state: 'Haryana', lat: 29.8015, lon: 76.3996, tz: 'Asia/Kolkata', district: true },
    { name: 'Narnaul', state: 'Haryana', lat: 28.0444, lon: 76.1084, tz: 'Asia/Kolkata' },
    { name: 'Fatehabad', state: 'Haryana', lat: 29.5150, lon: 75.4540, tz: 'Asia/Kolkata', district: true },

    /* Delhi */
    { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025, tz: 'Asia/Kolkata' },
    { name: 'Dwarka Delhi', state: 'Delhi', lat: 28.5921, lon: 77.0460, tz: 'Asia/Kolkata' },

    /* Andhra Pradesh */
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, tz: 'Asia/Kolkata', hot: true },
    { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365, tz: 'Asia/Kolkata', district: true },
    { name: 'Nellore', state: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865, tz: 'Asia/Kolkata' },
    { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373, tz: 'Asia/Kolkata', district: true },
    { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Rajahmundry', state: 'Andhra Pradesh', lat: 17.0005, lon: 81.8040, tz: 'Asia/Kolkata' },
    { name: 'Kakinada', state: 'Andhra Pradesh', lat: 16.9891, lon: 82.2475, tz: 'Asia/Kolkata', district: true },
    { name: 'Anantapur', state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6006, tz: 'Asia/Kolkata', district: true },
    { name: 'Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lon: 78.8242, tz: 'Asia/Kolkata' },
    { name: 'Ongole', state: 'Andhra Pradesh', lat: 15.5057, lon: 80.0499, tz: 'Asia/Kolkata' },
    { name: 'Srikakulam', state: 'Andhra Pradesh', lat: 18.2949, lon: 83.8938, tz: 'Asia/Kolkata', district: true },
    { name: 'Eluru', state: 'Andhra Pradesh', lat: 16.7107, lon: 81.0952, tz: 'Asia/Kolkata', district: true },
    { name: 'Machilipatnam', state: 'Andhra Pradesh', lat: 16.1875, lon: 81.1389, tz: 'Asia/Kolkata' },

    /* Arunachal Pradesh */
    { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053, tz: 'Asia/Kolkata' },
    { name: 'Pasighat', state: 'Arunachal Pradesh', lat: 28.0667, lon: 95.3333, tz: 'Asia/Kolkata' },
    { name: 'Tawang', state: 'Arunachal Pradesh', lat: 27.5861, lon: 91.8594, tz: 'Asia/Kolkata', district: true, famous: true },
    { name: 'Ziro', state: 'Arunachal Pradesh', lat: 27.5440, lon: 93.8317, tz: 'Asia/Kolkata' },
    { name: 'Bomdila', state: 'Arunachal Pradesh', lat: 27.2650, lon: 92.4060, tz: 'Asia/Kolkata' },

    /* Assam */
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lon: 91.7362, tz: 'Asia/Kolkata', hot: true },
    { name: 'Dibrugarh', state: 'Assam', lat: 27.4728, lon: 94.9120, tz: 'Asia/Kolkata', district: true },
    { name: 'Silchar', state: 'Assam', lat: 24.8333, lon: 92.7789, tz: 'Asia/Kolkata' },
    { name: 'Jorhat', state: 'Assam', lat: 26.7509, lon: 94.2037, tz: 'Asia/Kolkata', district: true },
    { name: 'Tezpur', state: 'Assam', lat: 26.6338, lon: 92.8000, tz: 'Asia/Kolkata' },
    { name: 'Nagaon', state: 'Assam', lat: 26.3464, lon: 92.6840, tz: 'Asia/Kolkata', district: true },
    { name: 'Bongaigaon', state: 'Assam', lat: 26.4769, lon: 90.5583, tz: 'Asia/Kolkata', district: true },

    /* Bihar */
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Gaya', state: 'Bihar', lat: 24.7955, lon: 85.0002, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Bhagalpur', state: 'Bihar', lat: 25.2425, lon: 86.9842, tz: 'Asia/Kolkata', district: true },
    { name: 'Muzaffarpur', state: 'Bihar', lat: 26.1209, lon: 85.3647, tz: 'Asia/Kolkata', district: true },
    { name: 'Darbhanga', state: 'Bihar', lat: 26.1542, lon: 85.8918, tz: 'Asia/Kolkata', district: true },
    { name: 'Purnia', state: 'Bihar', lat: 25.7771, lon: 87.4753, tz: 'Asia/Kolkata', district: true },
    { name: 'Arrah', state: 'Bihar', lat: 25.5560, lon: 84.6600, tz: 'Asia/Kolkata' },
    { name: 'Begusarai', state: 'Bihar', lat: 25.4182, lon: 86.1272, tz: 'Asia/Kolkata', district: true },
    { name: 'Chhapra', state: 'Bihar', lat: 25.7815, lon: 84.7470, tz: 'Asia/Kolkata' },
    { name: 'Katihar', state: 'Bihar', lat: 25.5541, lon: 87.5580, tz: 'Asia/Kolkata', district: true },
    { name: 'Bodh Gaya', state: 'Bihar', lat: 24.6961, lon: 84.9869, tz: 'Asia/Kolkata', famous: true },

    /* Chhattisgarh */
    { name: 'Raipur', state: 'Chhattisgarh', lat: 21.2514, lon: 81.6296, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Bhilai', state: 'Chhattisgarh', lat: 21.1938, lon: 81.3509, tz: 'Asia/Kolkata' },
    { name: 'Bilaspur', state: 'Chhattisgarh', lat: 22.0797, lon: 82.1409, tz: 'Asia/Kolkata', district: true },
    { name: 'Korba', state: 'Chhattisgarh', lat: 22.3595, lon: 82.7501, tz: 'Asia/Kolkata', district: true },
    { name: 'Durg', state: 'Chhattisgarh', lat: 21.1904, lon: 81.2849, tz: 'Asia/Kolkata', district: true },
    { name: 'Jagdalpur', state: 'Chhattisgarh', lat: 19.0748, lon: 82.0344, tz: 'Asia/Kolkata' },
    { name: 'Ambikapur', state: 'Chhattisgarh', lat: 23.1210, lon: 83.1950, tz: 'Asia/Kolkata' },
    { name: 'Rajnandgaon', state: 'Chhattisgarh', lat: 21.0972, lon: 81.0300, tz: 'Asia/Kolkata', district: true },

    /* Goa */
    { name: 'Panaji', state: 'Goa', lat: 15.4909, lon: 73.8278, tz: 'Asia/Kolkata' },
    { name: 'Margao', state: 'Goa', lat: 15.2832, lon: 73.9862, tz: 'Asia/Kolkata' },
    { name: 'Vasco da Gama', state: 'Goa', lat: 15.3981, lon: 73.8113, tz: 'Asia/Kolkata' },
    { name: 'Mapusa', state: 'Goa', lat: 15.5937, lon: 73.8142, tz: 'Asia/Kolkata' },
    { name: 'Ponda', state: 'Goa', lat: 15.4027, lon: 74.0078, tz: 'Asia/Kolkata' },

    /* Gujarat */
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812, tz: 'Asia/Kolkata', district: true },
    { name: 'Rajkot', state: 'Gujarat', lat: 22.3039, lon: 70.8022, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhavnagar', state: 'Gujarat', lat: 21.7645, lon: 72.1519, tz: 'Asia/Kolkata', district: true },
    { name: 'Jamnagar', state: 'Gujarat', lat: 22.4707, lon: 70.0577, tz: 'Asia/Kolkata', district: true },
    { name: 'Junagadh', state: 'Gujarat', lat: 21.5222, lon: 70.4579, tz: 'Asia/Kolkata', district: true },
    { name: 'Gandhinagar', state: 'Gujarat', lat: 23.2156, lon: 72.6369, tz: 'Asia/Kolkata', district: true },
    { name: 'Anand', state: 'Gujarat', lat: 22.5645, lon: 72.9289, tz: 'Asia/Kolkata', district: true },
    { name: 'Navsari', state: 'Gujarat', lat: 20.9467, lon: 72.9520, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhuj', state: 'Gujarat', lat: 23.2420, lon: 69.6669, tz: 'Asia/Kolkata' },
    { name: 'Dwarka', state: 'Gujarat', lat: 22.2394, lon: 68.9678, tz: 'Asia/Kolkata' },
    { name: 'Somnath', state: 'Gujarat', lat: 20.8880, lon: 70.4012, tz: 'Asia/Kolkata' },
    { name: 'Mount Abu', state: 'Rajasthan', lat: 24.5926, lon: 72.7156, tz: 'Asia/Kolkata', famous: true },

    /* Himachal Pradesh */
    { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734, tz: 'Asia/Kolkata', district: true },
    { name: 'Manali', state: 'Himachal Pradesh', lat: 32.2432, lon: 77.1892, tz: 'Asia/Kolkata', famous: true },
    { name: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.2190, lon: 76.3234, tz: 'Asia/Kolkata', famous: true },
    { name: 'Solan', state: 'Himachal Pradesh', lat: 30.9045, lon: 77.0967, tz: 'Asia/Kolkata', district: true },
    { name: 'Mandi', state: 'Himachal Pradesh', lat: 31.7080, lon: 76.9317, tz: 'Asia/Kolkata', district: true },
    { name: 'Kullu', state: 'Himachal Pradesh', lat: 31.9578, lon: 77.1094, tz: 'Asia/Kolkata', district: true },
    { name: 'Chamba', state: 'Himachal Pradesh', lat: 32.5534, lon: 76.1258, tz: 'Asia/Kolkata', district: true, famous: true },
    { name: 'Una', state: 'Himachal Pradesh', lat: 31.4685, lon: 76.2708, tz: 'Asia/Kolkata', district: true },

    /* Jharkhand */
    { name: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096, tz: 'Asia/Kolkata', district: true },
    { name: 'Jamshedpur', state: 'Jharkhand', lat: 22.8046, lon: 86.2029, tz: 'Asia/Kolkata' },
    { name: 'Dhanbad', state: 'Jharkhand', lat: 23.7957, lon: 86.4304, tz: 'Asia/Kolkata', district: true },
    { name: 'Bokaro Steel City', state: 'Jharkhand', lat: 23.6693, lon: 86.1511, tz: 'Asia/Kolkata' },
    { name: 'Deoghar', state: 'Jharkhand', lat: 24.4823, lon: 86.6994, tz: 'Asia/Kolkata', district: true },
    { name: 'Hazaribagh', state: 'Jharkhand', lat: 23.9924, lon: 85.3637, tz: 'Asia/Kolkata', district: true },
    { name: 'Giridih', state: 'Jharkhand', lat: 24.1800, lon: 86.3000, tz: 'Asia/Kolkata', district: true },
    { name: 'Dumka', state: 'Jharkhand', lat: 24.2676, lon: 87.2498, tz: 'Asia/Kolkata', district: true },

    /* Karnataka */
    { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata', hot: true },
    { name: 'Mysuru', state: 'Karnataka', lat: 12.2958, lon: 76.6394, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Mangaluru', state: 'Karnataka', lat: 12.9141, lon: 74.8560, tz: 'Asia/Kolkata' },
    { name: 'Hubballi', state: 'Karnataka', lat: 15.3647, lon: 75.1240, tz: 'Asia/Kolkata' },
    { name: 'Belagavi', state: 'Karnataka', lat: 15.8497, lon: 74.4977, tz: 'Asia/Kolkata', district: true },
    { name: 'Davanagere', state: 'Karnataka', lat: 14.4644, lon: 75.9218, tz: 'Asia/Kolkata', district: true },
    { name: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lon: 75.5681, tz: 'Asia/Kolkata', district: true },
    { name: 'Tumakuru', state: 'Karnataka', lat: 13.3379, lon: 77.1173, tz: 'Asia/Kolkata', district: true },
    { name: 'Udupi', state: 'Karnataka', lat: 13.3409, lon: 74.7421, tz: 'Asia/Kolkata', district: true },
    { name: 'Hampi', state: 'Karnataka', lat: 15.3350, lon: 76.4600, tz: 'Asia/Kolkata', famous: true },
    { name: 'Vijayapura', state: 'Karnataka', lat: 16.8302, lon: 75.7100, tz: 'Asia/Kolkata', district: true },
    { name: 'Kalaburagi', state: 'Karnataka', lat: 17.3297, lon: 76.8343, tz: 'Asia/Kolkata', district: true },
    { name: 'Shravanabelagola', state: 'Karnataka', lat: 12.8570, lon: 76.4870, tz: 'Asia/Kolkata', famous: true },

    /* Kerala */
    { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lon: 76.2673, tz: 'Asia/Kolkata', hot: true },
    { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lon: 75.7804, tz: 'Asia/Kolkata', district: true },
    { name: 'Thrissur', state: 'Kerala', lat: 10.5276, lon: 76.2144, tz: 'Asia/Kolkata', district: true },
    { name: 'Kollam', state: 'Kerala', lat: 8.8932, lon: 76.6141, tz: 'Asia/Kolkata', district: true },
    { name: 'Kannur', state: 'Kerala', lat: 11.8745, lon: 75.3704, tz: 'Asia/Kolkata', district: true },
    { name: 'Alappuzha', state: 'Kerala', lat: 9.4981, lon: 76.3388, tz: 'Asia/Kolkata', district: true },
    { name: 'Palakkad', state: 'Kerala', lat: 10.7867, lon: 76.6548, tz: 'Asia/Kolkata', district: true },
    { name: 'Sabarimala', state: 'Kerala', lat: 9.4350, lon: 77.0810, tz: 'Asia/Kolkata', famous: true },
    { name: 'Guruvayur', state: 'Kerala', lat: 10.5947, lon: 76.0390, tz: 'Asia/Kolkata' },

    /* Madhya Pradesh */
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Gwalior', state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828, tz: 'Asia/Kolkata', district: true },
    { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864, tz: 'Asia/Kolkata', district: true },
    { name: 'Ujjain', state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Sagar', state: 'Madhya Pradesh', lat: 23.8388, lon: 78.7378, tz: 'Asia/Kolkata', district: true },
    { name: 'Rewa', state: 'Madhya Pradesh', lat: 24.5362, lon: 81.3037, tz: 'Asia/Kolkata', district: true },
    { name: 'Satna', state: 'Madhya Pradesh', lat: 24.6005, lon: 80.8322, tz: 'Asia/Kolkata', district: true },
    { name: 'Ratlam', state: 'Madhya Pradesh', lat: 23.3315, lon: 75.0367, tz: 'Asia/Kolkata', district: true },
    { name: 'Dewas', state: 'Madhya Pradesh', lat: 22.9676, lon: 76.0534, tz: 'Asia/Kolkata', district: true },
    { name: 'Chhindwara', state: 'Madhya Pradesh', lat: 22.0574, lon: 78.9382, tz: 'Asia/Kolkata', district: true },
    { name: 'Pachmarhi', state: 'Madhya Pradesh', lat: 22.4675, lon: 78.4338, tz: 'Asia/Kolkata', famous: true },
    { name: 'Orchha', state: 'Madhya Pradesh', lat: 25.3519, lon: 78.6400, tz: 'Asia/Kolkata', famous: true },
    { name: 'Khajuraho', state: 'Madhya Pradesh', lat: 24.8318, lon: 79.9199, tz: 'Asia/Kolkata', famous: true },
    { name: 'Chitrakoot', state: 'Madhya Pradesh', lat: 25.2000, lon: 80.8667, tz: 'Asia/Kolkata' },

    /* Maharashtra */
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata', hot: true },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781, tz: 'Asia/Kolkata', district: true },
    { name: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lon: 75.3433, tz: 'Asia/Kolkata', district: true },
    { name: 'Solapur', state: 'Maharashtra', lat: 17.6599, lon: 75.9064, tz: 'Asia/Kolkata', district: true },
    { name: 'Kolhapur', state: 'Maharashtra', lat: 16.7050, lon: 74.2433, tz: 'Asia/Kolkata', district: true },
    { name: 'Amravati', state: 'Maharashtra', lat: 20.9374, lon: 77.7796, tz: 'Asia/Kolkata', district: true },
    { name: 'Nanded', state: 'Maharashtra', lat: 19.1383, lon: 77.3210, tz: 'Asia/Kolkata', district: true },
    { name: 'Sangli', state: 'Maharashtra', lat: 16.8524, lon: 74.5815, tz: 'Asia/Kolkata', district: true },
    { name: 'Jalgaon', state: 'Maharashtra', lat: 21.0077, lon: 75.5626, tz: 'Asia/Kolkata', district: true },
    { name: 'Akola', state: 'Maharashtra', lat: 20.7002, lon: 77.0082, tz: 'Asia/Kolkata', district: true },
    { name: 'Shirdi', state: 'Maharashtra', lat: 19.7646, lon: 74.4760, tz: 'Asia/Kolkata' },
    { name: 'Alibaug', state: 'Maharashtra', lat: 18.6414, lon: 72.8722, tz: 'Asia/Kolkata', famous: true },
    { name: 'Lonavala', state: 'Maharashtra', lat: 18.7546, lon: 73.4062, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mahabaleshwar', state: 'Maharashtra', lat: 17.9307, lon: 73.6477, tz: 'Asia/Kolkata', famous: true },
    { name: 'Trimbakeshwar', state: 'Maharashtra', lat: 19.9322, lon: 73.5310, tz: 'Asia/Kolkata', famous: true },

    /* Manipur */
    { name: 'Imphal', state: 'Manipur', lat: 24.8170, lon: 93.9368, tz: 'Asia/Kolkata' },
    { name: 'Thoubal', state: 'Manipur', lat: 24.6388, lon: 94.0100, tz: 'Asia/Kolkata', district: true },
    { name: 'Churachandpur', state: 'Manipur', lat: 24.3333, lon: 93.6833, tz: 'Asia/Kolkata', district: true },
    { name: 'Bishnupur', state: 'Manipur', lat: 24.6280, lon: 93.7700, tz: 'Asia/Kolkata', district: true },

    /* Meghalaya */
    { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lon: 91.8933, tz: 'Asia/Kolkata', famous: true },
    { name: 'Tura', state: 'Meghalaya', lat: 25.5140, lon: 90.2027, tz: 'Asia/Kolkata' },
    { name: 'Cherrapunji', state: 'Meghalaya', lat: 25.3000, lon: 91.7000, tz: 'Asia/Kolkata', famous: true },
    { name: 'Jowai', state: 'Meghalaya', lat: 25.4500, lon: 92.2000, tz: 'Asia/Kolkata' },

    /* Mizoram */
    { name: 'Aizawl', state: 'Mizoram', lat: 23.7271, lon: 92.7176, tz: 'Asia/Kolkata', district: true, famous: true },
    { name: 'Lunglei', state: 'Mizoram', lat: 22.8870, lon: 92.7330, tz: 'Asia/Kolkata', district: true },
    { name: 'Champhai', state: 'Mizoram', lat: 23.4740, lon: 93.3290, tz: 'Asia/Kolkata', district: true },

    /* Nagaland */
    { name: 'Kohima', state: 'Nagaland', lat: 25.6751, lon: 94.1086, tz: 'Asia/Kolkata', district: true, famous: true },
    { name: 'Dimapur', state: 'Nagaland', lat: 25.9060, lon: 93.7276, tz: 'Asia/Kolkata', district: true },
    { name: 'Mokokchung', state: 'Nagaland', lat: 26.3200, lon: 94.5200, tz: 'Asia/Kolkata', district: true },
    { name: 'Tuensang', state: 'Nagaland', lat: 26.2830, lon: 94.8300, tz: 'Asia/Kolkata', district: true },

    /* Odisha */
    { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lon: 85.8245, tz: 'Asia/Kolkata', hot: true },
    { name: 'Cuttack', state: 'Odisha', lat: 20.4625, lon: 85.8830, tz: 'Asia/Kolkata', district: true },
    { name: 'Rourkela', state: 'Odisha', lat: 22.2604, lon: 84.8536, tz: 'Asia/Kolkata' },
    { name: 'Berhampur', state: 'Odisha', lat: 19.3150, lon: 84.7941, tz: 'Asia/Kolkata' },
    { name: 'Sambalpur', state: 'Odisha', lat: 21.4669, lon: 83.9812, tz: 'Asia/Kolkata', district: true },
    { name: 'Puri', state: 'Odisha', lat: 19.8135, lon: 85.8312, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Balasore', state: 'Odisha', lat: 21.4942, lon: 86.9330, tz: 'Asia/Kolkata', district: true },
    { name: 'Baripada', state: 'Odisha', lat: 21.9333, lon: 86.7333, tz: 'Asia/Kolkata' },
    { name: 'Konark', state: 'Odisha', lat: 19.8876, lon: 86.0949, tz: 'Asia/Kolkata' },

    /* Punjab */
    { name: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573, tz: 'Asia/Kolkata', district: true },
    { name: 'Amritsar', state: 'Punjab', lat: 31.6340, lon: 74.8723, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Jalandhar', state: 'Punjab', lat: 31.3260, lon: 75.5762, tz: 'Asia/Kolkata', district: true },
    { name: 'Patiala', state: 'Punjab', lat: 30.3398, lon: 76.3869, tz: 'Asia/Kolkata', district: true },
    { name: 'Bathinda', state: 'Punjab', lat: 30.2110, lon: 74.9455, tz: 'Asia/Kolkata', district: true },
    { name: 'Mohali', state: 'Punjab', lat: 30.7046, lon: 76.7179, tz: 'Asia/Kolkata' },
    { name: 'Hoshiarpur', state: 'Punjab', lat: 31.5143, lon: 75.9115, tz: 'Asia/Kolkata', district: true },
    { name: 'Pathankot', state: 'Punjab', lat: 32.2643, lon: 75.6421, tz: 'Asia/Kolkata', district: true },
    { name: 'Anandpur Sahib', state: 'Punjab', lat: 31.2390, lon: 76.5020, tz: 'Asia/Kolkata', famous: true },

    /* Rajasthan */
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lon: 73.0243, tz: 'Asia/Kolkata', district: true },
    { name: 'Udaipur', state: 'Rajasthan', lat: 24.5854, lon: 73.7125, tz: 'Asia/Kolkata', district: true },
    { name: 'Kota', state: 'Rajasthan', lat: 25.2138, lon: 75.8648, tz: 'Asia/Kolkata', district: true },
    { name: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lon: 73.3119, tz: 'Asia/Kolkata', district: true },
    { name: 'Ajmer', state: 'Rajasthan', lat: 26.4499, lon: 74.6399, tz: 'Asia/Kolkata', district: true },
    { name: 'Alwar', state: 'Rajasthan', lat: 27.5530, lon: 76.6346, tz: 'Asia/Kolkata', district: true },
    { name: 'Bharatpur', state: 'Rajasthan', lat: 27.2170, lon: 77.4900, tz: 'Asia/Kolkata', district: true },
    { name: 'Sikar', state: 'Rajasthan', lat: 27.6094, lon: 75.1399, tz: 'Asia/Kolkata', district: true },
    { name: 'Pushkar', state: 'Rajasthan', lat: 26.4897, lon: 74.5511, tz: 'Asia/Kolkata', famous: true },
    { name: 'Chittorgarh', state: 'Rajasthan', lat: 24.8799, lon: 74.6294, tz: 'Asia/Kolkata', district: true },
    { name: 'Jaisalmer', state: 'Rajasthan', lat: 26.9157, lon: 70.9083, tz: 'Asia/Kolkata', district: true },

    /* Sikkim */
    { name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lon: 88.6065, tz: 'Asia/Kolkata', district: true },
    { name: 'Namchi', state: 'Sikkim', lat: 27.1670, lon: 88.3500, tz: 'Asia/Kolkata', district: true },
    { name: 'Gyalshing', state: 'Sikkim', lat: 27.2833, lon: 88.2667, tz: 'Asia/Kolkata', district: true },
    { name: 'Mangan', state: 'Sikkim', lat: 27.5100, lon: 88.5300, tz: 'Asia/Kolkata', district: true },

    /* Tamil Nadu */
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lon: 78.1198, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047, tz: 'Asia/Kolkata', district: true },
    { name: 'Salem', state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460, tz: 'Asia/Kolkata', district: true },
    { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139, lon: 77.7567, tz: 'Asia/Kolkata', district: true },
    { name: 'Vellore', state: 'Tamil Nadu', lat: 12.9165, lon: 79.1325, tz: 'Asia/Kolkata', district: true },
    { name: 'Erode', state: 'Tamil Nadu', lat: 11.3410, lon: 77.7172, tz: 'Asia/Kolkata', district: true },
    { name: 'Thanjavur', state: 'Tamil Nadu', lat: 10.7870, lon: 79.1378, tz: 'Asia/Kolkata', district: true },
    { name: 'Kanyakumari', state: 'Tamil Nadu', lat: 8.0883, lon: 77.5385, tz: 'Asia/Kolkata', district: true },
    { name: 'Rameswaram', state: 'Tamil Nadu', lat: 9.2876, lon: 79.3129, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ooty', state: 'Tamil Nadu', lat: 11.4102, lon: 76.6950, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.8342, lon: 79.7036, tz: 'Asia/Kolkata', district: true },
    { name: 'Kumbakonam', state: 'Tamil Nadu', lat: 10.9601, lon: 79.3845, tz: 'Asia/Kolkata' },
    { name: 'Chidambaram', state: 'Tamil Nadu', lat: 11.3991, lon: 79.6930, tz: 'Asia/Kolkata' },
    { name: 'Tiruvannamalai', state: 'Tamil Nadu', lat: 12.2253, lon: 79.0747, tz: 'Asia/Kolkata', district: true },

    /* Telangana */
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Secunderabad', state: 'Telangana', lat: 17.4399, lon: 78.4983, tz: 'Asia/Kolkata' },
    { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941, tz: 'Asia/Kolkata', district: true },
    { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941, tz: 'Asia/Kolkata', district: true },
    { name: 'Karimnagar', state: 'Telangana', lat: 18.4386, lon: 79.1288, tz: 'Asia/Kolkata', district: true },
    { name: 'Khammam', state: 'Telangana', lat: 17.2473, lon: 80.1514, tz: 'Asia/Kolkata', district: true },
    { name: 'Ramagundam', state: 'Telangana', lat: 18.7500, lon: 79.4500, tz: 'Asia/Kolkata' },
    { name: 'Mahbubnagar', state: 'Telangana', lat: 16.7488, lon: 77.9850, tz: 'Asia/Kolkata' },
    { name: 'Bhadrachalam', state: 'Telangana', lat: 17.6688, lon: 80.8936, tz: 'Asia/Kolkata' },

    /* Tripura */
    { name: 'Agartala', state: 'Tripura', lat: 23.8315, lon: 91.2868, tz: 'Asia/Kolkata', famous: true },
    { name: 'Dharmanagar', state: 'Tripura', lat: 24.3667, lon: 92.1667, tz: 'Asia/Kolkata' },
    { name: 'Kailashahar', state: 'Tripura', lat: 24.3300, lon: 92.0100, tz: 'Asia/Kolkata' },
    { name: 'Udaipur Tripura', state: 'Tripura', lat: 23.5333, lon: 91.4833, tz: 'Asia/Kolkata' },

    /* Uttar Pradesh */
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, tz: 'Asia/Kolkata' },
    { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Agra', state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Meerut', state: 'Uttar Pradesh', lat: 28.9845, lon: 77.7064, tz: 'Asia/Kolkata', district: true },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538, tz: 'Asia/Kolkata', district: true },
    { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910, tz: 'Asia/Kolkata', hot: true },
    { name: 'Bareilly', state: 'Uttar Pradesh', lat: 28.3670, lon: 79.4304, tz: 'Asia/Kolkata', district: true },
    { name: 'Aligarh', state: 'Uttar Pradesh', lat: 27.8974, lon: 78.0880, tz: 'Asia/Kolkata', district: true },
    { name: 'Moradabad', state: 'Uttar Pradesh', lat: 28.8386, lon: 78.7733, tz: 'Asia/Kolkata', district: true },
    { name: 'Gorakhpur', state: 'Uttar Pradesh', lat: 26.7606, lon: 83.3732, tz: 'Asia/Kolkata', district: true },
    { name: 'Jhansi', state: 'Uttar Pradesh', lat: 25.4484, lon: 78.5685, tz: 'Asia/Kolkata', district: true },
    { name: 'Mathura', state: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Vrindavan', state: 'Uttar Pradesh', lat: 27.5820, lon: 77.7060, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.7920, lon: 82.1998, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Faizabad', state: 'Uttar Pradesh', lat: 26.7730, lon: 82.1450, tz: 'Asia/Kolkata' },
    { name: 'Sultanpur', state: 'Uttar Pradesh', lat: 26.2649, lon: 82.0727, tz: 'Asia/Kolkata', district: true },
    { name: 'Mirzapur', state: 'Uttar Pradesh', lat: 25.1337, lon: 82.5644, tz: 'Asia/Kolkata', district: true },
    { name: 'Etawah', state: 'Uttar Pradesh', lat: 26.7855, lon: 79.0150, tz: 'Asia/Kolkata', district: true },
    { name: 'Firozabad', state: 'Uttar Pradesh', lat: 27.1592, lon: 78.3957, tz: 'Asia/Kolkata', district: true },
    { name: 'Sarnath', state: 'Uttar Pradesh', lat: 25.3811, lon: 83.0214, tz: 'Asia/Kolkata', famous: true },

    /* Uttarakhand */
    { name: 'Dehradun', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322, tz: 'Asia/Kolkata', district: true },
    { name: 'Haridwar', state: 'Uttarakhand', lat: 29.9457, lon: 78.1642, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Rishikesh', state: 'Uttarakhand', lat: 30.0869, lon: 78.2676, tz: 'Asia/Kolkata', hot: true, famous: true },
    { name: 'Nainital', state: 'Uttarakhand', lat: 29.3803, lon: 79.4636, tz: 'Asia/Kolkata', district: true },
    { name: 'Haldwani', state: 'Uttarakhand', lat: 29.2183, lon: 79.5130, tz: 'Asia/Kolkata' },
    { name: 'Roorkee', state: 'Uttarakhand', lat: 29.8543, lon: 77.8880, tz: 'Asia/Kolkata' },
    { name: 'Almora', state: 'Uttarakhand', lat: 29.5892, lon: 79.6467, tz: 'Asia/Kolkata', district: true },
    { name: 'Mussoorie', state: 'Uttarakhand', lat: 30.4598, lon: 78.0644, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kedarnath', state: 'Uttarakhand', lat: 30.7346, lon: 79.0669, tz: 'Asia/Kolkata', famous: true },
    { name: 'Badrinath', state: 'Uttarakhand', lat: 30.7433, lon: 79.4938, tz: 'Asia/Kolkata', famous: true },
    { name: 'Gangotri', state: 'Uttarakhand', lat: 30.9947, lon: 78.9417, tz: 'Asia/Kolkata', famous: true },
    { name: 'Yamunotri', state: 'Uttarakhand', lat: 31.0110, lon: 78.4610, tz: 'Asia/Kolkata', famous: true },
    { name: 'Joshimath', state: 'Uttarakhand', lat: 30.5556, lon: 79.5644, tz: 'Asia/Kolkata', famous: true },

    /* West Bengal */
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Howrah', state: 'West Bengal', lat: 22.5958, lon: 88.2636, tz: 'Asia/Kolkata', district: true },
    { name: 'Durgapur', state: 'West Bengal', lat: 23.5204, lon: 87.3119, tz: 'Asia/Kolkata' },
    { name: 'Asansol', state: 'West Bengal', lat: 23.6739, lon: 86.9524, tz: 'Asia/Kolkata' },
    { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lon: 88.3953, tz: 'Asia/Kolkata' },
    { name: 'Darjeeling', state: 'West Bengal', lat: 27.0360, lon: 88.2627, tz: 'Asia/Kolkata', district: true },
    { name: 'Kharagpur', state: 'West Bengal', lat: 22.3460, lon: 87.2320, tz: 'Asia/Kolkata' },
    { name: 'Haldia', state: 'West Bengal', lat: 22.0667, lon: 88.0698, tz: 'Asia/Kolkata' },
    { name: 'Kalimpong', state: 'West Bengal', lat: 27.0667, lon: 88.4667, tz: 'Asia/Kolkata', district: true },
    { name: 'Shantiniketan', state: 'West Bengal', lat: 23.6780, lon: 87.6830, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mayapur', state: 'West Bengal', lat: 23.4250, lon: 88.3900, tz: 'Asia/Kolkata' },
    { name: 'Tarapith', state: 'West Bengal', lat: 24.1833, lon: 87.7833, tz: 'Asia/Kolkata' },

    /* Union Territories */
    { name: 'Port Blair', state: 'Andaman & Nicobar Islands', lat: 11.6234, lon: 92.7265, tz: 'Asia/Kolkata', famous: true },
    { name: 'Havelock Island', state: 'Andaman & Nicobar Islands', lat: 12.0167, lon: 92.9833, tz: 'Asia/Kolkata', famous: true },
    { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lon: 76.7794, tz: 'Asia/Kolkata', hot: true, district: true },
    { name: 'Silvassa', state: 'Dadra & Nagar Haveli and Daman & Diu', lat: 20.2738, lon: 73.0163, tz: 'Asia/Kolkata' },
    { name: 'Daman', state: 'Dadra & Nagar Haveli and Daman & Diu', lat: 20.3974, lon: 72.8328, tz: 'Asia/Kolkata', district: true },
    { name: 'Diu', state: 'Dadra & Nagar Haveli and Daman & Diu', lat: 20.7144, lon: 70.9874, tz: 'Asia/Kolkata', district: true },
    { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.0837, lon: 74.7973, tz: 'Asia/Kolkata', district: true },
    { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.7266, lon: 74.8570, tz: 'Asia/Kolkata', district: true },
    { name: 'Anantnag', state: 'Jammu & Kashmir', lat: 33.7311, lon: 75.1487, tz: 'Asia/Kolkata', district: true },
    { name: 'Baramulla', state: 'Jammu & Kashmir', lat: 34.1980, lon: 74.3636, tz: 'Asia/Kolkata', district: true },
    { name: 'Katra', state: 'Jammu & Kashmir', lat: 32.9917, lon: 74.9319, tz: 'Asia/Kolkata' },
    { name: 'Gulmarg', state: 'Jammu & Kashmir', lat: 34.0484, lon: 74.3805, tz: 'Asia/Kolkata', famous: true },
    { name: 'Pahalgam', state: 'Jammu & Kashmir', lat: 34.0161, lon: 75.3150, tz: 'Asia/Kolkata', famous: true },
    { name: 'Leh', state: 'Ladakh', lat: 34.1526, lon: 77.5771, tz: 'Asia/Kolkata', district: true, famous: true },
    { name: 'Kargil', state: 'Ladakh', lat: 34.5539, lon: 76.1349, tz: 'Asia/Kolkata', district: true, famous: true },
    { name: 'Kavaratti', state: 'Lakshadweep', lat: 10.5669, lon: 72.6420, tz: 'Asia/Kolkata', famous: true },
    { name: 'Puducherry', state: 'Puducherry', lat: 11.9416, lon: 79.8083, tz: 'Asia/Kolkata', district: true, famous: true },
    { name: 'Karaikal', state: 'Puducherry', lat: 10.9254, lon: 79.8380, tz: 'Asia/Kolkata', district: true },
    { name: 'Mahe', state: 'Puducherry', lat: 11.7000, lon: 75.5333, tz: 'Asia/Kolkata', district: true },
    { name: 'Yanam', state: 'Puducherry', lat: 16.7333, lon: 82.2167, tz: 'Asia/Kolkata', district: true },

    /* NRI hubs — IANA zones keep DST correct */
    { name: 'London', state: 'United Kingdom', lat: 51.5074, lon: -0.1278, tz: 'Europe/London', hot: true },
    { name: 'Birmingham', state: 'United Kingdom', lat: 52.4862, lon: -1.8904, tz: 'Europe/London' },
    { name: 'Leicester', state: 'United Kingdom', lat: 52.6369, lon: -1.1398, tz: 'Europe/London' },
    { name: 'Manchester', state: 'United Kingdom', lat: 53.4808, lon: -2.2426, tz: 'Europe/London' },
    { name: 'Edinburgh', state: 'United Kingdom', lat: 55.9533, lon: -3.1883, tz: 'Europe/London' },
    { name: 'New York', state: 'USA', lat: 40.7128, lon: -74.0060, tz: 'America/New_York', hot: true },
    { name: 'Washington DC', state: 'USA', lat: 38.9072, lon: -77.0369, tz: 'America/New_York' },
    { name: 'Boston', state: 'USA', lat: 42.3601, lon: -71.0589, tz: 'America/New_York' },
    { name: 'Atlanta', state: 'USA', lat: 33.7490, lon: -84.3880, tz: 'America/New_York' },
    { name: 'Chicago', state: 'USA', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
    { name: 'Houston', state: 'USA', lat: 29.7604, lon: -95.3698, tz: 'America/Chicago' },
    { name: 'Dallas', state: 'USA', lat: 32.7767, lon: -96.7970, tz: 'America/Chicago' },
    { name: 'San Francisco', state: 'USA', lat: 37.7749, lon: -122.4194, tz: 'America/Los_Angeles' },
    { name: 'Los Angeles', state: 'USA', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
    { name: 'Seattle', state: 'USA', lat: 47.6062, lon: -122.3321, tz: 'America/Los_Angeles' },
    { name: 'Toronto', state: 'Canada', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto', hot: true },
    { name: 'Vancouver', state: 'Canada', lat: 49.2827, lon: -123.1207, tz: 'America/Vancouver' },
    { name: 'Calgary', state: 'Canada', lat: 51.0447, lon: -114.0719, tz: 'America/Edmonton' },
    { name: 'Dubai', state: 'UAE', lat: 25.2048, lon: 55.2708, tz: 'Asia/Dubai', hot: true },
    { name: 'Abu Dhabi', state: 'UAE', lat: 24.4539, lon: 54.3773, tz: 'Asia/Dubai' },
    { name: 'Muscat', state: 'Oman', lat: 23.5880, lon: 58.3829, tz: 'Asia/Muscat' },
    { name: 'Doha', state: 'Qatar', lat: 25.2854, lon: 51.5310, tz: 'Asia/Qatar' },
    { name: 'Riyadh', state: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, tz: 'Asia/Riyadh' },
    { name: 'Kuwait City', state: 'Kuwait', lat: 29.3759, lon: 47.9774, tz: 'Asia/Kuwait' },
    { name: 'Singapore', state: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore', hot: true },
    { name: 'Kuala Lumpur', state: 'Malaysia', lat: 3.1390, lon: 101.6869, tz: 'Asia/Kuala_Lumpur' },
    { name: 'Bangkok', state: 'Thailand', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
    { name: 'Hong Kong', state: 'Hong Kong', lat: 22.3193, lon: 114.1694, tz: 'Asia/Hong_Kong' },
    { name: 'Kathmandu', state: 'Nepal', lat: 27.7172, lon: 85.3240, tz: 'Asia/Kathmandu' },
    { name: 'Colombo', state: 'Sri Lanka', lat: 6.9271, lon: 79.8612, tz: 'Asia/Colombo' },
    { name: 'Sydney', state: 'Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney', hot: true },
    { name: 'Melbourne', state: 'Australia', lat: -37.8136, lon: 144.9631, tz: 'Australia/Melbourne' },
    { name: 'Perth', state: 'Australia', lat: -31.9505, lon: 115.8605, tz: 'Australia/Perth' },
    { name: 'Brisbane', state: 'Australia', lat: -27.4698, lon: 153.0251, tz: 'Australia/Brisbane' },
    { name: 'Auckland', state: 'New Zealand', lat: -36.8509, lon: 174.7645, tz: 'Pacific/Auckland' },
    { name: 'Paris', state: 'France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
    { name: 'Frankfurt', state: 'Germany', lat: 50.1109, lon: 8.6821, tz: 'Europe/Berlin' },
    { name: 'Amsterdam', state: 'Netherlands', lat: 52.3676, lon: 4.9041, tz: 'Europe/Amsterdam' },
    { name: 'Mauritius', state: 'Mauritius', lat: -20.3484, lon: 57.5522, tz: 'Indian/Mauritius' },
    { name: 'Nairobi', state: 'Kenya', lat: -1.2921, lon: 36.8219, tz: 'Africa/Nairobi' },
    { name: 'Johannesburg', state: 'South Africa', lat: -26.2041, lon: 28.0473, tz: 'Africa/Johannesburg' },

    /* ================================================================
       ALL-INDIA DISTRICTS + FAMOUS PLACES (generated, 2026)
       Coordinates are WGS-84; every Indian entry uses Asia/Kolkata.
       district: true marks an administrative district; famous: true
       marks a pilgrimage, monument, beach, hill station or park.
       ================================================================ */

    /* Himachal Pradesh */
    { name: 'Bilaspur (Himachal Pradesh)', state: 'Himachal Pradesh', lat: 31.3300, lon: 76.7600, tz: 'Asia/Kolkata', district: true },
    { name: 'Hamirpur', state: 'Himachal Pradesh', lat: 31.6800, lon: 76.5200, tz: 'Asia/Kolkata', district: true },
    { name: 'Kangra', state: 'Himachal Pradesh', lat: 32.2200, lon: 76.3200, tz: 'Asia/Kolkata', district: true },
    { name: 'Kinnaur', state: 'Himachal Pradesh', lat: 31.5300, lon: 78.2700, tz: 'Asia/Kolkata', district: true },
    { name: 'Lahaul and Spiti', state: 'Himachal Pradesh', lat: 32.5700, lon: 77.0300, tz: 'Asia/Kolkata', district: true },
    { name: 'Sirmaur', state: 'Himachal Pradesh', lat: 30.5600, lon: 77.3000, tz: 'Asia/Kolkata', district: true },

    /* Punjab */
    { name: 'Barnala', state: 'Punjab', lat: 30.3800, lon: 75.5500, tz: 'Asia/Kolkata', district: true },
    { name: 'Faridkot', state: 'Punjab', lat: 30.6800, lon: 74.7600, tz: 'Asia/Kolkata', district: true },
    { name: 'Fatehgarh Sahib', state: 'Punjab', lat: 30.6400, lon: 76.4000, tz: 'Asia/Kolkata', district: true },
    { name: 'Fazilka', state: 'Punjab', lat: 30.4000, lon: 74.0300, tz: 'Asia/Kolkata', district: true },
    { name: 'Ferozepur', state: 'Punjab', lat: 30.9300, lon: 74.6200, tz: 'Asia/Kolkata', district: true },
    { name: 'Gurdaspur', state: 'Punjab', lat: 32.0300, lon: 75.4000, tz: 'Asia/Kolkata', district: true },
    { name: 'Kapurthala', state: 'Punjab', lat: 31.3800, lon: 75.3800, tz: 'Asia/Kolkata', district: true },
    { name: 'Malerkotla', state: 'Punjab', lat: 30.5200, lon: 75.8800, tz: 'Asia/Kolkata', district: true },
    { name: 'Mansa', state: 'Punjab', lat: 29.9800, lon: 75.3800, tz: 'Asia/Kolkata', district: true },
    { name: 'Moga', state: 'Punjab', lat: 30.8200, lon: 75.1700, tz: 'Asia/Kolkata', district: true },
    { name: 'Muktsar', state: 'Punjab', lat: 30.4700, lon: 74.5200, tz: 'Asia/Kolkata', district: true },
    { name: 'Rupnagar', state: 'Punjab', lat: 30.9700, lon: 76.5300, tz: 'Asia/Kolkata', district: true },
    { name: 'Sahibzada Ajit Singh Nagar', state: 'Punjab', lat: 30.7000, lon: 76.7200, tz: 'Asia/Kolkata', district: true },
    { name: 'Sangrur', state: 'Punjab', lat: 30.2500, lon: 75.8400, tz: 'Asia/Kolkata', district: true },
    { name: 'Shahid Bhagat Singh Nagar', state: 'Punjab', lat: 31.1300, lon: 76.1200, tz: 'Asia/Kolkata', district: true },
    { name: 'Tarn Taran', state: 'Punjab', lat: 31.4500, lon: 74.9300, tz: 'Asia/Kolkata', district: true },

    /* Haryana */
    { name: 'Charkhi Dadri', state: 'Haryana', lat: 28.6000, lon: 76.2700, tz: 'Asia/Kolkata', district: true },
    { name: 'Jhajjar', state: 'Haryana', lat: 28.6100, lon: 76.6500, tz: 'Asia/Kolkata', district: true },
    { name: 'Mahendragarh', state: 'Haryana', lat: 28.2700, lon: 76.1500, tz: 'Asia/Kolkata', district: true },
    { name: 'Nuh', state: 'Haryana', lat: 28.1100, lon: 77.0000, tz: 'Asia/Kolkata', district: true },
    { name: 'Panchkula', state: 'Haryana', lat: 30.7400, lon: 76.8000, tz: 'Asia/Kolkata', district: true },

    /* Uttarakhand */
    { name: 'Bageshwar', state: 'Uttarakhand', lat: 29.8377, lon: 79.7712, tz: 'Asia/Kolkata', district: true },
    { name: 'Chamoli', state: 'Uttarakhand', lat: 30.2736, lon: 79.3273, tz: 'Asia/Kolkata', district: true },
    { name: 'Champawat', state: 'Uttarakhand', lat: 29.3364, lon: 80.0963, tz: 'Asia/Kolkata', district: true },
    { name: 'Pauri Garhwal', state: 'Uttarakhand', lat: 30.1458, lon: 78.7735, tz: 'Asia/Kolkata', district: true },
    { name: 'Pithoragarh', state: 'Uttarakhand', lat: 29.5828, lon: 80.2182, tz: 'Asia/Kolkata', district: true },
    { name: 'Rudraprayag', state: 'Uttarakhand', lat: 30.2844, lon: 78.9811, tz: 'Asia/Kolkata', district: true },
    { name: 'Tehri Garhwal', state: 'Uttarakhand', lat: 30.3845, lon: 78.4842, tz: 'Asia/Kolkata', district: true },
    { name: 'Udham Singh Nagar', state: 'Uttarakhand', lat: 28.9800, lon: 79.4000, tz: 'Asia/Kolkata', district: true },
    { name: 'Uttarkashi', state: 'Uttarakhand', lat: 30.7267, lon: 78.4354, tz: 'Asia/Kolkata', district: true },

    /* Uttar Pradesh */
    { name: 'Ambedkar Nagar', state: 'Uttar Pradesh', lat: 26.4116, lon: 82.5350, tz: 'Asia/Kolkata', district: true },
    { name: 'Amethi', state: 'Uttar Pradesh', lat: 26.1601, lon: 81.8152, tz: 'Asia/Kolkata', district: true },
    { name: 'Amroha', state: 'Uttar Pradesh', lat: 28.9044, lon: 78.2778, tz: 'Asia/Kolkata', district: true },
    { name: 'Auraiya', state: 'Uttar Pradesh', lat: 26.4638, lon: 79.5222, tz: 'Asia/Kolkata', district: true },
    { name: 'Azamgarh', state: 'Uttar Pradesh', lat: 26.0683, lon: 83.1843, tz: 'Asia/Kolkata', district: true },
    { name: 'Badaun', state: 'Uttar Pradesh', lat: 28.0287, lon: 79.1171, tz: 'Asia/Kolkata', district: true },
    { name: 'Baghpat', state: 'Uttar Pradesh', lat: 28.9427, lon: 77.2276, tz: 'Asia/Kolkata', district: true },
    { name: 'Bahraich', state: 'Uttar Pradesh', lat: 27.5750, lon: 81.5976, tz: 'Asia/Kolkata', district: true },
    { name: 'Ballia', state: 'Uttar Pradesh', lat: 25.7597, lon: 84.1444, tz: 'Asia/Kolkata', district: true },
    { name: 'Balrampur', state: 'Uttar Pradesh', lat: 27.4287, lon: 82.1764, tz: 'Asia/Kolkata', district: true },
    { name: 'Banda', state: 'Uttar Pradesh', lat: 25.4746, lon: 80.3347, tz: 'Asia/Kolkata', district: true },
    { name: 'Barabanki', state: 'Uttar Pradesh', lat: 26.9311, lon: 81.1895, tz: 'Asia/Kolkata', district: true },
    { name: 'Basti', state: 'Uttar Pradesh', lat: 26.8049, lon: 82.7246, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhadohi', state: 'Uttar Pradesh', lat: 25.3950, lon: 82.5694, tz: 'Asia/Kolkata', district: true },
    { name: 'Bijnor', state: 'Uttar Pradesh', lat: 29.3724, lon: 78.1358, tz: 'Asia/Kolkata', district: true },
    { name: 'Bulandshahr', state: 'Uttar Pradesh', lat: 28.4069, lon: 77.8498, tz: 'Asia/Kolkata', district: true },
    { name: 'Chandauli', state: 'Uttar Pradesh', lat: 25.2599, lon: 83.2678, tz: 'Asia/Kolkata', district: true },
    { name: 'Chitrakoot (Uttar Pradesh)', state: 'Uttar Pradesh', lat: 25.2045, lon: 80.9329, tz: 'Asia/Kolkata', district: true },
    { name: 'Deoria', state: 'Uttar Pradesh', lat: 26.5029, lon: 83.7794, tz: 'Asia/Kolkata', district: true },
    { name: 'Etah', state: 'Uttar Pradesh', lat: 27.6253, lon: 78.6653, tz: 'Asia/Kolkata', district: true },
    { name: 'Farrukhabad', state: 'Uttar Pradesh', lat: 27.3828, lon: 79.5891, tz: 'Asia/Kolkata', district: true },
    { name: 'Fatehpur', state: 'Uttar Pradesh', lat: 25.9256, lon: 80.8351, tz: 'Asia/Kolkata', district: true },
    { name: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', lat: 28.4744, lon: 77.5040, tz: 'Asia/Kolkata', district: true },
    { name: 'Ghazipur', state: 'Uttar Pradesh', lat: 25.5786, lon: 83.5780, tz: 'Asia/Kolkata', district: true },
    { name: 'Gonda', state: 'Uttar Pradesh', lat: 27.1337, lon: 81.9610, tz: 'Asia/Kolkata', district: true },
    { name: 'Hamirpur (Uttar Pradesh)', state: 'Uttar Pradesh', lat: 25.9546, lon: 80.1491, tz: 'Asia/Kolkata', district: true },
    { name: 'Hapur', state: 'Uttar Pradesh', lat: 28.7306, lon: 77.7759, tz: 'Asia/Kolkata', district: true },
    { name: 'Hardoi', state: 'Uttar Pradesh', lat: 27.4111, lon: 80.1256, tz: 'Asia/Kolkata', district: true },
    { name: 'Hathras', state: 'Uttar Pradesh', lat: 27.6033, lon: 78.0536, tz: 'Asia/Kolkata', district: true },
    { name: 'Jalaun', state: 'Uttar Pradesh', lat: 26.1360, lon: 79.3496, tz: 'Asia/Kolkata', district: true },
    { name: 'Jaunpur', state: 'Uttar Pradesh', lat: 25.7464, lon: 82.6837, tz: 'Asia/Kolkata', district: true },
    { name: 'Kannauj', state: 'Uttar Pradesh', lat: 27.0544, lon: 79.9142, tz: 'Asia/Kolkata', district: true },
    { name: 'Kanpur Dehat', state: 'Uttar Pradesh', lat: 26.3989, lon: 79.9329, tz: 'Asia/Kolkata', district: true },
    { name: 'Kanpur Nagar', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, tz: 'Asia/Kolkata', district: true },
    { name: 'Kasganj', state: 'Uttar Pradesh', lat: 27.8093, lon: 78.6477, tz: 'Asia/Kolkata', district: true },
    { name: 'Kaushambi', state: 'Uttar Pradesh', lat: 25.5342, lon: 81.3323, tz: 'Asia/Kolkata', district: true },
    { name: 'Kushinagar', state: 'Uttar Pradesh', lat: 26.9030, lon: 83.9825, tz: 'Asia/Kolkata', district: true },
    { name: 'Lakhimpur Kheri', state: 'Uttar Pradesh', lat: 27.9482, lon: 80.7788, tz: 'Asia/Kolkata', district: true },
    { name: 'Lalitpur', state: 'Uttar Pradesh', lat: 24.6853, lon: 78.4187, tz: 'Asia/Kolkata', district: true },
    { name: 'Maharajganj', state: 'Uttar Pradesh', lat: 27.1437, lon: 83.5606, tz: 'Asia/Kolkata', district: true },
    { name: 'Mahoba', state: 'Uttar Pradesh', lat: 25.2903, lon: 79.8732, tz: 'Asia/Kolkata', district: true },
    { name: 'Mainpuri', state: 'Uttar Pradesh', lat: 27.2274, lon: 79.0243, tz: 'Asia/Kolkata', district: true },
    { name: 'Mau', state: 'Uttar Pradesh', lat: 25.9409, lon: 83.5627, tz: 'Asia/Kolkata', district: true },
    { name: 'Muzaffarnagar', state: 'Uttar Pradesh', lat: 29.4727, lon: 77.7085, tz: 'Asia/Kolkata', district: true },
    { name: 'Pilibhit', state: 'Uttar Pradesh', lat: 28.6315, lon: 79.7997, tz: 'Asia/Kolkata', district: true },
    { name: 'Pratapgarh', state: 'Uttar Pradesh', lat: 25.9083, lon: 81.9366, tz: 'Asia/Kolkata', district: true },
    { name: 'Rae Bareli', state: 'Uttar Pradesh', lat: 26.2255, lon: 81.2405, tz: 'Asia/Kolkata', district: true },
    { name: 'Rampur', state: 'Uttar Pradesh', lat: 28.8155, lon: 79.0253, tz: 'Asia/Kolkata', district: true },
    { name: 'Saharanpur', state: 'Uttar Pradesh', lat: 29.9640, lon: 77.5460, tz: 'Asia/Kolkata', district: true },
    { name: 'Sambhal', state: 'Uttar Pradesh', lat: 28.5833, lon: 78.5667, tz: 'Asia/Kolkata', district: true },
    { name: 'Sant Kabir Nagar', state: 'Uttar Pradesh', lat: 26.7441, lon: 83.0298, tz: 'Asia/Kolkata', district: true },
    { name: 'Shahjahanpur', state: 'Uttar Pradesh', lat: 27.8804, lon: 79.9130, tz: 'Asia/Kolkata', district: true },
    { name: 'Shamli', state: 'Uttar Pradesh', lat: 29.4496, lon: 77.3087, tz: 'Asia/Kolkata', district: true },
    { name: 'Shravasti', state: 'Uttar Pradesh', lat: 27.5029, lon: 81.9056, tz: 'Asia/Kolkata', district: true },
    { name: 'Siddharthnagar', state: 'Uttar Pradesh', lat: 27.2952, lon: 82.8130, tz: 'Asia/Kolkata', district: true },
    { name: 'Sitapur', state: 'Uttar Pradesh', lat: 27.5684, lon: 80.6797, tz: 'Asia/Kolkata', district: true },
    { name: 'Sonbhadra', state: 'Uttar Pradesh', lat: 24.6871, lon: 83.0645, tz: 'Asia/Kolkata', district: true },
    { name: 'Unnao', state: 'Uttar Pradesh', lat: 26.5393, lon: 80.4878, tz: 'Asia/Kolkata', district: true },

    /* Delhi */
    { name: 'Central Delhi', state: 'Delhi', lat: 28.6465, lon: 77.2346, tz: 'Asia/Kolkata', district: true },
    { name: 'East Delhi', state: 'Delhi', lat: 28.6300, lon: 77.3000, tz: 'Asia/Kolkata', district: true },
    { name: 'North Delhi', state: 'Delhi', lat: 28.6833, lon: 77.2167, tz: 'Asia/Kolkata', district: true },
    { name: 'North East Delhi', state: 'Delhi', lat: 28.7121, lon: 77.2721, tz: 'Asia/Kolkata', district: true },
    { name: 'North West Delhi', state: 'Delhi', lat: 28.7299, lon: 77.1420, tz: 'Asia/Kolkata', district: true },
    { name: 'Shahdara', state: 'Delhi', lat: 28.6826, lon: 77.2917, tz: 'Asia/Kolkata', district: true },
    { name: 'South Delhi', state: 'Delhi', lat: 28.4897, lon: 77.1906, tz: 'Asia/Kolkata', district: true },
    { name: 'South East Delhi', state: 'Delhi', lat: 28.5393, lon: 77.2514, tz: 'Asia/Kolkata', district: true },
    { name: 'South West Delhi', state: 'Delhi', lat: 28.5830, lon: 77.0620, tz: 'Asia/Kolkata', district: true },
    { name: 'West Delhi', state: 'Delhi', lat: 28.6496, lon: 77.0864, tz: 'Asia/Kolkata', district: true },

    /* Madhya Pradesh */
    { name: 'Agar Malwa', state: 'Madhya Pradesh', lat: 23.7144, lon: 76.0152, tz: 'Asia/Kolkata', district: true },
    { name: 'Alirajpur', state: 'Madhya Pradesh', lat: 22.3018, lon: 74.3542, tz: 'Asia/Kolkata', district: true },
    { name: 'Anuppur', state: 'Madhya Pradesh', lat: 23.1042, lon: 81.6917, tz: 'Asia/Kolkata', district: true },
    { name: 'Ashoknagar', state: 'Madhya Pradesh', lat: 24.5779, lon: 77.7289, tz: 'Asia/Kolkata', district: true },
    { name: 'Balaghat', state: 'Madhya Pradesh', lat: 21.8129, lon: 80.1838, tz: 'Asia/Kolkata', district: true },
    { name: 'Barwani', state: 'Madhya Pradesh', lat: 22.0315, lon: 74.9038, tz: 'Asia/Kolkata', district: true },
    { name: 'Betul', state: 'Madhya Pradesh', lat: 21.9022, lon: 77.8967, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhind', state: 'Madhya Pradesh', lat: 26.5615, lon: 78.7836, tz: 'Asia/Kolkata', district: true },
    { name: 'Burhanpur', state: 'Madhya Pradesh', lat: 21.3145, lon: 76.2217, tz: 'Asia/Kolkata', district: true },
    { name: 'Chhatarpur', state: 'Madhya Pradesh', lat: 24.9157, lon: 79.5824, tz: 'Asia/Kolkata', district: true },
    { name: 'Damoh', state: 'Madhya Pradesh', lat: 23.8388, lon: 79.4422, tz: 'Asia/Kolkata', district: true },
    { name: 'Datia', state: 'Madhya Pradesh', lat: 25.6653, lon: 78.4619, tz: 'Asia/Kolkata', district: true },
    { name: 'Dhar', state: 'Madhya Pradesh', lat: 22.5976, lon: 75.3055, tz: 'Asia/Kolkata', district: true },
    { name: 'Dindori', state: 'Madhya Pradesh', lat: 22.9463, lon: 81.0776, tz: 'Asia/Kolkata', district: true },
    { name: 'Guna', state: 'Madhya Pradesh', lat: 24.6473, lon: 77.3110, tz: 'Asia/Kolkata', district: true },
    { name: 'Harda', state: 'Madhya Pradesh', lat: 22.3392, lon: 77.1009, tz: 'Asia/Kolkata', district: true },
    { name: 'Narmadapuram', state: 'Madhya Pradesh', lat: 22.7533, lon: 77.7170, tz: 'Asia/Kolkata', district: true },
    { name: 'Jhabua', state: 'Madhya Pradesh', lat: 22.7661, lon: 74.5932, tz: 'Asia/Kolkata', district: true },
    { name: 'Katni', state: 'Madhya Pradesh', lat: 23.8320, lon: 80.3985, tz: 'Asia/Kolkata', district: true },
    { name: 'Khandwa', state: 'Madhya Pradesh', lat: 21.8262, lon: 76.3533, tz: 'Asia/Kolkata', district: true },
    { name: 'Khargone', state: 'Madhya Pradesh', lat: 21.8228, lon: 75.6155, tz: 'Asia/Kolkata', district: true },
    { name: 'Maihar', state: 'Madhya Pradesh', lat: 24.2667, lon: 80.7500, tz: 'Asia/Kolkata', district: true },
    { name: 'Mandla', state: 'Madhya Pradesh', lat: 22.5997, lon: 80.3697, tz: 'Asia/Kolkata', district: true },
    { name: 'Mandsaur', state: 'Madhya Pradesh', lat: 24.0734, lon: 75.0683, tz: 'Asia/Kolkata', district: true },
    { name: 'Mauganj', state: 'Madhya Pradesh', lat: 24.6833, lon: 81.8833, tz: 'Asia/Kolkata', district: true },
    { name: 'Morena', state: 'Madhya Pradesh', lat: 26.5003, lon: 78.0058, tz: 'Asia/Kolkata', district: true },
    { name: 'Narsinghpur', state: 'Madhya Pradesh', lat: 22.9515, lon: 79.1947, tz: 'Asia/Kolkata', district: true },
    { name: 'Neemuch', state: 'Madhya Pradesh', lat: 24.4754, lon: 74.8722, tz: 'Asia/Kolkata', district: true },
    { name: 'Niwari', state: 'Madhya Pradesh', lat: 25.3582, lon: 78.8021, tz: 'Asia/Kolkata', district: true },
    { name: 'Pandhurna', state: 'Madhya Pradesh', lat: 21.5959, lon: 78.5204, tz: 'Asia/Kolkata', district: true },
    { name: 'Panna', state: 'Madhya Pradesh', lat: 24.2694, lon: 80.1706, tz: 'Asia/Kolkata', district: true },
    { name: 'Raisen', state: 'Madhya Pradesh', lat: 23.3320, lon: 77.7812, tz: 'Asia/Kolkata', district: true },
    { name: 'Rajgarh', state: 'Madhya Pradesh', lat: 24.0093, lon: 76.7329, tz: 'Asia/Kolkata', district: true },
    { name: 'Sehore', state: 'Madhya Pradesh', lat: 23.2032, lon: 77.0845, tz: 'Asia/Kolkata', district: true },
    { name: 'Seoni', state: 'Madhya Pradesh', lat: 22.0869, lon: 79.5435, tz: 'Asia/Kolkata', district: true },
    { name: 'Shahdol', state: 'Madhya Pradesh', lat: 23.3005, lon: 81.3571, tz: 'Asia/Kolkata', district: true },
    { name: 'Shajapur', state: 'Madhya Pradesh', lat: 23.4284, lon: 76.2754, tz: 'Asia/Kolkata', district: true },
    { name: 'Sheopur', state: 'Madhya Pradesh', lat: 25.6669, lon: 76.6961, tz: 'Asia/Kolkata', district: true },
    { name: 'Shivpuri', state: 'Madhya Pradesh', lat: 25.4326, lon: 77.6539, tz: 'Asia/Kolkata', district: true },
    { name: 'Sidhi', state: 'Madhya Pradesh', lat: 24.4042, lon: 81.8797, tz: 'Asia/Kolkata', district: true },
    { name: 'Singrauli', state: 'Madhya Pradesh', lat: 24.1950, lon: 82.6625, tz: 'Asia/Kolkata', district: true },
    { name: 'Tikamgarh', state: 'Madhya Pradesh', lat: 24.7454, lon: 78.8329, tz: 'Asia/Kolkata', district: true },
    { name: 'Umaria', state: 'Madhya Pradesh', lat: 23.5262, lon: 80.8354, tz: 'Asia/Kolkata', district: true },
    { name: 'Vidisha', state: 'Madhya Pradesh', lat: 23.5251, lon: 77.8081, tz: 'Asia/Kolkata', district: true },

    /* Rajasthan */
    { name: 'Anupgarh', state: 'Rajasthan', lat: 29.1912, lon: 73.2085, tz: 'Asia/Kolkata', district: true },
    { name: 'Balotra', state: 'Rajasthan', lat: 25.8344, lon: 72.2382, tz: 'Asia/Kolkata', district: true },
    { name: 'Banswara', state: 'Rajasthan', lat: 23.5461, lon: 74.4350, tz: 'Asia/Kolkata', district: true },
    { name: 'Baran', state: 'Rajasthan', lat: 25.1011, lon: 76.5132, tz: 'Asia/Kolkata', district: true },
    { name: 'Barmer', state: 'Rajasthan', lat: 25.7521, lon: 71.3967, tz: 'Asia/Kolkata', district: true },
    { name: 'Beawar', state: 'Rajasthan', lat: 26.1042, lon: 74.3195, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhilwara', state: 'Rajasthan', lat: 25.3463, lon: 74.6364, tz: 'Asia/Kolkata', district: true },
    { name: 'Bundi', state: 'Rajasthan', lat: 25.4398, lon: 75.6358, tz: 'Asia/Kolkata', district: true },
    { name: 'Churu', state: 'Rajasthan', lat: 28.2900, lon: 74.9720, tz: 'Asia/Kolkata', district: true },
    { name: 'Dausa', state: 'Rajasthan', lat: 26.8856, lon: 76.3284, tz: 'Asia/Kolkata', district: true },
    { name: 'Deeg', state: 'Rajasthan', lat: 27.4714, lon: 77.3204, tz: 'Asia/Kolkata', district: true },
    { name: 'Dholpur', state: 'Rajasthan', lat: 26.7013, lon: 77.8926, tz: 'Asia/Kolkata', district: true },
    { name: 'Didwana-Kuchaman', state: 'Rajasthan', lat: 27.4011, lon: 74.5756, tz: 'Asia/Kolkata', district: true },
    { name: 'Dudu', state: 'Rajasthan', lat: 26.6667, lon: 75.2333, tz: 'Asia/Kolkata', district: true },
    { name: 'Dungarpur', state: 'Rajasthan', lat: 23.8378, lon: 73.7196, tz: 'Asia/Kolkata', district: true },
    { name: 'Gangapur City', state: 'Rajasthan', lat: 26.4764, lon: 76.7197, tz: 'Asia/Kolkata', district: true },
    { name: 'Hanumangarh', state: 'Rajasthan', lat: 29.5794, lon: 74.3235, tz: 'Asia/Kolkata', district: true },
    { name: 'Jaipur Rural', state: 'Rajasthan', lat: 26.9200, lon: 75.8000, tz: 'Asia/Kolkata', district: true },
    { name: 'Jalore', state: 'Rajasthan', lat: 25.3423, lon: 72.6186, tz: 'Asia/Kolkata', district: true },
    { name: 'Jhalawar', state: 'Rajasthan', lat: 24.5973, lon: 76.1610, tz: 'Asia/Kolkata', district: true },
    { name: 'Jhunjhunu', state: 'Rajasthan', lat: 28.1289, lon: 75.3995, tz: 'Asia/Kolkata', district: true },
    { name: 'Jodhpur Rural', state: 'Rajasthan', lat: 26.2500, lon: 73.0500, tz: 'Asia/Kolkata', district: true },
    { name: 'Karauli', state: 'Rajasthan', lat: 26.5024, lon: 77.0253, tz: 'Asia/Kolkata', district: true },
    { name: 'Kekri', state: 'Rajasthan', lat: 25.9664, lon: 75.1485, tz: 'Asia/Kolkata', district: true },
    { name: 'Khairthal-Tijara', state: 'Rajasthan', lat: 27.8228, lon: 76.8202, tz: 'Asia/Kolkata', district: true },
    { name: 'Kotputli-Behror', state: 'Rajasthan', lat: 27.7027, lon: 76.2046, tz: 'Asia/Kolkata', district: true },
    { name: 'Nagaur', state: 'Rajasthan', lat: 27.1983, lon: 73.7441, tz: 'Asia/Kolkata', district: true },
    { name: 'Neem Ka Thana', state: 'Rajasthan', lat: 27.7347, lon: 75.7850, tz: 'Asia/Kolkata', district: true },
    { name: 'Pali', state: 'Rajasthan', lat: 25.7713, lon: 73.3237, tz: 'Asia/Kolkata', district: true },
    { name: 'Phalodi', state: 'Rajasthan', lat: 27.1325, lon: 72.3665, tz: 'Asia/Kolkata', district: true },
    { name: 'Pratapgarh (Rajasthan)', state: 'Rajasthan', lat: 24.0305, lon: 74.7820, tz: 'Asia/Kolkata', district: true },
    { name: 'Rajsamand', state: 'Rajasthan', lat: 25.0654, lon: 73.8828, tz: 'Asia/Kolkata', district: true },
    { name: 'Salumbar', state: 'Rajasthan', lat: 24.1396, lon: 74.0502, tz: 'Asia/Kolkata', district: true },
    { name: 'Sanchore', state: 'Rajasthan', lat: 24.7554, lon: 71.7656, tz: 'Asia/Kolkata', district: true },
    { name: 'Sawai Madhopur', state: 'Rajasthan', lat: 26.0125, lon: 76.3533, tz: 'Asia/Kolkata', district: true },
    { name: 'Shahpura', state: 'Rajasthan', lat: 25.6267, lon: 74.9281, tz: 'Asia/Kolkata', district: true },
    { name: 'Sirohi', state: 'Rajasthan', lat: 24.8826, lon: 72.8589, tz: 'Asia/Kolkata', district: true },
    { name: 'Sri Ganganagar', state: 'Rajasthan', lat: 29.9175, lon: 73.8771, tz: 'Asia/Kolkata', district: true },
    { name: 'Tonk', state: 'Rajasthan', lat: 26.1666, lon: 75.7845, tz: 'Asia/Kolkata', district: true },

    /* Gujarat */
    { name: 'Amreli', state: 'Gujarat', lat: 21.6032, lon: 71.2221, tz: 'Asia/Kolkata', district: true },
    { name: 'Aravalli', state: 'Gujarat', lat: 23.3323, lon: 73.3134, tz: 'Asia/Kolkata', district: true },
    { name: 'Banaskantha', state: 'Gujarat', lat: 24.1724, lon: 71.8601, tz: 'Asia/Kolkata', district: true },
    { name: 'Bharuch', state: 'Gujarat', lat: 21.7051, lon: 72.9959, tz: 'Asia/Kolkata', district: true },
    { name: 'Botad', state: 'Gujarat', lat: 22.1706, lon: 71.6684, tz: 'Asia/Kolkata', district: true },
    { name: 'Chhota Udaipur', state: 'Gujarat', lat: 22.3082, lon: 74.0153, tz: 'Asia/Kolkata', district: true },
    { name: 'Dahod', state: 'Gujarat', lat: 22.8335, lon: 74.2562, tz: 'Asia/Kolkata', district: true },
    { name: 'Dang', state: 'Gujarat', lat: 20.8038, lon: 73.6843, tz: 'Asia/Kolkata', district: true },
    { name: 'Devbhoomi Dwarka', state: 'Gujarat', lat: 22.2442, lon: 68.9685, tz: 'Asia/Kolkata', district: true },
    { name: 'Gir Somnath', state: 'Gujarat', lat: 20.8655, lon: 70.3642, tz: 'Asia/Kolkata', district: true },
    { name: 'Kheda', state: 'Gujarat', lat: 22.7533, lon: 72.6841, tz: 'Asia/Kolkata', district: true },
    { name: 'Kutch', state: 'Gujarat', lat: 23.7337, lon: 69.8597, tz: 'Asia/Kolkata', district: true },
    { name: 'Mahisagar', state: 'Gujarat', lat: 23.1118, lon: 73.5358, tz: 'Asia/Kolkata', district: true },
    { name: 'Mehsana', state: 'Gujarat', lat: 23.5880, lon: 72.3693, tz: 'Asia/Kolkata', district: true },
    { name: 'Morbi', state: 'Gujarat', lat: 22.8120, lon: 70.8322, tz: 'Asia/Kolkata', district: true },
    { name: 'Narmada', state: 'Gujarat', lat: 21.8708, lon: 73.5463, tz: 'Asia/Kolkata', district: true },
    { name: 'Panchmahal', state: 'Gujarat', lat: 22.7601, lon: 73.6217, tz: 'Asia/Kolkata', district: true },
    { name: 'Patan', state: 'Gujarat', lat: 23.8493, lon: 72.1266, tz: 'Asia/Kolkata', district: true },
    { name: 'Porbandar', state: 'Gujarat', lat: 21.6417, lon: 69.6293, tz: 'Asia/Kolkata', district: true },
    { name: 'Sabarkantha', state: 'Gujarat', lat: 23.6335, lon: 72.9774, tz: 'Asia/Kolkata', district: true },
    { name: 'Surendranagar', state: 'Gujarat', lat: 22.7275, lon: 71.6372, tz: 'Asia/Kolkata', district: true },
    { name: 'Tapi', state: 'Gujarat', lat: 21.1645, lon: 73.5414, tz: 'Asia/Kolkata', district: true },
    { name: 'Valsad', state: 'Gujarat', lat: 20.5992, lon: 72.9342, tz: 'Asia/Kolkata', district: true },

    /* Maharashtra */
    { name: 'Ahmednagar', state: 'Maharashtra', lat: 19.0952, lon: 74.7496, tz: 'Asia/Kolkata', district: true },
    { name: 'Beed', state: 'Maharashtra', lat: 18.9894, lon: 75.7601, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhandara', state: 'Maharashtra', lat: 21.1777, lon: 79.6583, tz: 'Asia/Kolkata', district: true },
    { name: 'Buldhana', state: 'Maharashtra', lat: 20.5284, lon: 76.1843, tz: 'Asia/Kolkata', district: true },
    { name: 'Chandrapur', state: 'Maharashtra', lat: 19.9615, lon: 79.2961, tz: 'Asia/Kolkata', district: true },
    { name: 'Dhule', state: 'Maharashtra', lat: 20.9042, lon: 74.7749, tz: 'Asia/Kolkata', district: true },
    { name: 'Gadchiroli', state: 'Maharashtra', lat: 20.1849, lon: 80.0033, tz: 'Asia/Kolkata', district: true },
    { name: 'Gondia', state: 'Maharashtra', lat: 21.4549, lon: 80.1961, tz: 'Asia/Kolkata', district: true },
    { name: 'Hingoli', state: 'Maharashtra', lat: 19.7153, lon: 77.1472, tz: 'Asia/Kolkata', district: true },
    { name: 'Jalna', state: 'Maharashtra', lat: 19.8297, lon: 75.8800, tz: 'Asia/Kolkata', district: true },
    { name: 'Latur', state: 'Maharashtra', lat: 18.4088, lon: 76.5604, tz: 'Asia/Kolkata', district: true },
    { name: 'Mumbai City', state: 'Maharashtra', lat: 18.9067, lon: 72.8147, tz: 'Asia/Kolkata', district: true },
    { name: 'Mumbai Suburban', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, tz: 'Asia/Kolkata', district: true },
    { name: 'Nandurbar', state: 'Maharashtra', lat: 21.3695, lon: 74.2427, tz: 'Asia/Kolkata', district: true },
    { name: 'Osmanabad', state: 'Maharashtra', lat: 18.1856, lon: 76.0419, tz: 'Asia/Kolkata', district: true },
    { name: 'Palghar', state: 'Maharashtra', lat: 19.6966, lon: 72.7655, tz: 'Asia/Kolkata', district: true },
    { name: 'Parbhani', state: 'Maharashtra', lat: 19.2644, lon: 76.7766, tz: 'Asia/Kolkata', district: true },
    { name: 'Raigad', state: 'Maharashtra', lat: 18.5158, lon: 73.1822, tz: 'Asia/Kolkata', district: true },
    { name: 'Ratnagiri', state: 'Maharashtra', lat: 16.9902, lon: 73.3120, tz: 'Asia/Kolkata', district: true },
    { name: 'Satara', state: 'Maharashtra', lat: 17.6805, lon: 73.9966, tz: 'Asia/Kolkata', district: true },
    { name: 'Sindhudurg', state: 'Maharashtra', lat: 16.1084, lon: 73.5300, tz: 'Asia/Kolkata', district: true },
    { name: 'Wardha', state: 'Maharashtra', lat: 20.7453, lon: 78.6022, tz: 'Asia/Kolkata', district: true },
    { name: 'Washim', state: 'Maharashtra', lat: 20.1130, lon: 77.1293, tz: 'Asia/Kolkata', district: true },
    { name: 'Yavatmal', state: 'Maharashtra', lat: 20.3888, lon: 78.1204, tz: 'Asia/Kolkata', district: true },

    /* Goa */
    { name: 'North Goa', state: 'Goa', lat: 15.4909, lon: 73.8278, tz: 'Asia/Kolkata', district: true },
    { name: 'South Goa', state: 'Goa', lat: 15.2736, lon: 73.9581, tz: 'Asia/Kolkata', district: true },

    /* Karnataka */
    { name: 'Bagalkote', state: 'Karnataka', lat: 16.1691, lon: 75.6615, tz: 'Asia/Kolkata', district: true },
    { name: 'Ballari', state: 'Karnataka', lat: 15.1394, lon: 76.9214, tz: 'Asia/Kolkata', district: true },
    { name: 'Bengaluru Rural', state: 'Karnataka', lat: 13.1500, lon: 77.5800, tz: 'Asia/Kolkata', district: true },
    { name: 'Bengaluru Urban', state: 'Karnataka', lat: 12.9716, lon: 77.5946, tz: 'Asia/Kolkata', district: true },
    { name: 'Bidar', state: 'Karnataka', lat: 17.9104, lon: 77.5199, tz: 'Asia/Kolkata', district: true },
    { name: 'Chamarajanagara', state: 'Karnataka', lat: 11.9261, lon: 76.9437, tz: 'Asia/Kolkata', district: true },
    { name: 'Chikkaballapur', state: 'Karnataka', lat: 13.4325, lon: 77.7275, tz: 'Asia/Kolkata', district: true },
    { name: 'Chikkamagaluru', state: 'Karnataka', lat: 13.3161, lon: 75.7720, tz: 'Asia/Kolkata', district: true },
    { name: 'Chitradurga', state: 'Karnataka', lat: 14.2251, lon: 76.4010, tz: 'Asia/Kolkata', district: true },
    { name: 'Dakshina Kannada', state: 'Karnataka', lat: 12.9141, lon: 74.8560, tz: 'Asia/Kolkata', district: true },
    { name: 'Dharwad', state: 'Karnataka', lat: 15.4589, lon: 75.0078, tz: 'Asia/Kolkata', district: true },
    { name: 'Gadag', state: 'Karnataka', lat: 15.4297, lon: 75.6300, tz: 'Asia/Kolkata', district: true },
    { name: 'Hassan', state: 'Karnataka', lat: 13.0068, lon: 76.1004, tz: 'Asia/Kolkata', district: true },
    { name: 'Haveri', state: 'Karnataka', lat: 14.7946, lon: 75.4011, tz: 'Asia/Kolkata', district: true },
    { name: 'Kodagu', state: 'Karnataka', lat: 12.4244, lon: 75.7382, tz: 'Asia/Kolkata', district: true },
    { name: 'Kolar', state: 'Karnataka', lat: 13.1367, lon: 78.1292, tz: 'Asia/Kolkata', district: true },
    { name: 'Koppal', state: 'Karnataka', lat: 15.3456, lon: 76.1557, tz: 'Asia/Kolkata', district: true },
    { name: 'Mandya', state: 'Karnataka', lat: 12.5218, lon: 76.8951, tz: 'Asia/Kolkata', district: true },
    { name: 'Raichur', state: 'Karnataka', lat: 16.2076, lon: 77.3463, tz: 'Asia/Kolkata', district: true },
    { name: 'Ramanagara', state: 'Karnataka', lat: 12.7150, lon: 77.2813, tz: 'Asia/Kolkata', district: true },
    { name: 'Uttara Kannada', state: 'Karnataka', lat: 14.8185, lon: 74.1416, tz: 'Asia/Kolkata', district: true },
    { name: 'Vijayanagara', state: 'Karnataka', lat: 15.2633, lon: 76.3882, tz: 'Asia/Kolkata', district: true },
    { name: 'Yadgir', state: 'Karnataka', lat: 16.7628, lon: 77.1352, tz: 'Asia/Kolkata', district: true },

    /* Kerala */
    { name: 'Ernakulam', state: 'Kerala', lat: 9.9816, lon: 76.2999, tz: 'Asia/Kolkata', district: true },
    { name: 'Idukki', state: 'Kerala', lat: 9.8493, lon: 76.9734, tz: 'Asia/Kolkata', district: true },
    { name: 'Kasaragod', state: 'Kerala', lat: 12.5102, lon: 74.9852, tz: 'Asia/Kolkata', district: true },
    { name: 'Kottayam', state: 'Kerala', lat: 9.5916, lon: 76.5222, tz: 'Asia/Kolkata', district: true },
    { name: 'Malappuram', state: 'Kerala', lat: 11.0735, lon: 76.0740, tz: 'Asia/Kolkata', district: true },
    { name: 'Pathanamthitta', state: 'Kerala', lat: 9.2648, lon: 76.7870, tz: 'Asia/Kolkata', district: true },
    { name: 'Wayanad', state: 'Kerala', lat: 11.6103, lon: 76.0825, tz: 'Asia/Kolkata', district: true },

    /* Tamil Nadu */
    { name: 'Ariyalur', state: 'Tamil Nadu', lat: 11.1400, lon: 79.0786, tz: 'Asia/Kolkata', district: true },
    { name: 'Chengalpattu', state: 'Tamil Nadu', lat: 12.6939, lon: 79.9756, tz: 'Asia/Kolkata', district: true },
    { name: 'Cuddalore', state: 'Tamil Nadu', lat: 11.7480, lon: 79.7714, tz: 'Asia/Kolkata', district: true },
    { name: 'Dharmapuri', state: 'Tamil Nadu', lat: 12.1277, lon: 78.1582, tz: 'Asia/Kolkata', district: true },
    { name: 'Dindigul', state: 'Tamil Nadu', lat: 10.3673, lon: 77.9803, tz: 'Asia/Kolkata', district: true },
    { name: 'Kallakurichi', state: 'Tamil Nadu', lat: 11.7384, lon: 78.9639, tz: 'Asia/Kolkata', district: true },
    { name: 'Karur', state: 'Tamil Nadu', lat: 10.9598, lon: 78.0766, tz: 'Asia/Kolkata', district: true },
    { name: 'Krishnagiri', state: 'Tamil Nadu', lat: 12.5186, lon: 78.2137, tz: 'Asia/Kolkata', district: true },
    { name: 'Mayiladuthurai', state: 'Tamil Nadu', lat: 11.1018, lon: 79.6526, tz: 'Asia/Kolkata', district: true },
    { name: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.7656, lon: 79.8424, tz: 'Asia/Kolkata', district: true },
    { name: 'Namakkal', state: 'Tamil Nadu', lat: 11.2189, lon: 78.1674, tz: 'Asia/Kolkata', district: true },
    { name: 'Nilgiris', state: 'Tamil Nadu', lat: 11.4100, lon: 76.6950, tz: 'Asia/Kolkata', district: true },
    { name: 'Perambalur', state: 'Tamil Nadu', lat: 11.2342, lon: 78.8821, tz: 'Asia/Kolkata', district: true },
    { name: 'Pudukkottai', state: 'Tamil Nadu', lat: 10.3797, lon: 78.8205, tz: 'Asia/Kolkata', district: true },
    { name: 'Ramanathapuram', state: 'Tamil Nadu', lat: 9.3639, lon: 78.8306, tz: 'Asia/Kolkata', district: true },
    { name: 'Ranipet', state: 'Tamil Nadu', lat: 12.9272, lon: 79.3330, tz: 'Asia/Kolkata', district: true },
    { name: 'Sivaganga', state: 'Tamil Nadu', lat: 9.8433, lon: 78.4809, tz: 'Asia/Kolkata', district: true },
    { name: 'Tenkasi', state: 'Tamil Nadu', lat: 8.9595, lon: 77.3160, tz: 'Asia/Kolkata', district: true },
    { name: 'Theni', state: 'Tamil Nadu', lat: 10.0096, lon: 77.4776, tz: 'Asia/Kolkata', district: true },
    { name: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642, lon: 78.1348, tz: 'Asia/Kolkata', district: true },
    { name: 'Tirupattur', state: 'Tamil Nadu', lat: 12.4960, lon: 78.5670, tz: 'Asia/Kolkata', district: true },
    { name: 'Tiruppur', state: 'Tamil Nadu', lat: 11.1085, lon: 77.3411, tz: 'Asia/Kolkata', district: true },
    { name: 'Tiruvallur', state: 'Tamil Nadu', lat: 13.1419, lon: 79.9071, tz: 'Asia/Kolkata', district: true },
    { name: 'Tiruvarur', state: 'Tamil Nadu', lat: 10.7661, lon: 79.6367, tz: 'Asia/Kolkata', district: true },
    { name: 'Viluppuram', state: 'Tamil Nadu', lat: 11.9401, lon: 79.4861, tz: 'Asia/Kolkata', district: true },
    { name: 'Virudhunagar', state: 'Tamil Nadu', lat: 9.5872, lon: 77.9515, tz: 'Asia/Kolkata', district: true },

    /* Andhra Pradesh */
    { name: 'Alluri Sitharama Raju', state: 'Andhra Pradesh', lat: 18.0827, lon: 82.6644, tz: 'Asia/Kolkata', district: true },
    { name: 'Anakapalli', state: 'Andhra Pradesh', lat: 17.6896, lon: 83.0024, tz: 'Asia/Kolkata', district: true },
    { name: 'Annamayya', state: 'Andhra Pradesh', lat: 14.0556, lon: 78.7517, tz: 'Asia/Kolkata', district: true },
    { name: 'Bapatla', state: 'Andhra Pradesh', lat: 15.9048, lon: 80.4682, tz: 'Asia/Kolkata', district: true },
    { name: 'Chittoor', state: 'Andhra Pradesh', lat: 13.2172, lon: 79.1003, tz: 'Asia/Kolkata', district: true },
    { name: 'East Godavari', state: 'Andhra Pradesh', lat: 17.0005, lon: 81.8040, tz: 'Asia/Kolkata', district: true },
    { name: 'Konaseema', state: 'Andhra Pradesh', lat: 16.5772, lon: 82.0042, tz: 'Asia/Kolkata', district: true },
    { name: 'Krishna', state: 'Andhra Pradesh', lat: 16.1782, lon: 81.1340, tz: 'Asia/Kolkata', district: true },
    { name: 'Nandyal', state: 'Andhra Pradesh', lat: 15.4851, lon: 78.4867, tz: 'Asia/Kolkata', district: true },
    { name: 'NTR', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480, tz: 'Asia/Kolkata', district: true },
    { name: 'Palnadu', state: 'Andhra Pradesh', lat: 16.2343, lon: 80.0487, tz: 'Asia/Kolkata', district: true },
    { name: 'Parvathipuram Manyam', state: 'Andhra Pradesh', lat: 18.7801, lon: 83.4273, tz: 'Asia/Kolkata', district: true },
    { name: 'Prakasam', state: 'Andhra Pradesh', lat: 15.5057, lon: 80.0499, tz: 'Asia/Kolkata', district: true },
    { name: 'SPSR Nellore', state: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865, tz: 'Asia/Kolkata', district: true },
    { name: 'Sri Sathya Sai', state: 'Andhra Pradesh', lat: 14.1668, lon: 77.8105, tz: 'Asia/Kolkata', district: true },
    { name: 'Vizianagaram', state: 'Andhra Pradesh', lat: 18.1133, lon: 83.3977, tz: 'Asia/Kolkata', district: true },
    { name: 'West Godavari', state: 'Andhra Pradesh', lat: 16.5441, lon: 81.5212, tz: 'Asia/Kolkata', district: true },
    { name: 'YSR Kadapa', state: 'Andhra Pradesh', lat: 14.4673, lon: 78.8242, tz: 'Asia/Kolkata', district: true },

    /* Telangana */
    { name: 'Adilabad', state: 'Telangana', lat: 19.6823, lon: 78.5316, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhadradri Kothagudem', state: 'Telangana', lat: 17.5511, lon: 80.6174, tz: 'Asia/Kolkata', district: true },
    { name: 'Hanumakonda', state: 'Telangana', lat: 18.0054, lon: 79.5591, tz: 'Asia/Kolkata', district: true },
    { name: 'Jagtial', state: 'Telangana', lat: 18.7993, lon: 78.9130, tz: 'Asia/Kolkata', district: true },
    { name: 'Jangaon', state: 'Telangana', lat: 17.7280, lon: 79.1627, tz: 'Asia/Kolkata', district: true },
    { name: 'Jayashankar Bhupalpally', state: 'Telangana', lat: 18.4328, lon: 79.8550, tz: 'Asia/Kolkata', district: true },
    { name: 'Jogulamba Gadwal', state: 'Telangana', lat: 16.2263, lon: 77.8010, tz: 'Asia/Kolkata', district: true },
    { name: 'Kamareddy', state: 'Telangana', lat: 18.3168, lon: 78.3444, tz: 'Asia/Kolkata', district: true },
    { name: 'Komaram Bheem Asifabad', state: 'Telangana', lat: 19.3626, lon: 79.2818, tz: 'Asia/Kolkata', district: true },
    { name: 'Mahabubabad', state: 'Telangana', lat: 17.5960, lon: 80.0076, tz: 'Asia/Kolkata', district: true },
    { name: 'Mahabubnagar', state: 'Telangana', lat: 16.7441, lon: 78.0006, tz: 'Asia/Kolkata', district: true },
    { name: 'Mancherial', state: 'Telangana', lat: 18.8715, lon: 79.4442, tz: 'Asia/Kolkata', district: true },
    { name: 'Medak', state: 'Telangana', lat: 18.0441, lon: 78.2618, tz: 'Asia/Kolkata', district: true },
    { name: 'Medchal-Malkajgiri', state: 'Telangana', lat: 17.6293, lon: 78.4832, tz: 'Asia/Kolkata', district: true },
    { name: 'Mulugu', state: 'Telangana', lat: 18.1904, lon: 79.9431, tz: 'Asia/Kolkata', district: true },
    { name: 'Nagarkurnool', state: 'Telangana', lat: 16.4835, lon: 78.3276, tz: 'Asia/Kolkata', district: true },
    { name: 'Nalgonda', state: 'Telangana', lat: 17.0504, lon: 79.2682, tz: 'Asia/Kolkata', district: true },
    { name: 'Narayanpet', state: 'Telangana', lat: 16.7360, lon: 77.4981, tz: 'Asia/Kolkata', district: true },
    { name: 'Nirmal', state: 'Telangana', lat: 19.0964, lon: 78.3430, tz: 'Asia/Kolkata', district: true },
    { name: 'Peddapalli', state: 'Telangana', lat: 18.6146, lon: 79.3804, tz: 'Asia/Kolkata', district: true },
    { name: 'Rajanna Sircilla', state: 'Telangana', lat: 18.3905, lon: 78.8037, tz: 'Asia/Kolkata', district: true },
    { name: 'Ranga Reddy', state: 'Telangana', lat: 17.2605, lon: 78.3846, tz: 'Asia/Kolkata', district: true },
    { name: 'Sangareddy', state: 'Telangana', lat: 17.6294, lon: 78.0817, tz: 'Asia/Kolkata', district: true },
    { name: 'Siddipet', state: 'Telangana', lat: 18.1018, lon: 78.8520, tz: 'Asia/Kolkata', district: true },
    { name: 'Suryapet', state: 'Telangana', lat: 17.1398, lon: 79.6234, tz: 'Asia/Kolkata', district: true },
    { name: 'Vikarabad', state: 'Telangana', lat: 17.3364, lon: 77.9048, tz: 'Asia/Kolkata', district: true },
    { name: 'Wanaparthy', state: 'Telangana', lat: 16.3639, lon: 78.0631, tz: 'Asia/Kolkata', district: true },
    { name: 'Yadadri Bhuvanagiri', state: 'Telangana', lat: 17.5103, lon: 78.8893, tz: 'Asia/Kolkata', district: true },

    /* Bihar */
    { name: 'Araria', state: 'Bihar', lat: 26.1500, lon: 87.5200, tz: 'Asia/Kolkata', district: true },
    { name: 'Arwal', state: 'Bihar', lat: 25.2500, lon: 84.6800, tz: 'Asia/Kolkata', district: true },
    { name: 'Aurangabad (Bihar)', state: 'Bihar', lat: 24.7500, lon: 84.3700, tz: 'Asia/Kolkata', district: true },
    { name: 'Banka', state: 'Bihar', lat: 24.8800, lon: 86.9200, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhojpur', state: 'Bihar', lat: 25.5600, lon: 84.6700, tz: 'Asia/Kolkata', district: true },
    { name: 'Buxar', state: 'Bihar', lat: 25.5600, lon: 83.9800, tz: 'Asia/Kolkata', district: true },
    { name: 'East Champaran', state: 'Bihar', lat: 26.6500, lon: 84.9200, tz: 'Asia/Kolkata', district: true },
    { name: 'Gopalganj', state: 'Bihar', lat: 26.4700, lon: 84.4300, tz: 'Asia/Kolkata', district: true },
    { name: 'Jamui', state: 'Bihar', lat: 24.9300, lon: 86.2200, tz: 'Asia/Kolkata', district: true },
    { name: 'Jehanabad', state: 'Bihar', lat: 25.2100, lon: 84.9900, tz: 'Asia/Kolkata', district: true },
    { name: 'Kaimur', state: 'Bihar', lat: 25.0300, lon: 83.6100, tz: 'Asia/Kolkata', district: true },
    { name: 'Khagaria', state: 'Bihar', lat: 25.5000, lon: 86.4700, tz: 'Asia/Kolkata', district: true },
    { name: 'Kishanganj', state: 'Bihar', lat: 26.0800, lon: 87.9400, tz: 'Asia/Kolkata', district: true },
    { name: 'Lakhisarai', state: 'Bihar', lat: 25.1700, lon: 86.0900, tz: 'Asia/Kolkata', district: true },
    { name: 'Madhepura', state: 'Bihar', lat: 25.9200, lon: 86.7900, tz: 'Asia/Kolkata', district: true },
    { name: 'Madhubani', state: 'Bihar', lat: 26.3500, lon: 86.0800, tz: 'Asia/Kolkata', district: true },
    { name: 'Munger', state: 'Bihar', lat: 25.3800, lon: 86.4700, tz: 'Asia/Kolkata', district: true },
    { name: 'Nalanda', state: 'Bihar', lat: 25.2000, lon: 85.5200, tz: 'Asia/Kolkata', district: true },
    { name: 'Nawada', state: 'Bihar', lat: 24.8800, lon: 85.5300, tz: 'Asia/Kolkata', district: true },
    { name: 'Rohtas', state: 'Bihar', lat: 24.9500, lon: 84.0300, tz: 'Asia/Kolkata', district: true },
    { name: 'Saharsa', state: 'Bihar', lat: 25.8800, lon: 86.6000, tz: 'Asia/Kolkata', district: true },
    { name: 'Samastipur', state: 'Bihar', lat: 25.8600, lon: 85.7800, tz: 'Asia/Kolkata', district: true },
    { name: 'Saran', state: 'Bihar', lat: 25.7800, lon: 84.7300, tz: 'Asia/Kolkata', district: true },
    { name: 'Sheikhpura', state: 'Bihar', lat: 25.1300, lon: 85.8600, tz: 'Asia/Kolkata', district: true },
    { name: 'Sheohar', state: 'Bihar', lat: 26.5100, lon: 85.2900, tz: 'Asia/Kolkata', district: true },
    { name: 'Sitamarhi', state: 'Bihar', lat: 26.5900, lon: 85.4900, tz: 'Asia/Kolkata', district: true },
    { name: 'Siwan', state: 'Bihar', lat: 26.2200, lon: 84.3600, tz: 'Asia/Kolkata', district: true },
    { name: 'Supaul', state: 'Bihar', lat: 26.1200, lon: 86.6000, tz: 'Asia/Kolkata', district: true },
    { name: 'Vaishali', state: 'Bihar', lat: 25.6800, lon: 85.2000, tz: 'Asia/Kolkata', district: true },
    { name: 'West Champaran', state: 'Bihar', lat: 26.8000, lon: 84.5000, tz: 'Asia/Kolkata', district: true },

    /* Jharkhand */
    { name: 'Bokaro', state: 'Jharkhand', lat: 23.7900, lon: 85.9800, tz: 'Asia/Kolkata', district: true },
    { name: 'Chatra', state: 'Jharkhand', lat: 24.2000, lon: 84.8700, tz: 'Asia/Kolkata', district: true },
    { name: 'East Singhbhum', state: 'Jharkhand', lat: 22.8000, lon: 86.2000, tz: 'Asia/Kolkata', district: true },
    { name: 'Garhwa', state: 'Jharkhand', lat: 24.1800, lon: 83.8200, tz: 'Asia/Kolkata', district: true },
    { name: 'Godda', state: 'Jharkhand', lat: 24.8300, lon: 87.2200, tz: 'Asia/Kolkata', district: true },
    { name: 'Gumla', state: 'Jharkhand', lat: 23.0500, lon: 84.5400, tz: 'Asia/Kolkata', district: true },
    { name: 'Jamtara', state: 'Jharkhand', lat: 23.9700, lon: 86.8000, tz: 'Asia/Kolkata', district: true },
    { name: 'Khunti', state: 'Jharkhand', lat: 23.0800, lon: 85.2800, tz: 'Asia/Kolkata', district: true },
    { name: 'Koderma', state: 'Jharkhand', lat: 24.4700, lon: 85.5900, tz: 'Asia/Kolkata', district: true },
    { name: 'Latehar', state: 'Jharkhand', lat: 23.7500, lon: 84.5000, tz: 'Asia/Kolkata', district: true },
    { name: 'Lohardaga', state: 'Jharkhand', lat: 23.4300, lon: 84.6800, tz: 'Asia/Kolkata', district: true },
    { name: 'Pakur', state: 'Jharkhand', lat: 24.6300, lon: 87.8500, tz: 'Asia/Kolkata', district: true },
    { name: 'Palamu', state: 'Jharkhand', lat: 24.0300, lon: 84.0700, tz: 'Asia/Kolkata', district: true },
    { name: 'Ramgarh', state: 'Jharkhand', lat: 23.6300, lon: 85.5200, tz: 'Asia/Kolkata', district: true },
    { name: 'Sahibganj', state: 'Jharkhand', lat: 25.2400, lon: 87.6400, tz: 'Asia/Kolkata', district: true },
    { name: 'Saraikela-Kharsawan', state: 'Jharkhand', lat: 22.7000, lon: 85.9300, tz: 'Asia/Kolkata', district: true },
    { name: 'Simdega', state: 'Jharkhand', lat: 22.6200, lon: 84.5000, tz: 'Asia/Kolkata', district: true },
    { name: 'West Singhbhum', state: 'Jharkhand', lat: 22.5500, lon: 85.8000, tz: 'Asia/Kolkata', district: true },

    /* West Bengal */
    { name: 'Alipurduar', state: 'West Bengal', lat: 26.4900, lon: 89.5300, tz: 'Asia/Kolkata', district: true },
    { name: 'Bankura', state: 'West Bengal', lat: 23.2300, lon: 87.0800, tz: 'Asia/Kolkata', district: true },
    { name: 'Birbhum', state: 'West Bengal', lat: 23.9100, lon: 87.5300, tz: 'Asia/Kolkata', district: true },
    { name: 'Cooch Behar', state: 'West Bengal', lat: 26.3300, lon: 89.4500, tz: 'Asia/Kolkata', district: true },
    { name: 'Dakshin Dinajpur', state: 'West Bengal', lat: 25.2600, lon: 88.7600, tz: 'Asia/Kolkata', district: true },
    { name: 'Hooghly', state: 'West Bengal', lat: 22.8900, lon: 88.3900, tz: 'Asia/Kolkata', district: true },
    { name: 'Jalpaiguri', state: 'West Bengal', lat: 26.5400, lon: 88.7200, tz: 'Asia/Kolkata', district: true },
    { name: 'Jhargram', state: 'West Bengal', lat: 22.4500, lon: 86.9800, tz: 'Asia/Kolkata', district: true },
    { name: 'Malda', state: 'West Bengal', lat: 25.0100, lon: 88.1400, tz: 'Asia/Kolkata', district: true },
    { name: 'Murshidabad', state: 'West Bengal', lat: 24.1000, lon: 88.2500, tz: 'Asia/Kolkata', district: true },
    { name: 'Nadia', state: 'West Bengal', lat: 23.4000, lon: 88.5000, tz: 'Asia/Kolkata', district: true },
    { name: 'North 24 Parganas', state: 'West Bengal', lat: 22.7200, lon: 88.4800, tz: 'Asia/Kolkata', district: true },
    { name: 'Paschim Bardhaman', state: 'West Bengal', lat: 23.6800, lon: 86.9800, tz: 'Asia/Kolkata', district: true },
    { name: 'Paschim Medinipur', state: 'West Bengal', lat: 22.4300, lon: 87.3200, tz: 'Asia/Kolkata', district: true },
    { name: 'Purba Bardhaman', state: 'West Bengal', lat: 23.2300, lon: 87.8600, tz: 'Asia/Kolkata', district: true },
    { name: 'Purba Medinipur', state: 'West Bengal', lat: 22.3000, lon: 87.9200, tz: 'Asia/Kolkata', district: true },
    { name: 'Purulia', state: 'West Bengal', lat: 23.3300, lon: 86.3600, tz: 'Asia/Kolkata', district: true },
    { name: 'South 24 Parganas', state: 'West Bengal', lat: 22.5300, lon: 88.3300, tz: 'Asia/Kolkata', district: true },
    { name: 'Uttar Dinajpur', state: 'West Bengal', lat: 25.6200, lon: 88.1200, tz: 'Asia/Kolkata', district: true },

    /* Odisha */
    { name: 'Angul', state: 'Odisha', lat: 20.8300, lon: 85.1000, tz: 'Asia/Kolkata', district: true },
    { name: 'Balangir', state: 'Odisha', lat: 20.7200, lon: 83.4800, tz: 'Asia/Kolkata', district: true },
    { name: 'Bargarh', state: 'Odisha', lat: 21.3300, lon: 83.6200, tz: 'Asia/Kolkata', district: true },
    { name: 'Bhadrak', state: 'Odisha', lat: 21.0500, lon: 86.5000, tz: 'Asia/Kolkata', district: true },
    { name: 'Boudh', state: 'Odisha', lat: 20.8400, lon: 84.3200, tz: 'Asia/Kolkata', district: true },
    { name: 'Debagarh', state: 'Odisha', lat: 21.5400, lon: 84.7300, tz: 'Asia/Kolkata', district: true },
    { name: 'Dhenkanal', state: 'Odisha', lat: 20.6600, lon: 85.6000, tz: 'Asia/Kolkata', district: true },
    { name: 'Gajapati', state: 'Odisha', lat: 18.7700, lon: 84.0900, tz: 'Asia/Kolkata', district: true },
    { name: 'Ganjam', state: 'Odisha', lat: 19.3500, lon: 84.9800, tz: 'Asia/Kolkata', district: true },
    { name: 'Jagatsinghpur', state: 'Odisha', lat: 20.2700, lon: 86.1700, tz: 'Asia/Kolkata', district: true },
    { name: 'Jajpur', state: 'Odisha', lat: 20.8400, lon: 86.3300, tz: 'Asia/Kolkata', district: true },
    { name: 'Jharsuguda', state: 'Odisha', lat: 21.8600, lon: 84.0100, tz: 'Asia/Kolkata', district: true },
    { name: 'Kalahandi', state: 'Odisha', lat: 19.9000, lon: 83.1600, tz: 'Asia/Kolkata', district: true },
    { name: 'Kandhamal', state: 'Odisha', lat: 20.4700, lon: 84.2300, tz: 'Asia/Kolkata', district: true },
    { name: 'Kendrapara', state: 'Odisha', lat: 20.5000, lon: 86.4200, tz: 'Asia/Kolkata', district: true },
    { name: 'Keonjhar', state: 'Odisha', lat: 21.6300, lon: 85.5800, tz: 'Asia/Kolkata', district: true },
    { name: 'Khordha', state: 'Odisha', lat: 20.1800, lon: 85.6200, tz: 'Asia/Kolkata', district: true },
    { name: 'Koraput', state: 'Odisha', lat: 18.8100, lon: 82.7100, tz: 'Asia/Kolkata', district: true },
    { name: 'Malkangiri', state: 'Odisha', lat: 18.3500, lon: 81.8800, tz: 'Asia/Kolkata', district: true },
    { name: 'Mayurbhanj', state: 'Odisha', lat: 21.9300, lon: 86.7300, tz: 'Asia/Kolkata', district: true },
    { name: 'Nabarangpur', state: 'Odisha', lat: 19.2300, lon: 82.5500, tz: 'Asia/Kolkata', district: true },
    { name: 'Nayagarh', state: 'Odisha', lat: 20.1300, lon: 85.1000, tz: 'Asia/Kolkata', district: true },
    { name: 'Nuapada', state: 'Odisha', lat: 20.8300, lon: 82.5300, tz: 'Asia/Kolkata', district: true },
    { name: 'Rayagada', state: 'Odisha', lat: 19.1700, lon: 83.4200, tz: 'Asia/Kolkata', district: true },
    { name: 'Subarnapur', state: 'Odisha', lat: 20.8400, lon: 83.9200, tz: 'Asia/Kolkata', district: true },
    { name: 'Sundargarh', state: 'Odisha', lat: 22.1200, lon: 84.0300, tz: 'Asia/Kolkata', district: true },

    /* Chhattisgarh */
    { name: 'Balod', state: 'Chhattisgarh', lat: 20.7300, lon: 81.2000, tz: 'Asia/Kolkata', district: true },
    { name: 'Baloda Bazar', state: 'Chhattisgarh', lat: 21.6600, lon: 82.1600, tz: 'Asia/Kolkata', district: true },
    { name: 'Balrampur (Chhattisgarh)', state: 'Chhattisgarh', lat: 23.6100, lon: 83.6100, tz: 'Asia/Kolkata', district: true },
    { name: 'Bastar', state: 'Chhattisgarh', lat: 19.0700, lon: 82.0300, tz: 'Asia/Kolkata', district: true },
    { name: 'Bemetara', state: 'Chhattisgarh', lat: 21.7000, lon: 81.5500, tz: 'Asia/Kolkata', district: true },
    { name: 'Bijapur', state: 'Chhattisgarh', lat: 18.8000, lon: 80.8100, tz: 'Asia/Kolkata', district: true },
    { name: 'Dantewada', state: 'Chhattisgarh', lat: 18.9000, lon: 81.3500, tz: 'Asia/Kolkata', district: true },
    { name: 'Dhamtari', state: 'Chhattisgarh', lat: 20.7100, lon: 81.5500, tz: 'Asia/Kolkata', district: true },
    { name: 'Gariaband', state: 'Chhattisgarh', lat: 20.6400, lon: 82.0600, tz: 'Asia/Kolkata', district: true },
    { name: 'Gaurela-Pendra-Marwahi', state: 'Chhattisgarh', lat: 22.7500, lon: 81.8900, tz: 'Asia/Kolkata', district: true },
    { name: 'Janjgir-Champa', state: 'Chhattisgarh', lat: 22.0100, lon: 82.5600, tz: 'Asia/Kolkata', district: true },
    { name: 'Jashpur', state: 'Chhattisgarh', lat: 22.8800, lon: 84.1400, tz: 'Asia/Kolkata', district: true },
    { name: 'Kabirdham', state: 'Chhattisgarh', lat: 22.0100, lon: 81.2300, tz: 'Asia/Kolkata', district: true },
    { name: 'Kanker', state: 'Chhattisgarh', lat: 20.2700, lon: 81.4900, tz: 'Asia/Kolkata', district: true },
    { name: 'Khairagarh-Chhuikhadan-Gandai', state: 'Chhattisgarh', lat: 21.4200, lon: 80.9700, tz: 'Asia/Kolkata', district: true },
    { name: 'Kondagaon', state: 'Chhattisgarh', lat: 19.5900, lon: 81.6600, tz: 'Asia/Kolkata', district: true },
    { name: 'Koriya', state: 'Chhattisgarh', lat: 23.2500, lon: 82.5500, tz: 'Asia/Kolkata', district: true },
    { name: 'Mahasamund', state: 'Chhattisgarh', lat: 21.1100, lon: 82.1000, tz: 'Asia/Kolkata', district: true },
    { name: 'Manendragarh-Chirmiri-Bharatpur', state: 'Chhattisgarh', lat: 23.2100, lon: 82.2000, tz: 'Asia/Kolkata', district: true },
    { name: 'Mohla-Manpur-Ambagarh Chowki', state: 'Chhattisgarh', lat: 20.5700, lon: 80.7400, tz: 'Asia/Kolkata', district: true },
    { name: 'Mungeli', state: 'Chhattisgarh', lat: 22.0700, lon: 81.6900, tz: 'Asia/Kolkata', district: true },
    { name: 'Narayanpur', state: 'Chhattisgarh', lat: 19.7200, lon: 81.2200, tz: 'Asia/Kolkata', district: true },
    { name: 'Raigarh', state: 'Chhattisgarh', lat: 21.9000, lon: 83.4000, tz: 'Asia/Kolkata', district: true },
    { name: 'Sarangarh-Bilaigarh', state: 'Chhattisgarh', lat: 21.5900, lon: 83.0800, tz: 'Asia/Kolkata', district: true },
    { name: 'Sakti', state: 'Chhattisgarh', lat: 22.0300, lon: 82.9600, tz: 'Asia/Kolkata', district: true },
    { name: 'Sukma', state: 'Chhattisgarh', lat: 18.3900, lon: 81.6600, tz: 'Asia/Kolkata', district: true },
    { name: 'Surajpur', state: 'Chhattisgarh', lat: 23.2200, lon: 82.8500, tz: 'Asia/Kolkata', district: true },
    { name: 'Surguja', state: 'Chhattisgarh', lat: 23.1100, lon: 83.2000, tz: 'Asia/Kolkata', district: true },

    /* Sikkim */
    { name: 'Pakyong', state: 'Sikkim', lat: 27.2346, lon: 88.5878, tz: 'Asia/Kolkata', district: true },
    { name: 'Soreng', state: 'Sikkim', lat: 27.1648, lon: 88.2045, tz: 'Asia/Kolkata', district: true },

    /* Assam */
    { name: 'Bajali', state: 'Assam', lat: 26.5029, lon: 91.2057, tz: 'Asia/Kolkata', district: true },
    { name: 'Baksa', state: 'Assam', lat: 26.5925, lon: 91.4393, tz: 'Asia/Kolkata', district: true },
    { name: 'Barpeta', state: 'Assam', lat: 26.3216, lon: 91.0069, tz: 'Asia/Kolkata', district: true },
    { name: 'Biswanath', state: 'Assam', lat: 26.7323, lon: 93.1554, tz: 'Asia/Kolkata', district: true },
    { name: 'Cachar', state: 'Assam', lat: 24.8333, lon: 92.7789, tz: 'Asia/Kolkata', district: true },
    { name: 'Charaideo', state: 'Assam', lat: 26.9388, lon: 94.7570, tz: 'Asia/Kolkata', district: true },
    { name: 'Chirang', state: 'Assam', lat: 26.5415, lon: 90.6212, tz: 'Asia/Kolkata', district: true },
    { name: 'Darrang', state: 'Assam', lat: 26.4429, lon: 92.0298, tz: 'Asia/Kolkata', district: true },
    { name: 'Dhemaji', state: 'Assam', lat: 27.4836, lon: 94.5768, tz: 'Asia/Kolkata', district: true },
    { name: 'Dhubri', state: 'Assam', lat: 26.0207, lon: 89.9740, tz: 'Asia/Kolkata', district: true },
    { name: 'Dima Hasao', state: 'Assam', lat: 25.1764, lon: 93.0366, tz: 'Asia/Kolkata', district: true },
    { name: 'Goalpara', state: 'Assam', lat: 26.1729, lon: 90.6225, tz: 'Asia/Kolkata', district: true },
    { name: 'Golaghat', state: 'Assam', lat: 26.5160, lon: 93.9743, tz: 'Asia/Kolkata', district: true },
    { name: 'Hailakandi', state: 'Assam', lat: 24.6806, lon: 92.5645, tz: 'Asia/Kolkata', district: true },
    { name: 'Hojai', state: 'Assam', lat: 26.0028, lon: 92.8647, tz: 'Asia/Kolkata', district: true },
    { name: 'Kamrup', state: 'Assam', lat: 26.3168, lon: 91.3149, tz: 'Asia/Kolkata', district: true },
    { name: 'Kamrup Metropolitan', state: 'Assam', lat: 26.1445, lon: 91.7362, tz: 'Asia/Kolkata', district: true },
    { name: 'Karbi Anglong', state: 'Assam', lat: 26.0041, lon: 93.4402, tz: 'Asia/Kolkata', district: true },
    { name: 'Karimganj', state: 'Assam', lat: 24.8648, lon: 92.3589, tz: 'Asia/Kolkata', district: true },
    { name: 'Kokrajhar', state: 'Assam', lat: 26.4010, lon: 90.2667, tz: 'Asia/Kolkata', district: true },
    { name: 'Lakhimpur', state: 'Assam', lat: 27.2367, lon: 94.1039, tz: 'Asia/Kolkata', district: true },
    { name: 'Majuli', state: 'Assam', lat: 26.9530, lon: 94.0818, tz: 'Asia/Kolkata', district: true },
    { name: 'Morigaon', state: 'Assam', lat: 26.2515, lon: 92.3392, tz: 'Asia/Kolkata', district: true },
    { name: 'Nalbari', state: 'Assam', lat: 26.4431, lon: 91.4399, tz: 'Asia/Kolkata', district: true },
    { name: 'Sivasagar', state: 'Assam', lat: 26.9826, lon: 94.6425, tz: 'Asia/Kolkata', district: true },
    { name: 'Sonitpur', state: 'Assam', lat: 26.6342, lon: 92.7932, tz: 'Asia/Kolkata', district: true },
    { name: 'South Salmara-Mankachar', state: 'Assam', lat: 25.5670, lon: 89.9234, tz: 'Asia/Kolkata', district: true },
    { name: 'Tamulpur', state: 'Assam', lat: 26.6322, lon: 91.5791, tz: 'Asia/Kolkata', district: true },
    { name: 'Tinsukia', state: 'Assam', lat: 27.4886, lon: 95.3558, tz: 'Asia/Kolkata', district: true },
    { name: 'Udalguri', state: 'Assam', lat: 26.7454, lon: 92.0950, tz: 'Asia/Kolkata', district: true },
    { name: 'West Karbi Anglong', state: 'Assam', lat: 25.9686, lon: 92.3853, tz: 'Asia/Kolkata', district: true },

    /* Arunachal Pradesh */
    { name: 'Anjaw', state: 'Arunachal Pradesh', lat: 27.9150, lon: 96.8643, tz: 'Asia/Kolkata', district: true },
    { name: 'Changlang', state: 'Arunachal Pradesh', lat: 27.1273, lon: 95.7423, tz: 'Asia/Kolkata', district: true },
    { name: 'Dibang Valley', state: 'Arunachal Pradesh', lat: 28.8105, lon: 95.9613, tz: 'Asia/Kolkata', district: true },
    { name: 'East Kameng', state: 'Arunachal Pradesh', lat: 27.2917, lon: 93.1812, tz: 'Asia/Kolkata', district: true },
    { name: 'East Siang', state: 'Arunachal Pradesh', lat: 28.0683, lon: 95.3262, tz: 'Asia/Kolkata', district: true },
    { name: 'Itanagar Capital Complex', state: 'Arunachal Pradesh', lat: 27.1000, lon: 93.6167, tz: 'Asia/Kolkata', district: true },
    { name: 'Kamle', state: 'Arunachal Pradesh', lat: 27.6831, lon: 94.1206, tz: 'Asia/Kolkata', district: true },
    { name: 'Kra Daadi', state: 'Arunachal Pradesh', lat: 27.8100, lon: 93.3000, tz: 'Asia/Kolkata', district: true },
    { name: 'Kurung Kumey', state: 'Arunachal Pradesh', lat: 27.8722, lon: 93.3101, tz: 'Asia/Kolkata', district: true },
    { name: 'Lepa Rada', state: 'Arunachal Pradesh', lat: 27.8016, lon: 94.6976, tz: 'Asia/Kolkata', district: true },
    { name: 'Lohit', state: 'Arunachal Pradesh', lat: 27.8872, lon: 96.0125, tz: 'Asia/Kolkata', district: true },
    { name: 'Longding', state: 'Arunachal Pradesh', lat: 26.8524, lon: 95.2753, tz: 'Asia/Kolkata', district: true },
    { name: 'Lower Dibang Valley', state: 'Arunachal Pradesh', lat: 28.1465, lon: 95.8450, tz: 'Asia/Kolkata', district: true },
    { name: 'Lower Siang', state: 'Arunachal Pradesh', lat: 27.6596, lon: 94.8193, tz: 'Asia/Kolkata', district: true },
    { name: 'Lower Subansiri', state: 'Arunachal Pradesh', lat: 27.5446, lon: 93.8340, tz: 'Asia/Kolkata', district: true },
    { name: 'Namsai', state: 'Arunachal Pradesh', lat: 27.6715, lon: 95.8752, tz: 'Asia/Kolkata', district: true },
    { name: 'Pakke Kessang', state: 'Arunachal Pradesh', lat: 27.1408, lon: 93.0416, tz: 'Asia/Kolkata', district: true },
    { name: 'Papum Pare', state: 'Arunachal Pradesh', lat: 27.1856, lon: 93.5936, tz: 'Asia/Kolkata', district: true },
    { name: 'Shi Yomi', state: 'Arunachal Pradesh', lat: 28.4729, lon: 94.3989, tz: 'Asia/Kolkata', district: true },
    { name: 'Siang', state: 'Arunachal Pradesh', lat: 28.2718, lon: 94.9427, tz: 'Asia/Kolkata', district: true },
    { name: 'Tirap', state: 'Arunachal Pradesh', lat: 26.9945, lon: 95.5385, tz: 'Asia/Kolkata', district: true },
    { name: 'Upper Siang', state: 'Arunachal Pradesh', lat: 28.6186, lon: 94.9216, tz: 'Asia/Kolkata', district: true },
    { name: 'Upper Subansiri', state: 'Arunachal Pradesh', lat: 28.1400, lon: 94.1167, tz: 'Asia/Kolkata', district: true },
    { name: 'West Kameng', state: 'Arunachal Pradesh', lat: 27.2562, lon: 92.2359, tz: 'Asia/Kolkata', district: true },
    { name: 'West Siang', state: 'Arunachal Pradesh', lat: 28.1884, lon: 94.6938, tz: 'Asia/Kolkata', district: true },

    /* Meghalaya */
    { name: 'East Garo Hills', state: 'Meghalaya', lat: 25.5683, lon: 90.6276, tz: 'Asia/Kolkata', district: true },
    { name: 'East Jaintia Hills', state: 'Meghalaya', lat: 25.3524, lon: 92.3789, tz: 'Asia/Kolkata', district: true },
    { name: 'East Khasi Hills', state: 'Meghalaya', lat: 25.5788, lon: 91.8933, tz: 'Asia/Kolkata', district: true },
    { name: 'Eastern West Khasi Hills', state: 'Meghalaya', lat: 25.5562, lon: 91.6427, tz: 'Asia/Kolkata', district: true },
    { name: 'North Garo Hills', state: 'Meghalaya', lat: 25.9037, lon: 90.6241, tz: 'Asia/Kolkata', district: true },
    { name: 'Ri-Bhoi', state: 'Meghalaya', lat: 25.8824, lon: 91.8644, tz: 'Asia/Kolkata', district: true },
    { name: 'South Garo Hills', state: 'Meghalaya', lat: 25.3624, lon: 90.6300, tz: 'Asia/Kolkata', district: true },
    { name: 'South West Garo Hills', state: 'Meghalaya', lat: 25.4379, lon: 89.9405, tz: 'Asia/Kolkata', district: true },
    { name: 'South West Khasi Hills', state: 'Meghalaya', lat: 25.3190, lon: 91.3090, tz: 'Asia/Kolkata', district: true },
    { name: 'West Garo Hills', state: 'Meghalaya', lat: 25.5145, lon: 90.2036, tz: 'Asia/Kolkata', district: true },
    { name: 'West Jaintia Hills', state: 'Meghalaya', lat: 25.4398, lon: 92.1979, tz: 'Asia/Kolkata', district: true },
    { name: 'West Khasi Hills', state: 'Meghalaya', lat: 25.5303, lon: 91.2662, tz: 'Asia/Kolkata', district: true },

    /* Nagaland */
    { name: 'Chümoukedima', state: 'Nagaland', lat: 25.7950, lon: 93.7656, tz: 'Asia/Kolkata', district: true },
    { name: 'Kiphire', state: 'Nagaland', lat: 25.8677, lon: 94.7788, tz: 'Asia/Kolkata', district: true },
    { name: 'Longleng', state: 'Nagaland', lat: 26.4719, lon: 94.8083, tz: 'Asia/Kolkata', district: true },
    { name: 'Mon', state: 'Nagaland', lat: 26.7441, lon: 95.0560, tz: 'Asia/Kolkata', district: true },
    { name: 'Niuland', state: 'Nagaland', lat: 25.9329, lon: 93.9926, tz: 'Asia/Kolkata', district: true },
    { name: 'Noklak', state: 'Nagaland', lat: 26.1993, lon: 94.9912, tz: 'Asia/Kolkata', district: true },
    { name: 'Peren', state: 'Nagaland', lat: 25.5126, lon: 93.7381, tz: 'Asia/Kolkata', district: true },
    { name: 'Phek', state: 'Nagaland', lat: 25.7001, lon: 94.4607, tz: 'Asia/Kolkata', district: true },
    { name: 'Shamator', state: 'Nagaland', lat: 26.0142, lon: 94.8727, tz: 'Asia/Kolkata', district: true },
    { name: 'Tseminyu', state: 'Nagaland', lat: 25.8569, lon: 94.2494, tz: 'Asia/Kolkata', district: true },
    { name: 'Wokha', state: 'Nagaland', lat: 26.1044, lon: 94.2625, tz: 'Asia/Kolkata', district: true },
    { name: 'Zunheboto', state: 'Nagaland', lat: 25.9654, lon: 94.5233, tz: 'Asia/Kolkata', district: true },

    /* Manipur */
    { name: 'Chandel', state: 'Manipur', lat: 24.3217, lon: 94.0041, tz: 'Asia/Kolkata', district: true },
    { name: 'Imphal East', state: 'Manipur', lat: 24.8101, lon: 94.0326, tz: 'Asia/Kolkata', district: true },
    { name: 'Imphal West', state: 'Manipur', lat: 24.8475, lon: 93.9161, tz: 'Asia/Kolkata', district: true },
    { name: 'Jiribam', state: 'Manipur', lat: 24.7876, lon: 93.1118, tz: 'Asia/Kolkata', district: true },
    { name: 'Kakching', state: 'Manipur', lat: 24.4920, lon: 93.9785, tz: 'Asia/Kolkata', district: true },
    { name: 'Kamjong', state: 'Manipur', lat: 24.8967, lon: 94.3905, tz: 'Asia/Kolkata', district: true },
    { name: 'Kangpokpi', state: 'Manipur', lat: 25.1396, lon: 93.9666, tz: 'Asia/Kolkata', district: true },
    { name: 'Noney', state: 'Manipur', lat: 24.8329, lon: 93.6166, tz: 'Asia/Kolkata', district: true },
    { name: 'Pherzawl', state: 'Manipur', lat: 24.2541, lon: 93.1764, tz: 'Asia/Kolkata', district: true },
    { name: 'Senapati', state: 'Manipur', lat: 25.2638, lon: 94.0203, tz: 'Asia/Kolkata', district: true },
    { name: 'Tamenglong', state: 'Manipur', lat: 24.9818, lon: 93.5042, tz: 'Asia/Kolkata', district: true },
    { name: 'Tengnoupal', state: 'Manipur', lat: 24.3283, lon: 94.1352, tz: 'Asia/Kolkata', district: true },
    { name: 'Ukhrul', state: 'Manipur', lat: 25.1147, lon: 94.3591, tz: 'Asia/Kolkata', district: true },

    /* Mizoram */
    { name: 'Hnahthial', state: 'Mizoram', lat: 22.9554, lon: 92.9304, tz: 'Asia/Kolkata', district: true },
    { name: 'Khawzawl', state: 'Mizoram', lat: 23.5358, lon: 93.1818, tz: 'Asia/Kolkata', district: true },
    { name: 'Kolasib', state: 'Mizoram', lat: 24.2251, lon: 92.6738, tz: 'Asia/Kolkata', district: true },
    { name: 'Lawngtlai', state: 'Mizoram', lat: 22.5292, lon: 92.8953, tz: 'Asia/Kolkata', district: true },
    { name: 'Mamit', state: 'Mizoram', lat: 23.9290, lon: 92.4908, tz: 'Asia/Kolkata', district: true },
    { name: 'Saiha', state: 'Mizoram', lat: 22.4862, lon: 92.9774, tz: 'Asia/Kolkata', district: true },
    { name: 'Saitual', state: 'Mizoram', lat: 23.9714, lon: 92.9526, tz: 'Asia/Kolkata', district: true },
    { name: 'Serchhip', state: 'Mizoram', lat: 23.3082, lon: 92.8443, tz: 'Asia/Kolkata', district: true },

    /* Tripura */
    { name: 'Dhalai', state: 'Tripura', lat: 23.8687, lon: 91.9392, tz: 'Asia/Kolkata', district: true },
    { name: 'Gomati', state: 'Tripura', lat: 23.5414, lon: 91.4880, tz: 'Asia/Kolkata', district: true },
    { name: 'Khowai', state: 'Tripura', lat: 24.0886, lon: 91.6033, tz: 'Asia/Kolkata', district: true },
    { name: 'North Tripura', state: 'Tripura', lat: 24.3168, lon: 92.1765, tz: 'Asia/Kolkata', district: true },
    { name: 'Sepahijala', state: 'Tripura', lat: 23.6331, lon: 91.3148, tz: 'Asia/Kolkata', district: true },
    { name: 'South Tripura', state: 'Tripura', lat: 23.2386, lon: 91.5654, tz: 'Asia/Kolkata', district: true },
    { name: 'Unakoti', state: 'Tripura', lat: 24.2422, lon: 92.0152, tz: 'Asia/Kolkata', district: true },
    { name: 'West Tripura', state: 'Tripura', lat: 23.8364, lon: 91.2798, tz: 'Asia/Kolkata', district: true },

    /* Jammu & Kashmir */
    { name: 'Bandipora', state: 'Jammu & Kashmir', lat: 34.4200, lon: 74.6500, tz: 'Asia/Kolkata', district: true },
    { name: 'Budgam', state: 'Jammu & Kashmir', lat: 34.0100, lon: 74.7100, tz: 'Asia/Kolkata', district: true },
    { name: 'Doda', state: 'Jammu & Kashmir', lat: 33.1400, lon: 75.5400, tz: 'Asia/Kolkata', district: true },
    { name: 'Ganderbal', state: 'Jammu & Kashmir', lat: 34.2100, lon: 74.7800, tz: 'Asia/Kolkata', district: true },
    { name: 'Kathua', state: 'Jammu & Kashmir', lat: 32.3700, lon: 75.5100, tz: 'Asia/Kolkata', district: true },
    { name: 'Kishtwar', state: 'Jammu & Kashmir', lat: 33.3100, lon: 75.7600, tz: 'Asia/Kolkata', district: true },
    { name: 'Kulgam', state: 'Jammu & Kashmir', lat: 33.6400, lon: 75.0100, tz: 'Asia/Kolkata', district: true },
    { name: 'Kupwara', state: 'Jammu & Kashmir', lat: 34.5200, lon: 74.2500, tz: 'Asia/Kolkata', district: true },
    { name: 'Poonch', state: 'Jammu & Kashmir', lat: 33.7700, lon: 74.0900, tz: 'Asia/Kolkata', district: true },
    { name: 'Pulwama', state: 'Jammu & Kashmir', lat: 33.8700, lon: 74.8900, tz: 'Asia/Kolkata', district: true },
    { name: 'Rajouri', state: 'Jammu & Kashmir', lat: 33.3800, lon: 74.3000, tz: 'Asia/Kolkata', district: true },
    { name: 'Ramban', state: 'Jammu & Kashmir', lat: 33.2400, lon: 75.1900, tz: 'Asia/Kolkata', district: true },
    { name: 'Reasi', state: 'Jammu & Kashmir', lat: 33.0800, lon: 74.8300, tz: 'Asia/Kolkata', district: true },
    { name: 'Samba', state: 'Jammu & Kashmir', lat: 32.5500, lon: 75.1100, tz: 'Asia/Kolkata', district: true },
    { name: 'Shopian', state: 'Jammu & Kashmir', lat: 33.7200, lon: 74.8300, tz: 'Asia/Kolkata', district: true },
    { name: 'Udhampur', state: 'Jammu & Kashmir', lat: 32.9200, lon: 75.1400, tz: 'Asia/Kolkata', district: true },

    /* Ladakh */
    { name: 'Changthang', state: 'Ladakh', lat: 33.1900, lon: 78.6400, tz: 'Asia/Kolkata', district: true },
    { name: 'Drass', state: 'Ladakh', lat: 34.4300, lon: 75.7600, tz: 'Asia/Kolkata', district: true },
    { name: 'Nubra', state: 'Ladakh', lat: 34.5500, lon: 77.5500, tz: 'Asia/Kolkata', district: true },
    { name: 'Sham', state: 'Ladakh', lat: 34.3200, lon: 76.8800, tz: 'Asia/Kolkata', district: true },
    { name: 'Zanskar', state: 'Ladakh', lat: 33.4600, lon: 76.9800, tz: 'Asia/Kolkata', district: true },

    /* Andaman & Nicobar Islands */
    { name: 'Nicobar', state: 'Andaman & Nicobar Islands', lat: 7.0500, lon: 93.7800, tz: 'Asia/Kolkata', district: true },
    { name: 'North and Middle Andaman', state: 'Andaman & Nicobar Islands', lat: 12.8900, lon: 92.9300, tz: 'Asia/Kolkata', district: true },
    { name: 'South Andaman', state: 'Andaman & Nicobar Islands', lat: 11.6600, lon: 92.7300, tz: 'Asia/Kolkata', district: true },

    /* Dadra & Nagar Haveli and Daman & Diu */
    { name: 'Dadra and Nagar Haveli', state: 'Dadra & Nagar Haveli and Daman & Diu', lat: 20.2700, lon: 73.0100, tz: 'Asia/Kolkata', district: true },

    /* Lakshadweep */
    { name: 'Lakshadweep', state: 'Lakshadweep', lat: 10.5600, lon: 72.6400, tz: 'Asia/Kolkata', district: true },

    /* Famous tirths, monuments, beaches & hill stations */
    { name: 'Katra (Vaishno Devi)', state: 'Jammu & Kashmir', lat: 32.9917, lon: 74.9310, tz: 'Asia/Kolkata', famous: true },
    { name: 'Sonamarg', state: 'Jammu & Kashmir', lat: 34.3030, lon: 75.2930, tz: 'Asia/Kolkata', famous: true },
    { name: 'Nubra Valley', state: 'Ladakh', lat: 34.5428, lon: 77.5590, tz: 'Asia/Kolkata', famous: true },
    { name: 'Pangong Lake', state: 'Ladakh', lat: 33.7500, lon: 78.6500, tz: 'Asia/Kolkata', famous: true },
    { name: 'Rohtang Pass', state: 'Himachal Pradesh', lat: 32.3716, lon: 77.2460, tz: 'Asia/Kolkata', famous: true },
    { name: 'McLeod Ganj', state: 'Himachal Pradesh', lat: 32.2427, lon: 76.3200, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kasol', state: 'Himachal Pradesh', lat: 32.0100, lon: 77.3150, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kaza (Spiti)', state: 'Himachal Pradesh', lat: 32.2260, lon: 78.0710, tz: 'Asia/Kolkata', famous: true },
    { name: 'Dalhousie', state: 'Himachal Pradesh', lat: 32.5387, lon: 75.9700, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kufri', state: 'Himachal Pradesh', lat: 31.0970, lon: 77.2670, tz: 'Asia/Kolkata', famous: true },
    { name: 'Auli', state: 'Uttarakhand', lat: 30.5280, lon: 79.5680, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ranikhet', state: 'Uttarakhand', lat: 29.6420, lon: 79.4320, tz: 'Asia/Kolkata', famous: true },
    { name: 'Jim Corbett Park', state: 'Uttarakhand', lat: 29.3950, lon: 78.8340, tz: 'Asia/Kolkata', famous: true },
    { name: 'Valley of Flowers', state: 'Uttarakhand', lat: 30.7280, lon: 79.6050, tz: 'Asia/Kolkata', famous: true },
    { name: 'Golden Temple Amritsar', state: 'Punjab', lat: 31.6200, lon: 74.8765, tz: 'Asia/Kolkata', famous: true },
    { name: 'Wagah Border', state: 'Punjab', lat: 31.6047, lon: 74.5730, tz: 'Asia/Kolkata', famous: true },
    { name: 'Brahma Sarovar', state: 'Haryana', lat: 29.9640, lon: 76.8780, tz: 'Asia/Kolkata', famous: true },
    { name: 'Sultanpur Bird Sanctuary', state: 'Haryana', lat: 28.4660, lon: 76.8950, tz: 'Asia/Kolkata', famous: true },
    { name: 'India Gate', state: 'Delhi', lat: 28.6129, lon: 77.2295, tz: 'Asia/Kolkata', famous: true },
    { name: 'Red Fort', state: 'Delhi', lat: 28.6562, lon: 77.2410, tz: 'Asia/Kolkata', famous: true },
    { name: 'Qutub Minar', state: 'Delhi', lat: 28.5245, lon: 77.1855, tz: 'Asia/Kolkata', famous: true },
    { name: 'Lotus Temple', state: 'Delhi', lat: 28.5535, lon: 77.2588, tz: 'Asia/Kolkata', famous: true },
    { name: 'Akshardham Delhi', state: 'Delhi', lat: 28.6127, lon: 77.2773, tz: 'Asia/Kolkata', famous: true },
    { name: 'ISKCON Temple Delhi', state: 'Delhi', lat: 28.5557, lon: 77.2440, tz: 'Asia/Kolkata', famous: true },
    { name: 'Hauz Khas Village', state: 'Delhi', lat: 28.5535, lon: 77.1940, tz: 'Asia/Kolkata', famous: true },
    { name: 'Hawa Mahal', state: 'Rajasthan', lat: 26.9239, lon: 75.8267, tz: 'Asia/Kolkata', famous: true },
    { name: 'Amber Fort', state: 'Rajasthan', lat: 26.9855, lon: 75.8513, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mehrangarh Fort', state: 'Rajasthan', lat: 26.2978, lon: 73.0184, tz: 'Asia/Kolkata', famous: true },
    { name: 'Lake Pichola', state: 'Rajasthan', lat: 24.5720, lon: 73.6800, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ajmer Sharif Dargah', state: 'Rajasthan', lat: 26.4499, lon: 74.6399, tz: 'Asia/Kolkata', famous: true },
    { name: 'Sam Sand Dunes', state: 'Rajasthan', lat: 26.8400, lon: 70.7800, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ranthambore', state: 'Rajasthan', lat: 26.0173, lon: 76.5026, tz: 'Asia/Kolkata', famous: true },
    { name: 'Taj Mahal', state: 'Uttar Pradesh', lat: 27.1751, lon: 78.0421, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kashi Vishwanath', state: 'Uttar Pradesh', lat: 25.3109, lon: 83.0105, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ram Mandir Ayodhya', state: 'Uttar Pradesh', lat: 26.7956, lon: 82.1943, tz: 'Asia/Kolkata', famous: true },
    { name: 'Krishna Janmabhoomi', state: 'Uttar Pradesh', lat: 27.5046, lon: 77.6699, tz: 'Asia/Kolkata', famous: true },
    { name: 'Triveni Sangam', state: 'Uttar Pradesh', lat: 25.4280, lon: 81.8840, tz: 'Asia/Kolkata', famous: true },
    { name: 'Bara Imambara', state: 'Uttar Pradesh', lat: 26.8697, lon: 80.9128, tz: 'Asia/Kolkata', famous: true },
    { name: 'Fatehpur Sikri', state: 'Uttar Pradesh', lat: 27.0945, lon: 77.6679, tz: 'Asia/Kolkata', famous: true },
    { name: 'Dudhwa National Park', state: 'Uttar Pradesh', lat: 28.4700, lon: 80.6500, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mahabodhi Temple', state: 'Bihar', lat: 24.6959, lon: 84.9911, tz: 'Asia/Kolkata', famous: true },
    { name: 'Nalanda Ruins', state: 'Bihar', lat: 25.1350, lon: 85.4440, tz: 'Asia/Kolkata', famous: true },
    { name: 'Rajgir', state: 'Bihar', lat: 25.0333, lon: 85.4167, tz: 'Asia/Kolkata', famous: true },
    { name: 'Baidyanath Temple Deoghar', state: 'Jharkhand', lat: 24.4920, lon: 86.6990, tz: 'Asia/Kolkata', famous: true },
    { name: 'Parasnath', state: 'Jharkhand', lat: 23.9630, lon: 86.1290, tz: 'Asia/Kolkata', famous: true },
    { name: 'Dassam Falls', state: 'Jharkhand', lat: 23.1400, lon: 85.4700, tz: 'Asia/Kolkata', famous: true },
    { name: 'Dakshineswar Kali Temple', state: 'West Bengal', lat: 22.6550, lon: 88.3570, tz: 'Asia/Kolkata', famous: true },
    { name: 'Tiger Hill Darjeeling', state: 'West Bengal', lat: 27.0000, lon: 88.2600, tz: 'Asia/Kolkata', famous: true },
    { name: 'Sundarbans', state: 'West Bengal', lat: 22.1600, lon: 88.8000, tz: 'Asia/Kolkata', famous: true },
    { name: 'Jagannath Temple Puri', state: 'Odisha', lat: 19.8048, lon: 85.8180, tz: 'Asia/Kolkata', famous: true },
    { name: 'Konark Sun Temple', state: 'Odisha', lat: 19.8876, lon: 86.0945, tz: 'Asia/Kolkata', famous: true },
    { name: 'Lingaraj Temple', state: 'Odisha', lat: 20.2380, lon: 85.8330, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kaziranga', state: 'Assam', lat: 26.5775, lon: 93.1711, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ziro Valley', state: 'Arunachal Pradesh', lat: 27.5900, lon: 93.8300, tz: 'Asia/Kolkata', famous: true },
    { name: 'Loktak Lake', state: 'Manipur', lat: 24.5500, lon: 93.8000, tz: 'Asia/Kolkata', famous: true },
    { name: 'Nathu La', state: 'Sikkim', lat: 27.3860, lon: 88.8300, tz: 'Asia/Kolkata', famous: true },
    { name: 'Gwalior Fort', state: 'Madhya Pradesh', lat: 26.2300, lon: 78.1690, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mahakaleshwar Ujjain', state: 'Madhya Pradesh', lat: 23.1828, lon: 75.7682, tz: 'Asia/Kolkata', famous: true },
    { name: 'Omkareshwar', state: 'Madhya Pradesh', lat: 22.2420, lon: 76.1510, tz: 'Asia/Kolkata', famous: true },
    { name: 'Maheshwar', state: 'Madhya Pradesh', lat: 22.1760, lon: 75.5870, tz: 'Asia/Kolkata', famous: true },
    { name: 'Sanchi Stupa', state: 'Madhya Pradesh', lat: 23.4795, lon: 77.7398, tz: 'Asia/Kolkata', famous: true },
    { name: 'Bandhavgarh', state: 'Madhya Pradesh', lat: 23.6970, lon: 81.0300, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kanha National Park', state: 'Madhya Pradesh', lat: 22.3345, lon: 80.6115, tz: 'Asia/Kolkata', famous: true },
    { name: 'Amarkantak', state: 'Madhya Pradesh', lat: 22.6730, lon: 81.7550, tz: 'Asia/Kolkata', famous: true },
    { name: 'Chitrakote Falls', state: 'Chhattisgarh', lat: 19.2000, lon: 81.7300, tz: 'Asia/Kolkata', famous: true },
    { name: 'Somnath Temple', state: 'Gujarat', lat: 20.8880, lon: 70.4010, tz: 'Asia/Kolkata', famous: true },
    { name: 'Dwarkadhish Temple', state: 'Gujarat', lat: 22.2394, lon: 68.9678, tz: 'Asia/Kolkata', famous: true },
    { name: 'Statue of Unity', state: 'Gujarat', lat: 21.8380, lon: 73.7191, tz: 'Asia/Kolkata', famous: true },
    { name: 'Rann of Kutch', state: 'Gujarat', lat: 23.9000, lon: 69.7500, tz: 'Asia/Kolkata', famous: true },
    { name: 'Gir National Park', state: 'Gujarat', lat: 21.1240, lon: 70.8240, tz: 'Asia/Kolkata', famous: true },
    { name: 'Palitana Temples', state: 'Gujarat', lat: 21.5260, lon: 71.8230, tz: 'Asia/Kolkata', famous: true },
    { name: 'Saputara', state: 'Gujarat', lat: 20.5780, lon: 73.7470, tz: 'Asia/Kolkata', famous: true },
    { name: 'Modhera Sun Temple', state: 'Gujarat', lat: 23.5830, lon: 72.1330, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ambaji', state: 'Gujarat', lat: 24.3333, lon: 72.8500, tz: 'Asia/Kolkata', famous: true },
    { name: 'Shirdi Sai Baba', state: 'Maharashtra', lat: 19.7660, lon: 74.4760, tz: 'Asia/Kolkata', famous: true },
    { name: 'Gateway of India', state: 'Maharashtra', lat: 18.9220, lon: 72.8347, tz: 'Asia/Kolkata', famous: true },
    { name: 'Elephanta Caves', state: 'Maharashtra', lat: 18.9633, lon: 72.9315, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ajanta Caves', state: 'Maharashtra', lat: 20.5534, lon: 75.7000, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ellora Caves', state: 'Maharashtra', lat: 20.0269, lon: 75.1610, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mahalaxmi Kolhapur', state: 'Maharashtra', lat: 16.7040, lon: 74.2430, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ganpatipule', state: 'Maharashtra', lat: 17.1440, lon: 73.2690, tz: 'Asia/Kolkata', famous: true },
    { name: 'Baga Beach', state: 'Goa', lat: 15.5553, lon: 73.7517, tz: 'Asia/Kolkata', famous: true },
    { name: 'Palolem Beach', state: 'Goa', lat: 15.0100, lon: 74.0233, tz: 'Asia/Kolkata', famous: true },
    { name: 'Basilica of Bom Jesus', state: 'Goa', lat: 15.5009, lon: 73.9116, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mysore Palace', state: 'Karnataka', lat: 12.3052, lon: 76.6552, tz: 'Asia/Kolkata', famous: true },
    { name: 'Madikeri (Coorg)', state: 'Karnataka', lat: 12.4244, lon: 75.7382, tz: 'Asia/Kolkata', famous: true },
    { name: 'Gokarna', state: 'Karnataka', lat: 14.5479, lon: 74.3188, tz: 'Asia/Kolkata', famous: true },
    { name: 'Udupi Krishna Temple', state: 'Karnataka', lat: 13.3409, lon: 74.7460, tz: 'Asia/Kolkata', famous: true },
    { name: 'Badami Caves', state: 'Karnataka', lat: 15.9180, lon: 75.6760, tz: 'Asia/Kolkata', famous: true },
    { name: 'Pattadakal', state: 'Karnataka', lat: 15.9480, lon: 75.8160, tz: 'Asia/Kolkata', famous: true },
    { name: 'Jog Falls', state: 'Karnataka', lat: 14.2290, lon: 74.7920, tz: 'Asia/Kolkata', famous: true },
    { name: 'Munnar', state: 'Kerala', lat: 10.0889, lon: 77.0595, tz: 'Asia/Kolkata', famous: true },
    { name: 'Alappuzha Backwaters', state: 'Kerala', lat: 9.4981, lon: 76.3388, tz: 'Asia/Kolkata', famous: true },
    { name: 'Thekkady', state: 'Kerala', lat: 9.5833, lon: 77.1667, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kovalam', state: 'Kerala', lat: 8.4004, lon: 76.9787, tz: 'Asia/Kolkata', famous: true },
    { name: 'Varkala', state: 'Kerala', lat: 8.7379, lon: 76.7163, tz: 'Asia/Kolkata', famous: true },
    { name: 'Guruvayur Temple', state: 'Kerala', lat: 10.5940, lon: 76.0400, tz: 'Asia/Kolkata', famous: true },
    { name: 'Meenakshi Temple', state: 'Tamil Nadu', lat: 9.9195, lon: 78.1193, tz: 'Asia/Kolkata', famous: true },
    { name: 'Brihadeeswarar Temple', state: 'Tamil Nadu', lat: 10.7828, lon: 79.1318, tz: 'Asia/Kolkata', famous: true },
    { name: 'Mahabalipuram', state: 'Tamil Nadu', lat: 12.6208, lon: 80.1945, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kodaikanal', state: 'Tamil Nadu', lat: 10.2381, lon: 77.4892, tz: 'Asia/Kolkata', famous: true },
    { name: 'Tirumala Temple', state: 'Andhra Pradesh', lat: 13.6833, lon: 79.3474, tz: 'Asia/Kolkata', famous: true },
    { name: 'Velankanni', state: 'Tamil Nadu', lat: 10.6833, lon: 79.8500, tz: 'Asia/Kolkata', famous: true },
    { name: 'Chidambaram Nataraja', state: 'Tamil Nadu', lat: 11.3990, lon: 79.6930, tz: 'Asia/Kolkata', famous: true },
    { name: 'Arunachaleswarar Temple', state: 'Tamil Nadu', lat: 12.2310, lon: 79.0670, tz: 'Asia/Kolkata', famous: true },
    { name: 'Charminar', state: 'Telangana', lat: 17.3616, lon: 78.4747, tz: 'Asia/Kolkata', famous: true },
    { name: 'Golconda Fort', state: 'Telangana', lat: 17.3833, lon: 78.4011, tz: 'Asia/Kolkata', famous: true },
    { name: 'Ramoji Film City', state: 'Telangana', lat: 17.2543, lon: 78.6808, tz: 'Asia/Kolkata', famous: true },
    { name: 'Thousand Pillar Temple', state: 'Telangana', lat: 17.9980, lon: 79.5880, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kailasagiri', state: 'Andhra Pradesh', lat: 17.7480, lon: 83.3430, tz: 'Asia/Kolkata', famous: true },
    { name: 'Araku Valley', state: 'Andhra Pradesh', lat: 18.3273, lon: 82.8770, tz: 'Asia/Kolkata', famous: true },
    { name: 'Kanaka Durga Temple', state: 'Andhra Pradesh', lat: 16.5150, lon: 80.6200, tz: 'Asia/Kolkata', famous: true },
    { name: 'Srisailam', state: 'Andhra Pradesh', lat: 16.0740, lon: 78.8680, tz: 'Asia/Kolkata', famous: true },
    { name: 'Lepakshi', state: 'Andhra Pradesh', lat: 13.8020, lon: 77.6060, tz: 'Asia/Kolkata', famous: true },
    { name: 'Neil Island', state: 'Andaman & Nicobar Islands', lat: 11.8333, lon: 93.0500, tz: 'Asia/Kolkata', famous: true },
    { name: 'Radhanagar Beach', state: 'Andaman & Nicobar Islands', lat: 12.0200, lon: 92.9600, tz: 'Asia/Kolkata', famous: true },
    { name: 'Bangaram Island', state: 'Lakshadweep', lat: 10.9400, lon: 72.2800, tz: 'Asia/Kolkata', famous: true },
    { name: 'Minicoy', state: 'Lakshadweep', lat: 8.2800, lon: 73.0500, tz: 'Asia/Kolkata', famous: true },
  ];

  var CATEGORIES = ['All Rituals', 'Home & Family', 'Griha & Bhoomi', 'Wedding & Sanskar', 'Remedy & Shanti', 'Corporate & Express', 'Festival Specials', 'Ganga & Tirth', 'Homa & Yagya'];

  var POOJAS = [
    {
      id: 'express-desk', name: 'Express Desk Blessing', hi: 'एक्सप्रेस डेस्क आशीर्वाद', cat: 'Corporate & Express', icon: '🪔',
      price: 1499, mrp: 1999, duration: '30 min', popular: true, tags: ['Office', 'Weekday'],
      desc: 'A crisp 30-minute Vedic blessing at your workstation or home desk — perfect for a launch, appraisal, new role or simply a calm start. Sankalpa, Ganpati Vandana, Kalash sthapana and a short durva-akshata blessing.',
      includes: ['Verified pandit', 'Tabletop eco setup', 'Sankalpa with your gotra', 'Prasad box', 'Digital receipt'],
      samagri: ['Tabletop brass diya', 'Roli & kalava', 'Akshata', 'Durva grass', 'Incense sticks', 'Small prasad box']
    },
    {
      id: 'vehicle-pooja', name: 'Vehicle Pooja', hi: 'वाहन पूजा', cat: 'Corporate & Express', icon: '🚗',
      price: 2100, mrp: 2999, duration: '45 min', popular: true, tags: ['New car', 'Office parking'],
      desc: 'Bless a new car, bike or fleet with Ganesh Vandana, Kalash pooja, swastik and coconut-breaking outside your tower or office parking. Society-friendly, no smoke inside the basement.',
      includes: ['Pandit at your parking bay', 'Smokeless dhoop', 'Coconut & lemon set', 'Swastik tilak', 'Gate pass support'],
      samagri: ['Coconut', 'Lemon & green chilli', 'Roli, haldi, kumkum', 'Kalava', 'Dhoop sticks', 'Small kalash']
    },
    {
      id: 'satyanarayan', name: 'Satyanarayan Katha', hi: 'सत्यनारायण कथा', cat: 'Home & Family', icon: '📖',
      price: 5100, mrp: 6999, duration: '3 hrs', popular: true, tags: ['Purnima', 'Family'],
      desc: 'The classic household vrat katha performed on Purnima or a chosen shubh muhurat. Includes Ganpati pooja, Navgrah sthapana, Satyanarayan katha recital, aarti and prasad distribution for the whole family.',
      includes: ['Senior pandit (North or South style)', 'Full samagri kit', 'Fresh flowers', 'Katha book & prasad', 'Punya-Flow waste pickup'],
      samagri: ['Satyanarayan kit', 'Panchamrit set', 'Fresh flowers & tulsi', 'Banana leaves', 'A2 cow ghee', 'Panjiri prasad', 'Eco havan samagri']
    },
    {
      id: 'griha-pravesh', name: 'Griha Pravesh', hi: 'गृह प्रवेश', cat: 'Griha & Bhoomi', icon: '🏠',
      price: 11500, mrp: 14999, duration: '4 hrs', popular: true, tags: ['New flat', 'Vastu'],
      desc: 'Move-in ceremony for your new apartment, villa or penthouse. Includes Vastu Shanti, Navgrah Shanti, Ganesh and Lakshmi pooja, milk boiling, Kalash sthapana and a coconut-breaking entry with the family.',
      includes: ['2 pandits for large homes', 'Vastu mapping & remedies', 'Full samagri + flowers', 'Havan with eco kund', 'Prasad & visarjan', 'Society gate pass coordination'],
      samagri: ['Griha Pravesh kit', 'Brass kalash & coconut', 'Navgrah samagri', 'Havan kund (tabletop)', 'A2 ghee 1 kg', 'Milk & gangajal', 'Fresh flower set']
    },
    {
      id: 'navgrah', name: 'Navgrah Shanti', hi: 'नवग्रह शांति', cat: 'Remedy & Shanti', icon: '🪐',
      price: 8500, mrp: 10999, duration: '3 hrs', tags: ['Dosha', 'Havan'],
      desc: 'A nine-planet pacification havan with graha-wise mantras, japa and daan. Recommended when multiple planets are afflicting the chart, during Sade Sati or before major life decisions.',
      includes: ['Graha-wise japa 1,000x each', 'Navgrah havan', 'Daan guidance', 'Kundli review by astrologer', 'Waste pickup'],
      samagri: ['Navgrah samagri', 'Nine grains', 'Nine coloured cloths', 'A2 ghee', 'Havan samagri 2 kg', 'Navgrah yantra']
    },
    {
      id: 'mangal-shanti', name: 'Mangal Dosh Nivaran', hi: 'मंगल दोष निवारण', cat: 'Remedy & Shanti', icon: '🔴',
      price: 6500, mrp: 8500, duration: '2.5 hrs', popular: true, tags: ['Marriage', 'Manglik'],
      desc: 'Mangal Shanti with 7,000 Mangal mantra japa, Kumbh sthapana and a red-cloth daan. Often advised before marriage or when Mars sits in the 1st, 2nd, 4th, 7th, 8th or 12th house.',
      includes: ['7,000 mantra japa', 'Mangal havan', 'Red cloth & masoor daan', 'Manglik report PDF', 'Pandit consultation'],
      samagri: ['Mangal yantra', 'Red cloth', 'Masoor dal', 'Copper vessel', 'Havan samagri', 'Roli & kalava']
    },
    {
      id: 'kaal-sarp', name: 'Kaal Sarp Dosh Pooja', hi: 'काल सर्प दोष पूजा', cat: 'Remedy & Shanti', icon: '🐍',
      price: 9500, mrp: 12500, duration: '3.5 hrs', tags: ['Dosha', 'Rahu-Ketu'],
      desc: 'Rahu–Ketu shanti with Nag-Nagin sthapana, 18,000 mantra japa and a silver snake daan. Performed on a Sunday or as per the Rahu-Ketu placement in your chart.',
      includes: ['18,000 mantra japa', 'Silver nag-nagin set', 'Rahu-Ketu havan', 'Chart verification', 'Prasad & visarjan'],
      samagri: ['Silver nag-nagin', 'Rahu-Ketu yantra', 'Black & white cloth', 'Coconut & sesame', 'Havan samagri', 'A2 ghee']
    },
    {
      id: 'rudrabhishek', name: 'Rudrabhishek', hi: 'रुद्राभिषेक', cat: 'Remedy & Shanti', icon: '🔱',
      price: 7500, mrp: 9500, duration: '2.5 hrs', popular: true, tags: ['Shiva', 'Monday'],
      desc: 'Panchamrit abhishek of a Shivling with Rudri path, milk, honey, ghee, curd and gangajal. A powerful remedy for health, longevity and mental peace, especially on Mondays and Pradosham.',
      includes: ['Rudri path (11 or 121 — choose at booking)', 'Panchamrit set', 'Bilva patra & bhang', 'Shivling setup', 'Prasad'],
      samagri: ['Milk, curd, honey, ghee', 'Gangajal', 'Bilva leaves', 'Bhang & dhatura', 'Shivling & jaldhari', 'Chandan & kumkum']
    },
    {
      id: 'mahamrityunjay', name: 'Mahamrityunjay Jaap', hi: 'महामृत्युंजय जाप', cat: 'Remedy & Shanti', icon: '🕉️',
      price: 11000, mrp: 14000, duration: '4 hrs', tags: ['Health', 'Protection'],
      desc: '1,25,000 Mahamrityunjay mantra japa by two pandits with havan and a protective kalava. Traditionally performed for recovery, surgery, accidents and family well-being.',
      includes: ['1,25,000 japa', 'Two pandits', 'Havan & purnahuti', 'Raksha kalava', 'Prasad delivery'],
      samagri: ['Mahamrityunjay yantra', 'Rudraksha mala', 'Havan samagri 3 kg', 'A2 ghee', 'Kalash & coconut', 'Saffron & camphor']
    },
    {
      id: 'ganesh-pooja', name: 'Ganesh Pooja', hi: 'गणेश पूजा', cat: 'Home & Family', icon: '🐘',
      price: 3100, mrp: 3999, duration: '1.5 hrs', tags: ['New beginning', 'Festival'],
      desc: 'Ganpati Vandana for new beginnings, exams, business launches and before any major ritual. Includes modak bhog, 108 names and aarti.',
      includes: ['Ganpati sthapana', '108 naamavali', 'Modak bhog', 'Aarti & prasad', 'Doorstep kit'],
      samagri: ['Ganesh idol (eco clay)', 'Red cloth', 'Durva grass', 'Modak', 'Camphor & dhoop', 'Akshata']
    },
    {
      id: 'lakshmi-kubera', name: 'Lakshmi Kubera Pooja', hi: 'लक्ष्मी कुबेर पूजा', cat: 'Home & Family', icon: '🪙',
      price: 4500, mrp: 5999, duration: '2 hrs', tags: ['Wealth', 'Business'],
      desc: 'Invite prosperity with Lakshmi–Kubera sthapana, Shri Suktam path, Kubera mantra and a lotus-bhog offering. Popular for new financial years, offices and shop openings.',
      includes: ['Shri Suktam path', 'Kubera mantras', 'Lotus & kamal-gatta', 'Yantra sthapana', 'Prasad box'],
      samagri: ['Lakshmi-Kubera yantra', 'Lotus flowers', 'Gold/silver coin', 'Kumkum & haldi', 'Kamal gatta', 'Ghee lamp']
    },
    {
      id: 'durga-saptashati', name: 'Durga Saptashati Path', hi: 'दुर्गा सप्तशती पाठ', cat: 'Home & Family', icon: '🦁',
      price: 15000, mrp: 18999, duration: '5 hrs', tags: ['Navratri', 'Protection'],
      desc: 'Complete 700-verse Durga Saptashati with 13 chapters, samputikaran and havan. Performed by a trained pathi with a second pandit for the havan during Navratri or for protection from enemies.',
      includes: ['Complete 13 chapters', 'Two pandits', 'Chandi havan', 'Kumkum & red chunri', 'Prasad & visarjan'],
      samagri: ['Durga Saptashati book', 'Red chunri & bangles', 'Kumkum', 'Havan samagri 3 kg', 'Coconut & kalash', 'Fresh red flowers']
    },
    {
      id: 'shani-shanti', name: 'Shani Shanti', hi: 'शनि शांति', cat: 'Remedy & Shanti', icon: '🪔',
      price: 7000, mrp: 8999, duration: '2.5 hrs', tags: ['Sade Sati', 'Saturday'],
      desc: 'Shani Telabhishek, Shani Chalisa path and til-oil daan for Sade Sati and Dhaiya periods. Includes a Saturn transit report and practical remedies.',
      includes: ['Telabhishek', 'Shani Chalisa 11x', 'Til & iron daan', 'Sade Sati report', 'Pandit consultation'],
      samagri: ['Mustard oil 1 L', 'Black til', 'Iron item', 'Black cloth', 'Shani yantra', 'Havan samagri']
    },
    {
      id: 'rahu-ketu', name: 'Rahu–Ketu Shanti', hi: 'राहु-केतु शांति', cat: 'Remedy & Shanti', icon: '🌑',
      price: 6800, mrp: 8500, duration: '2.5 hrs', tags: ['Dosha', 'Saturday'],
      desc: 'Rahu–Ketu grah shanti with 18,000 japa, nag-nagin pooja and coconut daan. Helpful for delays, anxiety, unexplained obstacles and Kaal Sarp indications.',
      includes: ['18,000 japa', 'Nag-nagin pooja', 'Coconut daan', 'Rahu-Ketu yantra', 'Prasad'],
      samagri: ['Rahu-Ketu yantra', 'Coconut', 'Black & white cloth', 'Sesame', 'Havan samagri', 'A2 ghee']
    },
    {
      id: 'pitru-tarpan', name: 'Pitru Tarpan & Shraddha', hi: 'पितृ तर्पण', cat: 'Home & Family', icon: '🙏',
      price: 5500, mrp: 6999, duration: '2 hrs', tags: ['Pitru Paksha', 'Ancestors'],
      desc: 'Respectful tarpan and shraddha for ancestors on their tithi or during Pitru Paksha. Includes pinda daan, brahmin bhoj guidance and sankalpa in your family gotra.',
      includes: ['Tarpan & pinda daan', 'Gotra sankalpa', 'Brahmin bhoj coordination', 'Prasad', 'Punya-Flow visarjan'],
      samagri: ['Barley & black til', 'Kusha grass', 'Pinda set', 'White cloth', 'Gangajal', 'Dhoop & diya']
    },
    {
      id: 'vastu-shanti', name: 'Vastu Shanti', hi: 'वास्तु शांति', cat: 'Griha & Bhoomi', icon: '🧭',
      price: 9500, mrp: 12000, duration: '3 hrs', popular: true, tags: ['Vastu', 'New home'],
      desc: 'Vastu dosha correction through Vastu Purush pooja, 81-Devta sthapana and directional remedies — ideal before interiors, after buying a resale flat or when the family feels unsettled.',
      includes: ['Floor-plan vastu review', 'Vastu Purush pooja', '81-Devta havan', 'Room-wise remedies', 'Report PDF'],
      samagri: ['Vastu yantra', 'Navdhanya', 'Kalash & coconut', 'Havan samagri', 'Copper strips', 'Fresh flowers']
    },
    {
      id: 'bhoomi-poojan', name: 'Bhoomi Poojan', hi: 'भूमि पूजन', cat: 'Griha & Bhoomi', icon: '⛏️',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Construction', 'Plot'],
      desc: 'Ground-breaking ceremony before construction or renovation. Includes Bhoomi Devi pooja, Vastu sthapana, nag-bali shanti and shila poojan with the family.',
      includes: ['Bhoomi Devi pooja', 'Shila poojan', 'Vastu sthapana', 'Nag-bali shanti', 'Site cleanup'],
      samagri: ['Silver nag', 'Bhoomi yantra', 'Bricks & lime', 'Kalash', 'Havan samagri', 'Coconut']
    },
    {
      id: 'vivah', name: 'Vivah Sanskar', hi: 'विवाह संस्कार', cat: 'Wedding & Sanskar', icon: '💍',
      price: 51000, mrp: 65000, duration: '6 hrs', tags: ['Wedding', 'Destination'],
      desc: 'Complete Vedic wedding with Ganesh pooja, Vargha, Mandap sthapana, Kanyadaan, Panigrahan, Saat pheras, Sindoor and Ashirwad. Our senior acharyas coordinate with your wedding planner and venue.',
      includes: ['Lead acharya + 2 assistants', 'Mandap & havan setup', 'Bridal welcome samagri', 'Gotra & kundli matching report', 'Rehearsal call', 'Travel within NCR'],
      samagri: ['Mandap samagri', 'Wedding havan kit', 'Kanyadaan set', 'Sindoor & mangalsutra thali', 'Fresh flower sets', 'A2 ghee 2 kg']
    },
    {
      id: 'roka', name: 'Roka / Engagement Pooja', hi: 'रोका / सगाई पूजा', cat: 'Wedding & Sanskar', icon: '💐',
      price: 15000, mrp: 18000, duration: '2.5 hrs', tags: ['Engagement', 'Family'],
      desc: 'An intimate Vedic engagement ceremony with Ganesh pooja, ring exchange blessing, gotra milan and ashirwad for both families.',
      includes: ['Pandit + samagri', 'Ring thali setup', 'Gotra milan', 'Aashirwad mantras', 'Fresh flowers'],
      samagri: ['Engagement thali', 'Rings tilak set', 'Fresh flowers', 'Kalash & coconut', 'Sweets', 'Dhoop & diya']
    },
    {
      id: 'namkaran', name: 'Namkaran Sanskar', hi: 'नामकरण संस्कार', cat: 'Wedding & Sanskar', icon: '👶',
      price: 4100, mrp: 5199, duration: '1.5 hrs', tags: ['Baby', 'Naming'],
      desc: 'Naming ceremony with nakshatra-based name syllables, Ganpati pooja, Punyahavachan and father’s first whisper of the name into the baby’s ear.',
      includes: ['Nakshatra name suggestions', 'Punyahavachan', 'Samagri kit', 'Prasad', 'Naming certificate'],
      samagri: ['Namkaran kit', 'Honey & ghee', 'Kalash', 'Fresh flowers', 'Prasad box', 'Janam patrika']
    },
    {
      id: 'mundan', name: 'Mundan Sanskar', hi: 'मुंडन संस्कार', cat: 'Wedding & Sanskar', icon: '✂️',
      price: 4500, mrp: 5500, duration: '2 hrs', tags: ['Baby', 'First haircut'],
      desc: 'First-haircut ceremony with Ganpati pooja, havan and a gentle, hygienic barber coordinated by us. Available at home or at a temple courtyard.',
      includes: ['Pandit & havan', 'Barber coordination', 'Hygiene kit', 'Prasad', 'Cleanup'],
      samagri: ['Mundan kit', 'Havan samagri', 'Roli & akshata', 'Coconut', 'Prasad', 'Fresh flowers']
    },
    {
      id: 'annaprashan', name: 'Annaprashan', hi: 'अन्नप्राशन', cat: 'Wedding & Sanskar', icon: '🍚',
      price: 4100, mrp: 5199, duration: '1.5 hrs', tags: ['Baby', 'First food'],
      desc: 'First-rice ceremony with Vedic mantras, kheer bhog and family blessings on a shubh muhurat chosen from the baby’s nakshatra.',
      includes: ['Muhurat selection', 'Pandit & samagri', 'Kheer bhog setup', 'Prasad', 'Photo-friendly setup'],
      samagri: ['Annaprashan thali', 'Kheer & honey', 'Kalash', 'Fresh flowers', 'Akshata', 'Prasad box']
    },
    {
      id: 'upanayan', name: 'Upanayan / Janeu Sanskar', hi: 'उपनयन संस्कार', cat: 'Wedding & Sanskar', icon: '🧵',
      price: 9000, mrp: 11500, duration: '3 hrs', tags: ['Thread ceremony', 'Vedic'],
      desc: 'Sacred-thread ceremony with Yagyopavit dharan, Gayatri upadesh, Sandhya vandana and bhiksha. Performed by a senior acharya with the family priest in attendance.',
      includes: ['Yagyopavit set', 'Gayatri upadesh', 'Havan & purnahuti', 'Bhiksha coordination', 'Prasad'],
      samagri: ['Janeu set', 'Dhoti & angavastram', 'Havan samagri', 'Kalash', 'Fresh flowers', 'Prasad']
    },
    {
      id: 'office-opening', name: 'Corporate Office Poojan', hi: 'कार्यालय पूजन', cat: 'Corporate & Express', icon: '🏢',
      price: 6000, mrp: 7500, duration: '1.5 hrs', tags: ['GST invoice', 'Office'],
      desc: 'GST-invoiced office blessing with Ganesh–Lakshmi pooja, desk-wise akshata blessing and a short motivational aarti for the whole team. Flexible 7–10 AM or 6–8 PM slots.',
      includes: ['GST invoice', '2 pandits for large floors', 'Desk-wise blessing', 'Prasad for team', 'Compliance-friendly dhoop'],
      samagri: ['Ganesh-Lakshmi idols', 'Tabletop havan', 'Akshata & kalava', 'Prasad boxes', 'Dhoop sticks', 'Fresh flowers']
    },
    {
      id: 'shop-opening', name: 'Shop / Showroom Opening', hi: 'दुकान उद्घाटन पूजा', cat: 'Corporate & Express', icon: '🏪',
      price: 5000, mrp: 6500, duration: '1.5 hrs', tags: ['Business', 'Muhurat'],
      desc: 'Muhurat-based opening pooja with Ganesh Vandana, Lakshmi sthapana, shubh muhurat ribbon timing and a coconut-breaking entry for the shutter.',
      includes: ['Muhurat timing', 'Ganesh-Lakshmi pooja', 'Shutter poojan', 'Prasad', 'GST invoice'],
      samagri: ['Ganesh-Lakshmi set', 'Coconut & lemon', 'Kalash', 'Akshata', 'Dhoop', 'Fresh flowers']
    },
    {
      id: 'saraswati', name: 'Saraswati Pooja', hi: 'सरस्वती पूजा', cat: 'Home & Family', icon: '📚',
      price: 3500, mrp: 4500, duration: '1.5 hrs', tags: ['Students', 'Exams'],
      desc: 'Blessing for students before board exams, competitive tests or a new academic year, with Saraswati Vandana, books poojan and pen-blessing.',
      includes: ['Saraswati sthapana', 'Books & pen poojan', '108 names', 'Prasad', 'Eco kit'],
      samagri: ['Saraswati yantra', 'White flowers', 'Books & pen', 'Honey & mishri', 'Dhoop', 'Prasad']
    },
    {
      id: 'hanuman-chalisa', name: 'Hanuman Chalisa Path', hi: 'हनुमान चालीसा पाठ', cat: 'Home & Family', icon: '🐒',
      price: 4000, mrp: 4999, duration: '1.5 hrs', tags: ['Tuesday', 'Saturday'],
      desc: '11 or 108 recitations of the Hanuman Chalisa with Sunderkand excerpts, sindoor-chola offering and a protective kalava for the family.',
      includes: ['11 or 108 paths', 'Sindoor & chola', 'Bajrang Bali aarti', 'Raksha kalava', 'Prasad'],
      samagri: ['Sindoor 250 g', 'Chola', 'Chalisa book', 'Camphor', 'Prasad', 'Kalava']
    },
    {
      id: 'sunderkand', name: 'Sunderkand Path', hi: 'सुंदरकांड पाठ', cat: 'Home & Family', icon: '🙏',
      price: 8000, mrp: 9999, duration: '2.5 hrs', tags: ['Hanuman', 'Family'],
      desc: 'A full Sunderkand path with a trained pathi and second pandit for the havan, followed by Hanuman aarti and prasad distribution.',
      includes: ['Sunderkand path', 'Hanuman havan', 'Two pandits', 'Prasad', 'Waste pickup'],
      samagri: ['Sunderkand book', 'Hanuman yantra', 'Sindoor & chola', 'Havan samagri', 'A2 ghee', 'Prasad']
    },
    {
      id: 'diwali-poojan', name: 'Diwali Lakshmi Poojan', hi: 'दिवाली लक्ष्मी पूजन', cat: 'Festival Specials', icon: '🪔',
      price: 5500, mrp: 6999, duration: '2 hrs', popular: true, tags: ['Diwali', 'Lakshmi'],
      desc: 'Festive Lakshmi–Ganesh pooja with Shri Suktam, diya-lighting ritual, Kubera sthapana and a guided aarti for the family. Book a pre-festival slot before Dhanteras.',
      includes: ['Lakshmi-Ganesh pooja', 'Shri Suktam', 'Diya set & rangoli kit', 'Prasad', 'Festival kit delivery'],
      samagri: ['Lakshmi-Ganesh idols', 'Diya set 21', 'Rangoli colours', 'Shri Suktam book', 'Kumkum & haldi', 'Prasad']
    },
    {
      id: 'navratri-sthapana', name: 'Navratri Ghatasthapana', hi: 'नवरात्रि घटस्थापना', cat: 'Festival Specials', icon: '🌺',
      price: 4500, mrp: 5999, duration: '2 hrs', tags: ['Navratri', 'Kalash'],
      desc: 'Kalash sthapana and Ghatasthapana on the first day of Navratri with barley sowing, Durga Saptashati shlokas and day-wise pooja guidance.',
      includes: ['Kalash sthapana', 'Barley sowing kit', 'Durga mantra vidhi', 'Day-wise guide', 'Prasad'],
      samagri: ['Kalash & coconut', 'Barley seeds & soil', 'Red chunri', 'Durga yantra', 'Fresh flowers', 'Prasad']
    },
    {
      id: 'chhath', name: 'Chhath Pooja', hi: 'छठ पूजा', cat: 'Festival Specials', icon: '🌅',
      price: 6500, mrp: 8500, duration: '3 hrs', tags: ['Bihar', 'Chhath'],
      desc: 'Chhath Maiya vrata setup with bamboo daala, soop, thekua prasad and sunset/sunrise arghya guidance — at your home, terrace or a nearby ghat.',
      includes: ['Chhath vrata setup', 'Bamboo daala & soop', 'Thekua prasad', 'Arghya guidance', 'Ghat coordination'],
      samagri: ['Bamboo daala', 'Soop & daura', 'Thekua ingredients', 'Sindoor & camphor', 'Fruits & sugarcane', 'Ghee lamps']
    },
    {
      id: 'karwa-chauth', name: 'Karwa Chauth Pooja', hi: 'करवा चौथ पूजा', cat: 'Festival Specials', icon: '🌙',
      price: 4500, mrp: 5999, duration: '1.5 hrs', tags: ['Karwa Chauth', 'Couples'],
      desc: 'Karwa Chauth vrat katha at home with karwa, chhalni and baya setup, plus moonrise timing for the first sip of water.',
      includes: ['Vrat katha', 'Karwa & chhalni', 'Baya setup', 'Moonrise timing', 'Prasad'],
      samagri: ['Karwa set', 'Chhalni', 'Baya', 'Kumkum & mehendi', 'Fruits', 'Prasad']
    },
    {
      id: 'ayushya', name: 'Ayushya Homa (Birthday)', hi: 'आयुष्य होम', cat: 'Home & Family', icon: '🎂',
      price: 5500, mrp: 6999, duration: '2 hrs', tags: ['Birthday', 'Longevity'],
      desc: 'A birthday blessing with Ayushya Sukta homa, nakshatra-based sankalpa and a family aarti for health and long life.',
      includes: ['Ayushya homa', 'Sankalpa', 'Prasad', 'Birthday blessing', 'Eco kund'],
      samagri: ['Ayushya samagri', 'Havan kund', 'A2 ghee', 'Fresh flowers', 'Prasad', 'Kalava']
    },
    {
      id: 'sade-sati', name: 'Sade Sati Shanti', hi: 'साढ़े साती शांति', cat: 'Remedy & Shanti', icon: '♄',
      price: 8500, mrp: 10999, duration: '3 hrs', tags: ['Saturn', 'Remedy'],
      desc: 'Targeted Shani–Hanuman upasana for the running Sade Sati phase, with telabhishek, 23,000 Shani mantra japa and practical daan guidance.',
      includes: ['Phase-wise analysis', '23,000 japa', 'Telabhishek', 'Daan guidance', '3-month remedy plan'],
      samagri: ['Shani yantra', 'Mustard oil', 'Black til & cloth', 'Iron items', 'Havan samagri', 'Hanuman chalisa']
    },
    {
      id: 'mangal-dosh-marriage', name: 'Manglik Vivah Shanti', hi: 'मांगलिक विवाह शांति', cat: 'Wedding & Sanskar', icon: '🔺',
      price: 7500, mrp: 9500, duration: '2.5 hrs', tags: ['Marriage', 'Manglik'],
      desc: 'Pre-wedding Manglik shanti for one or both partners, with kumbh sthapana, Mangal graha japa and an official shanti certificate for the families.',
      includes: ['Manglik report', 'Mangal japa', 'Kumbh sthapana', 'Shanti certificate', 'Wedding muhurat'],
      samagri: ['Mangal yantra', 'Red cloth & masoor', 'Kalash', 'Havan samagri', 'Coconut', 'A2 ghee']
    },
    {
      id: 'business-startup', name: 'Business Startup Pooja', hi: 'व्यापार आरंभ पूजा', cat: 'Corporate & Express', icon: '🚀',
      price: 5500, mrp: 6999, duration: '2 hrs', tags: ['New business', 'Muhurat'],
      desc: 'A muhurat-led launch pooja for a new venture, shop or company. Ganesh Vandana, Lakshmi–Kuber sthapana and a shubh timing for the first invoice or first customer.',
      includes: ['Muhurat timing for launch', 'Ganesh–Lakshmi pooja', 'Kuber sthapana', 'GST invoice', 'Prasad for the team'],
      samagri: ['Ganesh-Lakshmi idols', 'Kuber yantra', 'Kalash & coconut', 'Akshata & kalava', 'Dhoop', 'Prasad box']
    },
    {
      id: 'vishwakarma', name: 'Vishwakarma Pooja', hi: 'विश्वकर्मा पूजा', cat: 'Corporate & Express', icon: '🔨',
      price: 5100, mrp: 6499, duration: '2 hrs', tags: ['Factory', 'Office', 'Machines'],
      desc: 'Blessing for a factory, workshop, machines, tools or a new office fit-out. Vishwakarma sthapana, shastra poojan and a safety sankalpa for the whole team.',
      includes: ['Vishwakarma sthapana', 'Machine & tool poojan', 'Safety sankalpa', 'GST invoice', 'Prasad'],
      samagri: ['Vishwakarma yantra', 'Kalash & coconut', 'Roli & akshata', 'Dhoop & diya', 'Prasad', 'Fresh flowers']
    },
    {
      id: 'dussehra', name: 'Dussehra Poojan', hi: 'दशहरा पूजन', cat: 'Festival Specials', icon: '🏹',
      price: 4500, mrp: 5999, duration: '1.5 hrs', tags: ['Dussehra', 'Vijayadashami'],
      desc: 'Vijayadashami poojan for victory over obstacles, with Durga and Ram dhyan, shastra poojan and a family aarti. Ideal before starting a new venture or clearing a long-pending matter.',
      includes: ['Vijayadashami muhurat', 'Durga–Ram dhyan', 'Shastra or tool poojan', 'Aarti & prasad', 'Festival kit'],
      samagri: ['Durga yantra', 'Red chunri', 'Kalash & coconut', 'Akshata', 'Dhoop & diya', 'Prasad']
    },
    {
      id: 'holika', name: 'Holika Dahan Poojan', hi: 'होलिका दहन पूजन', cat: 'Festival Specials', icon: '🔥',
      price: 3500, mrp: 4500, duration: '1.5 hrs', tags: ['Holi', 'Holika Dahan'],
      desc: 'Holika Dahan vidhi with Prahlad smaran, samidha arpan and a sankalpa to burn old troubles. We coordinate the bonfire timing, safety and society permissions.',
      includes: ['Holika Dahan muhurat', 'Samidha arpan', 'Safety coordination', 'Prasad', 'Society permission help'],
      samagri: ['Samidha sticks', 'Roli & kalava', 'Coconut & akshata', 'Dhoop', 'Prasad', 'Ghee for samidha']
    },
    {
      id: 'janmashtami', name: 'Janmashtami Poojan', hi: 'जन्माष्टमी पूजन', cat: 'Festival Specials', icon: '🪈',
      price: 4500, mrp: 5999, duration: '2 hrs', tags: ['Krishna', 'Janmashtami'],
      desc: 'Midnight Krishna janmotsav with Bal Gopal sthapana, bhajan, jhula decoration and a chhappan-bhog blessing. A gentle, family-friendly ritual for children and elders alike.',
      includes: ['Bal Gopal sthapana', 'Midnight aarti', 'Jhula decoration', 'Chhappan-bhog blessing', 'Prasad'],
      samagri: ['Bal Gopal idol', 'Jhula & flowers', 'Makhan-mishri', 'Tulsi', 'Dhoop & diya', 'Prasad']
    },
    {
      id: 'maha-shivratri', name: 'Maha Shivratri Poojan', hi: 'महाशिवरात्रि पूजन', cat: 'Festival Specials', icon: '🔱',
      price: 5500, mrp: 6999, duration: '2.5 hrs', tags: ['Shiva', 'Ratri'],
      desc: 'Four-prahar Shiva upasana with Rudrabhishek, bel patra, milk and gangajal. Performed through the night or in the family’s chosen prahar with a Shivling setup at home.',
      includes: ['Char-prahar vidhi', 'Rudrabhishek', 'Bel patra & bhang', 'Shivling setup', 'Prasad'],
      samagri: ['Shivling & jaldhari', 'Milk, curd & honey', 'Bel patra', 'Bhang & dhatura', 'Chandan & kumkum', 'Prasad']
    },
    {
      id: 'naag-panchmi', name: 'Naag Panchmi Pooja', hi: 'नाग पंचमी पूजा', cat: 'Festival Specials', icon: '🐍',
      price: 3500, mrp: 4500, duration: '1.5 hrs', tags: ['Naag', 'Shravan'],
      desc: 'Naag Devta poojan with milk, lotus and a silver nag set, traditionally performed in Shravan. Helpful for Kaal Sarp indications, Rahu–Ketu afflictions and family well-being.',
      includes: ['Naag sthapana', 'Dugdhabhishek', 'Silver nag set', 'Rahu-Ketu shanti', 'Prasad'],
      samagri: ['Silver nag set', 'Milk & lotus', 'Rahu-Ketu yantra', 'Akshata', 'Dhoop', 'Prasad']
    },
    {
      id: 'raksha-bandhan', name: 'Raksha Bandhan Poojan', hi: 'रक्षाबंधन पूजन', cat: 'Festival Specials', icon: '🪢',
      price: 3100, mrp: 3999, duration: '1 hr', tags: ['Rakhi', 'Family'],
      desc: 'A short, joyful rakhi vidhi with sankalpa, aarti and a blessing for siblings. The pandit guides the thread-tying order and mantras for the whole family.',
      includes: ['Rakhi vidhi guidance', 'Sankalpa & aarti', 'Family blessing', 'Prasad', 'Festival kit'],
      samagri: ['Rakhi set', 'Roli & chawal', 'Kalash & coconut', 'Dhoop & diya', 'Sweets', 'Akshata']
    },
    {
      id: 'surya-shanti', name: 'Surya Grah Shanti', hi: 'सूर्य ग्रह शांति', cat: 'Remedy & Shanti', icon: '☀️',
      price: 5500, mrp: 6999, duration: '2 hrs', tags: ['Sun', 'Leadership'],
      desc: 'Surya upasana with Aditya Hridaya path, ruby or copper daan and a Sunday sunrise arghya. Recommended for confidence, authority, fatherhood and government matters.',
      includes: ['Aditya Hridaya path', 'Surya arghya', 'Copper & wheat daan', 'Graha report', 'Prasad'],
      samagri: ['Surya yantra', 'Copper vessel', 'Red flowers', 'Wheat & gud', 'Havan samagri', 'Prasad']
    },
    {
      id: 'chandra-shanti', name: 'Chandra Grah Shanti', hi: 'चंद्र ग्रह शांति', cat: 'Remedy & Shanti', icon: '🌙',
      price: 5500, mrp: 6999, duration: '2 hrs', tags: ['Moon', 'Mind'],
      desc: 'Chandra shanti with Shiva–Parvati poojan, milk abhishek and a pearl or silver daan. Traditionally chosen for emotional unrest, sleep issues and mother’s health.',
      includes: ['Chandra mantra japa', 'Milk abhishek', 'Silver & rice daan', 'Graha report', 'Prasad'],
      samagri: ['Chandra yantra', 'Silver item', 'Milk & rice', 'White flowers', 'Havan samagri', 'Prasad']
    },
    {
      id: 'mangal-grah-shanti', name: 'Mangal Grah Shanti', hi: 'मंगल ग्रह शांति', cat: 'Remedy & Shanti', icon: '🔺',
      price: 6000, mrp: 7500, duration: '2 hrs', tags: ['Mars', 'Courage'],
      desc: 'Mangal shanti with Hanuman Chalisa, red-cloth daan and a Mars mantra japa. Chosen for anger, accidents, sibling disputes and property-related delays.',
      includes: ['Mangal japa', 'Hanuman Chalisa path', 'Red cloth & masoor daan', 'Graha report', 'Prasad'],
      samagri: ['Mangal yantra', 'Red cloth', 'Masoor dal', 'Copper vessel', 'Havan samagri', 'Prasad']
    },
    {
      id: 'budh-shanti', name: 'Budh Grah Shanti', hi: 'बुध ग्रह शांति', cat: 'Remedy & Shanti', icon: '🟢',
      price: 5500, mrp: 6999, duration: '2 hrs', tags: ['Mercury', 'Business'],
      desc: 'Budh upasana with Vishnu Sahasranama excerpts, green moong daan and a mercury-yantra sthapana. Helpful for speech, exams, contracts and business communication.',
      includes: ['Budh mantra japa', 'Vishnu smaran', 'Green moong daan', 'Graha report', 'Prasad'],
      samagri: ['Budh yantra', 'Green cloth', 'Moong dal', 'Tulsi', 'Havan samagri', 'Prasad']
    },
    {
      id: 'guru-shanti', name: 'Brihaspati (Guru) Shanti', hi: 'बृहस्पति ग्रह शांति', cat: 'Remedy & Shanti', icon: '🟡',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Jupiter', 'Wisdom'],
      desc: 'Guru shanti with Vishnu–Brihaspati poojan, turmeric and chana daal daan and a yellow-sapphire consultation. Advised for marriage delays, education and spiritual growth.',
      includes: ['Guru mantra japa', 'Vishnu poojan', 'Turmeric & chana daan', 'Gemstone guidance', 'Prasad'],
      samagri: ['Guru yantra', 'Yellow cloth', 'Turmeric & chana dal', 'Banana', 'Havan samagri', 'Prasad']
    },
    {
      id: 'shukra-shanti', name: 'Shukra Grah Shanti', hi: 'शुक्र ग्रह शांति', cat: 'Remedy & Shanti', icon: '⚪',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Venus', 'Marriage'],
      desc: 'Shukra upasana with Lakshmi poojan, white-cloth and curd daan and a Venus mantra japa. Chosen for relationships, artistic success, luxury and marital harmony.',
      includes: ['Shukra japa', 'Lakshmi poojan', 'White cloth & curd daan', 'Graha report', 'Prasad'],
      samagri: ['Shukra yantra', 'White cloth', 'Curd & rice', 'White flowers', 'Havan samagri', 'Prasad']
    },
    {
      id: 'ketu-shanti', name: 'Ketu Grah Shanti', hi: 'केतु ग्रह शांति', cat: 'Remedy & Shanti', icon: '🔶',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Ketu', 'Detachment'],
      desc: 'Ketu shanti with Ganesh upasana, a two-colour cloth daan and a Ketu mantra japa. Helpful for confusion, spiritual unrest, skin issues and unexpected losses.',
      includes: ['Ketu japa', 'Ganesh poojan', 'Two-colour cloth daan', 'Graha report', 'Prasad'],
      samagri: ['Ketu yantra', 'Mixed cloth', 'Sesame & coconut', 'Ganesh idol', 'Havan samagri', 'Prasad']
    },
    {
      id: 'bhagwat-path', name: 'Shrimad Bhagwat Path', hi: 'श्रीमद्भागवत पाठ', cat: 'Remedy & Shanti', icon: '📖',
      price: 21000, mrp: 25999, duration: '5 hrs/day', tags: ['Bhagwat', 'Katha'],
      desc: 'A guided Shrimad Bhagwat katha with a trained pathi, daily Krishna aarti and a family sankalpa. Available as a one-day sankshipt path or a full seven-day katha.',
      includes: ['Trained pathi', 'One-day or 7-day format', 'Daily aarti', 'Katha book', 'Prasad'],
      samagri: ['Bhagwat book', 'Krishna idol', 'Tulsi & flowers', 'Dhoop & diya', 'Prasad', 'Akshata']
    },
    {
      id: 'gayatri-jap', name: 'Gayatri Mantra Jaap', hi: 'गायत्री मंत्र जाप', cat: 'Remedy & Shanti', icon: '🕉️',
      price: 5100, mrp: 6499, duration: '2 hrs', tags: ['Gayatri', 'Study'],
      desc: 'A 24,000 Gayatri mantra japa with sandhya vandana and a havan. Traditionally performed for children’s education, focus, speech and spiritual discipline.',
      includes: ['24,000 japa', 'Sandhya vandana', 'Gayatri havan', 'Japa mala', 'Prasad'],
      samagri: ['Gayatri yantra', 'Rudraksha mala', 'Havan samagri', 'A2 ghee', 'White flowers', 'Prasad']
    },
    {
      id: 'kaal-bhairav-jap', name: 'Kaal Bhairav Jap', hi: 'काल भैरव जाप', cat: 'Remedy & Shanti', icon: '🖤',
      price: 7500, mrp: 9500, duration: '2.5 hrs', tags: ['Bhairav', 'Protection'],
      desc: 'Kaal Bhairav upasana for protection from enemies, legal matters and sudden fear. Includes a black-cloth offering, Bhairav Chalisa and a protective kalava.',
      includes: ['Bhairav japa', 'Chalisa path', 'Black-cloth offering', 'Raksha kalava', 'Prasad'],
      samagri: ['Bhairav yantra', 'Black cloth', 'Coconut & sesame', 'Camphor', 'Havan samagri', 'Prasad']
    },
    {
      id: 'mool-nakshatra', name: 'Mool Nakshatra Shanti', hi: 'मूल नक्षत्र शांति', cat: 'Remedy & Shanti', icon: '⭐',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Nakshatra', 'Baby'],
      desc: 'Mool shanti for a child born in Mool, Ashlesha or Jyeshtha nakshatra, or when the birth nakshatra needs pacification. Includes a nakshatra-specific japa and family blessing.',
      includes: ['Nakshatra analysis', 'Mool shanti japa', 'Family blessing', 'Shanti report', 'Prasad'],
      samagri: ['Nakshatra yantra', 'Kusha grass', 'Black til', 'Kalash & coconut', 'Havan samagri', 'Prasad']
    },
    {
      id: 'baglamukhi-jap', name: 'Baglamukhi Jap', hi: 'बगलामुखी जाप', cat: 'Remedy & Shanti', icon: '🟡',
      price: 11000, mrp: 14000, duration: '3 hrs', tags: ['Baglamukhi', 'Victory'],
      desc: 'Baglamukhi upasana with a yellow-cloth sthapana, 11,000 mantra japa and a turmeric havan. Traditionally performed for court cases, competition and enemy obstacles.',
      includes: ['11,000 japa', 'Yellow sthapana', 'Turmeric havan', 'Raksha kalava', 'Prasad'],
      samagri: ['Baglamukhi yantra', 'Yellow cloth', 'Turmeric & haldi mala', 'Yellow flowers', 'Havan samagri', 'Prasad']
    },
    {
      id: 'navchandi', name: 'Navchandi Path', hi: 'नवचंडी पाठ', cat: 'Remedy & Shanti', icon: '🪔',
      price: 18000, mrp: 22999, duration: '4 hrs', tags: ['Durga', 'Havan'],
      desc: 'Nine-fold Chandi path with Navchandi havan, Durga Saptashati samputikaran and a kumkum offering. A larger remedy for family protection and major obstacles.',
      includes: ['Navchandi path', 'Navchandi havan', 'Kumkum offering', 'Two pandits', 'Prasad'],
      samagri: ['Durga Saptashati book', 'Red chunri', 'Kumkum', 'Havan samagri 4 kg', 'Coconut & kalash', 'Prasad']
    },
    {
      id: 'sahasra-chandi', name: 'Sahasra Chandi Path', hi: 'सहस्र चंडी पाठ', cat: 'Remedy & Shanti', icon: '📜',
      price: 35000, mrp: 45000, duration: '2 days', tags: ['Durga', 'Maha-anushthan'],
      desc: 'A thousand-fold Chandi anushthan for the most serious family or business obstacles, performed by a team of pathis with a grand purnahuti havan.',
      includes: ['Team of pathis', 'Sahasra Chandi japa', 'Purnahuti havan', 'Kumkum & chunri', 'Prasad distribution'],
      samagri: ['Durga Saptashati set', 'Red chunri & kumkum', 'Havan samagri 10 kg', 'A2 ghee', 'Kalash set', 'Prasad']
    },
    {
      id: 'laxmi-narayan', name: 'Laxmi Narayan Mahayagya', hi: 'लक्ष्मी नारायण महायज्ञ', cat: 'Remedy & Shanti', icon: '🪙',
      price: 25000, mrp: 32000, duration: '5 hrs', tags: ['Wealth', 'Wedding'],
      desc: 'A grand Laxmi–Narayan yagya for prosperity, marital harmony and family unity, with Shri Suktam, Vishnu Sahasranama and a joint purnahuti.',
      includes: ['Shri Suktam path', 'Vishnu Sahasranama', 'Mahayagya havan', 'Two pandits', 'Prasad distribution'],
      samagri: ['Laxmi-Narayan yantra', 'Lotus & tulsi', 'Havan samagri 5 kg', 'A2 ghee', 'Gold/silver coin', 'Prasad']
    },
    {
      id: 'laxmi-prapti', name: 'Laxmi Prapti Yagya', hi: 'लक्ष्मी प्राप्ति यज्ञ', cat: 'Remedy & Shanti', icon: '💛',
      price: 9500, mrp: 12000, duration: '3 hrs', tags: ['Wealth', 'Lakshmi'],
      desc: 'A focused Lakshmi prapti yagya with Shri Suktam, Kamal Gatta japa and a Kuber sthapana for cash-flow, savings and business growth.',
      includes: ['Shri Suktam path', 'Kamal Gatta japa', 'Kuber sthapana', 'Wealth report', 'Prasad'],
      samagri: ['Lakshmi-Kuber yantra', 'Kamal gatta', 'Lotus flowers', 'Havan samagri', 'A2 ghee', 'Prasad']
    },
    {
      id: 'rudra-chandi', name: 'Rudra Chandi Yagya', hi: 'रुद्र चंडी यज्ञ', cat: 'Remedy & Shanti', icon: '🔱',
      price: 16000, mrp: 19999, duration: '4 hrs', tags: ['Shiva', 'Durga'],
      desc: 'A combined Rudra–Chandi yagya balancing Shiva and Shakti upasana, with Rudri path, Durga Saptashati and a joint havan for protection and strength.',
      includes: ['Rudri path', 'Durga Saptashati', 'Combined havan', 'Two pandits', 'Prasad'],
      samagri: ['Rudra yantra', 'Durga yantra', 'Bilva patra', 'Red chunri', 'Havan samagri 4 kg', 'Prasad']
    },
    {
      id: 'mrit-sanjeevni', name: 'Mrit Sanjeevni Jap', hi: 'मृत संजीवनी जाप', cat: 'Remedy & Shanti', icon: '🕯️',
      price: 12500, mrp: 16000, duration: '4 hrs', tags: ['Health', 'Protection'],
      desc: 'A protective Mrit Sanjeevni japa for serious health concerns, recovery and longevity, performed with a health sankalpa and a maha-mrityunjay havan.',
      includes: ['Mrit Sanjeevni japa', 'Maha-mrityunjay havan', 'Health sankalpa', 'Raksha kalava', 'Prasad'],
      samagri: ['Mrit Sanjeevni yantra', 'Rudraksha mala', 'Havan samagri 3 kg', 'A2 ghee', 'Kalash & coconut', 'Prasad']
    },
    {
      id: 'pitra-dosh', name: 'Pitra Dosh Nivaran', hi: 'पितृ दोष निवारण', cat: 'Remedy & Shanti', icon: '🙏',
      price: 8500, mrp: 10999, duration: '3 hrs', tags: ['Pitra', 'Ancestors'],
      desc: 'Pitra dosh nivaran with tarpan, pinda daan and a Pitra graha shanti havan. Chosen for family delays, child-related concerns and ancestral blessings.',
      includes: ['Pitra dosh analysis', 'Tarpan & pinda daan', 'Pitra havan', 'Daan guidance', 'Prasad'],
      samagri: ['Pitra yantra', 'Barley & black til', 'Kusha grass', 'White cloth', 'Havan samagri', 'Prasad']
    },
    {
      id: 'kuber-upasana', name: 'Kuber Upasana', hi: 'कुबेर उपासना', cat: 'Home & Family', icon: '💰',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Kuber', 'Wealth'],
      desc: 'A dedicated Kuber upasana with Kuber Ashtottara, a money-yantra sthapana and a north-direction remedy for steady wealth and savings.',
      includes: ['Kuber Ashtottara', 'Money yantra sthapana', 'North-zone remedy', 'Prasad', 'Wealth plan'],
      samagri: ['Kuber yantra', 'Gold/silver coin', 'Lotus flowers', 'Kumkum & haldi', 'Ghee lamp', 'Prasad']
    },
    {
      id: 'daily-hawan', name: 'Daily Hawan Seva', hi: 'दैनिक हवन सेवा', cat: 'Home & Family', icon: '🔥',
      price: 2100, mrp: 2999, duration: '45 min', tags: ['Daily', 'Hawan'],
      desc: 'A short daily hawan at home with a simple mantra set, eco samagri and a family sankalpa. Book a single day, a week or a full month of morning havens.',
      includes: ['Daily pandit visit', 'Eco havan samagri', 'Simple mantra set', 'Family sankalpa', 'Monthly report'],
      samagri: ['Eco havan samagri', 'A2 ghee', 'Tabletop kund', 'Camphor & dhoop', 'Akshata', 'Prasad']
    },
    {
      id: 'mata-jagran', name: 'Mata Jagran', hi: 'माता जागरण', cat: 'Home & Family', icon: '🌺',
      price: 11000, mrp: 14000, duration: 'Night', tags: ['Jagran', 'Devi'],
      desc: 'An overnight Devi jagran with bhajan mandali coordination, Durga sthapana and a morning havan. Ideal for Navratri, a family mannat or a thanks-giving.',
      includes: ['Devi sthapana', 'Bhajan mandali coordination', 'Overnight jagran', 'Morning havan', 'Prasad'],
      samagri: ['Durga yantra', 'Red chunri', 'Jyot & ghee', 'Fresh flowers', 'Havan samagri', 'Prasad']
    },
    {
      id: 'navratri-nine-devi', name: 'Navratri Nine Devi Pooja', hi: 'नवरात्रि नौ देवी पूजा', cat: 'Festival Specials', icon: '🌺',
      price: 15000, mrp: 18999, duration: '9 days', tags: ['Navratri', 'Nine Devi'],
      desc: 'Day-wise pooja for all nine forms of Maa Durga — Shailputri to Siddhidatri — with daily aarti, colour offerings and a final Navami havan.',
      includes: ['9-day vidhi schedule', 'Daily aarti', 'Colour-wise offerings', 'Navami havan', 'Prasad'],
      samagri: ['Durga yantra', 'Nine colour cloths', 'Red chunri', 'Barley seeds', 'Havan samagri', 'Prasad']
    },
    {
      id: 'ganga-aarti', name: 'Ganga Aarti Seva', hi: 'गंगा आरती सेवा', cat: 'Ganga & Tirth', icon: '🪔',
      price: 2100, mrp: 2999, duration: '1 hr', tags: ['Ganga', 'Aarti'],
      desc: 'A personalised Ganga aarti seva at a Haridwar ghat with a named sankalpa, lamp offering and prasad. You receive a short video and a photo of the aarti.',
      includes: ['Named sankalpa', 'Ganga aarti', 'Lamp offering', 'Video & photo', 'Prasad courier'],
      samagri: ['Ghee lamps', 'Ganga jal', 'Fresh flowers', 'Akshata', 'Dhoop', 'Prasad']
    },
    {
      id: 'ganga-poojan', name: 'Ganga Poojan', hi: 'गंगा पूजन', cat: 'Ganga & Tirth', icon: '🌊',
      price: 3500, mrp: 4500, duration: '1.5 hrs', tags: ['Ganga', 'Tirth'],
      desc: 'Ganga Devi poojan at the ghat with a kalash sthapana, milk–flower arpan and a family name sankalpa. Suitable for ancestors, mannat and new beginnings.',
      includes: ['Ganga sthapana', 'Milk & flower arpan', 'Family sankalpa', 'Photo & video', 'Prasad'],
      samagri: ['Kalash & coconut', 'Milk & gangajal', 'Fresh flowers', 'Akshata', 'Dhoop & diya', 'Prasad']
    },
    {
      id: 'ganga-abhishek', name: 'Ganga Abhishek', hi: 'गंगा अभिषेक', cat: 'Ganga & Tirth', icon: '💧',
      price: 4500, mrp: 5999, duration: '2 hrs', tags: ['Ganga', 'Abhishek'],
      desc: 'Abhishek of a Shiva linga with Ganga jal at a Haridwar temple, with Rudri path and a health or wealth sankalpa in your family’s name.',
      includes: ['Ganga jal abhishek', 'Rudri path', 'Named sankalpa', 'Photo & video', 'Prasad courier'],
      samagri: ['Gangajal', 'Milk, curd & honey', 'Bel patra', 'Bhang & dhatura', 'Dhoop', 'Prasad']
    },
    {
      id: 'homa-education', name: 'Vidya Homa', hi: 'विद्या होम', cat: 'Homa & Yagya', icon: '📚',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Education', 'Students'],
      desc: 'A Saraswati–Gayatri homa for academic success, focus and memory, with a books-and-pen poojan and a blessing for the student.',
      includes: ['Saraswati sthapana', 'Gayatri japa', 'Books & pen poojan', 'Student blessing', 'Prasad'],
      samagri: ['Saraswati yantra', 'White flowers', 'Honey & mishri', 'Havan samagri', 'A2 ghee', 'Prasad']
    },
    {
      id: 'homa-santaan', name: 'Santaan Prapti Homa', hi: 'संतान प्राप्ति होम', cat: 'Homa & Yagya', icon: '👶',
      price: 11000, mrp: 14000, duration: '3 hrs', tags: ['Santaan', 'Family'],
      desc: 'A Santaan Gopal homa with Putrakameshti-inspired mantras, a family sankalpa and a health blessing for the couple. Performed with sensitivity and privacy.',
      includes: ['Santaan Gopal homa', 'Couple sankalpa', 'Health blessing', 'Private setting', 'Prasad'],
      samagri: ['Santaan Gopal yantra', 'Havan samagri 3 kg', 'A2 ghee', 'Kalash & coconut', 'Fresh flowers', 'Prasad']
    },
    {
      id: 'homa-marriage', name: 'Vivah Homa', hi: 'विवाह होम', cat: 'Homa & Yagya', icon: '💍',
      price: 9500, mrp: 12000, duration: '2.5 hrs', tags: ['Marriage', 'Manglik'],
      desc: 'A pre-wedding Vivah homa to clear Manglik and marriage-delay indications, with Gauri–Shankar poojan and a joint family sankalpa.',
      includes: ['Gauri-Shankar pooja', 'Manglik shanti', 'Joint sankalpa', 'Wedding muhurat', 'Prasad'],
      samagri: ['Gauri-Shankar yantra', 'Red cloth', 'Havan samagri', 'A2 ghee', 'Kalash', 'Prasad']
    },
    {
      id: 'homa-vastu', name: 'Vastu Dosh Homa', hi: 'वास्तु दोष होम', cat: 'Homa & Yagya', icon: '🧭',
      price: 8500, mrp: 10999, duration: '3 hrs', tags: ['Vastu', 'Home'],
      desc: 'A Vastu Purush homa for directional doshas in a home, office or plot, with 81-Devta sthapana and room-wise remedies.',
      includes: ['Vastu Purush homa', '81-Devta sthapana', 'Room-wise remedies', 'Report', 'Prasad'],
      samagri: ['Vastu yantra', 'Navdhanya', 'Kalash & coconut', 'Havan samagri', 'Copper strips', 'Prasad']
    },
    {
      id: 'homa-wealth', name: 'Dhan Prapti Homa', hi: 'धन प्राप्ति होम', cat: 'Homa & Yagya', icon: '🪙',
      price: 7500, mrp: 9500, duration: '2 hrs', tags: ['Wealth', 'Business'],
      desc: 'A Lakshmi–Kuber homa for cash-flow, debt relief and business growth, with Shri Suktam and a money-yantra sthapana.',
      includes: ['Shri Suktam', 'Lakshmi-Kuber homa', 'Money yantra', 'Wealth plan', 'Prasad'],
      samagri: ['Lakshmi-Kuber yantra', 'Lotus & kamal gatta', 'Havan samagri', 'A2 ghee', 'Gold/silver coin', 'Prasad']
    },
    {
      id: 'homa-ganesh', name: 'Ganesh Homa', hi: 'गणेश होम', cat: 'Homa & Yagya', icon: '🐘',
      price: 5500, mrp: 6999, duration: '1.5 hrs', tags: ['Ganesh', 'New beginning'],
      desc: 'A Ganpati homa to remove obstacles before a new home, wedding, exam or venture, with 108 names and modak bhog.',
      includes: ['Ganesh sthapana', '108 naamavali', 'Ganpati homa', 'Modak bhog', 'Prasad'],
      samagri: ['Ganesh idol', 'Durva grass', 'Modak', 'Havan samagri', 'A2 ghee', 'Prasad']
    },
    {
      id: 'homa-shiva', name: 'Shiva Homa', hi: 'शिव होम', cat: 'Homa & Yagya', icon: '🔱',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Shiva', 'Health'],
      desc: 'A Rudra homa with Rudri path and panchamrit offering for health, longevity and mental peace. Performed on a Monday or Pradosham where possible.',
      includes: ['Rudri path', 'Panchamrit offering', 'Rudra homa', 'Raksha kalava', 'Prasad'],
      samagri: ['Shivling & jaldhari', 'Milk, curd & honey', 'Bel patra', 'Havan samagri', 'A2 ghee', 'Prasad']
    },
    {
      id: 'homa-navgrah', name: 'Navgrah Homa', hi: 'नवग्रह होम', cat: 'Homa & Yagya', icon: '🪐',
      price: 9500, mrp: 12000, duration: '3 hrs', tags: ['Navgrah', 'Havan'],
      desc: 'A nine-planet homa with graha-wise ahutis, nine grains and nine cloths. A complete pacification for a chart with multiple afflictions.',
      includes: ['Graha-wise ahutis', 'Nine grains & cloths', 'Navgrah yantra', 'Chart review', 'Prasad'],
      samagri: ['Navgrah yantra', 'Nine grains', 'Nine coloured cloths', 'Havan samagri 3 kg', 'A2 ghee', 'Prasad']
    },
    {
      id: 'laxmi-upasana', name: 'Laxmi Upasana Pooja', hi: 'लक्ष्मी उपासना पूजा', cat: 'Home & Family', icon: '🪙',
      price: 5500, mrp: 6999, duration: '2 hrs', tags: ['Lakshmi', 'Wealth'],
      desc: 'A focused Lakshmi upasana with Shri Suktam, the 108 names and a lotus sthapana at the home mandir. Traditionally performed on a Friday or Diwali for steady income and savings.',
      includes: ['Shri Suktam path', '108 names of Lakshmi', 'Lotus sthapana', 'Home mandir blessing', 'Prasad'],
      samagri: ['Lakshmi yantra', 'Lotus flowers', 'Kamal gatta', 'Kumkum & haldi', 'Ghee lamp', 'Prasad']
    },
    {
      id: 'rahu-grah-shanti', name: 'Rahu Grah Shanti', hi: 'राहु ग्रह शांति', cat: 'Remedy & Shanti', icon: '🌑',
      price: 6000, mrp: 7500, duration: '2 hrs', tags: ['Rahu', 'Protection'],
      desc: 'Rahu shanti with a Rahu mantra japa, nag-yantra sthapana and a black-til daan. Chosen for confusion, sudden delays, foreign-matter obstacles and Rahu dasha concerns.',
      includes: ['Rahu japa', 'Nag yantra sthapana', 'Black til & coconut daan', 'Graha report', 'Prasad'],
      samagri: ['Rahu yantra', 'Nag image', 'Black til', 'Coconut & black cloth', 'Havan samagri', 'Prasad']
    },
    {
      id: 'mangal-chandi-jap', name: 'Mangal Chandi Jap Yagya', hi: 'मंगल चंडी जाप यज्ञ', cat: 'Remedy & Shanti', icon: '🔥',
      price: 9500, mrp: 12000, duration: '3 hrs', tags: ['Mangal', 'Chandi'],
      desc: 'A Mangal Chandi japa yagya for courage, protection from disputes and relief from Mangal dosha. The japa is followed by a small purnahuti havan and a red-cloth offering.',
      includes: ['Mangal Chandi japa', 'Purnahuti havan', 'Red-cloth offering', 'Raksha kalava', 'Prasad'],
      samagri: ['Mangal-Chandi yantra', 'Red cloth & chunri', 'Masoor dal', 'Havan samagri', 'A2 ghee', 'Prasad']
    },
    {
      id: 'satchandi-path', name: 'Satchandi Path', hi: 'सतचंडी पाठ', cat: 'Remedy & Shanti', icon: '📖',
      price: 21000, mrp: 26000, duration: '4 hrs', tags: ['Durga', 'Anushthan'],
      desc: 'A seven-fold Chandi path with Durga Saptashati samputikaran and a purnahuti havan. A larger anushthan for family protection, business obstacles and repeated misfortune.',
      includes: ['Satchandi path', 'Samputikaran', 'Purnahuti havan', 'Two pandits', 'Prasad distribution'],
      samagri: ['Durga Saptashati set', 'Red chunri', 'Kumkum', 'Havan samagri 4 kg', 'A2 ghee', 'Prasad']
    },
    {
      id: 'bhairav-chandi-path', name: 'Bhairav Chandi Path', hi: 'भैरव चंडी पाठ', cat: 'Remedy & Shanti', icon: '🖤',
      price: 15000, mrp: 19000, duration: '4 hrs', tags: ['Bhairav', 'Durga'],
      desc: 'A combined Kaal Bhairav and Chandi path for protection from enemies, legal pressure and sudden fear. Includes a Bhairav Chalisa and a protective kalava for the family.',
      includes: ['Bhairav path', 'Chandi path', 'Combined havan', 'Raksha kalava', 'Prasad'],
      samagri: ['Bhairav yantra', 'Durga yantra', 'Black cloth & red chunri', 'Camphor', 'Havan samagri', 'Prasad']
    },
    {
      id: 'homa-devi-shakti', name: 'Devi Shakti Homa', hi: 'देवी शक्ति होम', cat: 'Homa & Yagya', icon: '🌺',
      price: 11000, mrp: 14000, duration: '3 hrs', tags: ['Devi', 'Shakti'],
      desc: 'A Devi Shakti homa with Durga Saptashati excerpts, a red-chunri sthapana and a kumkum offering. Performed for courage, family protection and victory over a persistent obstacle.',
      includes: ['Devi sthapana', 'Saptashati excerpts', 'Shakti homa', 'Kumkum offering', 'Prasad'],
      samagri: ['Durga yantra', 'Red chunri', 'Kumkum & haldi', 'Havan samagri 3 kg', 'A2 ghee', 'Prasad']
    },
    {
      id: 'homa-kuber', name: 'Kuber Homa', hi: 'कुबेर होम', cat: 'Homa & Yagya', icon: '💰',
      price: 7500, mrp: 9500, duration: '2 hrs', tags: ['Kuber', 'Wealth'],
      desc: 'A Kuber homa for cash-flow, savings and business liquidity, with Kuber Ashtottara and a north-zone money-yantra sthapana. A lighter ritual than a full Lakshmi yagya.',
      includes: ['Kuber Ashtottara', 'Kuber homa', 'Money yantra', 'North-zone remedy', 'Prasad'],
      samagri: ['Kuber yantra', 'Gold/silver coin', 'Lotus flowers', 'Havan samagri', 'A2 ghee', 'Prasad']
    },
    {
      id: 'homa-surya', name: 'Surya Homa', hi: 'सूर्य होम', cat: 'Homa & Yagya', icon: '☀️',
      price: 6500, mrp: 8500, duration: '2 hrs', tags: ['Surya', 'Leadership'],
      desc: 'A Surya homa with Aditya Hridaya path and a copper–wheat offering for confidence, authority and fatherhood. Ideally performed at sunrise on a Sunday.',
      includes: ['Aditya Hridaya path', 'Surya homa', 'Copper & wheat daan', 'Graha report', 'Prasad'],
      samagri: ['Surya yantra', 'Copper vessel', 'Red flowers', 'Wheat & gud', 'Havan samagri', 'Prasad']
    },
    {
      id: 'homa-vishnu', name: 'Vishnu Homa', hi: 'विष्णु होम', cat: 'Homa & Yagya', icon: '🪷',
      price: 8500, mrp: 11000, duration: '3 hrs', tags: ['Vishnu', 'Family'],
      desc: 'A Vishnu homa with Vishnu Sahasranama and a tulsi–yellow-flower offering for family unity, marriage harmony and protection of the household. Suitable for a new home or a family milestone.',
      includes: ['Vishnu Sahasranama', 'Vishnu homa', 'Tulsi offering', 'Family sankalpa', 'Prasad'],
      samagri: ['Vishnu yantra', 'Tulsi & yellow flowers', 'Havan samagri 3 kg', 'A2 ghee', 'Kalash & coconut', 'Prasad']
    }
  ];

  var PANDITS = [
    { id: 'p1', name: 'Pt. Ramesh Sharma', title: 'Senior Acharya', area: 'DLF Phase 1–5', exp: 22, rating: 4.9, reviews: 412, langs: ['Hindi', 'English', 'Punjabi'], tradition: 'North Indian', spec: ['Griha Pravesh', 'Satyanarayan', 'Vivah'], price: 0, verified: true, color: '#8a2c3b', bio: 'Kashi Vishwanath trained, 22 years of household and wedding rituals across Gurugram.' },
    { id: 'p2', name: 'Acharya Vinod Tiwari', title: 'Jyotish Acharya', area: 'Golf Course Road', exp: 18, rating: 4.8, reviews: 356, langs: ['Hindi', 'English'], tradition: 'North Indian', spec: ['Navgrah Shanti', 'Kaal Sarp', 'Kundli'], price: 0, verified: true, color: '#2f5d50', bio: 'Gold-medalist in Jyotish from Sampurnanand Sanskrit University, Varanasi.' },
    { id: 'p3', name: 'Pt. Suresh Bhatt', title: 'Vedic Pandit', area: 'Sushant Lok', exp: 15, rating: 4.9, reviews: 289, langs: ['Hindi', 'Gujarati', 'English'], tradition: 'Gujarati / Marwari', spec: ['Lakshmi Pooja', 'Satyanarayan', 'Shop Opening'], price: 0, verified: true, color: '#8a5a1f', bio: 'Specialises in Gujarati and Marwari griha rituals and business poojas.' },
    { id: 'p4', name: 'Pandita Meera Joshi', title: 'Vedic Scholar', area: 'DLF Phase 3', exp: 12, rating: 5.0, reviews: 198, langs: ['Hindi', 'Marathi', 'English'], tradition: 'Maharashtrian', spec: ['Griha Pravesh', 'Satyanarayan', 'Namkaran'], price: 0, verified: true, color: '#7a2a5e', bio: 'One of Gurugram’s most requested women pandits, trained in Pune and Varanasi.' },
    { id: 'p5', name: 'Pt. Karthik Iyer', title: 'Vedic Priest', area: 'Sohna Road', exp: 16, rating: 4.8, reviews: 231, langs: ['Tamil', 'Telugu', 'English', 'Hindi'], tradition: 'South Indian', spec: ['Griha Pravesh', 'Satyanarayan', 'Navgrah'], price: 0, verified: true, color: '#6b3b8a', bio: 'Follows Apastamba sutra; fluent in Tamil, Telugu and Kannada ritual traditions.' },
    { id: 'p6', name: 'Pt. Subrata Chakraborty', title: 'Bangla Pandit', area: 'New Gurgaon', exp: 20, rating: 4.9, reviews: 176, langs: ['Bengali', 'Hindi', 'English'], tradition: 'Bengali', spec: ['Durga Pooja', 'Lakshmi Pooja', 'Bhai Dooj'], price: 0, verified: true, color: '#1f6b6b', bio: 'Third-generation Bengali priest; conducts Durga Puja and household shraddha.' },
    { id: 'p7', name: 'Pt. Ganesh Patil', title: 'Vedic Pandit', area: 'Sector 43 Hub', exp: 11, rating: 4.7, reviews: 143, langs: ['Marathi', 'Hindi', 'English'], tradition: 'Maharashtrian', spec: ['Satyanarayan', 'Rudrabhishek', 'Vastu'], price: 0, verified: true, color: '#8a5a1f', bio: 'Known for punctual, detail-oriented Rudrabhishek and Satyanarayan kathas.' },
    { id: 'p8', name: 'Acharya Dinesh Shastri', title: 'Havan Specialist', area: 'Palam Vihar', exp: 25, rating: 4.9, reviews: 501, langs: ['Hindi', 'Sanskrit', 'English'], tradition: 'North Indian', spec: ['Mahamrityunjay', 'Navgrah', 'Durga Saptashati'], price: 0, verified: true, color: '#8a2c3b', bio: 'Expert in large havens and mantra japa with 25 years of practice.' },
    { id: 'p9', name: 'Pt. Mahesh Purohit', title: 'Marwari Pandit', area: 'Sector 14', exp: 19, rating: 4.8, reviews: 267, langs: ['Marwari', 'Hindi', 'English'], tradition: 'Marwari', spec: ['Shop Opening', 'Lakshmi Kubera', 'Vivah'], price: 0, verified: true, color: '#8a5a1f', bio: 'Family priest to several old Gurgaon business families.' },
    { id: 'p10', name: 'Dr. Raghav Acharya', title: 'Jyotish & Vastu', area: 'Golf Course Ext.', exp: 27, rating: 5.0, reviews: 388, langs: ['Hindi', 'English', 'Sanskrit'], tradition: 'North Indian', spec: ['Vastu Shanti', 'Sade Sati', 'Kundli'], price: 0, verified: true, color: '#2f5d50', bio: 'PhD in Vedic astrology; consults on vastu for premium high-rise projects.' },
    { id: 'p11', name: 'Pt. Shivam Dwivedi', title: 'Young Acharya', area: 'Sector 56', exp: 8, rating: 4.7, reviews: 121, langs: ['Hindi', 'English'], tradition: 'North Indian', spec: ['Express Pooja', 'Ganesh Pooja', 'Vehicle Pooja'], price: 0, verified: true, color: '#4a4a8a', bio: 'Quick, camera-friendly rituals for corporate desks and new vehicles.' },
    { id: 'p12', name: 'Pt. Anil Trivedi', title: 'Vedic Pandit', area: 'Nirvana Country', exp: 14, rating: 4.8, reviews: 204, langs: ['Hindi', 'English', 'Gujarati'], tradition: 'Gujarati / Marwari', spec: ['Griha Pravesh', 'Bhoomi Poojan', 'Satyanarayan'], price: 0, verified: true, color: '#6b3b8a', bio: 'Handles society-compliant griha pravesh and bhoomi poojan with full documentation.' }
  ];

  var PRODUCTS = [
    { id: 's1', name: 'Satyanarayan Pooja Kit', cat: 'Samagri Kits', price: 899, mrp: 1199, icon: '📖', desc: 'Complete step-numbered kit: katha book, panchamrit set, tulsi, banana leaves, ghee, wicks and prasad.' },
    { id: 's2', name: 'Griha Pravesh Kit', cat: 'Samagri Kits', price: 1899, mrp: 2499, icon: '🏠', desc: 'Brass kalash, coconut, navgrah samagri, havan samagri, gangajal and gate-pass checklist.' },
    { id: 's3', name: 'Navgrah Shanti Kit', cat: 'Samagri Kits', price: 1499, mrp: 1899, icon: '🪐', desc: 'Nine grains, nine cloths, navgrah yantra, havan samagri and graha-wise mantra card.' },
    { id: 's4', name: 'Eco Havan Kund (Tabletop)', cat: 'Havan & Ghee', price: 1299, mrp: 1699, icon: '🔥', desc: 'Smokeless compact kund designed for high-rise balconies and fire-alarm safe havens.' },
    { id: 's5', name: 'A2 Cow Ghee — 1 kg', cat: 'Havan & Ghee', price: 899, mrp: 1099, icon: '🧈', desc: 'Bilona churned A2 ghee from Haryana desi cows, lab-tested and pooja-grade.' },
    { id: 's6', name: 'Havan Samagri — 2 kg', cat: 'Havan & Ghee', price: 499, mrp: 649, icon: '🌿', desc: 'Low-smoke herbal blend of 24 dried herbs, no synthetic fragrance.' },
    { id: 's7', name: 'Fresh Flower Box (Morning)', cat: 'Flowers & Garlands', price: 599, mrp: 799, icon: '🌺', desc: 'Marigold, rose, mogra and tulsi picked at 5 AM and delivered before the ritual.' },
    { id: 's8', name: 'Loose Flower Pack — 500 g', cat: 'Flowers & Garlands', price: 349, mrp: 449, icon: '🌸', desc: 'Seasonal loose flowers for aarti thali, rangoli and kalash decoration.' },
    { id: 's9', name: 'Nepal Rudraksha Mala (5 Mukhi)', cat: 'Gemstones & Rudraksha', price: 1499, mrp: 1999, icon: '📿', desc: 'Energised 108-bead panchmukhi mala with lab certificate and silver cap.' },
    { id: 's10', name: 'Yellow Sapphire (Pukhraj)', cat: 'Gemstones & Rudraksha', price: 8999, mrp: 11999, icon: '💎', desc: 'IGI-certified 3.5 ratti Ceylon yellow sapphire — Jupiter remedy.' },
    { id: 's11', name: 'Blue Sapphire (Neelam)', cat: 'Gemstones & Rudraksha', price: 12500, mrp: 15999, icon: '💠', desc: 'Certified 3 ratti Sri Lankan neelam, recommended only after chart review.' },
    { id: 's12', name: 'Red Coral (Moonga)', cat: 'Gemstones & Rudraksha', price: 2499, mrp: 3299, icon: '🪸', desc: 'Italian red coral, 4 ratti, silver ring setting included.' },
    { id: 's13', name: 'Brass Pooja Thali Set', cat: 'Brass & Pooja Ware', price: 1199, mrp: 1499, icon: '🪔', desc: 'Thali, diya, kalash, bell, incense holder and kumkum box in pure brass.' },
    { id: 's14', name: 'Panchamrit & Bhog Set', cat: 'Brass & Pooja Ware', price: 499, mrp: 649, icon: '🥛', desc: 'Milk, curd, honey, ghee and sugar sachets with a brass spoon and bowl.' },
    { id: 's15', name: 'Prasad Box — 250 g', cat: 'Prasad & Bhog', price: 299, mrp: 399, icon: '🍬', desc: 'Panjiri, mishri and dry-fruit prasad prepared in a clean satvik kitchen.' },
    { id: 's16', name: 'Punya-Flow Visarjan Add-on', cat: 'Prasad & Bhog', price: 299, mrp: 399, icon: '♻️', desc: 'Doorstep pickup of flowers, havan ash and biodegradable samagri for composting.' }
  ];

  var EXTRAS = [
    { id: 'x1', name: 'Fresh Morning Flower Upgrade', price: 499, icon: '🌺', note: 'Extra 1 kg seasonal flowers + garland' },
    { id: 'x2', name: 'A2 Cow Ghee 1 kg', price: 899, icon: '🧈', note: 'Bilona ghee for havan' },
    { id: 'x3', name: 'Tabletop Eco Havan Kund', price: 1299, icon: '🔥', note: 'Smokeless, society-safe' },
    { id: 'x4', name: 'Punya-Flow Waste Pickup', price: 299, icon: '♻️', note: 'Flowers, ash & samagri recycling' },
    { id: 'x5', name: 'Prasad Courier (Pan-India)', price: 349, icon: '📦', note: 'For family unable to attend' },
    { id: 'x6', name: 'Live Stream & Recording', price: 1999, icon: '📹', note: 'Private HD link for NRI family' },
    { id: 'x7', name: 'Second Pandit (team ritual)', price: 1999, icon: '🙏', note: 'Recommended for 3+ hour havens' },
    { id: 'x8', name: 'Ritual Photography', price: 2499, icon: '📸', note: '60 edited photos, 24-hour delivery' }
  ];

  var GOTRAS = ['Kashyap', 'Bharadwaj', 'Vashistha', 'Vishwamitra', 'Gautam', 'Jamadagni', 'Atri', 'Agastya', 'Sankhyayan', 'Aupamanyav', 'Parashar', 'Sandilya', 'Garg', 'Kaushik', 'Shandilya', 'Mudgal', 'Krishnatreya', 'Vatsa', 'Kaundinya', 'Harita', 'Maitreya', 'Dhananjaya', 'Shaunak', 'Gobhil', 'Katyayan', 'Laugakshi', 'Pippalad', 'Agnivesh', 'Shatanand', 'Galav'];

  var TESTIMONIALS = [
    { name: 'Ananya Mehta', area: 'DLF Phase 5', text: 'The pandit arrived 15 minutes early, the gate pass was already approved, and every samagri item was numbered. Our Satyanarayan katha felt effortless for the first time.', rating: 5, pooja: 'Satyanarayan Katha' },
    { name: 'Rohit Bansal', area: 'Golf Course Road', text: 'Booked the express desk blessing for my new role. 30 minutes, zero mess in the office, and a proper GST invoice. My entire team asked for the link.', rating: 5, pooja: 'Express Desk Blessing' },
    { name: 'Priya & Arjun', area: 'Sohna Road', text: 'We moved into our first flat with a 4-hour Griha Pravesh. The smokeless havan meant no fire alarm drama, and the Punya-Flow pickup cleared everything the same evening.', rating: 5, pooja: 'Griha Pravesh' },
    { name: 'Vikram Sethi', area: 'Sushant Lok', text: 'I am Manglik and was nervous about matching. The Ashtakoot report was detailed, and the pandit explained the cancellation rules instead of scaring us.', rating: 5, pooja: 'Kundli Matching' },
    { name: 'Neha Kulkarni', area: 'New Gurgaon', text: 'A Marathi pandit for our Ganesh sthapana, with the aarti in Marathi. My mother was genuinely impressed — that says everything.', rating: 5, pooja: 'Ganesh Pooja' },
    { name: 'Sanjay Gupta', area: 'Udyog Vihar', text: 'Office opening at 8 AM, two pandits, invoice before the event. Exactly what a corporate admin needs. We have moved our annual poojas here.', rating: 5, pooja: 'Corporate Office Poojan' }
  ];

  var FAQS = [
    { q: 'How are pandits verified?', a: 'Every pandit clears a three-tier check: Aadhaar and address verification, Vedic certification from a recognised institution (Varanasi, Haridwar, Tirupati or equivalent), and a live chanting assessment by our senior acharyas. Only pandits rated 4.5+ stay active.' },
    { q: 'Is the samagri really included in the price?', a: 'Yes. Every all-inclusive package includes the complete samagri kit, fresh morning flowers and the pandit’s dakshina. You will see the exact item list before paying — no post-pooja bargaining, ever.' },
    { q: 'What if my society does not allow havan or smoke?', a: 'Choose our smokeless eco-havan kit. It uses low-smoke herbal samagri, A2 ghee and a compact tabletop kund, and is designed for high-rise flats with sensitive smoke alarms.' },
    { q: 'Can you handle MyGate / NoBrokerHood gate passes?', a: 'Yes. Add your society name and tower at checkout. We generate a visitor pass and share a one-time gate code with the pandit one hour before the ritual.' },
    { q: 'Do you offer regional rituals?', a: 'We have pandits for North Indian, South Indian (Tamil/Telugu/Kannada), Bengali, Maharashtrian, Gujarati and Marwari traditions. Filter by language and tradition while booking.' },
    { q: 'How does the muhurat work?', a: 'Our panchang engine computes Tithi, Nakshatra, Rahu Kaal and Abhijit Muhurat for your city and chosen date. You can pick a suggested shubh window or ask the pandit to confirm a custom time.' },
    { q: 'What is the cancellation policy?', a: 'Free cancellation up to 24 hours before the slot. Within 24 hours, samagri and travel costs are retained. Rescheduling is free once, subject to pandit availability.' },
    { q: 'Do you provide a GST invoice?', a: 'Yes. Add your GSTIN at checkout for corporate bookings, and the invoice is emailed before the ritual begins.' }
  ];

  var FEATURES = [
    { icon: 'shield', title: 'Background-verified pandits', text: 'Aadhaar, institution certification and a live mantra assessment — with audio samples you can hear before booking.' },
    { icon: 'box', title: 'Pooja-in-a-Box', text: 'Step-numbered, biodegradable samagri pouches and 5 AM fresh flowers delivered before the muhurat.' },
    { icon: 'gate', title: 'Gate pass, handled', text: 'MyGate and NoBrokerHood passes generated automatically, so your pandit never waits at the tower gate.' },
    { icon: 'fire', title: 'Smokeless eco-havan', text: 'Herbal samagri, A2 ghee and a tabletop kund that keeps high-rise smoke alarms quiet.' },
    { icon: 'rupee', title: 'Zero dakshina awkwardness', text: 'One transparent price covering pandit, travel and samagri. Optional digital tip, never a cash negotiation.' },
    { icon: 'leaf', title: 'Punya-Flow recycling', text: 'We collect flowers, ash and prasad waste and turn it into incense and compost — no society bin violations.' },
    { icon: 'clock', title: 'On-time, or we compensate', text: 'Geo-fenced check-in, buffer pandits in three zones and a 10-minute punctuality guarantee.' },
    { icon: 'globe', title: 'NRI live-stream', text: 'Two-way HD poojas from Varanasi, Haridwar and Rishikesh with prasad couriered worldwide.' }
  ];

  var RASHI_DAILY = {
    love: [
      'A candid conversation clears a week of misunderstanding. Speak before sunset.',
      'An old connection resurfaces — decide with your head, not your nostalgia.',
      'Plan something small and unplanned together; the ordinary will feel sacred.',
      'Your partner needs reassurance more than advice today. Listen first.',
      'Family approval moves in your favour. Let an elder open the conversation.',
      'Avoid keeping score in a disagreement. A quiet apology lands better than a perfect argument.',
      'A shared ritual — even a five-minute diya — rebuilds warmth.'
    ],
    career: [
      'A senior notices the detail you thought went unseen. Document your work.',
      'Do not sign the first offer. Ask one clarifying question and the number improves.',
      'Clear one pending task before noon; momentum follows the small win.',
      'A colleague becomes an ally. Offer help before you need it.',
      'Money talks are favourable after 3 PM. Schedule the negotiation then.',
      'Say no to a low-value meeting; protect your deep-work hours.',
      'A delayed approval is not a rejection. Follow up on Thursday.'
    ],
    health: [
      'Reduce screen time after 9 PM — sleep is your real remedy today.',
      'Hydration and a short walk will do more than a new supplement.',
      'A old niggle responds well to consistency, not intensity. Keep it gentle.',
      'Avoid heavy food near bedtime; your digestion is asking for simplicity.',
      'Ten minutes of pranayama before work steadies the entire day.',
      'Book the check-up you have been postponing. Prevention is favourable.',
      'Warm water, early dinner, early sleep. A reset day.'
    ],
    luck: ['Abhijit Muhurat (11:45 AM – 12:25 PM) is your window for the important call.', 'Wear a touch of yellow or gold for confidence.', 'Donate something small before noon — the day opens up.', 'A west-facing desk change brings unexpected clarity.', 'Chant your ishta mantra 11 times before the first meeting.', 'Keep a copper vessel of water at your desk.', 'Light a diya at dusk; the household energy shifts noticeably.']
  };

  var RASHI_TRAITS = [
    { sign: 'Aries', hi: 'मेष', element: 'Fire', lord: 'Mars', gem: 'Red Coral', lucky: '9, 1', color: 'Red', dates: 'Mar 21 – Apr 19' },
    { sign: 'Taurus', hi: 'वृषभ', element: 'Earth', lord: 'Venus', gem: 'Emerald', lucky: '6, 5', color: 'White', dates: 'Apr 20 – May 20' },
    { sign: 'Gemini', hi: 'मिथुन', element: 'Air', lord: 'Mercury', gem: 'Emerald', lucky: '5, 3', color: 'Green', dates: 'May 21 – Jun 20' },
    { sign: 'Cancer', hi: 'कर्क', element: 'Water', lord: 'Moon', gem: 'Pearl', lucky: '2, 7', color: 'White', dates: 'Jun 21 – Jul 22' },
    { sign: 'Leo', hi: 'सिंह', element: 'Fire', lord: 'Sun', gem: 'Ruby', lucky: '1, 4', color: 'Gold', dates: 'Jul 23 – Aug 22' },
    { sign: 'Virgo', hi: 'कन्या', element: 'Earth', lord: 'Mercury', gem: 'Emerald', lucky: '5, 6', color: 'Green', dates: 'Aug 23 – Sep 22' },
    { sign: 'Libra', hi: 'तुला', element: 'Air', lord: 'Venus', gem: 'Diamond', lucky: '6, 9', color: 'White', dates: 'Sep 23 – Oct 22' },
    { sign: 'Scorpio', hi: 'वृश्चिक', element: 'Water', lord: 'Mars', gem: 'Red Coral', lucky: '9, 8', color: 'Maroon', dates: 'Oct 23 – Nov 21' },
    { sign: 'Sagittarius', hi: 'धनु', element: 'Fire', lord: 'Jupiter', gem: 'Yellow Sapphire', lucky: '3, 9', color: 'Yellow', dates: 'Nov 22 – Dec 21' },
    { sign: 'Capricorn', hi: 'मकर', element: 'Earth', lord: 'Saturn', gem: 'Blue Sapphire', lucky: '8, 4', color: 'Blue', dates: 'Dec 22 – Jan 19' },
    { sign: 'Aquarius', hi: 'कुंभ', element: 'Air', lord: 'Saturn', gem: 'Blue Sapphire', lucky: '4, 8', color: 'Blue', dates: 'Jan 20 – Feb 18' },
    { sign: 'Pisces', hi: 'मीन', element: 'Water', lord: 'Jupiter', gem: 'Yellow Sapphire', lucky: '3, 7', color: 'Yellow', dates: 'Feb 19 – Mar 20' }
  ];

  var TRADITIONS = ['North Indian', 'South Indian', 'Bengali', 'Maharashtrian', 'Gujarati / Marwari'];
  var LANGUAGES = ['Hindi', 'English', 'Punjabi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Marwari', 'Kannada', 'Sanskrit'];

  var STATS = [
    { value: 12400, suffix: '+', label: 'Rituals performed' },
    { value: 300, suffix: '+', label: 'Verified pandits' },
    { value: 38, suffix: '', label: 'Cities served' },
    { value: 4.9, suffix: '/5', label: 'Average rating', decimal: true }
  ];

  var HOW_IT_WORKS = [
    { step: '01', title: 'Choose your ritual', text: 'Browse 30+ poojas with transparent all-inclusive pricing, or let the panchang suggest a muhurat.' },
    { step: '02', title: 'Share your details', text: 'Pick a date, add your gotra (or use our finder), society gate details and language preference.' },
    { step: '03', title: 'We arrive prepared', text: 'Samagri and fresh flowers reach you before the ritual. The pandit checks in 15 minutes early with a gate pass.' },
    { step: '04', title: 'Bless, rate, recycle', text: 'Live tracking, digital dakshina, rating prompt and optional Punya-Flow waste pickup.' }
  ];

  var PLATFORM = root.PanditData = root.PanditData || {};
  PLATFORM.CITIES = CITIES;
  PLATFORM.CATEGORIES = CATEGORIES;
  PLATFORM.POOJAS = POOJAS;
  PLATFORM.PANDITS = PANDITS;
  PLATFORM.PRODUCTS = PRODUCTS;
  PLATFORM.EXTRAS = EXTRAS;
  PLATFORM.GOTRAS = GOTRAS;
  PLATFORM.TESTIMONIALS = TESTIMONIALS;
  PLATFORM.FAQS = FAQS;
  PLATFORM.FEATURES = FEATURES;
  PLATFORM.RASHI_DAILY = RASHI_DAILY;
  PLATFORM.RASHI_TRAITS = RASHI_TRAITS;
  PLATFORM.TRADITIONS = TRADITIONS;
  PLATFORM.LANGUAGES = LANGUAGES;
  PLATFORM.STATS = STATS;
  PLATFORM.HOW_IT_WORKS = HOW_IT_WORKS;
})(typeof window !== 'undefined' ? window : globalThis);
