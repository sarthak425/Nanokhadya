import cv2
import numpy as np
from typing import List, Dict, Any, Tuple
from calibration import rgb_to_cielab, calculate_delta_e, apply_white_balance

# Standard normalized coordinates for 6 zones on the rectified cartridge image (width=600, height=300)
# Zone 1: Melamine (x=80, y=180)
# Zone 2: H2O2 (x=175, y=180)
# Zone 3: Urea (x=270, y=180)
# Zone 4: Starch (x=365, y=180)
# Zone 5: Neutralizer (x=460, y=180)
# Zone 6: Reference White (x=545, y=180)
ZONE_CENTERS = [
    (80, 180),   # Zone 1: Melamine
    (175, 180),  # Zone 2: H2O2
    (270, 180),  # Zone 3: Urea
    (365, 180),  # Zone 4: Starch
    (460, 180),  # Zone 5: Neutralizer
    (545, 180)   # Zone 6: White Reference Tile
]
ZONE_RADIUS = 24  # pixels

# Baseline unreacted blank CIELAB values (calibrated laboratory dry-state baseline)
BLANK_CIELAB = {
    1: (58.0, 24.0, 12.0),   # AuNP initial wine-red
    2: (86.0, -0.5, 2.0),    # Unreacted TMB / paper white
    3: (78.0, 4.0, 48.0),    # Phenol Red / BTB neutral yellow
    4: (74.0, 2.5, 32.0),    # Lugol uncomplexed amber
    5: (75.0, -3.0, 28.0),   # BCP normal milk pH
    6: (96.5, -0.2, 0.5)     # Certified white tile
}

class CartridgeImageProcessor:

    def __init__(self, target_width: int = 600, target_height: int = 300):
        self.target_width = target_width
        self.target_height = target_height

    def process_cartridge_image(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Executes end-to-end CV pipeline on raw camera JPEG:
        1. Decode image
        2. Exposure sanity validation
        3. Alignment & Perspective Rectification
        4. White balance correction from Zone 6
        5. Extraction of median RGB from each zone
        6. CIELAB conversion and Delta E calculation
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return {"success": False, "error": "Unable to decode image payload"}

        # 1. Optical Exposure Check
        mean_intensity = np.mean(img)
        if mean_intensity < 15.0:
            return {
                "success": False,
                "error": "Optical chamber underexposed or lid open",
                "validity_status": "INVALID_CHAMBER_AJAR"
            }
        if mean_intensity > 252.0:
            return {
                "success": False,
                "error": "Optical chamber saturated / overexposed",
                "validity_status": "INVALID_OPTICAL_SATURATION"
            }

        # 2. Perspective Rectification (fallback to proportional center crop if fiducials obscured)
        rectified = self._rectify_cartridge(img)

        # 3. Extract Zone 6 (White Reference) first for von Kries balance
        white_roi_rgb = self._extract_zone_median_rgb(rectified, ZONE_CENTERS[5], ZONE_RADIUS)
        
        # 4. Extract and calculate color features for all 6 zones
        readings = []
        for idx, center in enumerate(ZONE_CENTERS, start=1):
            raw_rgb = self._extract_zone_median_rgb(rectified, center, ZONE_RADIUS)
            
            # Apply white balance correction
            balanced_rgb = apply_white_balance(raw_rgb, white_roi_rgb)
            r, g, b = balanced_rgb[0], balanced_rgb[1], balanced_rgb[2]

            # Convert to CIELAB
            l_star, a_star, b_star = rgb_to_cielab(r, g, b)
            
            # Calculate Delta E against pre-calibrated blank
            blank_lab = BLANK_CIELAB.get(idx, (80.0, 0.0, 0.0))
            delta_e = calculate_delta_e((l_star, a_star, b_star), blank_lab)

            readings.append({
                "zoneIndex": idx,
                "rawR": round(float(raw_rgb[0]), 1),
                "rawG": round(float(raw_rgb[1]), 1),
                "rawB": round(float(raw_rgb[2]), 1),
                "cielabL": l_star,
                "cielabA": a_star,
                "cielabB": b_star,
                "deltaE": delta_e,
                "whiteReferenceDelta": round(float(np.linalg.norm(white_roi_rgb - np.array([245.0, 245.0, 245.0]))), 2)
            })

        return {
            "success": True,
            "validity_status": "VALID",
            "readings": readings,
            "mean_intensity": round(float(mean_intensity), 2)
        }

    def _rectify_cartridge(self, img: np.ndarray) -> np.ndarray:
        """
        Locates the high-contrast rectangular border of the cartridge cassette
        and warps it to fixed target dimensions (600x300).
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 40, 150)

        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)

        for c in contours[:5]:
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.03 * peri, True)
            if len(approx) == 4 and cv2.contourArea(approx) > (img.shape[0] * img.shape[1] * 0.25):
                # Detected 4 corner cartridge
                pts = approx.reshape(4, 2)
                rect = self._order_points(pts)
                dst = np.array([
                    [0, 0],
                    [self.target_width - 1, 0],
                    [self.target_width - 1, self.target_height - 1],
                    [0, self.target_height - 1]
                ], dtype="float32")

                m = cv2.getPerspectiveTransform(rect, dst)
                warped = cv2.warpPerspective(img, m, (self.target_width, self.target_height))
                return cv2.cvtColor(warped, cv2.COLOR_BGR2RGB)

        # Fallback: simple resize if cartridge fill factor is uniform
        resized = cv2.resize(img, (self.target_width, self.target_height))
        return cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

    def _order_points(self, pts: np.ndarray) -> np.ndarray:
        rect = np.zeros((4, 2), dtype="float32")
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)] # Top-left
        rect[2] = pts[np.argmax(s)] # Bottom-right

        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)] # Top-right
        rect[3] = pts[np.argmax(diff)] # Bottom-left
        return rect

    def _extract_zone_median_rgb(self, rgb_img: np.ndarray, center: Tuple[int, int], radius: int) -> np.ndarray:
        mask = np.zeros((rgb_img.shape[0], rgb_img.shape[1]), dtype=np.uint8)
        cv2.circle(mask, center, radius, 255, -1)
        pixels = rgb_img[mask == 255]
        if len(pixels) == 0:
            return np.array([200.0, 200.0, 200.0])
        median_rgb = np.median(pixels, axis=0)
        return median_rgb
