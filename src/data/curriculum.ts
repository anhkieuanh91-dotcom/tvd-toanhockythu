export type Topic = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
};

export type Grade = {
  id: number;
  name: string;
  nameEn: string;
  topics: Topic[];
};

export const CURRICULUM: Grade[] = [
  {
    id: 1,
    name: "Lớp 1",
    nameEn: "Grade 1",
    topics: [
      { id: "so-hoc-1", name: "Số và Phép tính", nameEn: "Numbers & Operations", description: "Đếm, so sánh, cộng trừ trong phạm vi 10, 20, 100", descriptionEn: "Counting, comparing, addition & subtraction within 10, 20, 100" },
      { id: "hinh-hoc-1", name: "Hình học", nameEn: "Geometry", description: "Vị trí (trên-dưới, trái-phải), Khối hộp chữ nhật, Khối lập phương, Hình tròn, tam giác, vuông, chữ nhật", descriptionEn: "Positions (up-down, left-right), Rectangular prism, Cube, Circle, triangle, square, rectangle" },
      { id: "do-luong-1", name: "Đo lường", nameEn: "Measurement", description: "Đo độ dài (cm), Xem giờ đúng, Các ngày trong tuần", descriptionEn: "Measuring length (cm), Reading exact hours, Days of the week" },
    ],
  },
  {
    id: 2,
    name: "Lớp 2",
    nameEn: "Grade 2",
    topics: [
      { id: "so-hoc-2", name: "Số và Phép tính", nameEn: "Addition & Subtraction", description: "Cộng trừ có nhớ, bảng nhân 2, 5. Tìm thành phần chưa biết", descriptionEn: "Addition & subtraction with regrouping, multiplication tables 2, 5. Finding unknown components" },
      { id: "hinh-hoc-2", name: "Hình học", nameEn: "Geometry", description: "Điểm, đoạn thẳng, đường cong, đường gấp khúc. Ba điểm thẳng hàng. Hình tứ giác. Khối trụ, khối cầu", descriptionEn: "Points, line segments, curves, broken lines. Collinear points. Quadrilaterals. Cylinders, spheres" },
      { id: "do-luong-2", name: "Đo lường", nameEn: "Measurement", description: "Ki-lô-gam, Lít, Mét, Đề-xi-mét, Mi-li-mét. Xem lịch, giờ, ngày, tháng", descriptionEn: "Kilogram, Liter, Meter, Decimeter, Millimeter. Reading calendar, time, day, month" },
      { id: "thong-ke-xac-suat-2", name: "Thống kê và Xác suất", nameEn: "Statistics and Probability", description: "Thu thập, phân loại, kiểm đếm. Biểu đồ tranh. Khả năng xảy ra (có thể, chắc chắn, không thể)", descriptionEn: "Collecting, classifying, counting. Pictograms. Probability (possible, certain, impossible)" },
    ],
  },
  {
    id: 3,
    name: "Lớp 3",
    nameEn: "Grade 3",
    topics: [
      { id: "so-hoc-3", name: "Số và Phép tính", nameEn: "Multiplication & Division", description: "Bảng nhân chia 3,4,6,7,8,9. Số có 4, 5 chữ số. Biểu thức số", descriptionEn: "Multiplication & division tables 3,4,6,7,8,9. 4-5 digit numbers. Numerical expressions" },
      { id: "hinh-hoc-3", name: "Hình học", nameEn: "Geometry", description: "Góc vuông, không vuông. Tam giác, Tứ giác. Chu vi, Diện tích hình chữ nhật, hình vuông", descriptionEn: "Right angles, non-right angles. Triangles, Quadrilaterals. Perimeter, Area of rectangles, squares" },
      { id: "do-luong-3", name: "Đo lường", nameEn: "Measurement", description: "Gam, Mi-li-lít. Nhiệt độ. Tháng năm. Tiền Việt Nam", descriptionEn: "Gram, Milliliter. Temperature. Months, years. Vietnamese Currency" },
      { id: "thong-ke-xac-suat-3", name: "Thống kê và Xác suất", nameEn: "Statistics and Probability", description: "Ghi chép số liệu. Bảng số liệu. Khả năng xảy ra của một sự kiện (1 lần)", descriptionEn: "Recording data. Data tables. Probability of an event (1 time)" },
    ],
  },
  {
    id: 4,
    name: "Lớp 4",
    nameEn: "Grade 4",
    topics: [
      { id: "so-hoc-4", name: "Số và Phép tính", nameEn: "Numbers and Operations", description: "Số lớn, 4 phép tính. Phân số. Tính chất giao hoán, kết hợp", descriptionEn: "Large numbers, 4 operations. Fractions. Commutative, associative properties" },
      { id: "hinh-hoc-4", name: "Hình học", nameEn: "Geometry", description: "Góc nhọn, tù, bẹt. Hai đường thẳng vuông góc, song song. Hình bình hành, hình thoi", descriptionEn: "Acute, obtuse, straight angles. Perpendicular, parallel lines. Parallelograms, rhombuses" },
      { id: "do-luong-4", name: "Đo lường", nameEn: "Measurement", description: "Yến, tạ, tấn. Giây, thế kỷ. Đơn vị đo diện tích (m², dm², cm², mm²)", descriptionEn: "Yen, quintal, ton. Seconds, centuries. Area units (m², dm², cm², mm²)" },
      { id: "thong-ke-xac-suat-4", name: "Thống kê và Xác suất", nameEn: "Statistics and Probability", description: "Dãy số liệu. Biểu đồ cột. Giá trị trung bình. Kiểm đếm số lần lặp lại", descriptionEn: "Data series. Bar charts. Average value. Counting repetitions" },
    ],
  },
  {
    id: 5,
    name: "Lớp 5",
    nameEn: "Grade 5",
    topics: [
      { id: "so-hoc-5", name: "Số và Phép tính", nameEn: "Numbers and Operations", description: "Đọc, viết, so sánh, tính toán với số thập phân. Tỉ số phần trăm", descriptionEn: "Reading, writing, comparing, calculating with decimals. Percentages" },
      { id: "hinh-hoc-5", name: "Hình học", nameEn: "Geometry", description: "Hình tam giác, hình thang, hình tròn. Diện tích, Chu vi. Hình hộp chữ nhật, lập phương. Thể tích", descriptionEn: "Triangles, trapezoids, circles. Area, Perimeter. Rectangular prisms, cubes. Volume" },
      { id: "do-luong-5", name: "Đo lường", nameEn: "Measurement", description: "Đơn vị đo độ dài, khối lượng, diện tích, thể tích. Số đo thời gian. Vận tốc", descriptionEn: "Units of length, mass, area, volume. Time measurement. Velocity" },
      { id: "thong-ke-xac-suat-5", name: "Thống kê và Xác suất", nameEn: "Statistics and Probability", description: "Biểu đồ hình quạt tròn. Lựa chọn cách biểu diễn. Tỉ số mô tả số lần lặp lại", descriptionEn: "Pie charts. Choosing representation. Ratio describing repetitions" },
    ],
  },
];

export const LEVELS = [
  { id: "easy", name: "Cơ bản", nameEn: "Basic", color: "bg-green-500" },
  { id: "medium", name: "Vận dụng", nameEn: "Applied", color: "bg-yellow-500" },
  { id: "hard", name: "Nâng cao", nameEn: "Advanced", color: "bg-red-500" },
];
