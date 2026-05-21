Design a complete movie ticket booking website UI with 3 pages + 1 modal component.
Use a warm cinematic color palette: deep dark brown #1A1410 as background, 
amber orange #E8832A as primary accent, warm cream #F5ECD7 as text, 
charcoal #2A2018 for cards, #211A14 for sidebar. 
Typography: Playfair Display for headings, Inter for body text.
Style: premium, dark cinema aesthetic, warm and immersive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL LAYOUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All pages share a fixed left sidebar (240px wide) on a 1440px canvas:
- Top: circular user avatar (48px) + username "Nguyễn Văn A" + subtitle "Premium Member" 
  with a small amber crown icon
- Navigation links with icons (amber icon when active, cream when inactive):
  • 🏠 Trang Chủ
  • 🎟 Đặt Vé
  • 📋 Lịch Sử Đặt Vé  
  • ❤️ Yêu Thích
  • ⚙️ Cài Đặt
- Active item has amber left border (3px) + amber text + subtle amber background highlight
- Bottom of sidebar: Logout button with icon
- Sidebar background: #211A14, right border: 1px solid #3D3020

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 1 – HOMEPAGE (Trang Chủ)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Main content area (right of sidebar, background #1A1410):

[TOP HEADER BAR]
- Height 64px, background #211A14
- Left: breadcrumb "Trang Chủ"
- Center: search bar with rounded input, placeholder "Tìm kiếm phim...", 
  search icon amber, border #3D3020
- Right: city selector dropdown "Hồ Chí Minh ▾" + notification bell icon 
  with amber dot badge

[HERO SLIDER SECTION]
- Full width, height 440px
- Current slide shows:
  • Full bleed movie backdrop image (cinematic scene, dark toned)
  • Dark gradient overlay from bottom (transparent to #1A1410)
  • Top-left corner: "HOT" badge in red + "ĐANG CHIẾU" badge in amber
  • Bottom-left overlay content:
    - Genre pills: [Hành Động] [Khoa Học Viễn Tưởng] in amber outline
    - Movie title in 48px Playfair Display bold cream: "Avengers: Secret Wars"
    - Star rating row: 5 golden stars + "8.7/10" + "(2.4k đánh giá)"
    - Duration + age rating: "2h 45m  |  T18"
    - CTA button: "🎟 Đặt Vé Ngay" — solid amber #E8832A, 
      rounded 8px, 160px wide, bold white text
    - Secondary button: "▶ Xem Trailer" — outline amber, same size
- Bottom center: dot pagination (5 dots, active dot amber and wider)
- Left/right arrow navigation buttons (semi-transparent dark circle, cream arrow icon)

[CATEGORY TABS]
- Below slider, padding 24px top
- Tabs: "Đang Chiếu | Sắp Chiếu | Top Tuần | Phim Hành Động | Phim Tình Cảm | Hoạt Hình"
- Active tab: amber text + 2px amber underline
- Inactive tabs: #9C8B75 text
- Right side: "Xem tất cả →" link in amber

[MOVIE CARD GRID]
- 4-column grid, gap 20px, padding 0 24px
- Each movie card (background #2A2018, border-radius 12px, overflow hidden):
  • Movie poster image top (aspect ratio 2:3, full width of card)
  • Hover state: dark overlay with centered play button icon (amber circle) 
    + "Đặt Vé Nhanh" amber button appearing at bottom
  • Age rating badge top-right corner of poster: "T18" red pill
  • Card body padding 12px:
    - Movie title: 14px bold cream, max 2 lines
    - Genre: 12px #9C8B75
    - Row: golden star icon + "8.5" rating (amber) + separator + "2h 10m" duration
    - "Đặt Vé" button: full width, amber background, 8px radius, 12px bold white, 
      margin-top 8px
- Show 8 cards total (2 rows × 4 columns)

[COMING SOON SECTION]
- Section title "Sắp Ra Mắt" in 24px Playfair Display cream + amber dot decoration
- Horizontal scroll row of 5 movie cards (narrower, 180px wide):
  • Poster image
  • "Khởi chiếu: 25/06/2025" in amber small text
  • Movie title
  • "Nhắc Nhở" outline button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 2 – MOVIE DETAIL PAGE (Chi Tiết Phim)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[HERO BACKDROP SECTION] height 380px:
- Full width blurred movie backdrop image at 25% opacity as background
- Amber-to-transparent radial glow overlay at bottom
- Foreground content in a centered row layout:
  LEFT: Movie poster 260px wide, border-radius 12px, box-shadow 0 20px 60px rgba(0,0,0,0.8)
  RIGHT (flex-1, padding-left 40px):
    - "ĐANG CHIẾU" amber pill badge
    - Movie title: 40px Playfair Display bold cream "Avengers: Secret Wars"
    - Genre pills row: [Hành Động] [Phiêu Lưu] [Khoa Học Viễn Tưởng] — amber outline, 
      8px radius
    - Meta row with icons: 🕐 2h 45m  |  🌐 Phụ đề Việt  |  📅 12/06/2025  |  🔞 T18
    - Star rating: 5 gold stars + "8.7/10" amber bold + "(2,431 lượt đánh giá)"
    - Synopsis text: 3 lines of cream text, 14px, "Xem thêm →" amber link
    - Director: small label + "Anthony & Joe Russo"
    - Cast avatars row: 5 circle avatar images 36px + names below 10px
    - Button row: 
      "▶ Xem Trailer" (amber outline, 160px) 
      "🎟 Đặt Vé" (amber solid, 160px)
      "❤" icon button (outline, square)

[SHOWTIME SECTION] below hero, padding 40px 24px:
- Section title "Lịch Chiếu" 24px Playfair Display + amber underline

- DATE PICKER ROW (horizontal, 7 items):
  Each date pill (80px wide, 64px tall, border-radius 10px):
  • Day name "T2" in small caps above
  • Date number "16" in bold large
  • Selected state: amber background, white text, subtle amber glow shadow
  • Default state: #2A2018 background, cream text
  • Past dates: #3D3020 background, #9C8B75 muted text

- CINEMA LIST (3 cinema blocks, separated by divider):
  Each cinema block:
  • Header row: cinema logo circle (40px) + "CGV Vincom Đồng Khởi" bold cream + 
    📍 "Quận 1, TP.HCM" muted + distance "1.2km" amber small
  • Subtitle: "Rạp 3 — Ghế 4DX  |  Âm thanh Dolby Atmos"
  • Time slot row (horizontal pills, gap 10px):
    Available slots: amber border, amber text, 80px × 36px, radius 8px
    → "09:00" "11:30" "14:00" "17:30" "20:00" "22:30"
    Sold out slot: #3D3020 bg, #9C8B75 muted text, strikethrough
  • Clicking any available time slot opens SEAT SELECTION MODAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODAL – SEAT SELECTION (Chọn Ghế)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full screen overlay: rgba(0,0,0,0.85) backdrop blur
Modal card: 800px wide, auto height, centered, background #1E1710, 
border-radius 16px, padding 32px

[MODAL HEADER]:
- Left: Movie title "Avengers: Secret Wars" bold cream + 
  info row "CGV Vincom  |  Rạp 3  |  Thứ 4, 18/06  |  20:00"
- Right: X close button (circle, #3D3020 bg)

[SCREEN INDICATOR]:
- Centered curved rectangle 400px wide, 12px tall, background amber gradient, 
  blur/glow effect, label "MÀN HÌNH" in 10px amber centered above

[SEAT MAP GRID]:
- 10 rows (A–J) × 12 columns
- Row label left side: A B C D E F G H I J in 12px #9C8B75
- Each seat: 32px × 32px square, border-radius 6px, gap 6px

Seat states (show all 3 types in the grid):
- Available: border 1px #C9A96E, background transparent, 
  hover: amber fill #E8832A, scale 1.1
- Selected (user picked): solid amber #E8832A, white checkmark icon center
- Sold/Unavailable: background #3D3020, opacity 0.4, cursor not-allowed
- VIP seats (rows E–F): slightly larger 36px, gold border #FFD700, 
  background #2A1F14

[LEGEND ROW] below map:
- 4 items side by side: [available swatch] Còn trống  [selected] Đã chọn  
  [sold] Đã bán  [vip] VIP — small 12px cream text

[BOTTOM BOOKING BAR] (sticky bottom of modal, #211A14 bg, padding 20px, 
border-top 1px #3D3020):
Left side:
- "Ghế đã chọn:" label + amber pill badges: [A3] [A4] [E6]
- "Loại ghế: Thường + VIP"

Right side:
- Price breakdown: "2 Thường × 90,000đ + 1 VIP × 130,000đ"
- Total: "Tổng cộng:" label + "310,000đ" in 24px bold amber
- Promo input: text field "Nhập mã giảm giá" + "Áp dụng" amber outline button
- "Xác Nhận & Thanh Toán →" full amber button, bold white, 200px wide, 44px tall

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 3 – TICKET CONFIRMATION (Chi Tiết Vé)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page background: #1A1410 with radial amber glow (very low opacity 8%) behind ticket

[SUCCESS HEADER] centered top:
- Large checkmark icon in amber circle (64px) with subtle pulse glow animation
- "Đặt Vé Thành Công!" 32px Playfair Display cream bold
- "Mã xác nhận đã được gửi về email của bạn" 14px #9C8B75

[TICKET CARD] centered, width 460px, skeuomorphic cinema ticket design:

TOP HALF (background #2A1F14, border-radius 12px 12px 0 0, padding 24px):
- Row layout:
  LEFT: Movie poster thumbnail 80px × 120px, border-radius 8px
  RIGHT:
    • Movie title "Avengers: Secret Wars" 18px bold cream
    • "CGV Vincom Đồng Khởi — Rạp 3" 13px #9C8B75
    • Divider line
    • Info rows with icons:
      📅 "Thứ 4, 18 tháng 6, 2025"
      🕐 "20:00 — 22:45"
      🎭 "4DX  |  Phụ đề Việt"
      👤 "Nguyễn Văn A"
- Tag row: [T18] [Hành Động] amber/red pills

TICKET DIVIDER (full width):
- Dashed line (#3D3020 color, dashed border)
- Left semicircle cutout: 20px circle cutout on left edge
- Right semicircle cutout: 20px circle cutout on right edge
(Classic ticket tear style)

BOTTOM HALF (background #241A12, border-radius 0 0 12px 12px, padding 24px):
- "Ghế:" label + seat badges in a row: [A3] [A4] [E6] — amber filled pills, bold
- "Loại vé:" "2× Thường | 1× VIP"
- Centered QR code: 160px × 160px, white modules on dark #1A1410 background, 
  thin amber border frame around QR
- Below QR: booking code in monospace font 16px amber bold: "CGV-20250618-47291"
- "Quét mã này tại quầy để nhận vé" 12px #9C8B75 centered

[ACTION BUTTONS ROW] below ticket card, centered, gap 12px:
- "⬇ Xuất Vé PDF" — amber outline button, 180px
- "📅 Thêm vào Lịch" — amber outline button, 180px

[NAVIGATION LINKS] below buttons:
- "← Xem Lịch Sử Đặt Vé" | "Đặt Vé Phim Khác →" amber text links

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN TOKENS & FIGMA SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Color Styles:
- bg/primary: #1A1410
- bg/card: #2A2018
- bg/sidebar: #211A14
- bg/modal: #1E1710
- bg/ticket-top: #2A1F14
- bg/ticket-bottom: #241A12
- accent/default: #E8832A
- accent/hover: #F59B3D
- accent/vip: #FFD700
- text/primary: #F5ECD7
- text/secondary: #9C8B75
- border/default: #3D3020
- seat/available: #C9A96E
- seat/sold: #3D3530
- status/success: #4CAF7D
- status/error: #E85252

Text Styles:
- heading/xl: Playfair Display, 48px, Bold
- heading/lg: Playfair Display, 40px, Bold
- heading/md: Playfair Display, 24px, SemiBold
- body/lg: Inter, 16px, Regular
- body/md: Inter, 14px, Regular
- body/sm: Inter, 12px, Regular
- label: Inter, 13px, Medium
- mono/code: JetBrains Mono, 16px, Bold (for booking code)

Effects:
- card-shadow: 0 8px 32px rgba(0,0,0,0.6)
- amber-glow: 0 0 24px rgba(232,131,42,0.3)
- ticket-glow: radial-gradient behind ticket, #E8832A at 5% opacity

Canvas: 1440px wide desktop, also create mobile frame 390px for homepage